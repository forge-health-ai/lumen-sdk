# LUMEN SDK — API Reference

## `new Lumen(config)`

Creates a new LUMEN SDK instance.

```typescript
import { Lumen } from '@forgehealth/lumen-sdk';

const lumen = new Lumen({
  domain: 'healthcare',
  region: 'canada',
  enforcementMode: 'ADVISORY'
});
```

### Config Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `domain` | `'healthcare' \| 'finance' \| 'government'` | required | Industry domain |
| `region` | `'canada' \| 'us' \| 'eu' \| 'uk'` | required | Jurisdiction for policy selection |
| `apiKey` | `string` | optional | For hosted API access (future) |
| `enforcementMode` | `'ADVISORY' \| 'GUARDED' \| 'STRICT'` | `'ADVISORY'` | Governance strictness level |
| `debug` | `boolean` | `false` | Enable debug logging |

---

## `lumen.evaluate(input)`

Evaluate an AI-assisted decision and generate a defensible record.

```typescript
const result = await lumen.evaluate({
  aiOutput: 'Recommend CT scan based on presenting symptoms',
  context: {
    department: 'Emergency',
    patientAge: 45
  },
  humanAction: 'accepted',
  modelId: 'gemini-2.5-pro',
  workflowId: 'ed-triage'
});
```

### Input

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `aiOutput` | `string` | ✅ | The AI model's output text |
| `context` | `Record<string, unknown>` | ✅ | Clinical or business context |
| `humanAction` | `'accepted' \| 'rejected' \| 'modified'` | ✅ | What the human did with the AI output |
| `modelId` | `string` | optional | Identifier of the AI model used |
| `workflowId` | `string` | optional | Identifier of the clinical workflow |

### Returns: `EvaluateResult`

```typescript
interface EvaluateResult {
  lumenScore: number;           // 0-100 LUMEN Score™
  passed: boolean;              // Whether it meets threshold
  verdict: 'ALLOW' | 'FLAG' | 'BLOCK';
  reasons: string[];            // Human-readable explanations
  citationIntegrity: number;    // 0-1 citation verification score
  recordId: string;             // Unique decision record ID

  riskRadar: {
    legal: 'Green' | 'Amber' | 'Red';
    labour: 'Green' | 'Amber' | 'Red';
    safety: 'Green' | 'Amber' | 'Red';
    ethics: 'Green' | 'Amber' | 'Red';
    cyber: 'Green' | 'Amber' | 'Red';
    finance: 'Green' | 'Amber' | 'Red';
    reputation: 'Green' | 'Amber' | 'Red';
  };

  checks: Array<{
    rule: string;               // e.g., 'PHIPA-10.2'
    passed: boolean;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }>;

  scoreBreakdown: {
    baseScore: number;
    riskModifier: number;
    finalScore: number;
    factors: Array<{
      name: string;
      confidence: string;
      weight: number;
      contribution: number;
    }>;
  };

  auditRecord: {
    transactionId: string;
    timestamp: string;
    previousHash: string;
    entryHash: string;
    policyVersion: string;
  };
}
```

---

## `lumen.getAuditTrail()`

Returns the complete audit event chain for the current session.

```typescript
const trail = lumen.getAuditTrail();
console.log(`${trail.length} events recorded`);
```

### Returns: `AuditEvent[]`

```typescript
interface AuditEvent {
  transactionId: string;
  timestamp: string;
  action: 'SCAN' | 'SCORE' | 'EVALUATE' | 'OVERRIDE';
  previousHash: string;
  entryHash: string;
  metadata: Record<string, unknown>;
}
```

---

## `lumen.verifyAuditIntegrity()`

Verifies the hash chain of all audit events hasn't been tampered with.

```typescript
const result = lumen.verifyAuditIntegrity();

if (result.valid) {
  console.log('Audit chain intact');
} else {
  console.log('Tampered at event:', result.brokenAt);
}
```

### Returns

```typescript
interface IntegrityResult {
  valid: boolean;
  eventsChecked: number;
  brokenAt?: number;        // Index of first tampered event
  brokenHash?: string;      // Expected vs actual hash
}
```

---

## Score Interpretation

| Range | Label | Recommendation |
|-------|-------|---------------|
| 85-100 | Excellent | Strong proceed |
| 70-84 | Good | Proceed with monitoring |
| 55-69 | Moderate | Proceed with caution |
| 40-54 | Low | Significant concerns |
| 1-39 | Critical | Do not proceed |

---

## Enforcement Modes

| Mode | Behavior |
|------|----------|
| `ADVISORY` | Scores and records — never blocks (default) |
| `GUARDED` | Flags high-risk decisions — human can override |
| `STRICT` | Blocks high-risk — requires explicit override signal |

Even in STRICT mode, LUMEN signals intent but maintains clear liability boundaries. The human always makes the final call.

---

## Policy Packs

### Built-in Packs

| Pack | Region | Regulations |
|------|--------|-------------|
| `canada-healthcare` | `canada` | PHIPA, PIPEDA, AIDA |
| `us-healthcare` | `us` | HIPAA, HITECH |

### Custom Policy Pack

```typescript
import { Lumen, PolicyPack } from '@forgehealth/lumen-sdk';

const customPack: PolicyPack = {
  id: 'my-org-policy',
  version: '1.0.0',
  rules: [
    {
      id: 'custom-rule-1',
      description: 'No AI recommendations without human review',
      severity: 'high',
      check: (input) => input.humanAction !== 'auto-accepted'
    }
  ]
};

const lumen = new Lumen({
  domain: 'healthcare',
  policyPack: customPack
});
```

---

## TypeScript Support

Full TypeScript support with exported types:

```typescript
import type {
  LumenConfig,
  EvaluateInput,
  EvaluateResult,
  PolicyPack,
  AuditEvent,
  DecisionRecord,
  RiskRadar
} from '@forgehealth/lumen-sdk';
```

---

*LUMEN SDK™ is a trademark of Forge Partners Inc.*
