/**
 * ============================================================================
 * LUMEN SCORE™ — STANDALONE SDK MODULE
 * ============================================================================
 * 
 * Extracted from forge-strategy-engine for SDK distribution.
 * 
 * Contains:
 * - MCDA (Multi-Criteria Decision Analysis) calculation
 * - Risk modifier logic (Risk Radar, PHIPA Hard Gate)
 * - Monte Carlo variance integration
 * - Score provenance generation
 * 
 * @module @forge/lumen-sdk/scoring
 * @version 3.0.0
 * @license UNLICENSED - PROTECTED IP
 */

// ============================================================================
// TYPES — STRATEGIC CONFIDENCE (MCDA)
// ============================================================================

export type ConfidenceLevel = 'Strong' | 'Moderate' | 'Limited' | 'Unverifiable';
export type RiskLevel = 'Green' | 'Amber' | 'Red';
export type ScoreTier = 'EXCELLENT' | 'STRONG' | 'MODERATE' | 'WEAK' | 'POOR';

export interface EvidenceFactor {
  factorName: string;
  confidence: ConfidenceLevel;
}

export interface RiskRadar {
  legal?: RiskLevel;
  labour?: RiskLevel;
  safety?: RiskLevel;
  ethics?: RiskLevel;
  cyber?: RiskLevel;
  finance?: RiskLevel;
  reputation?: RiskLevel;
}

export interface FactorBreakdown {
  factorName: string;
  confidence: string;
  numericScore: number;
  weight: number;
  contribution: number;
}

export interface StrategicConfidenceResult {
  scoreName: 'STRATEGIC_CONFIDENCE';
  finalScore: number;
  baseScore: number;
  riskModifier: number;
  factorBreakdown: FactorBreakdown[];
  calculatedAt: string;
  algorithmVersion: string;
  description: string;
  provenance: ScoreProvenance;
}

// ============================================================================
// TYPES — DECISION TRUST (Kernel)
// ============================================================================

export interface CitationIntegrity {
  totalCitations: number;
  verifiedCitations: number;
  fabricatedCitations: number;
  mismatchedCitations: number;
}

