# LUMEN SDK API

Enterprise-grade API for AI output evaluation and defensible record generation in healthcare applications.

**Copyright 2026 Forge Partners Inc.**

## 🚀 Quick Start

### Prerequisites

- Python 3.12+
- Supabase account and project
- Environment variables configured (see `.env.example`)

### Installation

```bash
# Clone and setup
git clone <repository-url>
cd lumen-sdk/api

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your Supabase credentials

# Run development server
python main.py
```

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up --build

# Or build manually
docker build -t lumen-api .
docker run -p 8000:8000 --env-file .env lumen-api
```

## 📚 API Documentation

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI Spec**: http://localhost:8000/openapi.json

## 🔑 Authentication

### API Keys

All evaluation endpoints require API key authentication:

```bash
curl -X POST https://api.lumen.forge.health/v1/evaluate \
  -H "X-API-Key: lumen_pk_live_..." \
  -H "Content-Type: application/json" \
  -d '{
    "ai_output": "Patient shows signs of...",
    "human_action": "accepted",
    "compliance_packs": ["ca-on-phipa", "us-fed-hipaa"]
  }'
```

### JWT Tokens

Portal management endpoints require JWT authentication from Supabase:

```bash
curl -X POST https://api.lumen.forge.health/v1/keys/generate \
  -H "Authorization: Bearer <supabase-jwt>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Production API Key",
    "environment": "live"
  }'
```

## 🛡️ Policy Packs

Six comprehensive compliance packs:

| Pack ID | Name | Jurisdiction | Tier | Checks |
|---------|------|--------------|------|--------|
| `ca-on-phipa` | Ontario PHIPA Healthcare | Canada — Ontario | Free | 15 |
| `us-fed-hipaa` | US Federal HIPAA Compliance | United States — Federal | Free | 18 |
| `ca-fed-pipeda` | Canada Federal PIPEDA | Canada — Federal | Free | 12 |
| `us-fed-fda-aiml` | US FDA AI/ML Medical Device | United States — FDA | Pro | 14 |
| `us-fed-nist-ai` | NIST AI Risk Management | United States — Federal | Free | 10 |
| `eu-ai-act` | EU AI Act Compliance | European Union | Pro | 16 |

## 📊 Rate Limits & Usage

### Plan Limits

| Plan | Rate Limit | Monthly Evaluations | API Keys | Policy Packs |
|------|------------|-------------------|----------|-------------|
| Free | 100/minute | 1,000 | 2 | 2 |
| Pro  | 1,000/minute | 50,000 | 10 | All |

### Headers

All responses include usage headers:

- `X-RateLimit-Limit`: Requests per minute
- `X-RateLimit-Remaining`: Remaining in current window
- `X-Lumen-Usage-Used`: Evaluations used this month
- `X-Lumen-Usage-Warning`: Warning when approaching limits

## 🏗️ Architecture

### Core Components

- **FastAPI**: Web framework with automatic OpenAPI docs
- **Supabase**: Backend-as-a-Service for auth and data
- **bcrypt**: Secure API key hashing
- **Pydantic**: Request/response validation
- **Custom Middleware**: Rate limiting and usage tracking

### Security Features

- **API Key Authentication**: bcrypt-hashed keys with prefix indexing
- **JWT Verification**: Supabase-based portal authentication  
- **Rate Limiting**: Sliding window with plan-based limits
- **Usage Tracking**: Monthly evaluation counting
- **CORS**: Configured for production origins
- **Environment Isolation**: Separate keys for dev/test/live

### Database Schema

Required Supabase tables:

```sql
-- Organizations
CREATE TABLE organizations (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  plan TEXT NOT NULL CHECK (plan IN ('free', 'pro')),
  owner_id UUID REFERENCES auth.users(id),
  legal_acknowledgment BOOLEAN DEFAULT FALSE,
  legal_acknowledgment_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- API Keys
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  environment TEXT NOT NULL CHECK (environment IN ('live', 'test', 'dev')),
  key_prefix TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
  allowed_origins TEXT[],
  ip_allowlist TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ
);

-- Usage Tracking
CREATE TABLE api_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),
  period_start TIMESTAMPTZ NOT NULL,
  evaluations_count INTEGER DEFAULT 0,
  last_evaluation_at TIMESTAMPTZ
);

-- Enabled Policy Packs
CREATE TABLE organization_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),
  pack_id TEXT NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  enabled_at TIMESTAMPTZ DEFAULT NOW(),
  disabled_at TIMESTAMPTZ
);
```

## 🧪 Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=. --cov-report=html

# Run specific test file
pytest tests/test_enterprise.py

# Run specific test
pytest tests/test_enterprise.py::TestPolicyPacks::test_list_packs_public
```

## 🚀 Deployment

### Environment Variables

Required for production:

```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIs...
CORS_ORIGINS=https://developer.forgelumen.ca
API_VERSION=1.0.0
LOG_LEVEL=info
```

### Health Checks

- `/health` - Comprehensive health with DB status
- `/health/ready` - Kubernetes readiness probe
- `/health/live` - Kubernetes liveness probe

### Monitoring

- Structured JSON logging
- Automatic error tracking
- Usage analytics
- Performance metrics

## 📞 Support

- **Documentation**: `/docs` endpoint (Swagger UI)
- **Developer Portal**: https://developer.forgelumen.ca  
- **Support Email**: support@forgelumen.ca
- **Status Page**: Monitor API health and incidents

---

**LUMEN SDK API** - Defensible AI compliance for healthcare applications  
Copyright 2026 Forge Partners Inc. | All rights reserved