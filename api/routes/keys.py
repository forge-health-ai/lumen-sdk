"""
API key management routes for LUMEN SDK API.

Copyright 2026 Forge Partners Inc.
"""

import secrets
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
import logging
from auth.jwt_auth import verify_jwt_token
from auth.supabase_client import get_supabase
from auth.api_keys import hash_api_key

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/v1/keys", tags=["API Keys"])


# Request/Response models
class GenerateKeyRequest(BaseModel):
    """Request body for generating a new API key."""
    name: str = Field(..., description="Human-readable name for this API key")
    environment: str = Field(..., description="Environment: live, test, or dev")
    allowed_origins: List[str] = Field(default_factory=list, description="Allowed CORS origins")
    ip_allowlist: List[str] = Field(default_factory=list, description="IP addresses allowed to use this key")
    expires_at: Optional[str] = Field(None, description="Expiration timestamp (ISO 8601)")

    model_config = {
        "json_schema_extra": {
            "example": {
                "name": "Production API Key",
                "environment": "live",
                "allowed_origins": ["https://myapp.com"],
                "ip_allowlist": ["192.168.1.100"],
                "expires_at": "2025-12-31T23:59:59Z"
            }
        }
    }


class GenerateKeyResponse(BaseModel):
    """Response body for API key generation."""
    key_id: str = Field(..., description="Unique identifier for this API key")
    api_key: str = Field(..., description="The API key (shown only once)")
    name: str = Field(..., description="Key name")
    environment: str = Field(..., description="Key environment")
    created_at: str = Field(..., description="Creation timestamp")
    expires_at: Optional[str] = Field(None, description="Expiration timestamp")

    model_config = {
        "json_schema_extra": {
            "example": {
                "key_id": "key_abc123",
                "api_key": "lumen_pk_live_AbCdEf123456789012345678901234567890",
                "name": "Production API Key",
                "environment": "live",
                "created_at": "2026-02-13T15:30:00Z",
                "expires_at": "2025-12-31T23:59:59Z"
            }
        }
    }


class KeyInfo(BaseModel):
    """API key information (masked)."""
    key_id: str = Field(..., description="Unique identifier")
    name: str = Field(..., description="Key name")
    environment: str = Field(..., description="Environment")
    key_prefix: str = Field(..., description="First 20 characters of key")
    status: str = Field(..., description="Key status")
    created_at: str = Field(..., description="Creation timestamp")
    last_used_at: Optional[str] = Field(None, description="Last usage timestamp")
    expires_at: Optional[str] = Field(None, description="Expiration timestamp")


class UsageResponse(BaseModel):
    """API usage information for current billing period."""
    plan: str = Field(..., description="Current plan")
    evaluations_this_month: int = Field(..., description="Evaluations used this month")
    evaluations_limit: int = Field(..., description="Monthly evaluation limit")
    reset_date: str = Field(..., description="Next billing cycle reset date")
    percent_used: float = Field(..., description="Percentage of limit used")

    model_config = {
        "json_schema_extra": {
            "example": {
                "plan": "free",
                "evaluations_this_month": 150,
                "evaluations_limit": 1000,
                "reset_date": "2026-03-01T00:00:00Z",
                "percent_used": 15.0
            }
        }
    }


