# ADR 001: Scoring Kernel Design

## Status

**Accepted** — 2026-02-13

## Context

The LUMEN SDK requires a scoring algorithm that produces defensible, auditable governance scores for AI decisions in healthcare. The algorithm must:

1. Handle multiple competing criteria (privacy, safety, ethics, legal compliance)
2. Provide consistent, reproducible scores
3. Account for uncertainty and worst-case scenarios
4. Support regulatory requirements (PHIPA, HIPAA, NIST AI RMF)
5. Be explainable to auditors and clinicians

We evaluated several approaches:
- Simple weighted sum (insufficient for complex multi-criteria decisions)
- Neural network scoring (not explainable, regulatory risk)
- Rule-based boolean (too rigid, no gradation)
- Multi-Criteria Decision Analysis (MCDA) with Monte Carlo simulation

## Decision

We will implement a **Multi-Criteria Decision Analysis (MCDA) scoring kernel** with **Monte Carlo risk adjustment**.

### Components

#### 1. Multi-Criteria Decision Analysis (MCDA)

The MCDA framework evaluates decisions across 10 CHAI (Coalition for Health AI) domains:

| Domain | Weight | Description |
|--------|--------|-------------|
| Validity | 15% | Clinical/scientific validity |
| Reliability | 15% | Consistency and reproducibility |
| Safety | 15% | Patient safety considerations |
| Fairness | 10% | Bias and equity assessment |
| Transparency | 10% | Explainability and interpretability |
| Security | 10% | Data protection and cybersecurity |
| Privacy | 10% | Patient privacy and consent |
| Accountability | 5% | Clear responsibility chains |
| Governance | 5% | Organizational oversight |
| Equity | 5% | Access and outcome equity |

Each domain receives a 0-100 score, weighted, and summed for a base LUMEN Score.

#### 2. Monte Carlo Risk Adjustment

To account for uncertainty and worst-case scenarios:

1. Run 10,000 simulations with input parameters perturbed by their uncertainty ranges
2. Calculate the 5th percentile (worst-case) score
3. Blend: `Final Score = 0.7 × Base Score + 0.3 × Worst-Case Score`

This ensures the score reflects not just expected outcomes, but tail risks.

#### 3. PHIPA Hard Gate

Regardless of the calculated score, certain conditions trigger automatic gating:

- **CRITICAL**: PHI disclosure without consent → Score capped at 39 (DENY tier)
- **HIGH**: Missing data residency verification → Score capped at 54 (REVIEW tier)
- **MEDIUM**: Incomplete audit logging → -15 point penalty

These gates ensure regulatory non-negotiables are always enforced.

## Consequences

### Positive

- **Explainable**: Every score can be decomposed into domain contributions
- **Regulatory aligned**: CHAI domains map directly to regulatory requirements
- **Risk-aware**: Monte Carlo adjustment prevents overconfidence
- **Flexible**: Weights can be adjusted per jurisdiction without code changes
- **Auditable**: Complete provenance from inputs to final score

### Negative

- **Computational cost**: Monte Carlo simulation adds ~50ms per evaluation
- **Complexity**: More complex than simple weighted sums
- **Calibration required**: Domain weights require expert input

### Mitigations

- Monte Carlo runs can be disabled for low-risk scenarios via configuration
- Default weights are based on CHAI Blueprint consensus
- Caching reduces repeated calculations

## Related

- CHAI Blueprint v1.0: https://coalitionforhealthai.org/
- NIST AI RMF 1.0: https://www.nist.gov/itl/ai-risk-management-framework
- PHIPA regulations: https://www.ipc.on.ca/privacy-and-access-to-information/health-information/

---

**Decision Owner:** Architecture Team  
**Review Date:** 2026-06-01