export interface ControlResult {
  controlId: string;
  passed: boolean;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface EvidenceMetrics {
  sourceCount: number;
  avgRetrievalScore: number;
  documentTypeCount: number;
}

export interface WorkflowContext {
  hasDefinedBoundaries?: boolean;
  hasRollbackPlan?: boolean;
  hasMonitoringPlan?: boolean;
}

export interface DecisionTrustInput {
  citationIntegrity: CitationIntegrity;
  controlResults: ControlResult[];
  evidenceMetrics: EvidenceMetrics;
  workflowContext?: WorkflowContext;
}

export interface FactorContribution {
  score: number;
  contributionPct: number;
  note: string;
}

export interface DecisionTrustResult {
  scoreName: 'DECISION_TRUST';
  overall: number;
  tier: ScoreTier;
  factors: {
    citationIntegrity: FactorContribution;
    controlAlignment: FactorContribution;
    evidenceQuality: FactorContribution;
    executionReadiness: FactorContribution;
  };
  description: string;
  inputsHash: string;
  kernelVersion: string;
  calculatedAt: string;
  reproducible: boolean;
  provenance: ScoreProvenance;
}

// ============================================================================
// TYPES — MONTE CARLO
// ============================================================================

export type MonteCarloMethod = 'STUB' | 'MULTI_RUN' | 'DROPOUT_SAMPLING';

export interface MonteCarloSignal {
  variance: number;
  runs: number;
  method: MonteCarloMethod;
  isStable: boolean;
  varianceBreakdown?: Record<string, number>;
}

export interface MonteCarloContext {
  content: string;
  modelId?: string;
  promptHash?: string;
  sessionId?: string;
}

// ============================================================================
// TYPES — PROVENANCE
// ============================================================================

export interface ScoreProvenance {
  /** Algorithm version */
  algorithmVersion: string;
  /** ISO timestamp */
  calculatedAt: string;
  /** SHA-256 hash of inputs for reproducibility */
  inputsHash: string;
  /** Whether result is reproducible */
  reproducible: boolean;
  /** Monte Carlo signal if applicable */
  monteCarloSignal?: MonteCarloSignal;
  /** Audit trail notes */
  auditNotes: string[];
}

// ============================================================================
// CONSTANTS — CONFIDENCE SCORES (v3.0 - Pessimistic)
// ============================================================================

const CONFIDENCE_SCORES: Record<ConfidenceLevel, number> = {
  'Strong': 85,      // Verified: specific citations, audit artifacts, enforcement
  'Moderate': 60,    // Reasonable: some evidence, gaps in verification
  'Limited': 35,     // Weak: stated intent only, no enforcement, no metrics
  'Unverifiable': 15 // Critical: vague claims, cannot be audited
};

// ============================================================================
// CONSTANTS — FACTOR WEIGHTS (MCDA)
// ============================================================================

const FACTOR_WEIGHTS: Record<string, number> = {
  'Technical Maturity': 0.20,
  'Regulatory Alignment': 0.25,
  'Labour Impact': 0.20,
  'Workforce Change Impact': 0.20,
  'Vendor Ecosystem': 0.15,
  'Funding Pathway': 0.20
};

const DEFAULT_WEIGHT = 0.20;

// ============================================================================
// CONSTANTS — KERNEL WEIGHTS (Decision Trust)
// ============================================================================

const KERNEL_WEIGHTS = {
  citationIntegrity: 0.30,
  controlAlignment: 0.25,
  evidenceQuality: 0.25,
  executionReadiness: 0.20,
} as const;

const TIER_THRESHOLDS = {
  EXCELLENT: 90,
  STRONG: 75,
  MODERATE: 60,
  WEAK: 40,
  POOR: 0,
} as const;

const KERNEL_VERSION = '1.0.0';
const MCDA_VERSION = 'LUMEN-v3.0';

// ============================================================================
// UTILITY — SHA-256 HASHING (Dependency-free)
// ============================================================================

async function sha256(message: string): Promise<string> {
  // Browser/Node.js compatible
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback: simple hash for non-browser environments
  let hash = 0;
  for (let i = 0; i < message.length; i++) {
    const char = message.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(16, '0');
}

// ============================================================================
// MONTE CARLO — VARIANCE DETECTION
// ============================================================================

/**
 * Compute variance across multiple runs (MVP Stub)
 * Returns unknown signal that degrades RELIABILITY domain
 */
export async function computeMonteCarloVariance(
  _context: MonteCarloContext
): Promise<MonteCarloSignal> {
  return {
    variance: 0,
    runs: 0,
    method: 'STUB',
    isStable: false,
  };
}

/**
 * Calculate degradation factor based on variance signal
 */
export function calculateVarianceDegradation(signal: MonteCarloSignal): number {
  if (signal.runs === 0) return 0.75; // 25% penalty for unknown
  if (signal.isStable) return 1.0;
  const normalizedVariance = Math.min(1, signal.variance);
  return Math.max(0.25, 1.0 - normalizedVariance * 0.75);
}

/**
 * Check if variance status is unknown
 */
export function isVarianceUnknown(signal: MonteCarloSignal): boolean {
  return signal.runs === 0 || signal.method === 'STUB';
}

/**
 * Recommend number of runs based on risk class
 */
export function recommendedRuns(riskClass: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'): number {
  const recommendations = { LOW: 3, MODERATE: 5, HIGH: 10, CRITICAL: 20 };
  return recommendations[riskClass];
}

// ============================================================================
// RISK MODIFIER — RISK RADAR
// ============================================================================

/**
 * Calculate risk modifier based on Risk Radar signals
 * Fatal flaw = hard cap at 42 (below "Moderate" threshold)
 */
function calculateRiskModifier(
  riskRadar: RiskRadar | undefined,
  fatalFlawDetected: boolean
): number {
  if (fatalFlawDetected) return 0.42;
  if (!riskRadar) return 1.00;

  const values = Object.values(riskRadar).filter(v => v !== undefined);
  const redCount = values.filter(v => v === 'Red').length;
  const amberCount = values.filter(v => v === 'Amber').length;

  if (redCount >= 3) return 0.50;
  if (redCount >= 2) return 0.60;
  if (redCount === 1) return 0.75;
  if (amberCount >= 4) return 0.80;
  if (amberCount >= 3) return 0.85;
  if (amberCount >= 2) return 0.90;
  if (amberCount >= 1) return 0.95;

  return 1.00;
}

// ============================================================================
// RISK MODIFIER — PHIPA HARD GATE
// ============================================================================

/**
 * PHIPA Hard Gate: PHI + weak regulatory = automatic penalty
 */
function calculatePhipaModifier(
  factors: EvidenceFactor[],
  phiInvolved: boolean
): { modifier: number; auditNote: string | null } {
  if (!phiInvolved) return { modifier: 1.00, auditNote: null };

  const regFactor = factors.find(f =>
    f.factorName === 'Regulatory Alignment' ||
    f.factorName.toLowerCase().includes('regulatory')
  );

  if (!regFactor) {
    return {
      modifier: 0.55,
      auditNote: 'PHIPA HARD GATE: PHI involved but no regulatory assessment'
    };
  }

  switch (regFactor.confidence) {
    case 'Strong':
      return { modifier: 1.00, auditNote: null };
    case 'Moderate':
      return { modifier: 0.90, auditNote: 'PHIPA: Moderate regulatory confidence with PHI' };
    case 'Limited':
      return {
        modifier: 0.70,
        auditNote: 'PHIPA HARD GATE: Limited regulatory confidence with PHI'
      };
    case 'Unverifiable':
      return {
        modifier: 0.50,
        auditNote: 'PHIPA HARD GATE: Unverifiable regulatory confidence with PHI'
      };
    default:
      return { modifier: 0.80, auditNote: 'PHIPA: Unknown regulatory confidence' };
  }
}

// ============================================================================
// MCDA — STRATEGIC CONFIDENCE CALCULATION
// ============================================================================

export interface StrategicConfidenceOptions {
  factors: EvidenceFactor[];
  riskRadar?: RiskRadar;
  fatalFlawDetected?: boolean;
  phiInvolved?: boolean;
  monteCarloSignal?: MonteCarloSignal;
}

/**
 * Calculate LUMEN Strategic Confidence Score (MCDA)
 * 
 * Answers: "How viable is this system for adoption?"
 * Audience: Executives, procurement committees, board
 */
export async function calculateStrategicConfidence(
  options: StrategicConfidenceOptions
): Promise<StrategicConfidenceResult> {
  const {
    factors,
    riskRadar,
    fatalFlawDetected = false,
    phiInvolved = false,
    monteCarloSignal
  } = options;

  const auditNotes: string[] = [];
  const inputsHash = await sha256(JSON.stringify({ factors, riskRadar, fatalFlawDetected, phiInvolved }));

  // Handle empty factors
  if (!factors || factors.length === 0) {
    return {
      scoreName: 'STRATEGIC_CONFIDENCE',
      finalScore: 50,
      baseScore: 50,
      riskModifier: 1.00,
      factorBreakdown: [],
      calculatedAt: new Date().toISOString(),
      algorithmVersion: MCDA_VERSION,
      description: 'Pessimistic-by-default: penalizes vagueness, rewards verifiability.',
      provenance: {
        algorithmVersion: MCDA_VERSION,
        calculatedAt: new Date().toISOString(),
        inputsHash,
        reproducible: true,
        monteCarloSignal,
        auditNotes: ['No factors provided — defaulting to neutral score']
      }
    };
  }

  // Calculate factor contributions
  const factorBreakdown: FactorBreakdown[] = factors.map(factor => {
    const numericScore = CONFIDENCE_SCORES[factor.confidence] || 50;
    const weight = FACTOR_WEIGHTS[factor.factorName] || DEFAULT_WEIGHT;
    const contribution = numericScore * weight;

    return {
      factorName: factor.factorName,
      confidence: factor.confidence,
      numericScore,
      weight,
      contribution
    };
  });

  const baseScore = factorBreakdown.reduce((sum, f) => sum + f.contribution, 0);

  // Apply risk modifiers
  const riskModifier = calculateRiskModifier(riskRadar, fatalFlawDetected);
  if (fatalFlawDetected) {
    auditNotes.push('FATAL FLAW: Score capped at 42');
  }

  const phipaResult = calculatePhipaModifier(factors, phiInvolved);
  if (phipaResult.auditNote) {
    auditNotes.push(phipaResult.auditNote);
  }

  // Apply Monte Carlo degradation if available
  let mcDegradation = 1.0;
  if (monteCarloSignal) {
    mcDegradation = calculateVarianceDegradation(monteCarloSignal);
    if (mcDegradation < 1.0) {
      auditNotes.push(`Monte Carlo degradation: ${Math.round((1 - mcDegradation) * 100)}% penalty`);
    }
  }

  const combinedModifier = riskModifier * phipaResult.modifier * mcDegradation;
  const finalScore = Math.max(1, Math.min(100, Math.round(baseScore * combinedModifier)));

  return {
    scoreName: 'STRATEGIC_CONFIDENCE',
    finalScore,
    baseScore: Math.round(baseScore),
    riskModifier: combinedModifier,
    factorBreakdown,
    calculatedAt: new Date().toISOString(),
    algorithmVersion: MCDA_VERSION,
    description: 'Pessimistic-by-default: penalizes vagueness, rewards verifiability. Litmus test: would this score survive a subpoena?',
    provenance: {
      algorithmVersion: MCDA_VERSION,
      calculatedAt: new Date().toISOString(),
      inputsHash,
      reproducible: true,
      monteCarloSignal,
      auditNotes
    }
  };
}

// ============================================================================
// KERNEL — DECISION TRUST CALCULATION
// ============================================================================

function calculateCitationIntegrityFactor(metrics: CitationIntegrity): number {
  const { totalCitations, verifiedCitations, fabricatedCitations, mismatchedCitations } = metrics;
  if (totalCitations === 0) return 70;

  const verificationRate = verifiedCitations / totalCitations;
  let score = verificationRate * 100;
  score -= (fabricatedCitations / totalCitations) * 50;
  score -= (mismatchedCitations / totalCitations) * 20;

  return Math.max(0, Math.min(100, Math.round(score)));
}

function calculateControlAlignmentFactor(results: ControlResult[]): number {
  if (results.length === 0) return 50;

  const severityWeights = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
  let totalWeight = 0;
  let passedWeight = 0;

  for (const result of results) {
    const weight = severityWeights[result.severity];
    totalWeight += weight;
    if (result.passed) passedWeight += weight;
  }

  if (totalWeight === 0) return 50;

  const hasCriticalFailure = results.some(r => r.severity === 'CRITICAL' && !r.passed);
  let score = (passedWeight / totalWeight) * 100;
  if (hasCriticalFailure) score = Math.min(score, 40);

  return Math.max(0, Math.min(100, Math.round(score)));
}

function calculateEvidenceQualityFactor(metrics: EvidenceMetrics): number {
  const { sourceCount, avgRetrievalScore, documentTypeCount } = metrics;
  if (sourceCount === 0) return 20;

  const sourceScore = Math.min(sourceCount / 10, 1) * 40;
  const retrievalScore = avgRetrievalScore * 40;
  const diversityScore = Math.min(documentTypeCount / 5, 1) * 20;

  return Math.max(0, Math.min(100, Math.round(sourceScore + retrievalScore + diversityScore)));
}

function calculateExecutionReadinessFactor(context?: WorkflowContext): number {
  if (!context) return 50;

  let score = 40;
  if (context.hasDefinedBoundaries) score += 20;
  if (context.hasRollbackPlan) score += 20;
  if (context.hasMonitoringPlan) score += 20;

  return Math.max(0, Math.min(100, score));
}

function determineTier(score: number): ScoreTier {
  if (score >= TIER_THRESHOLDS.EXCELLENT) return 'EXCELLENT';
  if (score >= TIER_THRESHOLDS.STRONG) return 'STRONG';
  if (score >= TIER_THRESHOLDS.MODERATE) return 'MODERATE';
  if (score >= TIER_THRESHOLDS.WEAK) return 'WEAK';
  return 'POOR';
}

function getCitationNote(metrics: CitationIntegrity): string {
  if (metrics.totalCitations === 0) return 'No citations to verify';
  if (metrics.fabricatedCitations > 0) return `${metrics.fabricatedCitations} fabricated citation(s) detected`;
  if (metrics.mismatchedCitations > 0) return `${metrics.mismatchedCitations} content mismatch(es)`;
  return `${metrics.verifiedCitations}/${metrics.totalCitations} verified`;
}

function getControlNote(results: ControlResult[]): string {
  if (results.length === 0) return 'No controls evaluated';
  const passed = results.filter(r => r.passed).length;
  const critical = results.filter(r => r.severity === 'CRITICAL' && !r.passed).length;
  if (critical > 0) return `${critical} critical control(s) failed`;
  return `${passed}/${results.length} controls passed`;
}

function getEvidenceNote(metrics: EvidenceMetrics): string {
  if (metrics.sourceCount === 0) return 'No sources available';
  return `${metrics.sourceCount} sources, ${metrics.documentTypeCount} types, avg score ${Math.round(metrics.avgRetrievalScore * 100)}%`;
}

function getExecutionNote(context?: WorkflowContext): string {
  if (!context) return 'Workflow context not provided';
  const items: string[] = [];
  if (context.hasDefinedBoundaries) items.push('boundaries');
  if (context.hasRollbackPlan) items.push('rollback');
  if (context.hasMonitoringPlan) items.push('monitoring');
  if (items.length === 0) return 'No execution safeguards defined';
  return `Has: ${items.join(', ')}`;
}

export interface DecisionTrustOptions {
  input: DecisionTrustInput;
  monteCarloSignal?: MonteCarloSignal;
}

/**
 * Calculate LUMEN Decision Trust Score (Kernel)
 * 
 * Answers: "Can this specific output be trusted right now?"
 * Audience: Clinicians, privacy officers, regulators, incident reviewers
 */
export async function calculateDecisionTrust(
  options: DecisionTrustOptions
): Promise<DecisionTrustResult> {
  const { input, monteCarloSignal } = options;
  const auditNotes: string[] = [];

  // Sort control results for deterministic hashing
  const sortedControls = [...input.controlResults].sort((a, b) => {
    const idCompare = a.controlId.localeCompare(b.controlId);
    if (idCompare !== 0) return idCompare;
    return a.severity.localeCompare(b.severity);
  });

  const canonical = {
    citationIntegrity: input.citationIntegrity,
    controlResults: sortedControls.map(c => ({
      controlId: c.controlId,
      passed: c.passed,
      severity: c.severity,
    })),
    evidenceMetrics: input.evidenceMetrics,
    workflowContext: input.workflowContext ? {
      hasDefinedBoundaries: input.workflowContext.hasDefinedBoundaries ?? false,
      hasRollbackPlan: input.workflowContext.hasRollbackPlan ?? false,
      hasMonitoringPlan: input.workflowContext.hasMonitoringPlan ?? false,
    } : null,
    kernelVersion: KERNEL_VERSION,
  };

  const inputsHash = await sha256(JSON.stringify(canonical));

  // Calculate raw factor scores
  const rawScores = {
    citationIntegrity: calculateCitationIntegrityFactor(input.citationIntegrity),
    controlAlignment: calculateControlAlignmentFactor(input.controlResults),
    evidenceQuality: calculateEvidenceQualityFactor(input.evidenceMetrics),
    executionReadiness: calculateExecutionReadinessFactor(input.workflowContext),
  };

  // Calculate weighted values
  const weighted = {
    citationIntegrity: rawScores.citationIntegrity * KERNEL_WEIGHTS.citationIntegrity,
    controlAlignment: rawScores.controlAlignment * KERNEL_WEIGHTS.controlAlignment,
    evidenceQuality: rawScores.evidenceQuality * KERNEL_WEIGHTS.evidenceQuality,
    executionReadiness: rawScores.executionReadiness * KERNEL_WEIGHTS.executionReadiness,
  };

  // Apply Monte Carlo degradation if available
  let mcDegradation = 1.0;
  if (monteCarloSignal) {
    mcDegradation = calculateVarianceDegradation(monteCarloSignal);
    if (mcDegradation < 1.0) {
      auditNotes.push(`Monte Carlo degradation: ${Math.round((1 - mcDegradation) * 100)}% penalty`);
    }
  }

  const overall = Math.round(
    (weighted.citationIntegrity +
     weighted.controlAlignment +
     weighted.evidenceQuality +
     weighted.executionReadiness) * mcDegradation
  );

  // Calculate contributions
  const weightedSum = Object.values(weighted).reduce((a, b) => a + b, 0);
  const safeSum = weightedSum > 0 ? weightedSum : 1;

  const contributions = {
    citationIntegrity: Math.round((weighted.citationIntegrity / safeSum) * 1000) / 10,
    controlAlignment: Math.round((weighted.controlAlignment / safeSum) * 1000) / 10,
    evidenceQuality: Math.round((weighted.evidenceQuality / safeSum) * 1000) / 10,
    executionReadiness: Math.round((weighted.executionReadiness / safeSum) * 1000) / 10,
  };

  const factors = {
    citationIntegrity: {
      score: rawScores.citationIntegrity,
      contributionPct: contributions.citationIntegrity,
      note: getCitationNote(input.citationIntegrity),
    },
    controlAlignment: {
      score: rawScores.controlAlignment,
      contributionPct: contributions.controlAlignment,
      note: getControlNote(input.controlResults),
    },
    evidenceQuality: {
      score: rawScores.evidenceQuality,
      contributionPct: contributions.evidenceQuality,
      note: getEvidenceNote(input.evidenceMetrics),
    },
    executionReadiness: {
      score: rawScores.executionReadiness,
      contributionPct: contributions.executionReadiness,
      note: getExecutionNote(input.workflowContext),
    },
  };

  return {
    scoreName: 'DECISION_TRUST',
    overall,
    tier: determineTier(overall),
    factors,
    description: 'Instance-specific assessment of output safety and trustworthiness',
    inputsHash,
    kernelVersion: KERNEL_VERSION,
    calculatedAt: new Date().toISOString(),
    reproducible: true,
    provenance: {
      algorithmVersion: KERNEL_VERSION,
      calculatedAt: new Date().toISOString(),
      inputsHash,
      reproducible: true,
      monteCarloSignal,
      auditNotes
    }
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if a score meets a minimum threshold
 */
export function meetsThreshold(score: number, threshold: number): boolean {
  return score >= threshold;
}

/**
 * Check if a score is in a specific tier or above
 */
export function meetsMinimumTier(tier: ScoreTier, requiredTier: ScoreTier): boolean {
  const tierOrder: ScoreTier[] = ['POOR', 'WEAK', 'MODERATE', 'STRONG', 'EXCELLENT'];
  return tierOrder.indexOf(tier) >= tierOrder.indexOf(requiredTier);
}

/**
 * Format Strategic Confidence result for display
 */
export function formatStrategicConfidence(result: StrategicConfidenceResult): string {
  const lines = [
    `Strategic Confidence Score: ${result.finalScore}/100`,
    `Base Score: ${result.baseScore} | Risk Modifier: ${result.riskModifier.toFixed(2)}`,
    '',
    'Factor Breakdown:',
    ...result.factorBreakdown.map(f =>
      `  ${f.factorName}: ${f.numericScore} (${f.confidence}) × ${f.weight} = ${f.contribution.toFixed(1)}`
    ),
    '',
    `Algorithm: ${result.algorithmVersion}`,
    `Hash: ${result.provenance.inputsHash.substring(0, 16)}...`,
  ];

  if (result.provenance.auditNotes.length > 0) {
    lines.push('', 'Audit Notes:', ...result.provenance.auditNotes.map(n => `  ⚠️ ${n}`));
  }

  return lines.join('\n');
}

/**
 * Format Decision Trust result for display
 */
export function formatDecisionTrust(result: DecisionTrustResult): string {
  const lines = [
    `Decision Trust Score: ${result.overall}/100 (${result.tier})`,
    result.description,
    '',
    'Factor Breakdown:',
    `  Citation Integrity: ${result.factors.citationIntegrity.score} (${result.factors.citationIntegrity.contributionPct}%)`,
    `    ${result.factors.citationIntegrity.note}`,
    `  Control Alignment: ${result.factors.controlAlignment.score} (${result.factors.controlAlignment.contributionPct}%)`,
    `    ${result.factors.controlAlignment.note}`,
    `  Evidence Quality: ${result.factors.evidenceQuality.score} (${result.factors.evidenceQuality.contributionPct}%)`,
    `    ${result.factors.evidenceQuality.note}`,
    `  Execution Readiness: ${result.factors.executionReadiness.score} (${result.factors.executionReadiness.contributionPct}%)`,
    `    ${result.factors.executionReadiness.note}`,
    '',
    `Kernel Version: ${result.kernelVersion}`,
    `Reproducible: ${result.reproducible ? 'Yes' : 'No'}`,
  ];

  if (result.provenance.auditNotes.length > 0) {
    lines.push('', 'Audit Notes:', ...result.provenance.auditNotes.map(n => `  ⚠️ ${n}`));
  }

  return lines.join('\n');
}

// ============================================================================
// COMPOSITE SCORE
// ============================================================================

export interface LumenScoreResult {
  strategicConfidence: StrategicConfidenceResult;
  decisionTrust: DecisionTrustResult;
  compositeScore: number;
  compositeProvenance: ScoreProvenance;
}

export interface LumenScoreOptions {
  strategicFactors: EvidenceFactor[];
  decisionInput: DecisionTrustInput;
  riskRadar?: RiskRadar;
  fatalFlawDetected?: boolean;
  phiInvolved?: boolean;
}

/**
 * Calculate composite LUMEN Score (both Strategic Confidence and Decision Trust)
 * 
 * Composite = (Strategic × 0.4) + (Decision × 0.6)
 * Decision Trust weighted higher as it's instance-specific
 */
export async function calculateLumenScore(
  options: LumenScoreOptions
): Promise<LumenScoreResult> {
  const mc = await computeMonteCarloVariance({ content: '' });

  const [strategicConfidence, decisionTrust] = await Promise.all([
    calculateStrategicConfidence({
      factors: options.strategicFactors,
      riskRadar: options.riskRadar,
      fatalFlawDetected: options.fatalFlawDetected,
      phiInvolved: options.phiInvolved,
      monteCarloSignal: mc,
    }),
    calculateDecisionTrust({
      input: options.decisionInput,
      monteCarloSignal: mc,
    }),
  ]);

  const compositeScore = Math.round(
    strategicConfidence.finalScore * 0.4 + decisionTrust.overall * 0.6
  );

  const compositeHash = await sha256(JSON.stringify({
    strategic: strategicConfidence.provenance.inputsHash,
    decision: decisionTrust.provenance.inputsHash,
  }));

  return {
    strategicConfidence,
    decisionTrust,
    compositeScore,
    compositeProvenance: {
      algorithmVersion: `COMPOSITE(${MCDA_VERSION},${KERNEL_VERSION})`,
      calculatedAt: new Date().toISOString(),
      inputsHash: compositeHash,
      reproducible: true,
      monteCarloSignal: mc,
      auditNotes: [
        ...strategicConfidence.provenance.auditNotes,
        ...decisionTrust.provenance.auditNotes,
      ],
    },
  };
}
