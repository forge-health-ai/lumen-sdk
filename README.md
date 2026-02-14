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
import { Lumen } from '@forgehealth/lumen-sdk';

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

## Why Trust the LUMEN Score?

**The LUMEN Score is to healthcare AI what a credit score is to lending** — standardized, objective, and backed by recognized frameworks.

### Built on Public Standards, Not Black-Box Magic

LUMEN doesn't invent its own rules. It scores against frameworks that healthcare leaders already trust:

| Framework | Who Created It | Why It Matters |
|-----------|---------------|----------------|
| **NIST AI RMF** | U.S. National Institute of Standards | The gold standard for AI risk management |
| **CHAI** | Coalition for Health AI (Mayo, Duke, WHO, Google) | Healthcare-specific AI assurance standards |
| **ISO 42001** | International Organization for Standardization | Global AI management system certification |
| **PHIPA** | Ontario Legislature | Ontario's health privacy law |
| **HIPAA** | U.S. Congress | U.S. health data protection |
| **FDA TPLC** | U.S. Food and Drug Administration | AI/ML medical device lifecycle framework |

### 10 Scoring Domains — Transparent and Documented

Every LUMEN Score evaluates across 10 domains aligned to [CHAI's Assurance Standards](https://www.coalitionforhealthai.org/):

1. **Clinical Safety** — Could this AI output cause patient harm?
2. **Bias & Fairness** — Does the output exhibit demographic bias?
3. **Privacy & Security** — Does it comply with PHI/PII protection requirements?
4. **Transparency** — Can the reasoning be explained to a clinician?
5. **Regulatory Compliance** — Does it meet jurisdiction-specific legal requirements?
6. **Data Quality** — Is the underlying data fit for clinical use?
7. **Operational Readiness** — Is the organization prepared to deploy safely?
8. **Human Oversight** — Is there appropriate human-in-the-loop governance?
9. **Accountability** — Is there clear ownership and audit trail?
10. **Interoperability** — Does it integrate with existing clinical workflows?

### Hard Gates — Non-Negotiable Safety

Some rules aren't scored — they're **binary pass/fail**. If PHIPA s.12 (collection limitation) is violated, the LUMEN Score drops to zero automatically. No exceptions. No overrides. This is how regulatory compliance works in healthcare.

### Deterministic and Auditable

- **Same inputs → same score.** Always. No randomness, no model drift.
- **Every score produces a signed decision record** with full traceability — what was evaluated, which rules fired, what the breakdown was.
- **Scores are objective. Thresholds are yours.** A LUMEN Score of 65 means the same thing at every hospital. Whether your organization treats 65 as ALLOW or REVIEW is your risk tolerance, not ours.

### Independent Verification

The scoring methodology is designed for third-party audit. Any qualified assessor can:
- Review which frameworks and rules were applied
- Verify the domain-level breakdown
- Confirm hard gate enforcement
- Validate the cryptographic audit chain

> *"You come with the most creative way of mitigating risk with LLM right now that I've been hearing."*
> — Antoine Vaillancourt-Dutil, Google

---

## Getting Started

### Step 1: Install the SDK

```bash
npm install @forgehealth/lumen-sdk
```

### Step 2: Choose Your Policy Packs

Policy packs contain jurisdiction-specific governance rules. Pick the packs that match your regulatory environment:

| Pack | Jurisdiction | Covers |
|------|-------------|--------|
| `ca-on-phipa` | Ontario, Canada | PHIPA, Ontario privacy |
| `ca-fed-pipeda` | Canada (federal) | PIPEDA, Bill C-27/AIDA |
| `us-fed-hipaa` | United States | HIPAA, HITECH |
| `us-fed-fda-aiml` | United States | FDA AI/ML SaMD guidance |
| `us-fed-nist-ai` | United States | NIST AI RMF 1.0 |
| `eu-ai-act` | European Union | EU AI Act |

The SDK ships with bundled packs. For **continuously updated packs** powered by our Legislative Intelligence Scanner, connect to the hosted API.

### Step 3: Get an API Key (Optional — For Hosted Packs)

Free tier gives you 1,000 evaluations/month with 2 policy packs.

1. Visit **[developer.forgelumen.ca](https://developer.forgelumen.ca)**
2. Create an account
3. Select your policy packs
4. Generate your API key
5. Add to your environment: `LUMEN_API_KEY=lumen_pk_...`

Without an API key, the SDK runs fully offline using bundled policy packs (updated with each npm release).

### Step 4: Evaluate

```typescript
import { Lumen } from '@forgehealth/lumen-sdk';

const lumen = new Lumen({
  domain: 'healthcare',
  region: 'canada',
  apiKey: process.env.LUMEN_API_KEY  // optional
});

const result = await lumen.evaluate({
  aiOutput: modelResponse,
  context: clinicalContext,
  humanAction: 'accepted'
});
```

> ⚠️ **Important:** Read the [Healthcare Disclaimer](HEALTHCARE_DISCLAIMER.md) and [Terms of Service](TERMS_OF_SERVICE.md) before deploying in clinical environments. LUMEN is a governance tool — not a clinical decision support system.

## Quick Start

```typescript
import { Lumen } from '@forgehealth/lumen-sdk';

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

## Legal & Compliance

- **[Terms of Service](TERMS_OF_SERVICE.md)** — Binding terms for SDK, API, and hosted services
- **[Healthcare Disclaimer](HEALTHCARE_DISCLAIMER.md)** — Critical disclaimers for clinical environments
- **[Security Policy](SECURITY.md)** — Vulnerability disclosure process
- **[License](LICENSE)** — Apache 2.0

**Key points:**
- LUMEN is a governance tool, NOT a medical device or clinical decision support system
- LUMEN Scores are governance indicators, NOT clinical safety ratings or compliance certifications
- Users are solely responsible for clinical decisions and regulatory compliance
- Do NOT submit PHI/PII to LUMEN Services
- Forge Partners Inc. bears no liability for clinical outcomes

## License

Apache 2.0 — See [LICENSE](LICENSE)

Core SDK is open source. Hosted Policy Packs, Legislative Intelligence, and Enterprise features are proprietary to Forge Partners Inc.

## About

LUMEN SDK™ is built by [Forge Health](https://forgehealth.ai) — AI Activation for Healthcare.

> "AI in healthcare isn't optional anymore. Governance for AI in healthcare shouldn't be either."

---

**Ready to make AI decisions defensible?**

```bash
npm install @forgehealth/lumen-sdk
```

[Documentation](https://github.com/forge-health-ai/lumen-sdk#readme) · [API Reference](https://github.com/forge-health-ai/lumen-sdk/blob/main/docs/API_REFERENCE.md) · [Contact](mailto:lumen-sdk@forgehealth.ai)
