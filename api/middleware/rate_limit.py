"""
Rate limiting middleware for LUMEN SDK API.

Per-key rate limiting with sliding window implementation.

Copyright 2026 Forge Partners Inc.
"""

import time
from collections import defaultdict
from typing import Dict, List
from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
import asyncio
import logging

logger = logging.getLogger(__name__)


class SlidingWindowRateLimit:
    """
    Sliding window rate limiter implementation.
    
    Tracks request timestamps in a sliding window and enforces limits
    based on plan tier (free: 100/min, pro: 1000/min).
    """
    
    def __init__(self):
        # Storage: key -> list of request timestamps
        self._windows: Dict[str, List[float]] = defaultdict(list)
        self._lock = asyncio.Lock()
    
    async def is_allowed(self, key: str, limit: int, window_seconds: int = 60) -> tuple[bool, dict]:
        """
        Check if request is allowed under rate limit.
        
        Args:
            key: Rate limit key (typically API key prefix)
            limit: Maximum requests per window
            window_seconds: Window size in seconds
            
        Returns:
            tuple: (allowed: bool, metadata: dict)
        """
        async with self._lock:
            now = time.time()
            window_start = now - window_seconds
            
            # Clean old timestamps
            if key in self._windows:
                self._windows[key] = [
                    ts for ts in self._windows[key] 
                    if ts > window_start
                ]
            
            current_count = len(self._windows[key])
            
            # Check if request is allowed
            if current_count >= limit:
                # Calculate retry-after
                oldest_in_window = min(self._windows[key]) if self._windows[key] else now
                retry_after = int(oldest_in_window + window_seconds - now) + 1
                
                return False, {
                    "limit": limit,
                    "remaining": 0,
                    "reset": int(oldest_in_window + window_seconds),
                    "retry_after": max(retry_after, 1)
                }
            
            # Allow request and record timestamp
            self._windows[key].append(now)
            
            # Calculate reset time (when oldest request expires)
            reset_time = int(self._windows[key][0] + window_seconds) if self._windows[key] else int(now + window_seconds)
            
            return True, {
                "limit": limit,
                "remaining": limit - current_count - 1,
                "reset": reset_time,
                "retry_after": 0
            }
    
    async def cleanup(self, max_age_seconds: int = 3600):
        """
        Cleanup old rate limit data.
        
        Args:
            max_age_seconds: Remove keys older than this
        """
        async with self._lock:
            now = time.time()
            cutoff = now - max_age_seconds
            
            keys_to_remove = []
            for key, timestamps in self._windows.items():
                # Remove old timestamps
                self._windows[key] = [ts for ts in timestamps if ts > cutoff]
                # If no recent activity, mark for removal
                if not self._windows[key]:
                    keys_to_remove.append(key)
            
            for key in keys_to_remove:
                del self._windows[key]


# Global rate limiter instance
_rate_limiter = SlidingWindowRateLimit()


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Rate limiting middleware.
    
    Enforces per-key rate limits:
    - Free plan: 100 requests/minute
    - Pro plan: 1000 requests/minute
    
    Uses sliding window with in-memory storage.
    """

    def __init__(self, app, excluded_paths: List[str] = None):
        super().__init__(app)
        self.excluded_paths = excluded_paths or ["/health", "/docs", "/redoc", "/openapi.json"]
    
    async def dispatch(self, request: Request, call_next):
        # Skip rate limiting for excluded paths
        if any(request.url.path.startswith(path) for path in self.excluded_paths):
            return await call_next(request)
        
        # Only apply rate limiting to API endpoints
        if not request.url.path.startswith("/v1/"):
            return await call_next(request)
        
        try:
            # Get API key for rate limiting
            api_key = request.headers.get("X-API-Key")
            
            if not api_key:
                # No API key, let endpoint handle auth
                return await call_next(request)
            
            # Use key prefix for rate limiting (privacy + efficiency)
            rate_key = api_key[:20] if len(api_key) >= 20 else api_key
            
            # Determine rate limit based on key format
            # Pro keys typically contain "live" or have specific prefixes
            # This is a simple heuristic; in production, look up plan from DB
            if "_live_" in api_key:
                limit = 1000  # Pro plan
            else:
                limit = 100   # Free plan (default)
            
            # Check rate limit
            allowed, metadata = await _rate_limiter.is_allowed(rate_key, limit)
            
            if not allowed:
                # Rate limit exceeded
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail={
                        "message": "Rate limit exceeded",
                        "limit": metadata["limit"],
                        "remaining": metadata["remaining"],
                        "reset": metadata["reset"]
                    },
                    headers={
                        "X-RateLimit-Limit": str(metadata["limit"]),
                        "X-RateLimit-Remaining": str(metadata["remaining"]),
                        "X-RateLimit-Reset": str(metadata["reset"]),
                        "Retry-After": str(metadata["retry_after"])
                    }
                )
            
            # Process request
            response = await call_next(request)
            
            # Add rate limit headers to response
            response.headers["X-RateLimit-Limit"] = str(metadata["limit"])
            response.headers["X-RateLimit-Remaining"] = str(metadata["remaining"])
            response.headers["X-RateLimit-Reset"] = str(metadata["reset"])
            
            return response
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Rate limiting error: {e}")
            # Don't fail requests for rate limiter errors
            return await call_next(request)


# Background cleanup task
async def cleanup_rate_limits():
    """
    Background task to cleanup old rate limit data.
    
    Should be called periodically (e.g., every hour).
    """
    while True:
        try:
            await _rate_limiter.cleanup()
            await asyncio.sleep(3600)  # 1 hour
        except Exception as e:
            logger.error(f"Rate limit cleanup error: {e}")
            await asyncio.sleep(300)   # 5 minutes on error