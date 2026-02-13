"""
API key authentication for LUMEN SDK API.

Enterprise Implementation:
- Supabase-backed key storage with bcrypt hashing
- Key prefix indexing for fast lookups
- Expiration and usage tracking
- Rate limiting metadata

Copyright 2026 Forge Partners Inc.
"""

from datetime import datetime, timezone
from typing import Optional
from fastapi import HTTPException, Security, status
from fastapi.security import APIKeyHeader
import bcrypt
import logging
from .supabase_client import get_supabase

logger = logging.getLogger(__name__)

# API key header configuration
API_KEY_HEADER = APIKeyHeader(name="X-API-Key", auto_error=False)


class APIKeyInfo:
    """API key information container."""
    
    def __init__(self, key_id: str, org_id: str, plan: str, name: str, environment: str):
        self.key_id = key_id
        self.org_id = org_id
        self.plan = plan
        self.name = name
        self.environment = environment


async def verify_api_key(api_key: str = Security(API_KEY_HEADER)) -> APIKeyInfo:
    """
    Verify API key against Supabase database.
    
    Flow:
    1. Extract key prefix (first 20 chars) for fast lookup
    2. Query api_keys table WHERE key_prefix matches AND status = 'active'
    3. bcrypt.verify(submitted_key, stored_hash)
    4. Check expiration
    5. Update last_used_at
    6. Return org_id + plan info for rate limiting
    
    Args:
        api_key: API key from X-API-Key header
        
    Returns:
        APIKeyInfo: API key metadata if valid
        
    Raises:
        HTTPException: If API key is missing or invalid
    """
    if api_key is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing API key. Include X-API-Key header.",
            headers={"WWW-Authenticate": "ApiKey"},
        )
    
    # Extract key prefix for database lookup
    if len(api_key) < 20:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid API key format.",
        )
    
    key_prefix = api_key[:20]
    
    try:
        supabase = get_supabase()
        
        # Query for active keys with matching prefix
        result = supabase.from_("api_keys").select(
            "id, org_id, key_hash, name, environment, expires_at, organizations!inner(plan)"
        ).eq("key_prefix", key_prefix).eq("status", "active").execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid API key.",
            )
        
        # Verify hash for each candidate (usually just one)
        for candidate in result.data:
            stored_hash = candidate["key_hash"].encode('utf-8')
            if bcrypt.checkpw(api_key.encode('utf-8'), stored_hash):
                # Check expiration
                if candidate.get("expires_at"):
                    expiry = datetime.fromisoformat(candidate["expires_at"].replace('Z', '+00:00'))
                    if datetime.now(timezone.utc) > expiry:
                        raise HTTPException(
                            status_code=status.HTTP_403_FORBIDDEN,
                            detail="API key has expired.",
                        )
                
                # Update last_used_at
                supabase.from_("api_keys").update({
                    "last_used_at": datetime.now(timezone.utc).isoformat()
                }).eq("id", candidate["id"]).execute()
                
                # Return key info
                return APIKeyInfo(
                    key_id=candidate["id"],
                    org_id=candidate["org_id"],
                    plan=candidate["organizations"]["plan"],
                    name=candidate["name"],
                    environment=candidate["environment"]
                )
        
        # If we get here, no hash matched
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid API key.",
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"API key verification error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication service error"
        )


async def get_api_key_optional(api_key: str = Security(API_KEY_HEADER)) -> Optional[APIKeyInfo]:
    """
    Optional API key verification (for endpoints that work with or without auth).
    
    Args:
        api_key: API key from X-API-Key header
        
    Returns:
        APIKeyInfo | None: API key metadata if valid, None if not provided
    """
    if api_key is None:
        return None
    
    try:
        return await verify_api_key(api_key)
    except HTTPException:
        return None


def hash_api_key(api_key: str) -> str:
    """
    Hash an API key using bcrypt.
    
    Args:
        api_key: Plain text API key
        
    Returns:
        str: Bcrypt hash of the API key
    """
    salt = bcrypt.gensalt()
    hash_bytes = bcrypt.hashpw(api_key.encode('utf-8'), salt)
    return hash_bytes.decode('utf-8')