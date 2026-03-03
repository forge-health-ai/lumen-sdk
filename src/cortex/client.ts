/**
 * LUMEN SDK™ — LumenClient (CORTEX Runtime Orchestrator)
 * 
 * Orchestrates the full LUMEN evaluation pipeline:
 *   1. Scanner Intelligence → active regulatory signals
 *   2. Policy Packs API → applicable governance packs
 *   3. CORTEX API → scoring + evaluation with signals + policies
 *   4. Unified result with LUMEN Score, audit trail, metadata
 * 
 * © 2026 Forge Partners Inc. All rights reserved.
 * CONFIDENTIAL AND PROPRIETARY.
 */

import {
  type LumenClientConfig,
  type EvaluateRequest,
  type EvaluateResult,
  type RegulatorySignal,
  type PolicyPackRef,
  type PolicyPackDetail,
  type PolicyRule,
  type DomainScore,
  type QuickScoreRequest,
  type QuickScoreResult,
  type AuditTrailRecord,
  type FrameworkInfo,
  type ScannerSignalsResponse,
  type PolicyPacksResponse,
  type CortexEvaluateRequest,
  type CortexEvaluateResponse,
} from './types';
import { LumenValidationError, LumenEvaluationError, LumenNetworkError } from './errors';
import { httpRequest, withRetry, type HttpResponse } from './http';

// ============================================================================
// DEFAULTS
// ============================================================================

const DEFAULTS = {
  cortexUrl: 'https://cortex.forgelumen.ca',
  policyUrl: 'https://api.forgelumen.ca',
  scannerUrl: 'https://api-intelligence.forgelumen.ca',
  timeout: 15000,
  maxRetries: 2,
} as const;

// ============================================================================
// LOGGER
// ============================================================================

interface LogEntry {
  ts: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  msg: string;
  data?: unknown;
}

function log(debug: boolean, entry: Omit<LogEntry, 'ts'>): void {
  if (!debug && entry.level === 'debug') return;
  const full: LogEntry = { ts: new Date().toISOString(), ...entry };
  if (entry.level === 'error') {
    console.error(`[LUMEN] ${full.msg}`, full.data ?? '');
  } else if (entry.level === 'warn') {
    console.warn(`[LUMEN] ${full.msg}`, full.data ?? '');
  } else {
    console.log(`[LUMEN] ${full.msg}`, full.data ?? '');
  }
}

// ============================================================================
// LUMEN CLIENT
// ============================================================================

export class LumenClient {
  private readonly apiKey: string;
  private readonly cortexUrl: string;
  private readonly policyUrl: string;
  private readonly scannerUrl: string;
  private readonly timeout: number;
  private readonly maxRetries: number;
  private readonly debug: boolean;
  private readonly tenantId?: string;

  constructor(config: LumenClientConfig) {
    if (!config.apiKey) {
      throw new LumenValidationError('apiKey is required');
    }
    this.apiKey = config.apiKey;
    this.cortexUrl = (config.cortexUrl || DEFAULTS.cortexUrl).replace(/\/+$/, '');
    this.policyUrl = (config.policyUrl || DEFAULTS.policyUrl).replace(/\/+$/, '');
    this.scannerUrl = (config.scannerUrl || DEFAULTS.scannerUrl).replace(/\/+$/, '');
    this.timeout = config.timeout ?? DEFAULTS.timeout;
    this.maxRetries = config.maxRetries ?? DEFAULTS.maxRetries;
    this.debug = config.debug ?? false;
    this.tenantId = config.tenantId;

    log(this.debug, { level: 'info', msg: 'LumenClient initialized', data: {
      cortexUrl: this.cortexUrl,
      policyUrl: this.policyUrl,
      scannerUrl: this.scannerUrl,
    }});
  }

  // ==========================================================================
  // PRIMARY METHOD — evaluate()
  // ==========================================================================

