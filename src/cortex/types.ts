/**
 * LUMEN SDK™ — CORTEX Runtime Types
 * 
 * © 2026 Forge Partners Inc. All rights reserved.
 * CONFIDENTIAL AND PROPRIETARY.
 */

// ============================================================================
// CLIENT CONFIGURATION
// ============================================================================

export interface LumenClientConfig {
  /** API key for authentication (lk_...) */
  apiKey: string;

  /** CORTEX scoring/evaluation engine URL */
  cortexUrl?: string;

  /** Policy Packs API URL */
  policyUrl?: string;

  /** Scanner Intelligence API URL */
  scannerUrl?: string;

  /** Request timeout in ms (default: 15000) */
  timeout?: number;

  /** Max retries on 5xx / network errors (default: 2) */
  maxRetries?: number;

  /** Enable structured debug logging */
  debug?: boolean;

  /** Tenant ID override */
  tenantId?: string;
}

// ============================================================================
// EVALUATE INPUT / OUTPUT
// ============================================================================

export interface EvaluateRequest {
  /** The LLM output text to evaluate */
  llmOutput: string;

  /** Use-case identifier (e.g. "medication-dosing-assistant") */
  useCase: string;

  /** Jurisdiction code (e.g. "on-ca" for Ontario, Canada) */
  jurisdiction: string;

  /** Clinical domain (e.g. "clinical-decision-support") */
  clinicalDomain?: string;

  /** Optional constraints */
  constraints?: EvaluateConstraints;

  /** Additional metadata passed to CORTEX */
  metadata?: Record<string, unknown>;
}

export interface EvaluateConstraints {
  /** Enforce no PHI in the output */
  noPHI?: boolean;
  /** Maximum acceptable latency in ms */
  maxLatency?: number;
  /** Required minimum LUMEN score to pass */
  minScore?: number;
  /** Custom constraint key-values */
  [key: string]: unknown;
}

export interface EvaluateResult {
  /** Composite LUMEN Score (0-100) */
  lumenScore: number;

  /** Confidence level */
  confidence: 'high' | 'moderate' | 'low';

  /** Per-domain scores from CORTEX */
  domainScores: DomainScore[];

  /** Go / No-Go decision */
  goNoGo: 'GO' | 'NO_GO' | 'CONDITIONAL';

  /** Immutable audit trail ID */
  auditTrailId: string;

  /** Policy packs that were applied */
  policiesApplied: PolicyPackRef[];

  /** Active regulatory signals considered */
  activeSignals: RegulatorySignal[];

  /** Evaluation latency breakdown */
  latency: LatencyBreakdown;

  /** Warning flags (e.g. stale signals) */
  warnings: string[];

  /** ISO timestamp */
  evaluatedAt: string;
}

export interface DomainScore {
  domain: string;
  score: number;
  weight: number;
  details?: string;
}

export interface LatencyBreakdown {
  totalMs: number;
  scannerMs: number;
  policyMs: number;
  cortexMs: number;
}

// ============================================================================
// SCANNER INTELLIGENCE API TYPES
// ============================================================================

export interface RegulatorySignal {
  id: string;
  jurisdiction: string;
  source: string;
  title: string;
  severity: 'info' | 'warning' | 'critical';
  effectiveDate: string;
  description?: string;
  framework?: string;
  url?: string;
}

export interface ScannerSignalsResponse {
  jurisdiction: string;
  signals: RegulatorySignal[];
  asOf: string;
}

// ============================================================================
// POLICY PACKS API TYPES
// ============================================================================

export interface PolicyPackRef {
  packId: string;
  name: string;
  version: string;
  jurisdiction: string;
  ruleCount: number;
}

export interface PolicyPackDetail extends PolicyPackRef {
  rules: PolicyRule[];
  framework: string;
  lastUpdated: string;
}

export interface PolicyRule {
  id: string;
  section: string;
  title: string;
  description: string;
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

export interface PolicyPacksResponse {
  packs: PolicyPackRef[];
}

// ============================================================================
// CORTEX API TYPES
// ============================================================================

export interface CortexEvaluateRequest {
  llmOutput: string;
  useCase: string;
  jurisdiction: string;
  clinicalDomain?: string;
  constraints?: EvaluateConstraints;
  policies: PolicyPackRef[];
  signals: RegulatorySignal[];
  metadata?: Record<string, unknown>;
}

export interface CortexEvaluateResponse {
  lumenScore: number;
  confidence: 'high' | 'moderate' | 'low';
  domainScores: DomainScore[];
  goNoGo: 'GO' | 'NO_GO' | 'CONDITIONAL';
  auditTrailId: string;
  evaluatedAt: string;
}

// ============================================================================
// CONVENIENCE METHOD TYPES
// ============================================================================

export interface QuickScoreRequest {
  domainAssessments: DomainScore[];
  jurisdiction: string;
}

export interface QuickScoreResult {
  lumenScore: number;
  goNoGo: 'GO' | 'NO_GO' | 'CONDITIONAL';
  auditTrailId: string;
}

export interface AuditTrailRecord {
  id: string;
  tenantId: string;
  evaluatedAt: string;
  lumenScore: number;
  goNoGo: 'GO' | 'NO_GO' | 'CONDITIONAL';
  request: EvaluateRequest;
  result: EvaluateResult;
}

export interface FrameworkInfo {
  id: string;
  name: string;
  jurisdiction: string;
  version: string;
  description: string;
}
