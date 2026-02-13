"""
Usage tracking middleware for LUMEN SDK API.

Tracks API usage and enforces plan limits on /v1/evaluate requests.

Copyright 2026 Forge Partners Inc.
"""

from datetime import datetime, timezone
from fastapi import Request, Response, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
import logging
from auth.supabase_client import get_supabase
from auth.api_keys import verify_api_key

logger = logging.getLogger(__name__)


class UsageTrackingMiddleware(BaseHTTPMiddleware):
    """
    Middleware to track API usage and enforce limits.
    
    On every /v1/evaluate request, AFTER successful auth:
    - Increment evaluations_count in api_usage for current period
    - Check against plan limit (free: 1000, pro: 50000)
    - If over limit: return 429 Too Many Requests with reset date
    - If at 80%: add X-Lumen-Usage-Warning header
    """

    async def dispatch(self, request: Request, call_next):
        # Only track usage for evaluate endpoints
        if not request.url.path.startswith("/v1/evaluate"):
            return await call_next(request)
        
        try:
            # Get API key info (this will be validated by the endpoint)
            api_key = request.headers.get("X-API-Key")
            if not api_key:
                # Let the endpoint handle auth errors
                return await call_next(request)
            
            # Quick verification to get org info
            # Note: This duplicates verification but ensures we have org_id
            try:
                api_key_info = await verify_api_key(api_key)
                org_id = api_key_info.org_id
                plan = api_key_info.plan
            except:
                # Auth will fail at endpoint level
                return await call_next(request)
            
            # Check current usage and limits
            supabase = get_supabase()
            
            # Get current month period
            now = datetime.now(timezone.utc)
            month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            period_key = month_start.strftime("%Y-%m")
            
            # Get or create usage record for this period
            usage_result = supabase.from_("api_usage").select("*").eq(
                "org_id", org_id
            ).eq("period_start", month_start.isoformat()).execute()
            
            if usage_result.data:
                usage_record = usage_result.data[0]
                current_count = usage_record["evaluations_count"]
            else:
                current_count = 0
            
            # Plan limits
            limit = 1000 if plan == "free" else 50000
            
            # Check if over limit
            if current_count >= limit:
                # Calculate next reset date
                if now.month == 12:
                    next_month = now.replace(year=now.year + 1, month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
                else:
                    next_month = now.replace(month=now.month + 1, day=1, hour=0, minute=0, second=0, microsecond=0)
                
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail={
                        "message": "Monthly evaluation limit exceeded",
                        "plan": plan,
                        "limit": limit,
                        "used": current_count,
                        "reset_date": next_month.isoformat()
                    },
                    headers={
                        "X-Lumen-Usage-Limit": str(limit),
                        "X-Lumen-Usage-Used": str(current_count),
                        "X-Lumen-Usage-Reset": next_month.isoformat(),
                        "Retry-After": str(int((next_month - now).total_seconds()))
                    }
                )
            
            # Process the request
            response = await call_next(request)
            
            # If request was successful (2xx), increment usage
            if 200 <= response.status_code < 300:
                try:
                    if usage_result.data:
                        # Update existing record
                        supabase.from_("api_usage").update({
                            "evaluations_count": current_count + 1,
                            "last_evaluation_at": now.isoformat()
                        }).eq("id", usage_record["id"]).execute()
                    else:
                        # Create new record
                        supabase.from_("api_usage").insert({
                            "org_id": org_id,
                            "period_start": month_start.isoformat(),
                            "evaluations_count": 1,
                            "last_evaluation_at": now.isoformat()
                        }).execute()
                    
                    # Add usage headers to response
                    new_count = current_count + 1
                    percent_used = (new_count / limit) * 100
                    
                    response.headers["X-Lumen-Usage-Limit"] = str(limit)
                    response.headers["X-Lumen-Usage-Used"] = str(new_count)
                    response.headers["X-Lumen-Usage-Remaining"] = str(limit - new_count)
                    response.headers["X-Lumen-Usage-Percent"] = f"{percent_used:.1f}"
                    
                    # Warning at 80%
                    if percent_used >= 80:
                        if now.month == 12:
                            next_month = now.replace(year=now.year + 1, month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
                        else:
                            next_month = now.replace(month=now.month + 1, day=1, hour=0, minute=0, second=0, microsecond=0)
                        
                        response.headers["X-Lumen-Usage-Warning"] = (
                            f"Approaching limit. {limit - new_count} evaluations remaining. "
                            f"Resets {next_month.strftime('%Y-%m-%d')}."
                        )
                    
                except Exception as e:
                    logger.error(f"Failed to update usage tracking: {e}")
                    # Don't fail the request for tracking errors
                    
            return response
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Usage tracking middleware error: {e}")
            # Don't fail requests for middleware errors
            return await call_next(request)