"""LUMEN SDK API - FastAPI Application.

Enterprise-ready API for AI output evaluation and defensible record generation.

Copyright 2026 Forge Partners Inc.
"""

import sys
import os
import asyncio
from pathlib import Path

# Add the api directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

# Route imports
from routes import evaluate, health, records, keys, packs

# Middleware imports
from middleware import UsageTrackingMiddleware, RateLimitMiddleware, cleanup_rate_limits

# Auth imports  
from auth.supabase_client import init_supabase

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# API metadata
API_TITLE = "LUMEN SDK API"
API_DESCRIPTION = """
## LUMEN - Legal Understanding & Medical Evaluation Network

The LUMEN SDK API provides enterprise-grade endpoints for:

- **Evaluation**: Analyze AI outputs for compliance with healthcare regulations
- **Records**: Retrieve and manage defensible audit records  
- **API Keys**: Manage authentication keys with plan-based limits
- **Policy Packs**: Configure compliance frameworks (PHIPA, HIPAA, FDA, etc.)

### Authentication

API endpoints require authentication via the `X-API-Key` header:

```bash
curl -X POST https://api.lumen.forge.health/v1/evaluate \\
  -H "X-API-Key: lumen_pk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "ai_output": "Patient John Doe...",
    "human_action": "accepted",
    "compliance_packs": ["ca-on-phipa"]
  }'
```

Portal management endpoints require JWT authentication from Supabase.

### Rate Limits

- **Free Plan**: 100 requests/minute, 1,000 evaluations/month
- **Pro Plan**: 1,000 requests/minute, 50,000 evaluations/month

Rate limit headers included in all responses:
- `X-RateLimit-Limit`: Request limit per window
- `X-RateLimit-Remaining`: Requests remaining in window
- `X-Lumen-Usage-Used`: Evaluations used this month
- `X-Lumen-Usage-Warning`: Warning when approaching limits

### Compliance Packs

Six comprehensive policy packs covering major healthcare regulations:

- **ca-on-phipa**: Ontario PHIPA Healthcare Pack (Free)
- **us-fed-hipaa**: US Federal HIPAA Compliance Pack (Free)  
- **ca-fed-pipeda**: Canada Federal PIPEDA Pack (Free)
- **us-fed-fda-aiml**: US FDA AI/ML Medical Device Pack (Pro)
- **us-fed-nist-ai**: NIST AI Risk Management Pack (Free)
- **eu-ai-act**: EU AI Act Compliance Pack (Pro)

### Error Handling

All endpoints return structured error responses:

```json
{
  "detail": "Error description",
  "status_code": 400,
  "timestamp": "2026-02-13T15:30:00Z"
}
```

### Support

- **Documentation**: Available at `/docs` (Swagger UI)
- **Developer Portal**: https://developer.forgelumen.ca
- **Status Page**: Monitor API health and incidents

---

**Copyright 2026 Forge Partners Inc.** | Enterprise healthcare AI compliance platform
"""

API_VERSION = os.getenv("API_VERSION", "1.0.0")

# Initialize FastAPI app
app = FastAPI(
    title=API_TITLE,
    description=API_DESCRIPTION,
    version=API_VERSION,
    docs_url="/docs",
    redoc_url="/redoc", 
    openapi_url="/openapi.json",
    contact={
        "name": "Forge Partners Inc.",
        "url": "https://forgelumen.ca",
        "email": "support@forgelumen.ca"
    },
    license_info={
        "name": "Proprietary",
        "url": "https://forgelumen.ca/license"
    },
    servers=[
        {
            "url": "https://api.lumen.forge.health",
            "description": "Production server"
        },
        {
            "url": "https://api-staging.lumen.forge.health", 
            "description": "Staging server"
        },
        {
            "url": "http://localhost:8000",
            "description": "Local development server"
        }
    ]
)

# CORS middleware - configured for production
cors_origins = os.getenv("CORS_ORIGINS", "").split(",")
if not cors_origins or cors_origins == [""]:
    cors_origins = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8000",
        "https://developer.forgelumen.ca",
        "https://lumen.forge.health",
        "https://*.forge.health",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=[
        "X-RateLimit-Limit",
        "X-RateLimit-Remaining", 
        "X-RateLimit-Reset",
        "X-Lumen-Usage-Limit",
        "X-Lumen-Usage-Used",
        "X-Lumen-Usage-Remaining",
        "X-Lumen-Usage-Warning"
    ]
)

# Add middleware (order matters!)
app.add_middleware(RateLimitMiddleware)
app.add_middleware(UsageTrackingMiddleware)

# Include routers
app.include_router(health.router)
app.include_router(evaluate.router) 
app.include_router(records.router)
app.include_router(keys.router)
app.include_router(packs.router)


@app.on_event("startup")
async def startup_event():
    """Initialize services on startup."""
    try:
        logger.info(f"🚀 {API_TITLE} v{API_VERSION} starting up...")
        
        # Initialize Supabase client
        init_supabase()
        logger.info("✅ Supabase client initialized")
        
        # Start background tasks
        asyncio.create_task(cleanup_rate_limits())
        logger.info("✅ Background tasks started")
        
        logger.info("🎯 LUMEN API ready for enterprise healthcare AI compliance")
        
    except Exception as e:
        logger.error(f"❌ Startup failed: {e}")
        raise


@app.on_event("shutdown") 
async def shutdown_event():
    """Cleanup on shutdown."""
    logger.info(f"👋 {API_TITLE} shutting down...")
    # Future: cleanup database connections, background tasks, etc.


@app.get("/", include_in_schema=False)
async def root():
    """Root endpoint redirect."""
    return {
        "message": "LUMEN SDK API",
        "version": API_VERSION,
        "documentation": "/docs",
        "health": "/health",
        "copyright": "© 2026 Forge Partners Inc."
    }


if __name__ == "__main__":
    import uvicorn
    
    # Development server configuration
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level=os.getenv("LOG_LEVEL", "info").lower(),
        access_log=True
    )