"""
Policy pack routes for LUMEN SDK API.

Copyright 2026 Forge Partners Inc.
"""

from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
import logging
from auth.jwt_auth import verify_jwt_token
from auth.api_keys import verify_api_key, APIKeyInfo
from auth.supabase_client import get_supabase
from data.packs import get_all_packs, get_pack_by_id, get_pack_summary

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/v1/packs", tags=["Policy Packs"])


# Request/Response models
class PackSummary(BaseModel):
    """Policy pack summary information."""
    pack_id: str = Field(..., description="Policy pack identifier")
    name: str = Field(..., description="Human-readable pack name")
    jurisdiction: str = Field(..., description="Legal jurisdiction")
    version: str = Field(..., description="Pack version")
    tier: str = Field(..., description="Required tier (free/pro)")
    frameworks: List[str] = Field(..., description="Regulatory frameworks covered")
    checks_count: int = Field(..., description="Number of compliance checks")

    model_config = {
        "json_schema_extra": {
            "example": {
                "pack_id": "ca-on-phipa",
                "name": "Ontario PHIPA Healthcare Pack",
                "jurisdiction": "Canada — Ontario",
                "version": "v2026-Q1-r3",
                "tier": "free",
                "frameworks": ["PHIPA", "PIPEDA", "NIST AI RMF"],
                "checks_count": 15
            }
        }
    }


class ComplianceCheck(BaseModel):
    """Individual compliance check."""
    checkId: str = Field(..., description="Unique check identifier")
    name: str = Field(..., description="Check name")
    severity: str = Field(..., description="Severity level")
    description: str = Field(..., description="Check description")


class PackDetail(BaseModel):
    """Detailed policy pack information."""
    pack_id: str = Field(..., description="Policy pack identifier")
    name: str = Field(..., description="Human-readable pack name")
    jurisdiction: str = Field(..., description="Legal jurisdiction")
    version: str = Field(..., description="Pack version")
    tier: str = Field(..., description="Required tier (free/pro)")
    frameworks: List[str] = Field(..., description="Regulatory frameworks covered")
    checks: List[ComplianceCheck] = Field(..., description="Individual compliance checks")

    model_config = {
        "json_schema_extra": {
            "example": {
                "pack_id": "ca-on-phipa",
                "name": "Ontario PHIPA Healthcare Pack",
                "jurisdiction": "Canada — Ontario",
                "version": "v2026-Q1-r3",
                "tier": "free",
                "frameworks": ["PHIPA", "PIPEDA", "NIST AI RMF"],
                "checks": [
                    {
                        "checkId": "phipa-001",
                        "name": "Consent Verification",
                        "severity": "critical",
                        "description": "Verify patient consent for AI-assisted decision per PHIPA s.18"
                    }
                ]
            }
        }
    }


class EnablePackRequest(BaseModel):
    """Request to enable a policy pack for an organization."""
    pack_id: str = Field(..., description="Policy pack identifier to enable")

    model_config = {
        "json_schema_extra": {
            "example": {
                "pack_id": "ca-on-phipa"
            }
        }
    }


@router.get("", response_model=List[PackSummary])
async def list_policy_packs() -> List[PackSummary]:
    """
    List all available policy packs.
    
    Public endpoint (no authentication required).
    Returns: pack_id, name, jurisdiction, version, frameworks, checks_count, tier.
    """
    try:
        summaries = get_pack_summary()
        return [PackSummary(**summary) for summary in summaries]
        
    except Exception as e:
        logger.error(f"Error listing policy packs: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.get("/{pack_id}", response_model=PackDetail)
async def get_policy_pack(
    pack_id: str,
    api_key_info: APIKeyInfo = Depends(verify_api_key)
) -> PackDetail:
    """
    Get detailed policy pack information.
    
    Requires API key authentication.
    Returns full pack definition with individual checks/rules.
    """
    try:
        pack_data = get_pack_by_id(pack_id)
        
        if not pack_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Policy pack '{pack_id}' not found"
            )
        
        # Convert checks to Pydantic models
        checks = [
            ComplianceCheck(
                checkId=check["checkId"],
                name=check["name"],
                severity=check["severity"],
                description=check["description"]
            )
            for check in pack_data["checks"]
        ]
        
        return PackDetail(
            pack_id=pack_id,
            name=pack_data["name"],
            jurisdiction=pack_data["jurisdiction"],
            version=pack_data["version"],
            tier=pack_data["tier"],
            frameworks=pack_data["frameworks"],
            checks=checks
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting policy pack {pack_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.post("/enable")
async def enable_policy_pack(
    request: EnablePackRequest,
    user_info: dict = Depends(verify_jwt_token)
):
    """
    Enable a policy pack for the organization.
    
    Requires JWT authentication.
    Checks plan limits (free: 2 packs, pro: unlimited).
    """
    try:
        # Verify pack exists
        pack_data = get_pack_by_id(request.pack_id)
        if not pack_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Policy pack '{request.pack_id}' not found"
            )
        
        # Check plan compatibility
        if pack_data["tier"] == "pro" and user_info["plan"] == "free":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Policy pack '{request.pack_id}' requires a Pro plan"
            )
        
        supabase = get_supabase()
        org_id = user_info["org_id"]
        plan = user_info["plan"]
        
        # Check if already enabled
        existing = supabase.from_("organization_packs").select("id").eq(
            "org_id", org_id
        ).eq("pack_id", request.pack_id).eq("enabled", True).execute()
        
        if existing.data:
            return {"message": f"Policy pack '{request.pack_id}' is already enabled"}
        
        # Check plan limits
        if plan == "free":
            enabled_count = supabase.from_("organization_packs").select("count", count="exact").eq(
                "org_id", org_id
            ).eq("enabled", True).execute()
            
            if enabled_count.count >= 2:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Free plan allows maximum 2 enabled policy packs"
                )
        
        # Enable the pack
        supabase.from_("organization_packs").upsert({
            "org_id": org_id,
            "pack_id": request.pack_id,
            "enabled": True,
            "enabled_at": f"{datetime.now(timezone.utc).isoformat()}"
        }).execute()
        
        return {
            "message": f"Policy pack '{request.pack_id}' enabled successfully",
            "pack_name": pack_data["name"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error enabling policy pack: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.post("/disable")
async def disable_policy_pack(
    request: EnablePackRequest,  # Same schema, different action
    user_info: dict = Depends(verify_jwt_token)
):
    """
    Disable a policy pack for the organization.
    
    Requires JWT authentication.
    """
    try:
        supabase = get_supabase()
        org_id = user_info["org_id"]
        
        # Check if currently enabled
        existing = supabase.from_("organization_packs").select("id").eq(
            "org_id", org_id
        ).eq("pack_id", request.pack_id).eq("enabled", True).execute()
        
        if not existing.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Policy pack '{request.pack_id}' is not currently enabled"
            )
        
        # Disable the pack
        supabase.from_("organization_packs").update({
            "enabled": False,
            "disabled_at": f"{datetime.now(timezone.utc).isoformat()}"
        }).eq("org_id", org_id).eq("pack_id", request.pack_id).execute()
        
        # Get pack name for response
        pack_data = get_pack_by_id(request.pack_id)
        pack_name = pack_data["name"] if pack_data else request.pack_id
        
        return {
            "message": f"Policy pack '{request.pack_id}' disabled successfully",
            "pack_name": pack_name
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error disabling policy pack: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )