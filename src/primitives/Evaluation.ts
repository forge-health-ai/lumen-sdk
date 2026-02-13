/**
 * LUMEN SDK - Evaluation Primitive
 * 
 * A deterministic evaluation run producing a reproducible result.
 * Same record snapshot + same pack version = SAME evaluation result.
 * 
 * This is the core of LUMEN's defensibility: every evaluation
 * can be reproduced and verified.
 * 
 * @module @forge/lumen-sdk
 * @copyright 2026 Forge Health Inc.
 * @license Apache-2.0
 */

export type EvaluationSignal = 'ALLOW' | 'WARN' | 'BLOCK';

export type CheckStatus = 'PASSED' | 'FAILED' | 'SKIPPED' | 'ERROR';

export interface EvaluationCheck {
  /** Check identifier (from PolicyRule) */
  checkId: string;
  
  /** Rule name */
  ruleName: string;
  
  /** Check result */
  status: CheckStatus;
  
  /** Evidence for the check result */
  evidence?: string;
  
  /** Duration of check in milliseconds */
  durationMs: number;
  
  /** Error message if status is ERROR */
  errorMessage?: string;
}

export interface EvaluationReason {
  /** Reason code */
  code: string;
  
  /** Human-readable message */
  message: string;
  
  /** Severity */
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  
  /** Related rule ID */
  ruleId?: string;
  
  /** Remediation suggestion */
  remediation?: string;
}

export interface EvaluationAlert {
  /** Alert identifier */
  alertId: string;
  
  /** Alert category */
  category: 'COMPLIANCE' | 'SAFETY' | 'CITATION' | 'DRIFT' | 'PERFORMANCE';
  
  /** Alert severity */
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  
  /** Alert message */
  message: string;
  
  /** Whether action is required */
  actionRequired: boolean;
  
  /** Recommended actions */
  recommendedActions?: string[];
}

export interface EvaluationMetrics {
  /** Total evaluation time in milliseconds */
  totalLatencyMs: number;
  
  /** Time spent on policy checks */
  policyCheckLatencyMs: number;
  
  /** Time spent on scoring */
  scoringLatencyMs: number;
  
  /** Time spent on citation verification */
  citationLatencyMs: number;
  
  /** Number of checks executed */
  checksExecuted: number;
  
  /** Number of checks passed */
  checksPassed: number;
  
  /** Number of checks failed */
  checksFailed: number;
  
  /** Completeness score (0-1) */
  completeness: number;
}

export interface LumenScoreBreakdown {
  /** Final LUMEN Score (0-100) */
  finalScore: number;
  
  /** Base score before modifiers */
  baseScore: number;
  
  /** Risk modifier applied */
  riskModifier: number;
  
  /** NIST adjustment (if applicable) */
  nistAdjustment?: number;
  
  /** Factor breakdown */
  factors: Array<{
    name: string;
    confidence: 'Strong' | 'Moderate' | 'Limited';
    numericScore: number;
    weight: number;
    contribution: number;
  }>;
  
  /** Risk radar summary */
  riskRadar: {
    legal: 'Green' | 'Amber' | 'Red';
    labour: 'Green' | 'Amber' | 'Red';
    safety: 'Green' | 'Amber' | 'Red';
    ethics: 'Green' | 'Amber' | 'Red';
    cyber: 'Green' | 'Amber' | 'Red';
    finance: 'Green' | 'Amber' | 'Red';
    reputation: 'Green' | 'Amber' | 'Red';
  };
  
  /** Fatal flaw detected */
  fatalFlawDetected: boolean;
  
  /** Fatal flaw reason (if detected) */
  fatalFlawReason?: string;
}

/**
 * Evaluation - The deterministic evaluation result
 * 
 * This is what gets attached to every DecisionRecord.
 * It proves the decision was evaluated against known policies.
 */
export interface Evaluation {
  /** Unique evaluation identifier */
  evaluationId: string;
  
  /** Decision record hash being evaluated */
  decisionRecordHash: string;
  
  /** Policy pack version used */
  policyPackId: string;
  policyPackVersion: string;
  
  /** Overall signal */
  signal: {
    /** Primary signal: ALLOW, WARN, or BLOCK */
    status: EvaluationSignal;
    /** LUMEN Score (0-100) */
    lumenScore: number;
    /** Risk tier (1 = highest risk, 3 = lowest) */
    tier: 1 | 2 | 3;
    /** Citation integrity score (0-1) */
    citationIntegrity: number;
  };
  
