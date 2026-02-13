"""API key authentication for LUMEN SDK API.

MVP Implementation (v1.0.0):
- Hardcoded development keys for local testing
- Keys are intentionally exposed for demonstration purposes

Production Implementation (v1.1.0+):
- Database-backed key storage
- Key rotation support
- Usage tracking and rate limiting
- Scope-based permissions

Copyright 2026 Forge Partners Inc.
"""

from fastapi import HTTPException, Security, status
from fastapi.security import APIKeyHeader

# API key header configuration
API_KEY_HEADER = APIKeyHeader(name="X-API-Key", auto_error=False)

# Development API keys (intentionally exposed for local testing)
# WARNING: Do not use these keys in production environments
# Production: Use secure key management (database, vault, or environment variables)
VALID_API_KEYS = {
    "lumen-dev-key-001": {"org": "development", "tier": "dev"},
    "lumen-test-key-001": {"org": "testing", "tier": "test"},
}


async def verify_api_key(api_key: str = Security(API_KEY_HEADER)) -> dict:
    """
    Verify the API key from request header.
    
    Args:
        api_key: API key from X-API-Key header
        
    Returns:
        dict: API key metadata if valid
        
    Raises:
        HTTPException: If API key is missing or invalid
    """
    if api_key is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing API key. Include X-API-Key header.",
            headers={"WWW-Authenticate": "ApiKey"},
        )
    
    if api_key not in VALID_API_KEYS:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid API key.",
        )
    
    return VALID_API_KEYS[api_key]


def get_api_key_optional(api_key: str = Security(API_KEY_HEADER)) -> dict | None:
    """
    Optional API key verification (for endpoints that work with or without auth).
    
    Returns:
        dict | None: API key metadata if valid, None if not provided
    """
    if api_key is None:
        return None
    
    return VALID_API_KEYS.get(api_key)
