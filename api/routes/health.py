"""Health check endpoint for LUMEN SDK API.

Copyright 2026 Forge Partners Inc.
"""

import os
import time
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, status

from models.schemas import HealthResponse
from auth.supabase_client import health_check as supabase_health_check

router = APIRouter(tags=["Health"])

# Global startup time for uptime calculation
_startup_time = time.time()


@router.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """
    Comprehensive health check endpoint.
    
    Returns:
    - Service status, version, and name
    - Uptime and timestamp
    - Database connectivity status
    
    Used by load balancers, orchestration systems, and monitoring.
    """
    try:
        # Check Supabase connectivity
        supabase_healthy = await supabase_health_check()
        
        # Calculate uptime
        uptime = time.time() - _startup_time
        
        # Overall health status
        status_value = "healthy" if supabase_healthy else "degraded"
        
        return HealthResponse(
            status=status_value,
            version=os.getenv("API_VERSION", "1.0.0"),
            service="lumen-sdk-api",
            timestamp=datetime.now(timezone.utc).isoformat(),
            uptime=round(uptime, 2),
            supabase_healthy=supabase_healthy
        )
        
    except Exception as e:
        # If health check itself fails, return 503
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "status": "unhealthy",
                "message": f"Health check failed: {str(e)}",
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
        )


@router.get("/health/ready", include_in_schema=False)
async def readiness_check():
    """
    Readiness check for Kubernetes.
    
    Returns 200 if service is ready to receive traffic.
    """
    try:
        # Check if Supabase is reachable
        supabase_healthy = await supabase_health_check()
        
        if not supabase_healthy:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Service not ready: database unavailable"
            )
        
        return {"status": "ready"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Service not ready: {str(e)}"
        )


@router.get("/health/live", include_in_schema=False)
async def liveness_check():
    """
    Liveness check for Kubernetes.
    
    Returns 200 if service process is alive.
    """
    return {"status": "alive"}