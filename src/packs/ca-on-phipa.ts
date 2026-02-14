/**
 * LUMEN SDK - Ontario PHIPA Policy Pack
 * 
 * Ontario Personal Health Information Protection Act
 * R.S.O. 2004, c. 3, Sched. A
 * 
 * This policy pack implements real PHIPA provisions for healthcare AI governance.
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
  /** Whether explicit consent was obtained */
  hasExplicitConsent?: boolean;
  /** Consent type: express, implied, or deemed */
  consentType?: 'express' | 'implied' | 'deemed' | 'none';
  /** Data residency location */
  dataResidency?: string;
  /** Whether data is in Canada */
  isCanadianResidency?: boolean;
  /** User role accessing the data */
  userRole?: 'healthcare_provider' | 'agent' | 'custodian' | 'patient' | 'third_party';
  /** Purpose of collection/use/disclosure */
  purpose?: string;
  /** Whether the purpose is healthcare provision */
  isHealthcareProvision?: boolean;
  /** Security safeguards implemented */
  safeguards?: string[];
  /** Whether audit logging is enabled */
  auditLoggingEnabled?: boolean;
  /** Encryption status */
  encryptionAtRest?: boolean;
  encryptionInTransit?: boolean;
  /** Access controls implemented */
  accessControlsImplemented?: boolean;
  /** Whether this is for treatment, payment, or healthcare operations */
  isTPO?: boolean;
  /** Patient requested access */
  patientAccessRequest?: boolean;
  /** Correction request */
  correctionRequest?: boolean;
  /** Breach detected */
  breachDetected?: boolean;
  /** Breach scope */
  breachScope?: 'minor' | 'significant' | 'major';
  /** Whether breach notification sent */
  breachNotificationSent?: boolean;
  /** Retention period in days */
  retentionDays?: number;
  /** Whether data is de-identified */
  isDeIdentified?: boolean;
  /** Electronic health record system */
  isEHRSystem?: boolean;
  /** Custodian identifier */
  custodianId?: string;
  /** Collection directly from individual */
  collectedFromIndividual?: boolean;
  /** Substitute decision maker involved */
  substituteDecisionMaker?: boolean;
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

/**
 * Ontario PHIPA Policy Pack
 * Implements key provisions of the Personal Health Information Protection Act
 */
