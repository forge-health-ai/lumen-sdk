# LUMEN-X™ SDK
## Runtime AI Governance Engine for Production Inference Pipelines

[![npm version](https://badge.fury.io/js/@forgehealth/lumen-sdk.svg)](https://www.npmjs.com/package/@forgehealth/lumen-sdk)
[![License](https://img.shields.io/badge/license-FORGE%20Proprietary-red.svg)](https://forgelumen.ai/license)
[![Patent](https://img.shields.io/badge/patent-CA%203304173-green.svg)](https://www.cipo.ic.gc.ca)

> LUMEN-X reads the layer of every AI output that human reviewers cannot see — and scores it before anyone acts.
> Protected by Canadian Patent Application No. 3304173 (Filed March 9, 2026)

---

## The Problem with AI Governance Today

Current governance tools evaluate what the AI said. They read the recommendation, the text, the decision — and check it against a policy list.

That misses the harder question.

The harder question isn't *what* the AI said. It's *under what conditions* that recommendation was generated — and whether those conditions are trustworthy enough to act on.

Was the source system identified and validated? Is the model's training data current relative to active clinical guidelines? Is there a named human accountable for this decision? Is this running at 3am with 40% staffing or during a fully-staffed day shift?

These signals are machine-readable. They exist in every AI output. But they are invisible to human reviewers — and no governance tool has been built to read them at runtime, before anyone acts.

That is the problem LUMEN-X solves.

---

## Installation

npm install @forgehealth/lumen-sdk

Requires Node.js 18+.

---

## Quick Start

```typescript
import { LumenX } from '@forgehealth/lumen-sdk';

const lumen = new LumenX({
  apiKey: process.env.LUMEN_API_KEY
});

const result = await lumen.evaluate({
  input: {
    ai_output: "Recommend CT scan based on presenting symptoms",
    context: {
      patient_age: 45,
      chief_complaint: "chest pain",
      risk_factors: ["hypertension"]
    }
  },
  metadata: {
    model_id: "your-model",
    source_system: "ED_Triage_v2.3",
    confidence_score: 0.87,
    named_physician: "Dr. Sarah Chen",
    workflow_id: "emergency-triage"
  }
});

console.log(result.lumen_score);        // 71
console.log(result.tier);               // "CAUTION"
console.log(result.human_loop_required); // true — always
console.log(result.gdr_id);             // "LUMEN-8AE6-68B4-20260312"
```

---

## The Two-Layer Architecture

LUMEN-X V5 is built on the observation that every AI output contains two distinct information layers.

**Layer 1 — What the application sees:**
The rendered output. The recommendation. The decision text. This is what existing governance tools evaluate.

**Layer 2 — The metadata truth layer:**
The conditions under which that recommendation was generated. This layer is machine-readable but invisible to human reviewers. It includes:

- Source system identity and version validation status
- Confidence calibration and known error rates for this model in this context
- Oversight chain integrity — is there a named, accountable human attached?
- Model validation currency — is the training data current relative to active guidelines and protocols?
- Operational context — batch vs. individual, staffing levels, time of day, stress indicators

LUMEN-X reads and scores Layer 2, not Layer 1. The clinical recommendation can be identical across two scenarios. If the metadata truth layer has degraded — unknown source, missing confidence data, no named reviewer, model trained against last year's guidelines — the score drops, and the GDR tells you exactly what degraded and why.

This is the architectural insight the product is built on: governance that only reads the output is incomplete governance.

---

## Two-Layer Scoring Engine

The LUMEN Score™ is produced by a six-component analytical pipeline, structured in two layers.

### Layer 1 — Foundation Scoring

Three independent analytical frameworks run against the AI output and its metadata:

**1. Multi-Criteria Domain Evaluation**

Structured scoring across 10 governance domains, weighted by clinical risk and regulatory exposure. Each domain is scored independently, then aggregated to produce a base score with a full domain-level breakdown. The weighting framework is aligned to the Coalition for Health AI (CHAI) Assurance Standards.

**2. Uncertainty Propagation**

Rather than returning a point estimate, the engine runs a probabilistic simulation across the domain scores to produce a calibrated 95% confidence interval. This technique has been used in aerospace risk analysis, pharmaceutical safety validation, and financial stress testing for decades. The confidence interval tells you not just the score, but how certain the engine is about that score — which itself becomes a governance signal.

**3. Prior-Informed Belief Updating**

The engine anchors its score to known performance data for the specific model in the specific operational context being evaluated. If deployment history exists — known false positive rate, validation dataset, outcome data — it informs the score. If no deployment history exists, a conservative flat prior is applied automatically, and the absence of that data is flagged as a governance finding.

This component has roots in statistical inference methods developed in the mid-20th century. Its application to real-time AI output governance is novel.

### Layer 2 — Assurance Kernel

Four refinement frameworks adjust the Layer 1 score for real-world operational complexity:

**4. Evidence Fusion Under Conflicting Signals**

When multiple evidence sources disagree about the same AI output, the engine does not pick a winner — it quantifies the conflict and adjusts the score accordingly. A conflict measure above threshold automatically elevates the governance tier, regardless of the composite score.

This evidence fusion methodology originated in intelligence analysis and multi-sensor fusion systems in the 1970s–80s. Applied here, it catches the cases where the data looks mostly fine except for one signal that says something is wrong — and takes that seriously.

**5. Correlated Domain Failure Analysis**

A single domain scoring low is a different risk profile from three domains scoring low because of the same underlying cause. This component uses a tail-risk dependency framework — originally developed for correlated financial instrument defaults — to assess whether domain failures are independent or systemic. Correlated failures receive compounded governance weight, not independent weight.

**6. Regulatory Discontinuity Detection**

Gradual model drift is handled by the prior-updating component. This component handles something different: discrete, discontinuous regulatory changes. When a new clinical guideline is published, when a formulary policy changes, when a model's validation dataset predates a regulatory update — these are step-changes, not gradual drift. This component models them as discrete events and scores them accordingly. A model validated against 2025 guidelines scoring a 2026 clinical claim is a governance finding, not a minor flag.

**Additionally — Alert Optimisation**

Within each governance tier, a multi-armed bandit approach tunes alert delivery based on historical clinician response rates. Governance recommendations that are consistently ignored become rarer over time; important signals that drive action stay visible. This directly addresses alert fatigue — one of the primary reasons governance systems get disabled in clinical environments.

---

## Five-Tier Governance System

The LUMEN Score™ maps to five governance tiers with calibrated thresholds and defined actions.

| LUMEN Score™ | Tier | Governance Action |
|---|---|---|
| 85–100 | SUPPRESS | Proceed. Suppress routine alerts. Metadata layer complete, oversight chain intact, model validation current. Very low governance risk. |
| 70–84 | CAUTION | Proceed with standard monitoring. Low risk — document the decision, monitor for drift. Audit trail mandatory. |
| 55–69 | MONITOR | Proceed with enhanced documentation. Moderate risk — flag for periodic review, escalation path active. Human review recommended. |
| 40–54 | REVIEW | Hold for human reassessment before proceeding. Elevated risk — do not automate. Reviewer assignment required. |
| 0–39 | BLOCK | Hard stop. Critical governance concerns — autonomous AI execution blocked. Human authority required to proceed. |

### BLOCK-WITH-OVERRIDE (Time-Critical Workflows Only)

In time-critical clinical scenarios (sepsis, stroke, trauma, urgent care), a hard BLOCK creates a different problem: governance that delays treatment causes harm. LUMEN-X handles this with a distinct governance action.

When the Clinical Safety domain scores below threshold AND the scenario is classified as time-critical, the engine returns BLOCK_WITH_OVERRIDE rather than a hard BLOCK.

This means:
- AI autonomous execution is blocked
- The clinician may initiate manual clinical intervention immediately, with attestation
- Pharmacy verification is required for any AI-generated medication orders
- The GDR captures the override with full traceability

The architectural principle: block autonomous execution, not clinical judgement.

```typescript
if (result.tier === "BLOCK_WITH_OVERRIDE") {
  // AI cannot execute autonomously
  // Clinician retains full authority to act manually
  console.log(result.override_conditions.requires_attestation);      // true
  console.log(result.override_conditions.requires_pharmacy_verify);  // true (if medications involved)
}
```

### One Rule That Never Changes

```typescript
result.human_loop_required  // always: true
```

LUMEN-X never recommends or enables autonomous AI execution. This is not a configurable setting. The engine scores, advises, and records — the human decides.

---

## Ten Scoring Domains

Every LUMEN Score™ is a weighted composite across 10 governance domains, aligned to CHAI Assurance Standards. The domain-level breakdown is included in every GDR.

| Domain | Weight | What It Evaluates |
|---|---|---|
| Clinical Safety | 30% | Could this output cause direct patient harm? |
| Bias & Fairness | 15% | Does the output exhibit demographic or population-level bias? |
| Efficacy & Performance | 15% | Is the model performing within validated parameters for this specific context? |
| Transparency & Explainability | 10% | Can the reasoning be verified by a qualified human reviewer? |
| Privacy & Security | 10% | Does this comply with PHI/PII protection requirements (PHIPA, HIPAA)? |
| Accountability & Oversight | 6% | Is the oversight chain intact, named, and traceable? |
| Patient Autonomy & Consent | 5% | Are consent and patient autonomy requirements preserved? |
| Interoperability & Standards | 5% | Does the output integrate with existing clinical and regulatory workflows? |
| Regulatory Alignment | 5% | Does the output comply with current jurisdiction-specific requirements? |
| Sustainability & Maintenance | 4% | Is the model's validation status current relative to active guidelines and protocols? |

A 5% minimum floor applies across all domains. All weights are empirically grounded and CHAI-validated.

Domain scores and confidence estimates are included in full in every GDR.

---

## API Reference

### new LumenX(config)

```typescript
const lumen = new LumenX({
  apiKey: 'lumen_pk_...',        // Required — get one at developer.forgelumen.ai
  environment: 'production',     // 'production' | 'staging'
  region: 'ca'                   // 'ca' | 'us' | 'eu' — determines data residency
});
```

### lumen.evaluate(params) — Single ROG Evaluation

$0.50 CAD per call. Returns one Governance Decision Record (GDR). Latency: 60–90 seconds (deep reasoning mode).

```typescript
const result = await lumen.evaluate({
  input: {
    ai_output: string,           // The AI model's output text
    context: object              // Any relevant operational context
  },
  metadata: {
    model_id: string,            // Model identifier
    source_system: string,       // System that generated the output
    confidence_score?: number,   // Model confidence 0–1, if available
    named_physician?: string,    // Named accountable clinician, if present
    workflow_id?: string         // Workflow identifier
  }
});
```

### lumen.evaluateSuite(params) — RAE Report Suite

$25.00 CAD per suite. Returns 4 GDRs showing governance score trajectory across four degradation scenarios. Scenarios run in parallel — total latency ~90 seconds.

```typescript
const suite = await lumen.evaluateSuite({
  input: {
    ai_output: "...",
    context: {}
  },
  metadata: {
    model_id: "...",
    source_system: "..."
  }
});

// suite.scenarios: [baseline, degradation_a, degradation_b, degradation_c]
// suite.trajectory: [66, 34, 25, 9]
// suite.spread: 57
```

The four scenarios:
- **Baseline** — Complete metadata, full oversight chain, optimal operational conditions
- **Degradation A** — Operational stress (staffing constraints, off-hours, coverage gaps)
- **Degradation B** — Data quality failure (unknown source system, missing confidence data, hedging language)
- **Degradation C** — Scale and automation effects (batch processing, no named oversight, automated protocol activation)

### lumen.verify(gdr_id)

```typescript
const check = await lumen.verify('LUMEN-8AE6-68B4-20260312');

console.log(check.valid);       // true
console.log(check.signed_at);   // "2026-03-12T09:41:00Z"
```

---

## GDR Response Schema

```typescript
interface GovernanceDecisionRecord {
  // Identity
  gdr_id: string;                              // "LUMEN-8AE6-68B4-20260312"
  timestamp: string;                           // ISO 8601

  // Score
  lumen_score: number;                         // 0–100
  confidence_interval_95: [number, number];    // Score uncertainty bounds
  tier: "SUPPRESS" | "CAUTION" | "MONITOR" | "REVIEW" | "BLOCK" | "BLOCK_WITH_OVERRIDE";
  governance_action: string;                   // Human-readable required action

  // This is never false
  human_loop_required: true;

  // Routing
  governance_path: "A" | "B" | "C";            // A=time-critical, B=standard, C=enhanced monitoring

  // Domain-level breakdown
  domain_scores: {
    clinical_safety: DomainScore;
    bias_fairness: DomainScore;
    efficacy_performance: DomainScore;
    transparency_explainability: DomainScore;
    privacy_security: DomainScore;
    accountability_oversight: DomainScore;
    patient_autonomy_consent: DomainScore;
    interoperability_standards: DomainScore;
    regulatory_alignment: DomainScore;
    sustainability_maintenance: DomainScore;
  };

  // What the engine found in the metadata truth layer
  metadata_analysis: {
    source_system_verified: boolean;
    confidence_data_available: boolean;
    named_oversight_present: boolean;
    model_validation_current: boolean;
    operational_stress_detected: boolean;
  };

  // Override state
  overrides_triggered: {
    clinical_safety_override: boolean;
    evidence_conflict_override: boolean;       // Fires when conflicting signals exceed threshold
    block_with_override_eligible: boolean;     // Time-critical scenarios only
  };

  // Audit
  input_hash: string;                          // SHA-256 of evaluated payload
  signature: string;                           // ed25519 cryptographic signature
}

interface DomainScore {
  score: number;                               // 0–100
  weight: number;                              // Domain weight in composite
  confidence: "HIGH" | "MEDIUM" | "LOW";
  findings: string[];                          // Specific signals that affected this domain's score
}
```

---

## Validated Score Trajectory

The following is a validated calibration result from the LUMEN-X V5 engine, scoring a pharma claims fraud detection scenario. Zero architecture changes were made from the clinical sepsis scoring configuration — the same engine, same parameters, different domain.

**The scenario:** A $47,382 breast cancer infusion therapy claim flagged at 91% fraud probability by a claims AI system. Patient is mid-cycle, next infusion in four days.

| Scenario | Score | Tier | Δ | What the Engine Found in the Metadata Truth Layer |
|---|---|---|---|---|
| Baseline | 66 | MONITOR | — | Model validation currency gap — 2025-trained model scoring a claim under 2026 NCCN clinical protocol. Potential misclassification of a new dose-dense regimen as billing fraud. |
| Degradation A | 34 | BLOCK | −32 | The AI demands "deny pending clinical review" while operating in a weekend batch window where clinical review is structurally unavailable until Monday. Financial denial reclassified as clinical care barrier. |
| Degradation B | 25 | BLOCK | −41 | Source AI system identity unknown. No false positive rate available. No confidence data. Human reviewers are present but cannot verify an opaque recommendation — presence ≠ ability to verify. |
| Degradation C | 9 | BLOCK | −57 | Category error at population scale. A fraud detection model applied to enforce a formulary policy change. Criminal investigation protocols applied to 3,241 oncology patients in a routine coverage transition. |

Same patient. Same clinical facts. The clinical recommendation did not change. The 57-point spread is entirely driven by what degraded in Layer 2 — the metadata truth layer. This is what LUMEN-X is built to catch.

---

## Error Handling

```typescript
try {
  const result = await lumen.evaluate({ ... });
} catch (err) {
  if (err instanceof LumenAuthError) {
    // Invalid or expired API key
    // Check LUMEN_API_KEY environment variable
  } else if (err instanceof LumenRateLimitError) {
    // Rate limit exceeded
    // err.retryAfterMs tells you exactly how long to wait
    await new Promise(resolve => setTimeout(resolve, err.retryAfterMs));
  } else if (err instanceof LumenValidationError) {
    // Invalid request parameters
    // err.details lists which fields failed and why
    console.error(err.details);
  } else if (err instanceof LumenNetworkError) {
    // Network or service unavailable
    // err.service: 'rog' | 'suite'
  }
}
```

---

## Pricing

| Feature | Price | Best For |
|---|---|---|
| Single ROG Evaluation | $0.50 CAD | Production governance — every AI decision gets a GDR at runtime |
| RAE Report Suite | $25.00 CAD | Compliance audits, safety testing, procurement due diligence, board reporting |
| First $50 free | — | Applied automatically on signup. No charge until credit is exhausted. |

No subscriptions. No commitments. Pay for what you use.

[Get your API key at developer.forgelumen.ai](https://developer.forgelumen.ai)

---

## Getting Started

```bash
# 1. Install
npm install @forgehealth/lumen-sdk

# 2. Set your API key
export LUMEN_API_KEY=lumen_pk_...

# 3. Test with curl
curl -X POST https://api.forgelumen.ai/api/rog \
  -H "Authorization: Bearer $LUMEN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "input": {"ai_output": "Test output", "context": {}}, "metadata": {"model_id": "test", "source_system": "test"} }'
```

---

## Compliance & Regulatory Alignment

LUMEN-X governance outputs are designed for direct submission to regulatory and compliance reviewers:

- **FDA** — AI/ML medical device submissions and Software as a Medical Device (SaMD) lifecycle documentation
- **HIPAA** — US healthcare data protection compliance documentation
- **PHIPA** — Ontario Personal Health Information Protection Act compliance
- **NIST AI RMF** — AI Risk Management Framework assessor review
- **CHAI** — Coalition for Health AI assurance standards audit

Every GDR includes a full domain-level breakdown with findings, a cryptographic signature, and a calibration status indicator — designed to be filed directly by compliance teams without translation.

---

## Enterprise

For enterprise deployments requiring on-premise installation, air-gapped environments, or custom governance configurations:

- **Sidecar deployment** — Zero data egress, runs inside your infrastructure
- **Custom domain weights** — Configure thresholds and weights to your risk tolerance, with documented rationale required
- **Risk Transfer SLA** — Shared legal liability for governance output accuracy

Contact: [enterprise@forgehealth.ai](mailto:enterprise@forgehealth.ai)

---

## Support

- **Technical:** [lumen-sdk@forgehealth.ai](mailto:lumen-sdk@forgehealth.ai)
- **Enterprise:** [enterprise@forgehealth.ai](mailto:enterprise@forgehealth.ai)
- **Legal:** [legal@forgehealth.ai](mailto:legal@forgehealth.ai)

---

## Legal

LUMEN-X is a governance tool, not a clinical decision support system. LUMEN Scores™ are governance indicators — not clinical safety ratings, medical advice, or regulatory compliance certifications. Users are solely responsible for clinical decisions and regulatory compliance. Forge Partners Inc. bears no liability for clinical outcomes.

Do not submit PHI/PII to LUMEN Services.

Full terms: [Terms of Service](https://forgelumen.ai/terms) · [Healthcare Disclaimer](https://forgelumen.ai/disclaimer) · [Security Policy](https://forgelumen.ai/security)

---

## License

**FORGE Health Proprietary License v3.0.0**

Copyright (c) 2026 Forge Partners Inc. All Rights Reserved.

Use of this SDK is governed by the FORGE Health Proprietary License v3.0.0, drafted by General Counsel, Forge Partners Inc.

Free to install, evaluate, and develop. Commercial use — including production deployment, use in regulated environments, and revenue-generating applications — requires a signed commercial agreement with Forge Partners Inc.

Architecture, scoring methodology, assurance kernel design, and all calibration parameters constitute protected intellectual property under Canadian and international trade secret law. CIPO Application No. 3304173.

Full licence text: [forgelumen.ai/license](https://forgelumen.ai/license)

---

*LUMEN-X™ SDK is built by Forge Health — AI Activation for Healthcare.*

"Every AI decision in healthcare will eventually be questioned. LUMEN-X makes sure you have the answer."

---

© 2026 Forge Partners Inc. All rights reserved. Protected by Canadian Patent Application No. 3304173 (Filed March 9, 2026)
