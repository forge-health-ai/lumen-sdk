/**
 * LUMEN SDK - US Federal HIPAA Policy Pack
 * 
 * Health Insurance Portability and Accountability Act
 * 45 CFR Parts 160, 162, 164
 * 
 * This policy pack implements real HIPAA provisions for healthcare AI governance.
 * Includes HITECH Act extensions.
 * 
 * @copyright 2026 Forge Partners Inc.
 * @license Apache-2.0
 */

export type RuleCategory = 'collection' | 'use' | 'disclosure' | 'consent' | 'security' | 'retention' | 'access' | 'breach';
export type Severity = 'critical' | 'high' | 'medium';

export interface EvaluationContext {
  /** Whether PHI is present in the context */
  phiPresent?: boolean;
  /** Types of PHI present */
  phiTypes?: string[];
  /** HIPAA identifiers present */
  hipaaIdentifiers?: string[];
  /** Whether authorization was obtained */
  hasAuthorization?: boolean;
  /** Valid HIPAA authorization on file */
  validAuthorization?: boolean;
  /** Data residency location */
  dataResidency?: string;
  /** User role accessing the data */
  userRole?: 'covered_entity' | 'business_associate' | 'healthcare_provider' | 'patient' | 'workforce' | 'third_party';
  /** Purpose of use/disclosure */
  purpose?: string;
  /** Whether the purpose is treatment, payment, or healthcare operations */
  isTPO?: boolean;
  /** Specific to treatment */
  forTreatment?: boolean;
  /** Specific to payment */
  forPayment?: boolean;
  /** Specific to healthcare operations */
  forHealthcareOperations?: boolean;
  /** Security safeguards implemented */
  safeguards?: string[];
  /** Administrative safeguards implemented */
  adminSafeguards?: boolean;
  /** Physical safeguards implemented */
  physicalSafeguards?: boolean;
  /** Technical safeguards implemented */
  technicalSafeguards?: boolean;
  /** Whether audit logging is enabled */
  auditLoggingEnabled?: boolean;
  /** Encryption status */
  encryptionAtRest?: boolean;
  encryptionInTransit?: boolean;
  /** Access controls implemented */
  accessControlsImplemented?: boolean;
  /** Unique user identification required */
  uniqueUserIdentification?: boolean;
  /** Emergency access procedures */
  emergencyAccessProcedures?: boolean;
  /** Patient requested access */
  patientAccessRequest?: boolean;
  /** Time to provide access (days) */
  accessResponseDays?: number;
  /** Amendment request */
  amendmentRequest?: boolean;
  /** Time to respond to amendment (days) */
  amendmentResponseDays?: number;
  /** Breach detected */
  breachDetected?: boolean;
  /** Breach scope */
  breachScope?: 'minor' | 'significant' | 'major' | 'reportable';
  /** Number of individuals affected */
  breachAffectedCount?: number;
  /** Whether breach notification sent */
  breachNotificationSent?: boolean;
  /** Breach notification timeframe met */
  breachNotificationTimely?: boolean;
  /** Whether data is de-identified */
  isDeIdentified?: boolean;
  /** De-identification method: Safe Harbor or Expert Determination */
  deidentificationMethod?: 'safe_harbor' | 'expert_determination' | 'none';
  /** Which Safe Harbor identifiers were removed */
  safeHarborRemoved?: string[];
  /** Notice of Privacy Practices provided */
  nppProvided?: boolean;
  /** Patient opted out of certain uses */
  patientOptOut?: boolean;
  /** Minimum necessary standard applied */
  minimumNecessaryApplied?: boolean;
  /** Request is for public health purposes */
  publicHealthPurpose?: boolean;
  /** Request is for law enforcement */
  lawEnforcementPurpose?: boolean;
  /** Request is for research */
  researchPurpose?: boolean;
  /** Research has IRB approval */
  researchIRBApproved?: boolean;
  /** Business Associate Agreement in place */
  baaInPlace?: boolean;
  /** Workforce training completed */
  workforceTrainingCompleted?: boolean;
  /** Sanction policy implemented */
  sanctionPolicyImplemented?: boolean;
  /** Privacy officer designated */
  privacyOfficerDesignated?: boolean;
  /** Security officer designated */
  securityOfficerDesignated?: boolean;
}