@router.post("/generate", response_model=GenerateKeyResponse)
async def generate_api_key(
    request: GenerateKeyRequest,
    user_info: dict = Depends(verify_jwt_token)
) -> GenerateKeyResponse:
    """
    Generate a new API key.
    
    Requires JWT authentication (user must be signed in via portal).
    Respects plan limits and records legal acknowledgment if first key.
    """
    try:
        supabase = get_supabase()
        org_id = user_info["org_id"]
        plan = user_info["plan"]
        
        # Check plan limits
        key_limit = 2 if plan == "free" else 10
        
        existing_keys = supabase.from_("api_keys").select("count", count="exact").eq(
            "org_id", org_id
        ).eq("status", "active").execute()
        
        if existing_keys.count >= key_limit:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"API key limit reached. {plan.title()} plan allows {key_limit} active keys."
            )
        
        # Validate environment
        if request.environment not in ["live", "test", "dev"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Environment must be 'live', 'test', or 'dev'"
            )
        
        # Generate cryptographic key
        random_suffix = secrets.token_urlsafe(32)
        api_key = f"lumen_pk_{request.environment}_{random_suffix}"
        key_prefix = api_key[:20]
        key_hash = hash_api_key(api_key)
        
        # Prepare key data
        now = datetime.now(timezone.utc)
        key_data = {
            "org_id": org_id,
            "name": request.name,
            "environment": request.environment,
            "key_prefix": key_prefix,
            "key_hash": key_hash,
            "allowed_origins": request.allowed_origins,
            "ip_allowlist": request.ip_allowlist,
            "status": "active",
            "created_at": now.isoformat(),
            "expires_at": request.expires_at
        }
        
        # Insert key
        result = supabase.from_("api_keys").insert(key_data).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create API key"
            )
        
        key_record = result.data[0]
        
        # Check if this is the first API key for this org (legal acknowledgment)
        if existing_keys.count == 0:
            supabase.from_("organizations").update({
                "legal_acknowledgment": True,
                "legal_acknowledgment_at": now.isoformat()
            }).eq("id", org_id).execute()
        
        return GenerateKeyResponse(
            key_id=key_record["id"],
            api_key=api_key,  # Only shown once!
            name=key_record["name"],
            environment=key_record["environment"],
            created_at=key_record["created_at"],
            expires_at=key_record.get("expires_at")
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating API key: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.get("", response_model=List[KeyInfo])
async def list_api_keys(
    user_info: dict = Depends(verify_jwt_token)
) -> List[KeyInfo]:
    """
    List API keys for authenticated user.
    
    Returns masked keys (prefix only), names, environments, status, last_used.
    """
    try:
        supabase = get_supabase()
        
        result = supabase.from_("api_keys").select(
            "id, name, environment, key_prefix, status, created_at, last_used_at, expires_at"
        ).eq("org_id", user_info["org_id"]).order("created_at", desc=True).execute()
        
        return [
            KeyInfo(
                key_id=key["id"],
                name=key["name"],
                environment=key["environment"],
                key_prefix=key["key_prefix"],
                status=key["status"],
                created_at=key["created_at"],
                last_used_at=key.get("last_used_at"),
                expires_at=key.get("expires_at")
            )
            for key in result.data
        ]
        
    except Exception as e:
        logger.error(f"Error listing API keys: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.delete("/{key_id}")
async def revoke_api_key(
    key_id: str,
    user_info: dict = Depends(verify_jwt_token)
):
    """
    Revoke an API key.
    
    Sets status = 'revoked' and revoked_at = now().
    """
    try:
        supabase = get_supabase()
        
        # Verify key belongs to this organization
        key_check = supabase.from_("api_keys").select("id").eq(
            "id", key_id
        ).eq("org_id", user_info["org_id"]).execute()
        
        if not key_check.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="API key not found"
            )
        
        # Revoke the key
        supabase.from_("api_keys").update({
            "status": "revoked",
            "revoked_at": datetime.now(timezone.utc).isoformat()
        }).eq("id", key_id).execute()
        
        return {"message": "API key revoked successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error revoking API key: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.get("/usage", response_model=UsageResponse)
async def get_usage_info(
    user_info: dict = Depends(verify_jwt_token)
) -> UsageResponse:
    """
    Get usage information for current billing period.
    
    Returns: plan, evaluationsThisMonth, evaluationsLimit, resetDate, percentUsed.
    """
    try:
        supabase = get_supabase()
        
        # Get current month usage
        now = datetime.now(timezone.utc)
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        next_month = month_start.replace(month=month_start.month + 1) if month_start.month < 12 else month_start.replace(year=month_start.year + 1, month=1)
        
        usage_result = supabase.from_("api_usage").select(
            "evaluations_count"
        ).eq("org_id", user_info["org_id"]).gte(
            "period_start", month_start.isoformat()
        ).lt("period_start", next_month.isoformat()).execute()
        
        evaluations_this_month = sum(row["evaluations_count"] for row in usage_result.data)
        
        # Plan limits
        plan = user_info["plan"]
        evaluations_limit = 1000 if plan == "free" else 50000
        
        percent_used = (evaluations_this_month / evaluations_limit) * 100
        
        return UsageResponse(
            plan=plan,
            evaluations_this_month=evaluations_this_month,
            evaluations_limit=evaluations_limit,
            reset_date=next_month.isoformat(),
            percent_used=round(percent_used, 1)
        )
        
    except Exception as e:
        logger.error(f"Error getting usage info: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )