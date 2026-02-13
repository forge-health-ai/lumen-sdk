/**
 * LUMEN SDK - Primitives
 * 
 * Core data structures for the Defensible Decision Record Layer (DDRL).
 * These primitives are the foundation of LUMEN's governance model.
 * 
 * @module @forge/lumen-sdk
 * @copyright 2026 Forge Health Inc.
 * @license Apache-2.0
 */

// DecisionRecord - The core artifact
export {
  type DecisionRecord,
  type RequestContext,
  type InputsSnapshot,
  type DataSourcePointer,
  type AIOutputs,
  type RetrievedSource,
  type HumanAction,
  type PolicyContext,
  type DecisionRecordHashes,
  createDecisionRecord
} from './DecisionRecord';

// PolicyPack - Governance rules
export {
  type PolicyPack,
  type PolicyPackMetadata,
  type PolicyPackStatus,
  type PolicyRule,
  type PolicyCheck,
  type PolicyThreshold,
  type EnforcementMode,
  POLICY_PACKS,
  validatePolicyPack,
  isPolicyPackExpired
} from './PolicyPack';

// Evaluation - Deterministic evaluation result
export {
  type Evaluation,
  type EvaluationSignal,
  type EvaluationCheck,
  type EvaluationReason,
  type EvaluationAlert,
  type EvaluationMetrics,
  type LumenScoreBreakdown,
  type CheckStatus,
  RISK_TIERS,
  determineRiskTier,
  determineSignal,
  createEvaluation
} from './Evaluation';

// AuditEvent - Immutable audit trail
export {
  type AuditEvent,
  type AuditEventType,
  type AuditActor,
  AuditChain,
  systemActor,
  userActor
} from './AuditEvent';