  /** LUMEN Score breakdown */
  scoreBreakdown: LumenScoreBreakdown;
  
  /** Individual check results */
  checks: EvaluationCheck[];
  
  /** Reasons for the signal */
  reasons: EvaluationReason[];
  
  /** Alerts generated */
  alerts: EvaluationAlert[];
  
  /** Performance metrics */
  metrics: EvaluationMetrics;
  
  /** ISO timestamp of evaluation */
  evaluatedAt: string;
  
  /** Whether this evaluation is deterministic */
  deterministic: boolean;
  
  /** If non-deterministic, the sources of non-determinism */
  nonDeterministicSources?: string[];
  
  /** Evaluation version */
  evaluationVersion: string;
}

/**
 * Risk tier interpretation
 */
export const RISK_TIERS = {
  1: {
    name: 'Tier 1: Clinical',
    description: 'High-risk clinical decisions requiring executive review',
    minScore: 0,
    maxScore: 54,
    recommendation: 'Do not proceed without significant remediation'
  },
  2: {
    name: 'Tier 2: Operational',
    description: 'Moderate-risk operational decisions',
    minScore: 55,
    maxScore: 74,
    recommendation: 'Proceed with enhanced monitoring'
  },
  3: {
    name: 'Tier 3: Administrative',
    description: 'Lower-risk administrative decisions',
    minScore: 75,
    maxScore: 100,
    recommendation: 'Proceed with standard oversight'
  }
} as const;

/**
 * Determine risk tier from LUMEN Score
 */
export function determineRiskTier(lumenScore: number): 1 | 2 | 3 {
  if (lumenScore < 55) return 1;
  if (lumenScore < 75) return 2;
  return 3;
}

/**
 * Determine signal from LUMEN Score and checks
 */
export function determineSignal(
  lumenScore: number, 
  checks: EvaluationCheck[],
  enforcementMode: 'ADVISORY' | 'GUARDED' | 'STRICT'
): EvaluationSignal {
  const criticalFailures = checks.filter(c => c.status === 'FAILED');
  
  // In STRICT mode, any critical failure = BLOCK
  if (enforcementMode === 'STRICT' && criticalFailures.length > 0) {
    return 'BLOCK';
  }
  
  // Low score = WARN or BLOCK depending on enforcement
  if (lumenScore < 40) {
    return enforcementMode === 'ADVISORY' ? 'WARN' : 'BLOCK';
  }
  
  if (lumenScore < 60) {
    return 'WARN';
  }
  
  return 'ALLOW';
}

/**
 * Create a new evaluation
 */
export function createEvaluation(params: {
  decisionRecordHash: string;
  policyPackId: string;
  policyPackVersion: string;
  scoreBreakdown: LumenScoreBreakdown;
  checks: EvaluationCheck[];
  metrics: EvaluationMetrics;
  enforcementMode: 'ADVISORY' | 'GUARDED' | 'STRICT';
}): Evaluation {
  const { scoreBreakdown, checks, enforcementMode } = params;
  const lumenScore = scoreBreakdown.finalScore;
  
  const signal = determineSignal(lumenScore, checks, enforcementMode);
  const tier = determineRiskTier(lumenScore);
  
  // Generate reasons
  const reasons: EvaluationReason[] = [];
  
  // Add reasons for failed checks
  checks.filter(c => c.status === 'FAILED').forEach(check => {
    reasons.push({
      code: `FAILED_${check.checkId}`,
      message: `Check failed: ${check.ruleName}`,
      severity: 'ERROR',
      ruleId: check.checkId,
      remediation: check.evidence
    });
  });
  
  // Add reason for fatal flaw
  if (scoreBreakdown.fatalFlawDetected) {
    reasons.push({
      code: 'FATAL_FLAW',
      message: scoreBreakdown.fatalFlawReason || 'Fatal flaw detected',
      severity: 'CRITICAL'
    });
  }
  
  return {
    evaluationId: generateEvaluationId(),
    decisionRecordHash: params.decisionRecordHash,
    policyPackId: params.policyPackId,
    policyPackVersion: params.policyPackVersion,
    signal: {
      status: signal,
      lumenScore,
      tier,
      citationIntegrity: 0.95 // Citation engine integration planned for v1.1.0
    },
    scoreBreakdown,
    checks,
    reasons,
    alerts: [],
    metrics: params.metrics,
    evaluatedAt: new Date().toISOString(),
    deterministic: true,
    evaluationVersion: '1.0.0'
  };
}

function generateEvaluationId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `EVAL-${timestamp}-${random}`;
}

export default Evaluation;
