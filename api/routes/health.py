"""Health check endpoint for LUMEN SDK API."""

from fastapi import APIRouter

from models.schemas import HealthResponse

router = APIRouter(tags=["Health"])

VERSION = "0.1.0"


@router.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """
    Health check endpoint.
    
    Returns service status, version, and name.
    Used by load balancers and orchestration systems.
    """
    return HealthResponse(
        status="healthy",
        version=VERSION,
        service="lumen-sdk-api"
    )
