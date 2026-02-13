"""Pydantic models for LUMEN SDK API request/response schemas."""

from enum import Enum
from typing import Any, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class HumanAction(str, Enum):
    """Human action taken on AI output."""
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    MODIFIED = "modified"


class Verdict(str, Enum):
    """LUMEN evaluation verdict."""
    ALLOW = "ALLOW"
    WARN = "WARN"
    BLOCK = "BLOCK"


class EvaluateRequest(BaseModel):
    """Request body for /v1/evaluate endpoint."""
    ai_output: str = Field(..., description="The AI-generated output to evaluate")
    context: dict[str, Any] = Field(default_factory=dict, description="Additional context for evaluation")
    human_action: HumanAction = Field(..., description="Action taken by human on the AI output")
    compliance_packs: list[str] = Field(default_factory=list, description="Compliance packs to evaluate against (e.g., 'phipa', 'hipaa')")

    model_config = {
        "json_schema_extra": {
            "example": {
                "ai_output": "Patient John Doe has diabetes and takes metformin.",
                "context": {"session_id": "abc123", "user_role": "physician"},
                "human_action": "accepted",
                "compliance_packs": ["phipa"]
            }
        }
    }


class EvaluateResponse(BaseModel):
    """Response body for /v1/evaluate endpoint."""
    record_id: UUID = Field(..., description="Unique identifier for this evaluation record")
    lumen_score: int = Field(..., ge=0, le=100, description="LUMEN score (0-100)")
    tier: int = Field(..., ge=1, le=3, description="Risk tier (1=low, 2=medium, 3=high)")
    verdict: Verdict = Field(..., description="Evaluation verdict")
    citation_integrity: float = Field(..., ge=0, le=1, description="Citation integrity score (0-1)")
    defensible_record_url: str = Field(..., description="URL to access the defensible record")

    model_config = {
        "json_schema_extra": {
            "example": {
                "record_id": "550e8400-e29b-41d4-a716-446655440000",
                "lumen_score": 85,
                "tier": 1,
                "verdict": "ALLOW",
                "citation_integrity": 0.95,
                "defensible_record_url": "https://lumen.forge.health/records/550e8400-e29b-41d4-a716-446655440000"
            }
        }
    }


class RecordResponse(BaseModel):
    """Response body for /v1/records/{id} endpoint."""
    record_id: UUID
    ai_output: str
    human_action: HumanAction
    compliance_packs: list[str]
    lumen_score: int
    tier: int
    verdict: Verdict
    citation_integrity: float
    created_at: str
    context: dict[str, Any] = Field(default_factory=dict)


class HealthResponse(BaseModel):
    """Response body for /health endpoint."""
    status: str = "healthy"
    version: str
    service: str = "lumen-sdk-api"
