# Changelog

All notable changes to the LUMEN SDK will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.4] - 2026-02-13

### Changed
- Migrated repository to `forge-health-ai` GitHub organization
- Updated all documentation links and references
- Cleaned repository history for production readiness

## [1.0.3] - 2026-02-12

### Changed
- Updated all package references to `forge-health-ai` organization
- Removed internal architecture documents from public repository

## [1.0.2] - 2026-02-12

### Added
- Comprehensive API reference documentation (`docs/API_REFERENCE.md`)

## [1.0.1] - 2026-02-12

### Fixed
- README headline, contact email, documentation links, npm badge

## [1.0.0] - 2026-02-12

### Added

#### Core Primitives (DDRL — Defensible Decision Record Layer)
- **DecisionRecord** — Canonical representation of a decision moment (human + AI + context)
- **PolicyPack** — Versioned governance artifacts with compliance rules (PHIPA, HIPAA, NIST)
- **Evaluation** — Deterministic evaluation results with LUMEN Score™
- **AuditEvent** — Tamper-evident audit chain with hash linking

#### LUMEN Score™ Algorithm
- Multi-Criteria Decision Analysis (MCDA) with configurable weights
- Monte Carlo risk adjustment for worst-case scoring
- Risk Radar (7-point assessment: legal, labour, safety, ethics, cyber, finance, reputation)
- NIST AI RMF weighting integration
- Score provenance for complete audit trail

#### Policy Packs
- `ca-on-healthcare-phipa` — Ontario Healthcare Privacy Pack (PHIPA, PIPEDA, NIST-AI-RMF)
- `us-healthcare-hipaa` — US Healthcare Pack (HIPAA, HITECH, NIST-AI-RMF)

#### API
- FastAPI skeleton with `/v1/evaluate` and `/v1/records` endpoints
- API key authentication
- Docker-ready deployment
- Swagger/OpenAPI documentation

#### Documentation
- Security & compliance documentation (SOC 2 aligned)
- Integration guide with code examples

### Security
- Cryptographic hashing (SHA-256) for decision records
- Tamper-evident audit chain
- No PHI storage by default (pointers + hashes only)
- PHIPA/HIPAA compliance-ready architecture

### Infrastructure
- TypeScript SDK with full type definitions
- ESM and CommonJS builds
- CI/CD pipeline (GitHub Actions)
- npm package: `@forgehealth/lumen-sdk`

---

## Version History

| Version | Date | Highlights |
|---------|------|------------|
| 1.0.4 | 2026-02-13 | Repository migration and documentation cleanup |
| 1.0.3 | 2026-02-12 | Organization transfer to forge-health-ai |
| 1.0.2 | 2026-02-12 | API reference documentation |
| 1.0.1 | 2026-02-12 | README and link fixes |
| 1.0.0 | 2026-02-12 | Initial release — Core primitives, LUMEN Score™, API |

---

## Roadmap

### 1.1.0 (Planned)
- Citation Integrity Engine
- Additional LLM adapters (OpenAI, Anthropic, Azure)

### 1.2.0 (Planned)
- EvidenceGraph primitive (claim → evidence → provenance)
- Break Glass Protocol for clinical emergencies
- Enhanced PHI detection (regex + ONNX)

### 2.0.0 (Planned)
- Sidecar deployment mode (on-prem, air-gapped)
- OCI artifact distribution
- CHAIN cross-hospital intelligence network
- Risk Transfer SLA framework

---

[Unreleased]: https://github.com/forge-health-ai/lumen-sdk/compare/v1.0.4...HEAD
[1.0.4]: https://github.com/forge-health-ai/lumen-sdk/compare/v1.0.3...v1.0.4
[1.0.3]: https://github.com/forge-health-ai/lumen-sdk/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/forge-health-ai/lumen-sdk/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/forge-health-ai/lumen-sdk/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/forge-health-ai/lumen-sdk/releases/tag/v1.0.0
