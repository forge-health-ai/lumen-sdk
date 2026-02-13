# ADR 003: Enforcement Modes

## Status

**Accepted** — 2026-02-13

## Context

LUMEN is a governance system for healthcare AI decisions. A critical design question is: **Should LUMEN block decisions that fail governance checks?**

This is a nuanced problem:

- **Blocking workflows** causes frustration and circumvention (see WhatsApp vs. Teams in hospitals)
- **Pure advisory** may not provide sufficient governance
- **Different scenarios** require different strictness (research vs. production vs. emergency)
- **Liability concerns** require clear decision boundaries

We needed a model that provides appropriate governance without creating barriers to clinical care.

### Research Insights

Industry research shows:
- 67% of clinicians bypass restrictive IT controls (HIMSS 2024)
- Non-blocking governance has 4x higher adoption rates
- Emergency override capabilities are essential in healthcare
- Audit trails are more valuable than blocking for liability protection

## Decision

We will implement **three enforcement modes** with configurable thresholds per hospital:

### 1. ADVISORY Mode (Default)

**Behavior:**
- LUMEN observes, scores, and records
- Never blocks or delays AI-assisted decisions
- Provides warnings for low scores
- Full audit trail maintained

**Use cases:**
- Initial LUMEN deployment (build trust)
- Research environments
- Low-risk AI applications
- Change-resistant organizations

**Hospital configuration:**
```typescript
{
  enforcementMode: 'ADVISORY',
  warningThreshold: 55  // Warn when score < 55
}
```

### 2. GUARDED Mode

**Behavior:**
- Blocks decisions with scores below threshold
- Human can override with explicit acknowledgment
- Override is logged with reason
- Requires justification for circumvention

**Use cases:**
- Production clinical environments
- Medium-risk AI applications
- Organizations with governance maturity

**Hospital configuration:**
```typescript
{
  enforcementMode: 'GUARDED',
  blockThreshold: 40,       // Block when score < 40
  overrideRequiresReason: true,
  autoOverrideInEmergency: true  // See Break Glass ADR
}
```

### 3. AUDIT Mode

**Behavior:**
- Records all decisions without real-time intervention
- Post-hoc analysis and reporting
- Trend monitoring and alerting
- Compliance reporting focused

**Use cases:**
- Retrospective analysis
- Compliance monitoring
- Executive dashboards
- Regulatory reporting

**Hospital configuration:**
```typescript
{
  enforcementMode: 'AUDIT',
  sampleRate: 1.0,  // Record 100% of decisions
  alertThreshold: 30  // Alert when score < 30
}
```

## Threshold Configuration

Hospitals can configure thresholds independently:

| Parameter | Default | Description |
|-----------|---------|-------------|
| `blockThreshold` | 40 | Score below which to block (GUARDED mode) |
| `warnThreshold` | 70 | Score below which to warn (all modes) |
| `criticalThreshold` | 20 | Score triggering immediate escalation |

### Per-Workflow Configuration

Different workflows can have different thresholds:

```typescript
{
  defaultThresholds: { block: 40, warn: 70 },
  workflowOverrides: {
    'ed-triage': { block: 30, warn: 60 },      // Emergency - more permissive
    'radiology-ai': { block: 50, warn: 80 },   // Diagnostic - stricter
    'scheduling': { block: 20, warn: 50 }      // Administrative - permissive
  }
}
```

## Consequences

### Positive

- **Adoption-friendly**: Default ADVISORY mode builds trust
- **Flexible**: Organizations can increase strictness as they mature
- **Emergency-ready**: Break glass protocols in GUARDED mode
- **Audit-proof**: All modes maintain complete audit trails
- **Configurable**: Per-hospital, per-workflow customization

### Negative

- **Complexity**: More complex than a single mode
- **Configuration burden**: Hospitals must choose and tune settings
- **Potential inconsistency**: Different hospitals have different standards

### Mitigations

- Sensible defaults for each mode
- Preset configurations ("strict HIPAA", "research", etc.)
- Configuration validation and recommendations
- Clear documentation on trade-offs

## Liability Considerations

**Critical principle:** LUMEN signals intent but does not enforce. The human always makes the final decision.

- In ADVISORY mode: Human is solely responsible
- In GUARDED mode: Human override is explicit, with liability traceability
- In all modes: LUMEN provides the audit trail that proves due diligence

This aligns with medical device regulations where the clinician maintains ultimate decision authority.

## Related

- Break Glass Protocol (ADR pending)
- Clinical Workflow Integration Guide
- Medical Device Regulations (FDA 21 CFR 820, Health Canada CMDR)

---

**Decision Owner:** Clinical Advisory Board  
**Review Date:** 2026-04-01