export const caOnPhipa: PolicyPack = {
  id: 'ca-on-phipa',
  name: 'Ontario Personal Health Information Protection Act',
  version: '2.0.0',
  jurisdiction: {
    country: 'CA',
    region: 'ON'
  },
  framework: 'PHIPA R.S.O. 2004, c. 3, Sched. A',
  lastUpdated: '2026-02-13',
  rules: [
    // Section 4 - Definition of Personal Health Information
    {
      id: 'phipa-s4-def-phi',
      section: 's.4(1)',
      title: 'Personal Health Information Definition',
      description: 'Identifying information about an individual in oral or recorded form that relates to physical/mental health, provision of healthcare, or payments for healthcare.',
      category: 'collection',
      severity: 'critical',
      evaluator: (ctx: EvaluationContext) => {
        if (ctx.phiPresent === undefined) {
          return fail('PHI presence must be explicitly declared');
        }
        if (ctx.phiPresent && (!ctx.phiTypes || ctx.phiTypes.length === 0)) {
          return fail('PHI types must be specified when PHI is present');
        }
        return pass('PHI declaration is complete');
      }
    },

    // Section 12(1) - Collection Limitation (direct from individual)
    {
      id: 'phipa-s12-1-collection-direct',
      section: 's.12(1)',
      title: 'Collection Directly from Individual',
      description: 'A health information custodian shall collect personal health information directly from the individual unless authorized or required by law to collect it from another source.',
      category: 'collection',
      severity: 'high',
      evaluator: (ctx: EvaluationContext) => {
        if (!ctx.phiPresent) return pass('No PHI involved');
        if (ctx.collectedFromIndividual === true) {
          return pass('PHI collected directly from individual as required');
        }
        // Allow if there's explicit authorization or it's from another custodian
        if (ctx.userRole === 'custodian') {
          return pass('Collection from another custodian is permitted under s.12(1)(b)');
        }
        return fail('PHIPA requires collection directly from individual unless authorized by law');
      }
    },

    // Section 12(2) - Collection Limitation (lawful collection)
    {
      id: 'phipa-s12-2-lawful-collection',
      section: 's.12(2)',
      title: 'Lawful Collection Required',
      description: 'Collection of PHI must be limited to what is reasonably necessary for the purpose.',
      category: 'collection',
      severity: 'high',
      evaluator: (ctx: EvaluationContext) => {
        if (!ctx.phiPresent) return pass('No PHI involved');
        if (!ctx.purpose) {
          return fail('Purpose must be specified for PHI collection');
        }
        return pass('Collection purpose is documented');
      }
    },

    // Section 15 - Consent Requirements
    {
      id: 'phipa-s15-consent-required',
      section: 's.15(1)',
      title: 'Consent Required for Collection, Use, Disclosure',
      description: 'No custodian shall collect, use or disclose personal health information about an individual without the individual\'s consent, except as permitted or required by law.',
      category: 'consent',
      severity: 'critical',
      evaluator: (ctx: EvaluationContext) => {
        if (!ctx.phiPresent) return pass('No PHI involved');
        if (ctx.hasExplicitConsent === true) {
          return pass('Explicit consent obtained');
        }
        if (ctx.consentType === 'deemed' && ctx.isHealthcareProvision) {
          return pass('Deemed consent applies for healthcare provision under s.20');
        }
        if (ctx.isTPO) {
          return pass('Consent not required for treatment, payment, or healthcare operations under s.37');
        }
        if (ctx.patientAccessRequest) {
          return pass('Consent not required for patient access request under s.23');
        }
        return fail('PHIPA requires consent for collection, use, or disclosure of PHI');
      }
    },

    // Section 17 - Use Limitation
    {
      id: 'phipa-s17-use-limitation',
      section: 's.17',
      title: 'Use Limited to Purpose',
      description: 'Personal health information shall not be used for purposes other than those for which it was collected or created, except with consent or as required by law.',
      category: 'use',
      severity: 'critical',
      evaluator: (ctx: EvaluationContext) => {
        if (!ctx.phiPresent) return pass('No PHI involved');
        if (!ctx.purpose) {
          return fail('Purpose must be specified for PHI use');
        }
        if (ctx.isHealthcareProvision || ctx.isTPO) {
          return pass('Use is for permitted healthcare purposes');
        }
        if (ctx.hasExplicitConsent) {
          return pass('Use permitted with explicit consent');
        }
        return fail('PHI use must be limited to the original purpose or permitted use');
      }
    },

    // Section 18 - Disclosure Rules
    {
      id: 'phipa-s18-disclosure-rules',
      section: 's.18',
      title: 'Disclosure Limitation',
      description: 'Personal health information shall not be disclosed without consent except as permitted or required by PHIPA.',
      category: 'disclosure',
      severity: 'critical',
      evaluator: (ctx: EvaluationContext) => {
        if (!ctx.phiPresent) return pass('No PHI involved');
        if (ctx.hasExplicitConsent) {
          return pass('Disclosure permitted with consent');
        }
        if (ctx.isHealthcareProvision && ctx.userRole === 'healthcare_provider') {
          return pass('Disclosure permitted for healthcare provision to another provider');
        }
        if (ctx.isTPO) {
          return pass('Disclosure permitted for treatment, payment, or operations');
        }
        return fail('Disclosure requires consent or statutory authority');
      }
    },

    // Section 20 - Deemed Consent for Healthcare Provision
    {
      id: 'phipa-s20-deemed-consent',
      section: 's.20(1)',
      title: 'Deemed Consent for Healthcare',
      description: 'Consent is deemed for collection, use, or disclosure of PHI for the purpose of providing healthcare, if the individual is provided with prescribed notice.',
      category: 'consent',
      severity: 'high',
      evaluator: (ctx: EvaluationContext) => {
        if (!ctx.phiPresent) return pass('No PHI involved');
        if (!ctx.isHealthcareProvision) {
          return pass('Deemed consent rules do not apply');
        }
        if (ctx.consentType === 'deemed' || ctx.consentType === 'express') {
          return pass('Consent (deemed or express) is in place for healthcare provision');
        }
        return fail('Healthcare provision requires deemed consent with proper notice to individual');
      }
    },

    // Section 23 - Access Rights
    {
      id: 'phipa-s23-access-rights',
      section: 's.23',
      title: 'Individual Right of Access',
      description: 'Individuals have a right to access their personal health information subject to limited exceptions.',
      category: 'access',
      severity: 'high',
      evaluator: (ctx: EvaluationContext) => {
        if (ctx.patientAccessRequest) {
          // Access requests should generally be granted
          if (ctx.hasExplicitConsent === false) {
            return fail('Access request requires verification of identity');
          }
          return pass('Access request properly authenticated');
        }
        return pass('No access request pending');
      }
    },

    // Section 25 - Correction Rights
    {
      id: 'phipa-s25-correction-rights',
      section: 's.25',
      title: 'Individual Right to Correct',
      description: 'Individuals have a right to request correction of their personal health information.',
      category: 'access',
      severity: 'medium',
      evaluator: (ctx: EvaluationContext) => {
        if (ctx.correctionRequest) {
          if (!ctx.custodianId) {
            return fail('Correction requests must be processed by the custodian');
          }
          return pass('Correction request properly routed to custodian');
        }
        return pass('No correction request pending');
      }
    },

    // Section 10 - Security Safeguards
    {
      id: 'phipa-s10-security-safeguards',
      section: 's.10(1)',
      title: 'Security Safeguards Required',
      description: 'Custodians shall take steps that are reasonable in the circumstances to ensure PHI is protected against theft, loss, and unauthorized use/disclosure.',
      category: 'security',
      severity: 'critical',
      evaluator: (ctx: EvaluationContext) => {
        if (!ctx.phiPresent) return pass('No PHI involved');
        const safeguards = ctx.safeguards || [];
        const hasPhysical = safeguards.some(s => s.toLowerCase().includes('physical'));
        const hasAdministrative = safeguards.some(s => s.toLowerCase().includes('administrative') || s.toLowerCase().includes('admin'));
        const hasTechnical = safeguards.some(s => s.toLowerCase().includes('technical') || s.toLowerCase().includes('encrypt'));
        
        if (!hasAdministrative) {
          return fail('Administrative safeguards required under s.10');
        }
        if (!hasPhysical) {
          return fail('Physical safeguards required under s.10');
        }
        if (!hasTechnical) {
          return fail('Technical safeguards required under s.10');
        }
        return pass('Security safeguards (administrative, physical, technical) are in place');
      }
    },

    // Section 10(3) - Data Residency/Storage
    {
      id: 'phipa-s10-3-storage',
      section: 's.10(3)',
      title: 'Secure Storage Requirement',
      description: 'Personal health information shall be stored in a manner that protects it from unauthorized access.',
      category: 'security',
      severity: 'high',
      evaluator: (ctx: EvaluationContext) => {
        if (!ctx.phiPresent) return pass('No PHI involved');
        if (ctx.isCanadianResidency === false) {
          return fail('PHI should be stored in Canada or with equivalent protections');
        }
        if (ctx.encryptionAtRest && ctx.accessControlsImplemented) {
          return pass('Secure storage with encryption and access controls');
        }
        return fail('Secure storage requires encryption at rest and access controls');
      }
    },

    // O. Reg. 329/04 - Prescribed Entities (Electronic Health Records)
    {
      id: 'phipa-reg329-ehr',
      section: 'O. Reg. 329/04, s.6.2',
      title: 'Electronic Health Record Requirements',
      description: 'Requirements for custodians participating in electronic health record systems.',
      category: 'use',
      severity: 'high',
      evaluator: (ctx: EvaluationContext) => {
        if (!ctx.isEHRSystem) return pass('Not an EHR system context');
        if (!ctx.auditLoggingEnabled) {
          return fail('EHR systems require comprehensive audit logging');
        }
        if (!ctx.accessControlsImplemented) {
          return fail('EHR systems require role-based access controls');
        }
        return pass('EHR system requirements met');
      }
    },

    // Breach Notification (IPC Guidelines)
    {
      id: 'phipa-breach-notification',
      section: 's.12(2), IPC Breach Guidelines',
      title: 'Breach Notification Requirements',
      description: 'Custodians must notify the Information and Privacy Commissioner and affected individuals of certain breaches.',
      category: 'breach',
      severity: 'critical',
      evaluator: (ctx: EvaluationContext) => {
        if (!ctx.breachDetected) return pass('No breach detected');
        if (ctx.breachScope === 'minor') {
          return pass('Minor breach - document and mitigate');
        }
        if (!ctx.breachNotificationSent) {
          return fail(`${ctx.breachScope || 'Significant'} breach requires notification to IPC and affected individuals`);
        }
        return pass('Breach notification requirements satisfied');
      }
    },

    // Retention Requirements
    {
      id: 'phipa-retention',
      section: 's.15(4), O. Reg. 329/04',
      title: 'Record Retention',
      description: 'Personal health information shall be retained for the period required by regulation or professional standards.',
      category: 'retention',
      severity: 'medium',
      evaluator: (ctx: EvaluationContext) => {
        if (!ctx.phiPresent) return pass('No PHI involved');
        if (ctx.retentionDays === undefined) {
          return fail('Retention period must be defined for PHI');
        }
        if (ctx.retentionDays < 10 * 365) {
          return fail('PHI retention period likely insufficient (minimum typically 10 years)');
        }
        return pass(`Retention period of ${ctx.retentionDays} days meets requirements`);
      }
    },

    // Agent/Employee Access
    {
      id: 'phipa-agent-access',
      section: 's.13, s.16',
      title: 'Agent Access Control',
      description: 'Agents shall only collect, use, or disclose PHI as authorized by the custodian and in accordance with PHIPA.',
      category: 'use',
      severity: 'high',
      evaluator: (ctx: EvaluationContext) => {
        if (!ctx.phiPresent) return pass('No PHI involved');
        if (ctx.userRole === 'agent') {
          if (!ctx.custodianId) {
            return fail('Agent access requires custodian authorization');
          }
          return pass('Agent access is authorized by custodian');
        }
        return pass('Not an agent access scenario');
      }
    },

    // Substitute Decision Maker
    {
      id: 'phipa-substitute-decision',
      section: 's.19',
      title: 'Substitute Decision Maker',
      description: 'Consent may be given by a substitute decision maker if the individual is incapable.',
      category: 'consent',
      severity: 'high',
      evaluator: (ctx: EvaluationContext) => {
        if (!ctx.substituteDecisionMaker) return pass('No substitute decision maker involved');
        if (!ctx.hasExplicitConsent) {
          return fail('Substitute decision maker authority must be verified');
        }
        return pass('Substitute decision maker authority confirmed');
      }
    },

    // De-identification Standards
    {
      id: 'phipa-deidentification',
      section: 's.4(1) "identifying information"',
      title: 'De-identification Standards',
      description: 'De-identified information that cannot reasonably identify an individual may be exempt from certain requirements.',
      category: 'use',
      severity: 'medium',
      evaluator: (ctx: EvaluationContext) => {
        if (ctx.isDeIdentified === true) {
          return pass('Information is de-identified');
        }
        if (ctx.isDeIdentified === false && ctx.phiPresent) {
          return pass('Information is identified PHI - full protections apply');
        }
        return pass('De-identification status not specified');
      }
    }
  ]
};

export default caOnPhipa;
