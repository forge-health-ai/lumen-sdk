# LUMEN SDK Security & Compliance Documentation

## Overview

The LUMEN SDK handles healthcare AI governance, which may involve processing context about patient data, clinical workflows, and compliance requirements. This document describes security controls and compliance alignment.

## Data Classification

### What LUMEN Processes

| Data Type | Classification | Handling |
|-----------|---------------|----------|
| Use case descriptions | Confidential | Encrypted at rest, logged |
| Compliance evaluations | Confidential | Encrypted, audit trail |
| Score results | Confidential | Encrypted, versioned |
| Knowledge base (legislation) | Public | Cached locally |
| Academic research | Public | Cached locally |

### What LUMEN Does NOT Process

- **No PHI/PII**: LUMEN evaluates AI USE CASES, not patient data
- **No clinical data**: Descriptions may reference data types but not actual records
- **No authentication credentials**: SDK uses API keys, not user passwords

## Encryption

### At Rest
- PostgreSQL: AES-256 encryption
- Pinecone: Encrypted by default (managed service)
- Local caches: Encrypted volume (deployment-specific)

### In Transit
- All API calls: TLS 1.3
- Inter-service: mTLS where applicable
- No plaintext transmission of evaluation data

## Authentication & Authorization

### SDK Authentication
```python
# API key authentication
evaluator = LumenEvaluator(
    api_key=os.environ["LUMEN_API_KEY"],
    org_id="org_sickkids_001"
)
```

### Role-Based Access
| Role | Permissions |
|------|-------------|
| `admin` | Full access, configuration, user management |
| `evaluator` | Create evaluations, view results |
| `viewer` | View results only |
| `auditor` | Read-only access to audit trail |

### API Key Scopes
```
lumen:evaluate      # Create evaluations
lumen:results:read  # View results
lumen:audit:read    # Access audit trail
lumen:config:write  # Modify configuration
```

## Audit Logging

### Events Logged

| Event | Data Captured |
|-------|---------------|
| `evaluation.started` | Timestamp, user, use_case_hash |
| `evaluation.completed` | Score, evidence_block, duration |
| `kill_switch.triggered` | Reason, use_case_hash, timestamp |
| `knowledge_base.updated` | Collection, version_change, timestamp |
| `auth.success` | User, IP, timestamp |
| `auth.failure` | Attempted user, IP, timestamp |

### Retention
- Audit logs: 7 years (healthcare regulatory requirement)
- Evaluation results: Configurable (default 7 years)
- Raw request logs: 90 days

### Log Format
```json
{
  "timestamp": "2026-02-12T15:30:00Z",
  "event": "evaluation.completed",
  "org_id": "org_sickkids_001",
  "user_id": "user_123",
  "record_id": "eval_abc123",
  "score": 67,
  "duration_ms": 2847,
  "kill_switch": false,
  "citation_integrity": 0.94
}
```

## Compliance Alignment

### PHIPA (Ontario)
- No PHI processed directly
- Evaluations assess PHIPA compliance of proposed AI use cases
- Audit trail satisfies accountability requirements

### HIPAA (US)
- SDK can operate as Business Associate if processing US healthcare contexts
- BAA template available for enterprise deployments
- No ePHI stored in SDK infrastructure

### SOC 2 Type II (Target)
| Control | Implementation |
|---------|----------------|
| CC6.1 Logical Access | Role-based access, API key scopes |
| CC6.6 System Boundaries | Network segmentation, firewall rules |
| CC7.2 System Monitoring | Audit logging, anomaly detection |
| CC8.1 Change Management | Version control, ADRs, release process |

### NIST AI RMF Alignment
The SDK itself aligns with NIST AI RMF:
- **Govern**: This security documentation, access controls
- **Map**: Data flow documentation, stakeholder identification
- **Measure**: Citation integrity monitoring, score validation
- **Manage**: Incident response, version rollback capability

## Incident Response

### Severity Levels

| Level | Definition | Response Time |
|-------|------------|---------------|
| P1 | Data breach, service down | 15 minutes |
| P2 | Security vulnerability, partial outage | 1 hour |
| P3 | Performance degradation, non-critical bug | 4 hours |
| P4 | Minor issue, feature request | 24 hours |

### Response Process
1. **Detect**: Automated monitoring, user report, audit log alert
2. **Triage**: Severity classification, impact assessment
3. **Contain**: Isolate affected systems, preserve evidence
4. **Remediate**: Fix root cause, deploy patch
5. **Recover**: Restore service, verify integrity
6. **Review**: Post-incident analysis, documentation update

### Contact
- Security issues: security@forgehealth.ai
- Urgent (P1/P2): [On-call escalation process]

## Dependency Security

### Vulnerability Scanning
- Dependabot enabled for all repositories
- Weekly dependency audit
- No known critical CVEs in production

### License Compliance
All dependencies audited for:
- No GPL (copyleft) in core SDK
- MIT, Apache 2.0, BSD preferred
- License inventory maintained

### Supply Chain
- Pinned dependency versions
- Lock files committed
- Signed releases (future)

## Secure Development

### Code Review
- All changes require PR approval
- Security-sensitive changes require 2 reviewers
- Automated SAST scanning (Semgrep)

### Secrets Management
- No secrets in code
- Environment variables for configuration
- Secrets manager for production (AWS Secrets Manager / GCP Secret Manager)

### Testing
- Unit tests for security controls
- Integration tests for auth flows
- Penetration testing (annual, third-party)

## Deployment Security

### Infrastructure
- Cloud-native (GCP Vertex AI integration ready)
- VPC isolation
- No public database endpoints

### Container Security
- Minimal base images (distroless)
- No root processes
- Read-only filesystem where possible

### Network
- Ingress: Load balancer with WAF
- Egress: Allowlist for external APIs
- Internal: Service mesh (future)
