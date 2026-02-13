"""LUMEN SDK API - FastAPI Application.

Production-ready API for AI output evaluation and defensible record generation.
"""

import sys
from pathlib import Path

# Add the api directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes import evaluate, health, records

# API metadata
API_TITLE = "LUMEN SDK API"
API_DESCRIPTION = """
## LUMEN - Legal Understanding & Medical Evaluation Network

The LUMEN SDK API provides endpoints for:

- **Evaluation**: Analyze AI outputs for compliance with healthcare regulations
- **Records**: Retrieve and manage defensible audit records
- **Compliance Packs**: Support for PHIPA, HIPAA, and other frameworks

### Authentication

All endpoints (except `/health`) require an API key via the `X-API-Key` header.

### Quick Start

```bash
curl -X POST https://api.lumen.forge.health/v1/evaluate \\
  -H "X-API-Key: your-api-key" \\
  -H "Content-Type: application/json" \\
  -d '{"ai_output": "...", "human_action": "accepted", "compliance_packs": ["phipa"]}'
```
"""

API_VERSION = "1.0.0"

# Initialize FastAPI app
app = FastAPI(
    title=API_TITLE,
    description=API_DESCRIPTION,
    version=API_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# CORS middleware - configure for production
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:8000",
        "https://lumen.forge.health",
        "https://*.forge.health",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router)
app.include_router(evaluate.router)
app.include_router(records.router)


@app.on_event("startup")
async def startup_event():
    """Initialize services on startup.
    
    Future versions will initialize:
    - Database connections (PostgreSQL)
    - Compliance pack definitions
    - Scoring engine components
    """
    print(f"🚀 {API_TITLE} v{API_VERSION} starting up...")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown.
    
    Future versions will handle:
    - Database connection cleanup
    - Resource deallocation
    """
    print(f"👋 {API_TITLE} shutting down...")


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
