"""
JWT authentication for LUMEN SDK API portal routes.

Copyright 2026 Forge Partners Inc.
"""

from typing import Optional
from fastapi import HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
import os
import logging
from .supabase_client import get_supabase

logger = logging.getLogger(__name__)

# JWT Bearer token security
bearer_scheme = HTTPBearer(auto_error=False)


async def verify_jwt_token(credentials: HTTPAuthorizationCredentials = Security(bearer_scheme)) -> dict:
    """
    Verify Supabase JWT token and return user info.
    
    Args:
        credentials: Bearer token credentials
        
    Returns:
        dict: User information including user_id and org_id
        
    Raises:
        HTTPException: If token is invalid or missing
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization token required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = credentials.credentials
    
    try:
        # Decode JWT without verification (Supabase handles verification)
        # In production, you'd verify against Supabase JWT secret
        jwt_secret = os.getenv("SUPABASE_JWT_SECRET")
        if not jwt_secret:
            # For development, we'll decode without verification
            # In production, always verify the signature
            payload = jwt.decode(token, options={"verify_signature": False})
        else:
            payload = jwt.decode(
                token,
                jwt_secret,
                algorithms=["HS256"],
                audience="authenticated"
            )
        
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing user ID"
            )
        
        # Look up user's organization
        supabase = get_supabase()
        org_result = supabase.from_("organizations").select("id, name, plan").eq("owner_id", user_id).execute()
        
        if not org_result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Organization not found for user"
            )
        
        org = org_result.data[0]
        
        return {
            "user_id": user_id,
            "org_id": org["id"],
            "org_name": org["name"],
            "plan": org["plan"],
            "email": payload.get("email"),
        }
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.InvalidTokenError as e:
        logger.warning(f"Invalid JWT token: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization token"
        )
    except Exception as e:
        logger.error(f"JWT verification error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication service error"
        )


async def verify_jwt_token_optional(
    credentials: HTTPAuthorizationCredentials = Security(bearer_scheme)
) -> Optional[dict]:
    """
    Optional JWT token verification.
    
    Args:
        credentials: Bearer token credentials
        
    Returns:
        dict | None: User information if valid token provided, None otherwise
    """
    if not credentials:
        return None
        
    try:
        return await verify_jwt_token(credentials)
    except HTTPException:
        return None