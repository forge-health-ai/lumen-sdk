/**
 * LUMEN SDK - PolicyPack Primitive
 * 
 * A versioned governance artifact that defines what checks to run
 * and how to score them. Think of it as "compliance as code."
 * 
 * Lifecycle: Draft → Approved → Active → Deprecated → Retired
 * 
 * @module @forge/lumen-sdk
 * @copyright 2026 Forge Partners Inc.
 * @license Apache-2.0
 */

export type PolicyPackStatus = 'DRAFT' | 'APPROVED' | 'ACTIVE' | 'DEPRECATED' | 'RETIRED';

export type EnforcementMode = 
  | 'ADVISORY'  // Warn only — never blocks
  | 'GUARDED'   // Block recommended — human can override
  | 'STRICT';   // Block required — explicit signal (still non-enforcing by LUMEN)

export interface PolicyRule {
  /** Unique rule identifier */
  ruleId: string;
  
  /** Human-readable name */
  name: string;
  
  /** Description of what this rule checks */
  description: string;
  
  /** Category: privacy, safety, ethics, compliance, etc. */
  category: 'PRIVACY' | 'SAFETY' | 'ETHICS' | 'COMPLIANCE' | 'OPERATIONAL' | 'FINANCIAL';
  
  /** Severity if triggered */
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  
  /** The check logic (deterministic) */
  check: PolicyCheck;
  
  /** Remediation guidance if rule triggers */
  remediation: string;
  
  /** Legal citation if applicable */
  legalCitation?: string;
}

export interface PolicyCheck {
  /** Check type */
  type: 'REGEX' | 'THRESHOLD' | 'REQUIRED_FIELD' | 'CONTRAINDICATION' | 'CUSTOM';
  
  /** For REGEX: pattern to match */
  pattern?: string;
  
  /** For THRESHOLD: field and limits */
  threshold?: {
    field: string;
    min?: number;
    max?: number;
  };
  
  /** For REQUIRED_FIELD: list of required fields */
  requiredFields?: string[];
  
  /** For CONTRAINDICATION: logic expression */
  contraindication?: string;
  
  /** For CUSTOM: function name to call */
  customCheckFn?: string;
}

export interface PolicyThreshold {
  /** What this threshold measures */
  name: string;
  
  /** Minimum acceptable value */
  min?: number;
  
  /** Maximum acceptable value */
  max?: number;
  
  /** Warning threshold (before hard limit) */
  warningThreshold?: number;
  
  /** Unit of measurement */
  unit?: string;
}

export interface PolicyPackMetadata {
  /** Unique pack identifier */
  packId: string;
  
  /** Semantic version */
  version: string;
  
  /** When this pack becomes effective */
  effectiveDate: string;
  
  /** When this pack expires (if applicable) */
  expirationDate?: string;
  
  /** Owner organization */
  owner: string;
  
  /** Current lifecycle status */
  status: PolicyPackStatus;
  
  /** How often this pack should be reviewed */
  reviewCadence: 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY';
  
  /** Last review date */
  lastReviewedAt?: string;
  
  /** Next scheduled review */
  nextReviewAt?: string;
  
  /** Approver information */
  approvedBy?: string;
  
  /** Approval date */
  approvedAt?: string;
}

/**
 * PolicyPack - Versioned governance artifact
 * 
 * Every decision evaluation references an active pack version.
 * If no active pack matches, the evaluation flags drift.
 */
export interface PolicyPack {
  /** Pack metadata */
  metadata: PolicyPackMetadata;
  
  /** Human-readable name */
  name: string;
  
  /** Description */
  description: string;
  
  /** Target domain */
  domain: 'HEALTHCARE' | 'FINANCE' | 'GOVERNMENT' | 'LEGAL' | 'GENERAL';
  
  /** Target region/jurisdiction */
  region: 'CA_ON' | 'CA_FED' | 'US' | 'EU' | 'UK' | 'GLOBAL';
  