  /**
   * Full LUMEN evaluation pipeline.
   *
   * Orchestration:
   *   1. Fetch active regulatory signals from Scanner Intelligence
   *   2. Fetch applicable policy packs from Policy Packs API
   *   3. Send LLM output + signals + policies to CORTEX for scoring
   *   4. Return unified result
   *
   * Graceful degradation: if Scanner is unreachable, evaluation proceeds
   * with an empty signal set and a warning flag.
   */
  async evaluate(request: EvaluateRequest): Promise<EvaluateResult> {
    // Validate
    if (!request.llmOutput) throw new LumenValidationError('llmOutput is required');
    if (!request.useCase) throw new LumenValidationError('useCase is required');
    if (!request.jurisdiction) throw new LumenValidationError('jurisdiction is required');

    const warnings: string[] = [];
    const totalStart = Date.now();

    log(this.debug, { level: 'debug', msg: 'evaluate() start', data: {
      useCase: request.useCase,
      jurisdiction: request.jurisdiction,
    }});

    // ------------------------------------------------------------------
    // Step 1: Scanner Intelligence — regulatory signals (non-blocking on failure)
    // ------------------------------------------------------------------
    let signals: RegulatorySignal[] = [];
    let scannerMs = 0;
    try {
      const scannerResult = await this.getSignals(request.jurisdiction);
      signals = scannerResult;
      scannerMs = Date.now() - totalStart;
      log(this.debug, { level: 'debug', msg: `Scanner returned ${signals.length} signal(s)`, data: { ms: scannerMs } });
    } catch (err) {
      scannerMs = Date.now() - totalStart;
      const msg = `Scanner unavailable: ${(err as Error).message}. Evaluating without live signals.`;
      warnings.push(msg);
      log(this.debug, { level: 'warn', msg });
    }

    // ------------------------------------------------------------------
    // Step 2: Policy Packs — applicable packs for jurisdiction
    // ------------------------------------------------------------------
    let policies: PolicyPackRef[] = [];
    const policyStart = Date.now();
    let policyMs = 0;
    try {
      policies = await this.getPoliciesForJurisdiction(request.jurisdiction);
      policyMs = Date.now() - policyStart;
      log(this.debug, { level: 'debug', msg: `Policy Packs returned ${policies.length} pack(s)`, data: { ms: policyMs } });
    } catch (err) {
      policyMs = Date.now() - policyStart;
      const msg = `Policy Packs unavailable: ${(err as Error).message}. Evaluating without policy context.`;
      warnings.push(msg);
      log(this.debug, { level: 'warn', msg });
    }

    // ------------------------------------------------------------------
    // Step 3: CORTEX — scoring + evaluation
    // ------------------------------------------------------------------
    const cortexStart = Date.now();
    const cortexPayload: CortexEvaluateRequest = {
      llmOutput: request.llmOutput,
      useCase: request.useCase,
      jurisdiction: request.jurisdiction,
      clinicalDomain: request.clinicalDomain,
      constraints: request.constraints,
      policies,
      signals,
      metadata: request.metadata,
    };

    let cortexResponse: CortexEvaluateResponse;
    try {
      const res = await withRetry(
        () => this.request<CortexEvaluateResponse>('cortex', 'POST', '/v1/evaluate', cortexPayload),
        this.maxRetries,
        'cortex',
      );
      cortexResponse = res.data;
    } catch (err) {
      throw new LumenEvaluationError(
        `CORTEX evaluation failed: ${(err as Error).message}`,
        { useCase: request.useCase, jurisdiction: request.jurisdiction },
      );
    }
    const cortexMs = Date.now() - cortexStart;

    log(this.debug, { level: 'info', msg: `evaluate() complete — score=${cortexResponse.lumenScore}`, data: {
      goNoGo: cortexResponse.goNoGo,
      totalMs: Date.now() - totalStart,
    }});

    // ------------------------------------------------------------------
    // Step 4: Unified result
    // ------------------------------------------------------------------
    return {
      lumenScore: cortexResponse.lumenScore,
      confidence: cortexResponse.confidence,
      domainScores: cortexResponse.domainScores,
      goNoGo: cortexResponse.goNoGo,
      auditTrailId: cortexResponse.auditTrailId,
      policiesApplied: policies,
      activeSignals: signals,
      latency: {
        totalMs: Date.now() - totalStart,
        scannerMs,
        policyMs,
        cortexMs,
      },
      warnings,
      evaluatedAt: cortexResponse.evaluatedAt,
    };
  }