export interface EvaluationResult {
  pass: boolean;
  reason: string;
}

export interface PolicyRule {
  id: string;
  section: string;
  title: string;
  description: string;
  category: RuleCategory;
  severity: Severity;
  evaluator: (context: EvaluationContext) => EvaluationResult;
}

export interface PolicyPack {
  id: string;
  name: string;
  version: string;
  jurisdiction: {
    country: string;
    region: string;
  };
  framework: string;
  lastUpdated: string;
  rules: PolicyRule[];
}

// Helper functions
const pass = (reason: string): EvaluationResult => ({ pass: true, reason });
const fail = (reason: string): EvaluationResult => ({ pass: false, reason });

// HIPAA Safe Harbor identifiers (18 total)
const SAFE_HARBOR_IDENTIFIERS = [
  'names',
  'geographic_subdivisions',
  'dates',
  'telephone_numbers',
  'fax_numbers',
  'email_addresses',
  'ssn',
  'mrn',
  'health_plan_numbers',
  'account_numbers',
  'certificate_numbers',
  'vehicle_identifiers',
  'device_identifiers',
  'urls',
  'ip_addresses',
  'biometric_identifiers',
  'photos',
  'other_unique_identifiers'
];

/**
 * US Federal HIPAA Policy Pack
 * Implements key provisions of the Health Insurance Portability and Accountability Act
 * Including HITECH Act extensions
 */
