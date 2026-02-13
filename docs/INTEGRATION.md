# LUMEN SDK Integration Guide

## Overview

The LUMEN SDK provides runtime AI governance for healthcare applications. This guide covers integration patterns for embedding the SDK into your AI systems.

## Installation

### Python
```bash
pip install lumen-sdk
```

### Node.js (Coming Soon)
```bash
npm install @forgehealth/lumen-sdk
```

## Quick Start

```python
from lumen_sdk import LumenEvaluator

# Initialize with your API key
evaluator = LumenEvaluator(
    api_key="your_api_key",
    compliance_packs=["phipa"]  # Ontario deployment
)

# Evaluate an AI use case
result = evaluator.evaluate(
    description="Clinical decision support for ED triage",
    operational_area="clinical_support",
    data_sources=["ehr_extracts", "vitals_streaming"],
    constraints=["no_phi_storage", "real_time_required"]
)

print(f"LUMEN Score: {result.score}/100")
print(f"Recommendation: {result.recommendation}")
```

## Integration Patterns

### Pattern 1: Pre-Deployment Evaluation

Evaluate AI use cases BEFORE deployment decisions:

```python
# During planning phase
use_case = {
    "description": "AI-powered radiology image analysis",
    "operational_area": "radiology",
    "intelligence_type": "inference_engine",
    "budget": 150000,
    "timeline_months": 12,
    "data_sources": ["pacs_images", "radiology_reports"],
    "constraints": ["phipa_compliant", "on_prem_only"]
}

result = evaluator.evaluate(**use_case)

if result.score < 60:
    print("⚠️ Executive review required")
    print("Issues:", result.evidence_block.flags)
else:
    print("✅ Proceed with standard oversight")
```

### Pattern 2: Runtime Decision Assurance

Attach defensible records to AI decisions at runtime:

```python
from lumen_sdk import LumenRuntime

runtime = LumenRuntime(
    api_key="your_api_key",
    compliance_packs=["phipa", "hipaa"]
)

# Your AI system generates a recommendation
ai_recommendation = your_model.predict(patient_context)

# LUMEN validates and creates defensible record
validation = runtime.validate(
    ai_output=ai_recommendation,
    use_case_id="radiology_triage_v2",
    context={
        "model_version": "1.2.3",
        "input_hash": hash(patient_context),
        "confidence": your_model.confidence
    }
)

if validation.kill_switch_triggered:
    # Compliance violation - do not proceed
    log_compliance_halt(validation.reason)
    return fallback_response()

# Attach defensible record to the decision
decision = Decision(
    recommendation=ai_recommendation,
    defensible_record=validation.record,
    lumen_score=validation.score
)

# Record is now auditable
return decision
```

### Pattern 3: Batch Evaluation

Evaluate multiple use cases for portfolio analysis:

```python
use_cases = load_use_cases_from_file("ai_roadmap.json")

results = evaluator.evaluate_batch(
    use_cases=use_cases,
    parallel=True,
    max_workers=4
)

# Generate portfolio report
report = results.generate_report(
    format="pdf",
    include_evidence=True,
    executive_summary=True
)
report.save("ai_portfolio_assessment.pdf")
```

### Pattern 4: Continuous Monitoring

Monitor deployed AI systems for governance drift:

```python
from lumen_sdk import LumenMonitor

monitor = LumenMonitor(
    api_key="your_api_key",
    use_case_id="radiology_triage_v2"
)

# Set up monitoring hooks
@monitor.on_decision
def track_decision(decision, context):
    # Called for each AI decision
    monitor.record(
        decision_id=decision.id,
        model_output=decision.recommendation,
        context=context
    )

@monitor.on_drift_detected
def handle_drift(alert):
    # Called when governance drift detected
    notify_governance_team(alert)
    if alert.severity == "critical":
        pause_ai_system()

# Start monitoring
monitor.start()
```

## Configuration

### Compliance Packs

```python
evaluator = LumenEvaluator(
    compliance_packs=[
        "phipa",      # Ontario Personal Health Information Protection Act
        "hipaa",      # US HIPAA (if serving US patients)
        "pipeda",     # Canadian federal privacy
        "labor_on",   # Ontario healthcare labor agreements
    ]
)
```