  // ==========================================================================
  // CONVENIENCE METHODS
  // ==========================================================================

  /**
   * Quick score without the full pipeline.
   * Sends pre-computed domain assessments directly to CORTEX.
   */
  async score(domainAssessments: DomainScore[], jurisdiction: string): Promise<QuickScoreResult> {
    const res = await withRetry(
      () => this.request<QuickScoreResult>('cortex', 'POST', '/v1/score', { domainAssessments, jurisdiction }),
      this.maxRetries,
      'cortex',
    );
    return res.data;
  }

  /**
   * Retrieve a stored evaluation / audit trail record by ID.
   */
  async getAuditTrail(id: string): Promise<AuditTrailRecord> {
    if (!id) throw new LumenValidationError('Audit trail ID is required');
    const res = await withRetry(
      () => this.request<AuditTrailRecord>('cortex', 'GET', `/v1/audit/${encodeURIComponent(id)}`),
      this.maxRetries,
      'cortex',
    );
    return res.data;
  }

  /**
   * List applicable regulatory frameworks for a jurisdiction.
   */
  async getFrameworks(jurisdiction: string): Promise<FrameworkInfo[]> {
    if (!jurisdiction) throw new LumenValidationError('jurisdiction is required');
    const res = await withRetry(
      () => this.request<FrameworkInfo[]>('policy', 'GET', `/v1/frameworks?jurisdiction=${encodeURIComponent(jurisdiction)}`),
      this.maxRetries,
      'policy',
    );
    return res.data;
  }

  /**
   * Get rules / details for a specific policy pack.
   */
  async getPolicies(packId: string): Promise<PolicyPackDetail> {
    if (!packId) throw new LumenValidationError('packId is required');
    const res = await withRetry(
      () => this.request<PolicyPackDetail>('policy', 'GET', `/v1/packs/${encodeURIComponent(packId)}`),
      this.maxRetries,
      'policy',
    );
    return res.data;
  }

  /**
   * Get active regulatory signals for a jurisdiction.
   */
  async getSignals(jurisdiction: string): Promise<RegulatorySignal[]> {
    if (!jurisdiction) throw new LumenValidationError('jurisdiction is required');
    const res = await withRetry(
      () => this.request<ScannerSignalsResponse>('scanner', 'GET', `/v1/signals?jurisdiction=${encodeURIComponent(jurisdiction)}`),
      this.maxRetries,
      'scanner',
    );
    return res.data.signals;
  }

  // ==========================================================================
  // INTERNAL
  // ==========================================================================

  private baseUrlFor(service: 'cortex' | 'policy' | 'scanner'): string {
    switch (service) {
      case 'cortex': return this.cortexUrl;
      case 'policy': return this.policyUrl;
      case 'scanner': return this.scannerUrl;
    }
  }

  private async request<T>(
    service: 'cortex' | 'policy' | 'scanner',
    method: 'GET' | 'POST',
    path: string,
    body?: unknown,
  ): Promise<HttpResponse<T>> {
    return httpRequest<T>({
      baseUrl: this.baseUrlFor(service),
      path,
      method,
      apiKey: this.apiKey,
      body,
      timeout: this.timeout,
      service,
    });
  }

  /**
   * Fetch applicable policy packs for a jurisdiction.
   */
  private async getPoliciesForJurisdiction(jurisdiction: string): Promise<PolicyPackRef[]> {
    const res = await withRetry(
      () => this.request<PolicyPacksResponse>('policy', 'GET', `/v1/packs?jurisdiction=${encodeURIComponent(jurisdiction)}`),
      this.maxRetries,
      'policy',
    );
    return res.data.packs;
  }
}
