# LUMEN SDK API

Production-ready FastAPI backend for the LUMEN SDK — Defensible AI Decisions for Healthcare.

## Quick Start

### Local Development

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows

# Install dependencies
pip install -r requirements.txt

# Run development server
python main.py
# or
uvicorn main:app --reload --port 8000
```

API available at: http://localhost:8000

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- OpenAPI JSON: http://localhost:8000/openapi.json

### Docker

```bash
# Build image
docker build -t lumen-sdk-api .

# Run container
docker run -p 8000:8000 lumen-sdk-api
```

## API Endpoints

### Health Check
```bash
GET /health
```

Returns service health status. No authentication required.

### Evaluate AI Output
```bash
POST /v1/evaluate
X-API-Key: your-api-key
Content-Type: application/json

{
  "ai_output": "Patient diagnosis suggests Type 2 Diabetes...",
  "context": {"session_id": "abc123"},
  "human_action": "accepted",
  "compliance_packs": ["phipa"]
}
```

Response:
```json
{
  "record_id": "550e8400-e29b-41d4-a716-446655440000",
  "lumen_score": 85,
  "tier": 1,
  "verdict": "ALLOW",
  "citation_integrity": 0.95,
  "defensible_record_url": "https://api.forgelumen.ca/v1/records/550e8400..."
}
```

### Get Record by ID
```bash
GET /v1/records/{record_id}
X-API-Key: your-api-key
```

Returns a specific defensible decision record.

### List Records
```bash
GET /v1/records?skip=0&limit=10
X-API-Key: your-api-key
```

Returns paginated list of decision records.

## Authentication

All endpoints except `/health` require an API key via the `X-API-Key` header.

**Development keys** (for local testing only):
- `lumen-dev-key-001`
- `lumen-test-key-001`

> ⚠️ Production deployments must use secure, rotated API keys.

## Project Structure

```
api/
├── main.py              # FastAPI application entry point
├── routes/
│   ├── evaluate.py      # POST /v1/evaluate
│   ├── records.py       # GET /v1/records, GET /v1/records/{id}
│   └── health.py        # GET /health
├── auth/
│   └── api_keys.py      # API key validation
├── models/
│   └── schemas.py       # Pydantic request/response models
├── requirements.txt     # Python dependencies
├── Dockerfile           # Production container image
└── README.md
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `8000` |
| `RECORDS_BASE_URL` | Base URL for record links | `https://api.forgelumen.ca/v1/records` |

## Roadmap

The following enhancements are planned for future releases:

| Feature | Target Version | Status |
|---------|----------------|--------|
| Full scoring engine integration | v1.1.0 | In Progress |
| PostgreSQL persistence | v1.1.0 | Planned |
| Production API key management | v1.1.0 | Planned |
| Compliance pack engine | v1.2.0 | Planned |
| Rate limiting | v1.1.0 | Planned |
| Structured logging | v1.1.0 | Planned |
| Metrics/monitoring | v1.2.0 | Planned |

See [CHANGELOG.md](../CHANGELOG.md) for release history and upcoming features.

## Current Implementation Note

This v1.0.0 release provides the API structure and contract with simplified scoring logic. 
The full LUMEN Score™ algorithm (MCDA + Monte Carlo + NIST weighting) is implemented in the 
TypeScript SDK (`src/scoring/LumenScore.ts`) and will be integrated in v1.1.0.

The current API demonstrates:
- Complete request/response contracts
- Authentication flow
- Record structure
- Defensible record generation

## License

Apache-2.0 — See [LICENSE](../LICENSE)

Copyright 2026 Forge Partners Inc.
