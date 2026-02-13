# LUMEN SDK™

**Defensible AI Decisions for Healthcare**

[![npm version](https://badge.fury.io/js/%40forgehealth%2Flumen-sdk.svg)](https://www.npmjs.com/package/@forgehealth/lumen-sdk)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)

> **Every AI decision in healthcare will eventually be questioned. LUMEN makes sure you have the answer.**

LUMEN is runtime governance that **doesn't slow clinicians down**. Every AI-assisted decision gets an auditable, cryptographically signed record — without blocking workflows.

## The Problem

Healthcare AI faces a governance gap:

- **Governance frameworks exist** (NIST, ISO, PHIPA) — but don't enforce at runtime
- **Monitoring tools exist** — but observe AFTER decisions are made  
- **Compliance platforms exist** — but BLOCK workflows and frustrate clinicians

When IT implements restrictive governance, clinicians bypass it (remember WhatsApp vs. Teams?).

## The Solution

LUMEN operates **alongside** AI processes — scoring, recording, never blocking:

```typescript
import { Lumen } from '@forge/lumen-sdk';

const lumen = new Lumen({ 
  domain: 'healthcare', 
  region: 'canada' 
});

// Every AI decision gets a defensible record
const result = await lumen.evaluate({
  aiOutput: modelResponse,
  context: clinicalContext,
  humanAction: 'accepted'
});

console.log(result.lumenScore);        // 78
console.log(result.verdict);           // 'ALLOW'
console.log(result.citationIntegrity); // 0.94
console.log(result.recordId);          // 'LUMEN-ABC123-XYZ'
```

**That's it.** 10 lines. Non-restrictive governance. Audit-ready records.

## What You Get

### LUMEN Score™ (0-100)
A confidence score that answers: "How defensible is this AI decision?"

| Score | Interpretation |
|-------|----------------|
| 85-100 | High confidence — proceed |
| 70-84 | Good — proceed with monitoring |
| 55-69 | Moderate — proceed with caution |
| 40-54 | Low — significant concerns |
| 1-39 | Critical — do not proceed |

### Defensible Decision Record
Every evaluation generates an immutable record containing:
- Decision context (who, what, when)
- AI output hash (what the model said)
- Human action (accepted/rejected/modified)
- Policy evaluation (which rules were checked)
- LUMEN Score with full breakdown
- Cryptographic signature

When the auditor asks "Why did you make that decision?" — you have receipts.

### Assurance Certificate
A human-readable certificate (like the one you can export as PDF):

```
┌─────────────────────────────────────────────────┐
│ ✓ Assurance Certificate          ✓ Signed      │
├─────────────────────────────────────────────────┤
│ FINGERPRINT: LUMEN-8AE6-68B4                    │
│ Cryptographically signed on 2/12/2026, 10:51   │
│                                                 │
│ LUMEN Score: 78/100                            │
│ Risk Tier: Tier 2: Operational                 │
│ Policy Pack: Ontario Healthcare Privacy Pack    │
│                                                 │
│ FRAMEWORKS EVALUATED:                           │
│ [PHIPA] [PIPEDA] [NIST-AI-RMF]                 │
│                                                 │
│ NON-NEGOTIABLES VERIFIED:                       │
│ ✓ PHI consent verification required            │
│ ✓ Canadian data residency mandatory            │
│ ✓ Audit logging immutable                      │
└─────────────────────────────────────────────────┘
```

## Installation

```bash
npm install @forge/lumen-sdk
# or
yarn add @forge/lumen-sdk
# or
pnpm add @forge/lumen-sdk
```

## Quick Start

```typescript
import { Lumen } from '@forge/lumen-sdk';

// Initialize
const lumen = new Lumen({
  domain: 'healthcare',
  region: 'canada',       // Uses PHIPA policy pack
  enforcementMode: 'ADVISORY'  // Never blocks, only advises
});

// Evaluate an AI decision
const result = await lumen.evaluate({
  aiOutput: 'Recommend CT scan based on presenting symptoms',
  context: {
    patientAge: 45,
    chiefComplaint: 'chest pain',
    riskFactors: ['hypertension']
  },
  humanAction: 'accepted',
  modelId: 'gemini-2.5-pro',
  workflowId: 'ed-triage'
});

// Check the result
if (result.passed) {
  console.log('Decision approved:', result.lumenScore);
} else {
  console.log('Review needed:', result.reasons);
}

// Get the audit trail
const auditTrail = lumen.getAuditTrail();
console.log(`${auditTrail.length} events recorded`);

// Verify chain integrity
const integrity = lumen.verifyAuditIntegrity();
console.log('Audit chain valid:', integrity.valid);
```

## Core Concepts

### Non-Restrictive Governance
LUMEN **never blocks** by default. It observes, scores, and records — but the human makes the final call. This is the key insight: restrictive governance gets bypassed; advisory governance gets adopted.

### Enforcement Modes

| Mode | Behavior |
|------|----------|
| `ADVISORY` | Warn only — never blocks (default) |
| `GUARDED` | Block recommended — human can override |
| `STRICT` | Block required — explicit signal |

Even in STRICT mode, LUMEN signals intent but doesn't enforce — maintaining clear liability boundaries.

### Policy Packs
Pre-configured governance rules for specific jurisdictions:

```typescript
// Canadian healthcare (PHIPA, PIPEDA)
const lumen = new Lumen({ domain: 'healthcare', region: 'canada' });

// US healthcare (HIPAA, HITECH)
const lumen = new Lumen({ domain: 'healthcare', region: 'us' });

// Custom pack
const lumen = new Lumen({ 
  domain: 'healthcare',
  policyPack: myCustomPack 
});
```

## API Reference

### `new Lumen(config)`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `domain` | string | required | `'healthcare'` \| `'finance'` \| `'government'` |
| `region` | string | required | `'canada'` \| `'us'` \| `'eu'` \| `'uk'` |
| `apiKey` | string | optional | For hosted API access |
| `enforcementMode` | string | `'ADVISORY'` | Governance strictness |
| `debug` | boolean | `false` | Enable debug logging |

### `lumen.evaluate(input)`

| Input | Type | Description |
|-------|------|-------------|
| `aiOutput` | string | The AI model's output |
| `context` | object | Clinical/business context |
| `humanAction` | string | `'accepted'` \| `'rejected'` \| `'modified'` |
| `modelId` | string | Model identifier |
| `workflowId` | string | Workflow identifier |

Returns: `EvaluateResult`

### `lumen.getAuditTrail()`

Returns the complete audit event chain for this session.

### `lumen.verifyAuditIntegrity()`

Verifies the audit chain hasn't been tampered with.

## Compliance

LUMEN helps with compliance for:

- **PHIPA** (Ontario Personal Health Information Protection Act)
- **PIPEDA** (Canadian federal privacy)
- **HIPAA** (US healthcare)
- **NIST AI RMF** (AI risk management framework)

## Architecture

LUMEN is built on four primitives:

1. **DecisionRecord** — Canonical representation of a decision moment
2. **PolicyPack** — Versioned governance rules
3. **Evaluation** — Deterministic evaluation result
4. **AuditEvent** — Immutable audit trail

See SDK source code for architecture details.

## Enterprise

For enterprise deployments (on-prem, air-gapped, custom compliance):

- **Sidecar deployment** — Zero data egress
- **Custom policy packs** — Your rules, our engine
- **Risk Transfer SLA** — We share legal liability
- **CHAIN Network** — Cross-hospital threat intelligence

Contact: lumen-sdk@forgehealth.ai

## License

Apache 2.0 — See [LICENSE](LICENSE)

Core SDK is open source. Enterprise features (Sidecar, CHAIN, Risk Transfer) are proprietary.

## About

LUMEN SDK™ is built by [Forge Health](https://forgehealth.ai) — AI Activation for Healthcare.

> "AI in healthcare isn't optional anymore. Governance for AI in healthcare shouldn't be either."

---

**Ready to make AI decisions defensible?**

```bash
npm install @forge/lumen-sdk
```

[Documentation](https://forgelumen.ca/docs) · [API Reference](https://forgelumen.ca/docs/api) · [Contact](mailto:lumen-sdk@forgehealth.ai)
