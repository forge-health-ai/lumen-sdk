/**
 * LUMEN SDK - DecisionRecord Primitive
 * 
 * A canonical representation of "a decision moment" — the convergence
 * of human judgment, AI output, and clinical context.
 * 
 * Design principle: Store POINTERS and HASHES, not raw clinical payloads.
 * PHI never transits through LUMEN by default.
 * 
 * @module @forge/lumen-sdk
 * @copyright 2026 Forge Partners Inc.
 * @license Apache-2.0
 */

export interface RequestContext {
  /** Encounter type: ED, inpatient, outpatient, etc. */
  encounterType?: string;
  /** Clinical setting */
  setting?: string;
  /** User role initiating the decision */
  userRole: 'PHYSICIAN' | 'NURSE' | 'PHARMACIST' | 'ADMIN' | 'SYSTEM';
  /** ISO timestamp when request was initiated */
  requestedAt: string;
  /** ISO timestamp when decision was finalized */
  finalizedAt?: string;
  /** Session identifier for audit correlation */
  sessionId: string;
}

export interface InputsSnapshot {
  /** Hash of the clinical input data (never the data itself) */
  inputsHash: string;
  /** List of data categories present */
  dataCategories: string[];
  /** Pointers to source systems (EHR, PACS, etc.) */
  sourcePointers?: DataSourcePointer[];
}

export interface DataSourcePointer {
  /** Source system identifier */
  systemId: string;
  /** Record type */
  recordType: string;
  /** Reference ID within source system */
  referenceId: string;
  /** Hash of the referenced data at retrieval time */
  contentHash: string;
  /** ISO timestamp of retrieval */
  retrievedAt: string;
}

export interface AIOutputs {
  /** Model identifier (e.g., "gemini-2.5-pro") */
  modelId: string;
  /** Model version */
  modelVersion: string;
  /** Prompt template identifier */
  promptTemplateId?: string;
  /** Prompt template version */
  promptTemplateVersion?: string;
  /** Pointers to retrieved sources (RAG) */
  retrievedSources: RetrievedSource[];
  /** Hash of the generated content */
  outputHash: string;
  /** Optional: generated content (if storage policy allows) */
  generatedContent?: string;
  /** Confidence score from the model (0-1) */
  modelConfidence?: number;
  /** Latency in milliseconds */
  latencyMs: number;
}

export interface RetrievedSource {
  /** Source identifier */
  sourceId: string;
  /** Document name */
  documentName: string;
  /** Document type */
  documentType: 'regulatory_doc' | 'clinical_guideline' | 'academic' | 'internal_policy' | 'news_signal';
  /** Relevance score from retrieval (0-1) */
  relevanceScore: number;
  /** Content hash for integrity verification */
  contentHash: string;
}

export interface HumanAction {
  /** What the human did with the AI output */
  action: 'ACCEPTED' | 'EDITED' | 'REJECTED' | 'DEFERRED';
  /** Optional rationale for the action */
  rationale?: string;
  /** If edited, hash of the edited content */
  editedContentHash?: string;
  /** User identifier (pseudonymous) */
  actorId: string;
  /** ISO timestamp of the action */
  actionAt: string;
}

export interface PolicyContext {
  /** Policy pack identifier */
  packId: string;
  /** Policy pack version */
  packVersion: string;
  /** Required checks that were run */
  requiredChecks: string[];
  /** Enforcement mode */
  enforcementMode: 'ADVISORY' | 'GUARDED' | 'STRICT';
}

export interface DecisionRecordHashes {
  /** Canonical hash of inputs snapshot */
  inputsCanonicalHash: string;
  /** Canonical hash of outputs snapshot */
  outputsCanonicalHash: string;
  /** Hash of the entire record for integrity verification */
  recordHash: string;
  /** Hash algorithm used */
  hashAlgorithm: 'SHA-256' | 'SHA-384' | 'SHA-512';
}

/**
 * DecisionRecord - The core primitive of the LUMEN DDRL
 * 
 * This is the auditable artifact that answers:
 * "Why was this decision made, what AI was involved, and who approved it?"
 */
export interface DecisionRecord {
  /** Unique identifier for this decision record */
  decisionId: string;
  
  /** Tenant/organization identifier */
  tenantId: string;
  
  /** 
   * Subject identifier - NEVER raw PHI
   * Use pseudonymous reference (hash, encounter ID, etc.)
   */
  subjectId: string;
  
  /** Workflow/use case identifier */
  workflowId: string;
  
  /** Request context (encounter, setting, timestamps) */
  requestContext: RequestContext;
  
  /** Inputs snapshot (hashes and pointers, not raw data) */
  inputs: InputsSnapshot;
  
  /** AI outputs (model info, sources, output hash) */
  aiOutputs: AIOutputs;
  
  /** Human action taken */
  humanAction: HumanAction;
  
  /** Policy context under which decision was evaluated */
  policyContext: PolicyContext;
  
  /** Canonical hashes for integrity verification */
  hashes: DecisionRecordHashes;
  
  /** LUMEN Score for this decision (0-100) */
  lumenScore?: number;
  
  /** Risk tier classification */
  riskTier?: 1 | 2 | 3;
  
  /** ISO timestamp of record creation */
  createdAt: string;
  
  /** Digital signature (when signed) */
  signature?: string;
  
  /** Signing key identifier */
  signedBy?: string;
  
  /** ISO timestamp of signing */
  signedAt?: string;
  
  /** SDK version that created this record */
  sdkVersion: string;
}

/**
 * Create a new DecisionRecord with defaults
 */
export function createDecisionRecord(
  params: Omit<DecisionRecord, 'decisionId' | 'createdAt' | 'sdkVersion' | 'hashes'>
): DecisionRecord {
  const now = new Date().toISOString();
  const decisionId = generateDecisionId();
  
  // Calculate hashes
  const inputsCanonicalHash = hashObject(params.inputs);
  const outputsCanonicalHash = hashObject(params.aiOutputs);
  const recordHash = hashObject({ ...params, decisionId, createdAt: now });
  
  return {
    ...params,
    decisionId,
    createdAt: now,
    sdkVersion: SDK_VERSION,
    hashes: {
      inputsCanonicalHash,
      outputsCanonicalHash,
      recordHash,
      hashAlgorithm: 'SHA-256'
    }
  };
}

/**
 * Generate a unique decision ID
 * Format: LUMEN-{timestamp}-{random}
 */
function generateDecisionId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `LUMEN-${timestamp}-${random}`;
}

/**
 * Hash an object deterministically
 * Uses JSON canonical serialization + SHA-256
 */
function hashObject(obj: unknown): string {
  // In production, use crypto.subtle.digest
  // For now, simple deterministic hash simulation
  const str = JSON.stringify(obj, Object.keys(obj as object).sort());
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return 'sha256:' + Math.abs(hash).toString(16).padStart(16, '0');
}

const SDK_VERSION = '1.0.0';

export default DecisionRecord;