### Custom Scoring Weights

Override default MCDA weights for your context:

```python
evaluator = LumenEvaluator(
    weights={
        "clinical_risk": 0.40,      # Higher for safety-critical
        "operational_risk": 0.20,
        "governance_alignment": 0.25,
        "implementation_ability": 0.15
    }
)
```

### NIST AI RMF Version

```python
evaluator = LumenEvaluator(
    nist_version="1.0",  # Default
    # nist_version="2.0"  # When available
)
```

## API Reference

### LumenEvaluator

```python
class LumenEvaluator:
    def __init__(
        self,
        api_key: str,
        compliance_packs: list[str] = ["phipa"],
        weights: dict = None,
        nist_version: str = "1.0"
    ): ...
    
    def evaluate(
        self,
        description: str,
        operational_area: str = None,
        intelligence_type: str = None,
        budget: int = None,
        timeline_months: int = None,
        data_sources: list[str] = None,
        constraints: list[str] = None,
        role: str = "cio"  # cio, cmio, clinician
    ) -> EvaluationResult: ...
    
    def evaluate_batch(
        self,
        use_cases: list[dict],
        parallel: bool = True,
        max_workers: int = 4
    ) -> BatchResult: ...
```

### EvaluationResult

```python
@dataclass
class EvaluationResult:
    record_id: str
    score: float                    # 0-100
    recommendation: str             # Human-readable recommendation
    evidence_block: EvidenceBlock
    nist_score: NistScore
    monte_carlo: MonteCarloResult
    kill_switch_triggered: bool
    compliance_status: dict
    citations: list[Citation]
    defensible_record: DefensibleRecord
```

### DefensibleRecord

The artifact attached to AI decisions for audit:

```python
@dataclass
class DefensibleRecord:
    record_id: str
    version: str                    # SDK version
    timestamp: datetime
    use_case_hash: str
    score: float
    evidence_summary: str
    compliance_checks: list[ComplianceCheck]
    citation_integrity: float
    nist_alignment: dict
    
    def to_json(self) -> str: ...
    def to_pdf(self) -> bytes: ...
```

## Error Handling

```python
from lumen_sdk.exceptions import (
    LumenAuthError,
    LumenRateLimitError,
    LumenKillSwitchError,
    LumenValidationError
)

try:
    result = evaluator.evaluate(...)
except LumenKillSwitchError as e:
    # Non-negotiable compliance violation
    print(f"Evaluation halted: {e.reason}")
    print(f"Remediation: {e.remediation}")
except LumenRateLimitError:
    # Back off and retry
    time.sleep(60)
    result = evaluator.evaluate(...)
except LumenValidationError as e:
    # Invalid input
    print(f"Input error: {e.field} - {e.message}")
```

## Webhooks

Receive notifications for important events:

```python
# Configure webhook endpoint
evaluator.configure_webhooks(
    url="https://your-app.com/lumen-webhook",
    events=[
        "evaluation.completed",
        "kill_switch.triggered",
        "score.below_threshold"
    ],
    threshold=60  # Notify when score < 60
)
```

Webhook payload:
```json
{
  "event": "kill_switch.triggered",
  "timestamp": "2026-02-12T15:30:00Z",
  "record_id": "eval_abc123",
  "reason": "phipa_violation",
  "use_case_hash": "sha256:...",
  "remediation": "Specify data residency requirements"
}
```

## Best Practices

### 1. Evaluate Early
Run LUMEN evaluation during use case planning, not after development.

### 2. Store Defensible Records
Always persist the `defensible_record` — it's your audit trail.

### 3. Set Appropriate Thresholds
Configure score thresholds for your risk tolerance:
- Conservative: Block below 70
- Moderate: Review below 60
- Aggressive: Review below 40

### 4. Monitor in Production
Use continuous monitoring for deployed AI systems.

### 5. Update Compliance Packs
Keep compliance packs current as regulations change.

## Support

- Documentation: https://github.com/forge-health-ai/lumen-sdk#readme
- API Status: https://forgehealth.ai
- Support: support@forgehealth.ai