  /** Policy rules in this pack */
  rules: PolicyRule[];
  
  /** Thresholds for scoring */
  thresholds: {
    /** Minimum LUMEN Score to pass */
    minLumenScore: number;
    /** Minimum citation integrity to pass */
    minCitationIntegrity: number;
    /** Maximum days before data is considered stale */
    maxDataStaleDays: number;
    /** Confidence threshold */
    minConfidence: number;
  };
  
  /** Required fields per workflow type */
  requiredFields: Record<string, string[]>;
  
  /** Enforcement mode for this pack */
  enforcementMode: EnforcementMode;
  
  /** Compliance frameworks this pack implements */
  complianceFrameworks: string[];
  
  /** Hash of the pack for integrity verification */
  packHash: string;
}

/**
 * Built-in Policy Packs
 */
export const POLICY_PACKS = {
  /** Ontario Healthcare Privacy Pack */
  PHIPA: {
    packId: 'ca-on-healthcare-phipa',
    name: 'Ontario Healthcare Privacy Pack',
    domain: 'HEALTHCARE',
    region: 'CA_ON',
    complianceFrameworks: ['PHIPA', 'PIPEDA', 'NIST-AI-RMF'],
    rules: [
      {
        ruleId: 'phipa-001',
        name: 'PHI Consent Verification',
        description: 'Verify patient consent exists for AI processing',
        category: 'PRIVACY',
        severity: 'CRITICAL',
        check: { type: 'REQUIRED_FIELD', requiredFields: ['consentStatus'] },
        remediation: 'Obtain explicit patient consent before AI processing',
        legalCitation: 'PHIPA Section 29(1)'
      },
      {
        ruleId: 'phipa-002',
        name: 'Data Residency',
        description: 'Ensure data remains in Canadian jurisdiction',
        category: 'COMPLIANCE',
        severity: 'CRITICAL',
        check: { type: 'REGEX', pattern: 'ca-(east|central|west)' },
        remediation: 'Use Canadian data centers only',
        legalCitation: 'PHIPA Section 10(3)'
      },
      {
        ruleId: 'phipa-003',
        name: 'Audit Trail Immutability',
        description: 'Verify audit logging is enabled and immutable',
        category: 'COMPLIANCE',
        severity: 'HIGH',
        check: { type: 'REQUIRED_FIELD', requiredFields: ['auditEnabled', 'auditImmutable'] },
        remediation: 'Enable immutable audit logging',
        legalCitation: 'PHIPA Section 10(1)'
      }
    ],
    thresholds: {
      minLumenScore: 60,
      minCitationIntegrity: 0.7,
      maxDataStaleDays: 30,
      minConfidence: 0.6
    }
  } as Partial<PolicyPack>,
  
  /** HIPAA Compliance Pack */
  HIPAA: {
    packId: 'us-healthcare-hipaa',
    name: 'US Healthcare HIPAA Pack',
    domain: 'HEALTHCARE',
    region: 'US',
    complianceFrameworks: ['HIPAA', 'HITECH', 'NIST-AI-RMF']
  } as Partial<PolicyPack>
} as const;

/**
 * Validate a policy pack
 */
export function validatePolicyPack(pack: PolicyPack): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!pack.metadata.packId) errors.push('Missing packId');
  if (!pack.metadata.version) errors.push('Missing version');
  if (!pack.rules || pack.rules.length === 0) errors.push('No rules defined');
  if (pack.metadata.status !== 'ACTIVE' && pack.metadata.status !== 'APPROVED') {
    errors.push(`Pack status is ${pack.metadata.status}, must be ACTIVE or APPROVED`);
  }
  
  return { valid: errors.length === 0, errors };
}

/**
 * Check if a policy pack is expired
 */
export function isPolicyPackExpired(pack: PolicyPack): boolean {
  if (!pack.metadata.expirationDate) return false;
  return new Date(pack.metadata.expirationDate) < new Date();
}

export default PolicyPack;