export const usFedHipaa: PolicyPack = {
  id: 'us-fed-hipaa',
  name: 'Health Insurance Portability and Accountability Act',
  version: '2.0.0',
  jurisdiction: {
    country: 'US',
    region: 'federal'
  },
  framework: 'HIPAA 45 CFR Parts 160, 162, 164',
  lastUpdated: '2026-02-13',
  rules: [
    // §164.502 - Minimum Necessary Standard
    {
      id: 'hipaa-164-502-minimum-necessary',
      section: '§164.502(b), §164.514(d)',
      title: 'Minimum Necessary Standard',
      description: 'Covered entities must make reasonable efforts to limit PHI access to the minimum necessary to accomplish the intended purpose.',
      category: 'use',
      severity: 'critical',
      evaluator: (ctx: EvaluationContext) => {
        if (!ctx.phiPresent) return pass('No PHI involved');
        if (ctx.userRole === 'patient') {
          return pass('Minimum necessary does not apply to own records');
        }
        if (ctx.forTreatment) {
          return pass('Minimum necessary does not apply for treatment purposes');
        }
        if (ctx.minimumNecessaryApplied === true) {
          return pass('Minimum necessary standard applied');
        }
        if (ctx.minimumNecessaryApplied === false) {
          return fail('Minimum necessary standard must be applied for non-treatment disclosures');
        }
        return pass('Minimum necessary assessment not applicable');
      }
    },

    // §164.508 - Authorization Requirements
    {
      id: 'hipaa-164-508-authorization',
      section: '§164.508(a)',
      title: 'Authorization Required',
      description: 'Except as permitted or required by §164.510 or §164.512, a covered entity shall not use or disclose PHI without valid authorization.',
      category: 'consent',
      severity: 'critical',
      evaluator: (ctx: EvaluationContext) => {
        if (!ctx.phiPresent) return pass('No PHI involved');
        if (ctx.hasAuthorization && ctx.validAuthorization) {
          return pass('Valid authorization on file');
        }
        if (ctx.isTPO) {
          return pass('Authorization not required for treatment, payment, or healthcare operations');
        }
        if (ctx.patientAccessRequest) {
          return pass('Authorization not required for patient access');
        }
        if (ctx.publicHealthPurpose) {
          return pass('Authorization not required for public health purposes §164.512(b)');
        }
        if (ctx.lawEnforcementPurpose) {
          return pass('Authorization not required for law enforcement under §164.512(f)');
        }
        if (ctx.researchPurpose && ctx.researchIRBApproved) {
          return pass('Authorization not required for IRB-approved research with waiver');
        }
        return fail('HIPAA authorization required for this use/disclosure');
      }
    },

    // §164.512 - Uses Without Authorization - Treatment
    {
      id: 'hipaa-164-512-treatment',
      section: '§164.502(a)(1)(ii), §164.506(c)',
      title: 'Treatment Exception',
      description: 'A covered entity may use or disclose PHI for its own treatment activities or health care operations without authorization.',
      category: 'use',
      severity: 'high',
      evaluator: (ctx: EvaluationContext) => {
        if (!ctx.phiPresent) return pass('No PHI involved');
        if (ctx.forTreatment) {
          if (ctx.userRole === 'covered_entity' || ctx.userRole === 'healthcare_provider') {
            return pass('Treatment use permitted without authorization');
          }
          if (ctx.userRole === 'business_associate' && ctx.baaInPlace) {
            return pass('Business associate may access PHI for treatment with BAA');
          }
        }
        return pass('Not a treatment use case');
      }
    },

    // §164.512 - Uses Without Authorization - Payment
    {
      id: 'hipaa-164-512-payment',
      section: '§164.506(c)(1)',
      title: 'Payment Exception',
      description: 'PHI may be used or disclosed for payment purposes without authorization.',
      category: 'use',
      severity: 'high',
      evaluator: (ctx: EvaluationContext) => {
        if (!ctx.phiPresent) return pass('No PHI involved');
        if (ctx.forPayment) {
          return pass('Payment use permitted without authorization');
        }
        return pass('Not a payment use case');
      }
    },

    // §164.512 - Uses Without Authorization - Healthcare Operations
    {
      id: 'hipaa-164-512-hco',
      section: '§164.506(c)(2)',
      title: 'Healthcare Operations Exception',
      description: 'PHI may be used or disclosed for healthcare operations without authorization.',
      category: 'use',
      severity: 'high',
      evaluator: (ctx: EvaluationContext) => {
        if (!ctx.phiPresent) return pass('No PHI involved');
        if (ctx.forHealthcareOperations) {
          return pass('Healthcare operations use permitted without authorization');
        }
        return pass('Not a healthcare operations use case');
      }
    },

    // §164.514 - De-identification Standard - Safe Harbor
    {
      id: 'hipaa-164-514-safe-harbor',
      section: '§164.514(b)(2)',
      title: 'Safe Harbor De-identification',
      description: 'Health information is de-identified if all 18 types of identifiers are removed and no actual knowledge of re-identification exists.',
      category: 'use',
      severity: 'high',
      evaluator: (ctx: EvaluationContext) => {
        if (ctx.isDeIdentified === false) return pass('Information is identified PHI');
        if (ctx.deidentificationMethod === 'safe_harbor') {
          const removed = ctx.safeHarborRemoved || [];
          const allRemoved = SAFE_HARBOR_IDENTIFIERS.every(id => removed.includes(id));
          if (allRemoved) {
            return pass('All 18 Safe Harbor identifiers removed');
          }
          const missing = SAFE_HARBOR_IDENTIFIERS.filter(id => !removed.includes(id));
          return fail(`Safe Harbor requires removal of all identifiers. Missing: ${missing.join(', ')}`);
        }
        if (ctx.deidentificationMethod === 'expert_determination') {
          return pass('Expert determination method applies');
        }
        return pass('De-identification method not specified');
      }
    },

    // §164.514 - De-identification Standard - Expert Determination
    {
      id: 'hipaa-164-514-expert',
      section: '§164.514(b)(1)',
      title: 'Expert Determination De-identification',
      description: 'Health information is de-identified if a person with appropriate knowledge and experience determines the risk of re-identification is very small.',
      category: 'use',
      severity: 'high',
      evaluator: (ctx: EvaluationContext) => {
        if (ctx.isDeIdentified === false) return pass('Information is identified PHI');
        if (ctx.deidentificationMethod === 'expert_determination') {
          return pass('Expert determination method documented');
        }
        return pass('Expert determination not claimed');
      }
    },

    // §164.520 - Notice of Privacy Practices
    {
      id: 'hipaa-164-520-npp',
      section: '§164.520(a)',
      title: 'Notice of Privacy Practices Required',
      description: 'A covered entity must maintain and make available a notice of privacy practices that describes uses and disclosures permitted without authorization.',
      category: 'consent',
      severity: 'high',
      evaluator: (ctx: EvaluationContext) => {
        if (!ctx.phiPresent) return pass('No PHI involved');
        if (ctx.nppProvided === true) {
          return pass('Notice of Privacy Practices provided');
        }
        if (ctx.nppProvided === false) {
          return fail('NPP must be provided to patients under §164.520');
        }
        return pass('NPP status not specified');
      }
    },

    // §164.524 - Access Rights
    {
      id: 'hipaa-164-524-access',
      section: '§164.524(a)',
      title: 'Individual Right of Access',
      description: 'Individuals have a right to access, inspect, and obtain a copy of their PHI in a designated record set.',
      category: 'access',
      severity: 'critical',
      evaluator: (ctx: EvaluationContext) => {
        if (!ctx.patientAccessRequest) return pass('No access request pending');
        if (ctx.accessResponseDays === undefined) {
          return fail('Access requests must be fulfilled within 30 days (60 with extension)');
        }
        if (ctx.accessResponseDays > 60) {
          return fail(`Access request response time (${ctx.accessResponseDays} days) exceeds maximum 60 days`);
        }
        if (ctx.accessResponseDays > 30) {
          return pass('Access request fulfilled with extension');
        }
        return pass('Access request fulfilled within 30 days');
      }
    },

    // §164.526 - Amendment Rights
    {
      id: 'hipaa-164-526-amendment',
      section: '§164.526(a)',
      title: 'Individual Right to Amend',
      description: 'Individuals have a right to have covered entities amend their PHI in a designated record set.',
      category: 'access',
      severity: 'medium',
      evaluator: (ctx: EvaluationContext) => {
        if (!ctx.amendmentRequest) return pass('No amendment request pending');
        if (ctx.amendmentResponseDays === undefined) {
          return fail('Amendment requests must be responded to within 60 days');
        }
        if (ctx.amendmentResponseDays > 60) {
          return fail(`Amendment response time (${ctx.amendmentResponseDays} days) exceeds 60 days`);
        }
        return pass('Amendment request responded to timely');
      }
    },

    // §164.530 - Administrative Requirements - Training
    {
      id: 'hipaa-164-530-training',
      section: '§164.530(b)(1)',
      title: 'Workforce Training Required',
      description: 'Covered entities must train all members of their workforce on HIPAA policies and procedures.',
      category: 'security',
      severity: 'high',
      evaluator: (ctx: EvaluationContext) => {
        if (ctx.userRole === 'workforce') {
          if (ctx.workforceTrainingCompleted === true) {
            return pass('Workforce member has completed HIPAA training');
          }
          if (ctx.workforceTrainingCompleted === false) {
            return fail('Workforce members must complete HIPAA training before accessing PHI');
          }
        }
        return pass('Not applicable to non-workforce access');
      }
    },

    // §164.530 - Administrative Requirements - Sanctions
    {
      id: 'hipaa-164-530-sanctions',
      section: '§164.530(e)(1)',
      title: 'Sanction Policy Required',
      description: 'Covered entities must have and apply appropriate sanctions against workforce members who violate policies.',
      category: 'security',
      severity: 'medium',
      evaluator: (ctx: EvaluationContext) => {
        if (ctx.sanctionPolicyImplemented === false) {
          return fail('Sanction policy required for workforce compliance');
        }
        return pass('Sanction policy status verified');
      }
    },

    // §164.530 - Administrative Requirements - Privacy Officer
    {
      id: 'hipaa-164-530-privacy-officer',
      section: '§164.530(a)(1)',
      title: 'Privacy Officer Designation',
      description: 'A covered entity must designate a privacy officer responsible for HIPAA compliance.',
      category: 'security',
      severity: 'high',
      evaluator: (ctx: EvaluationContext) => {
        if (ctx.privacyOfficerDesignated === false) {
          return fail('Privacy officer must be designated per §164.530(a)(1)');
        }
        return pass('Privacy officer designation verified');
      }
    },

    // §164.308 - Administrative Safeguards
    {
      id: 'hipaa-164-308-admin-safeguards',
      section: '§164.308(a)(1)',
      title: 'Administrative Safeguards Required',
      description: 'Covered entities must implement administrative safeguards to protect PHI.',
      category: 'security',
      severity: 'critical',
      evaluator: (ctx: EvaluationContext) => {
        if (!ctx.phiPresent) return pass('No PHI involved');
        if (ctx.adminSafeguards === true) {
          return pass('Administrative safeguards implemented');
        }
        if (ctx.adminSafeguards === false) {
          return fail('Administrative safeguards required under Security Rule');
        }
        return pass('Administrative safeguards status not specified');
      }
    },

    // §164.310 - Physical Safeguards
    {
      id: 'hipaa-164-310-physical-safeguards',
      section: '§164.310(a)(1)',
      title: 'Physical Safeguards Required',
      description: 'Covered entities must implement physical safeguards to protect PHI.',
      category: 'security',
      severity: 'critical',
      evaluator: (ctx: EvaluationContext) => {
        if (!ctx.phiPresent) return pass('No PHI involved');
        if (ctx.physicalSafeguards === true) {
          return pass('Physical safeguards implemented');
        }
        if (ctx.physicalSafeguards === false) {
          return fail('Physical safeguards required under Security Rule');
        }
        return pass('Physical safeguards status not specified');
      }
    },

    // §164.312 - Technical Safeguards
    {
      id: 'hipaa-164-312-technical-safeguards',
      section: '§164.312(a)(1)',
      title: 'Technical Safeguards Required',
      description: 'Covered entities must implement technical safeguards to protect PHI.',
      category: 'security',
      severity: 'critical',
      evaluator: (ctx: EvaluationContext) => {
        if (!ctx.phiPresent) return pass('No PHI involved');
        if (ctx.technicalSafeguards === true) {
          return pass('Technical safeguards implemented');
        }
        if (ctx.technicalSafeguards === false) {
          return fail('Technical safeguards required under Security Rule');
        }
        return pass('Technical safeguards status not specified');
      }
    },

    // §164.312 - Access Control
    {
      id: 'hipaa-164-312-access-control',
      section: '§164.312(a)(2)(i)',
      title: 'Access Control Implementation',
      description: 'Technical policies and procedures must restrict access to PHI to authorized persons/software.',
      category: 'security',
      severity: 'critical',
      evaluator: (ctx: EvaluationContext) => {
        if (!ctx.phiPresent) return pass('No PHI involved');
        if (ctx.accessControlsImplemented === false) {
          return fail('Access controls required for electronic PHI');
        }
        if (ctx.uniqueUserIdentification === false) {
          return fail('Unique user identification required per §164.312(a)(2)(i)');
        }
        return pass('Access controls implemented');
      }
    },

    // §164.312 - Encryption
    {
      id: 'hipaa-164-312-encryption',
      section: '§164.312(a)(2)(iv), §164.312(e)(2)(ii)',
      title: 'Encryption and Decryption',
      description: 'Mechanisms to encrypt and decrypt electronic PHI must be implemented.',
      category: 'security',
      severity: 'high',
      evaluator: (ctx: EvaluationContext) => {
        if (!ctx.phiPresent) return pass('No PHI involved');
        if (ctx.encryptionAtRest && ctx.encryptionInTransit) {
          return pass('Encryption at rest and in transit implemented');
        }
        if (!ctx.encryptionAtRest && !ctx.encryptionInTransit) {
          return fail('Encryption is addressable but strongly recommended - risk analysis required if not implemented');
        }
        if (!ctx.encryptionInTransit) {
          return fail('Encryption in transit strongly recommended for PHI transmission');
        }
        return pass('Partial encryption controls in place');
      }
    },

    // §164.312 - Audit Controls
    {
      id: 'hipaa-164-312-audit',
      section: '§164.312(b)',
      title: 'Audit Controls Required',
      description: 'Hardware, software, and procedural mechanisms must record and examine access to electronic PHI.',
      category: 'security',
      severity: 'high',
      evaluator: (ctx: EvaluationContext) => {
        if (!ctx.phiPresent) return pass('No PHI involved');
        if (ctx.auditLoggingEnabled === false) {
          return fail('Audit controls required for electronic PHI');
        }
        return pass('Audit controls status verified');
      }
    },

    // §164.402-414 - Breach Notification Rule
    {
      id: 'hipaa-164-402-breach-notification',
      section: '§164.404-414',
      title: 'Breach Notification Requirements',
      description: 'Covered entities must notify affected individuals, HHS, and media (in some cases) of breaches of unsecured PHI.',
      category: 'breach',
      severity: 'critical',
      evaluator: (ctx: EvaluationContext) => {
        if (!ctx.breachDetected) return pass('No breach detected');
        
        // Determine if breach is reportable
        const isReportable = ctx.breachScope === 'reportable' || 
                             ctx.breachScope === 'major' ||
                             (ctx.breachAffectedCount && ctx.breachAffectedCount >= 500);
        
        if (!isReportable && ctx.breachScope === 'minor') {
          return pass('Minor breach - document risk assessment');
        }
        
        if (!ctx.breachNotificationSent) {
          return fail('Breach notification required: notify affected individuals within 60 days, HHS without unreasonable delay');
        }
        
        if (ctx.breachNotificationTimely === false) {
          return fail('Breach notifications must be timely (individuals within 60 days, HHS within 60 days for 500+ affected)');
        }
        
        return pass('Breach notification requirements satisfied');
      }
    },

    // HITECH Act - Business Associate Agreement
    {
      id: 'hipaa-hitech-baa',
      section: '§164.504(e), HITECH §13401',
      title: 'Business Associate Agreement Required',
      description: 'Business associates must have written contracts requiring them to comply with HIPAA Security Rule.',
      category: 'use',
      severity: 'critical',
      evaluator: (ctx: EvaluationContext) => {
        if (!ctx.phiPresent) return pass('No PHI involved');
        if (ctx.userRole === 'business_associate') {
          if (ctx.baaInPlace === true) {
            return pass('Business Associate Agreement in place');
          }
          if (ctx.baaInPlace === false) {
            return fail('Business Associate Agreement required before PHI disclosure to BA');
          }
        }
        return pass('Not a business associate relationship');
      }
    },

    // HITECH Act - Security Officer
    {
      id: 'hipaa-hitech-security-officer',
      section: '§164.308(a)(2), HITECH',
      title: 'Security Officer Designation',
      description: 'A security officer must be designated to develop and implement security policies.',
      category: 'security',
      severity: 'high',
      evaluator: (ctx: EvaluationContext) => {
        if (ctx.securityOfficerDesignated === false) {
          return fail('Security officer must be designated per §164.308(a)(2)');
        }
        return pass('Security officer designation verified');
      }
    }
  ]
};

export default usFedHipaa;
