/**
 * LUMEN SDK Tests
 * 
 * @copyright Forge Partners Inc. 2026
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Lumen, SDK_VERSION } from './index';
import type { EvaluateResult, DecisionRecord, Evaluation } from './index';

describe('Lumen SDK', () => {
  let lumen: Lumen;

  beforeEach(() => {
    lumen = new Lumen({
      domain: 'healthcare',
      region: 'canada',
      enforcementMode: 'ADVISORY'
    });
  });

  describe('initialization', () => {
    it('should initialize with required config', () => {
      expect(lumen).toBeDefined();
    });

    it('should have correct SDK version', () => {
      expect(SDK_VERSION).toBe('1.0.0');
    });

    it('should default to ADVISORY enforcement mode', () => {
      const defaultLumen = new Lumen({
        domain: 'healthcare',
        region: 'canada'
      });
      expect(defaultLumen).toBeDefined();
    });
  });

  describe('evaluate()', () => {
    it('should return a valid EvaluateResult', async () => {
      const result = await lumen.evaluate({
        aiOutput: 'Test AI output',
        context: { test: true },
        humanAction: 'accepted'
      });

      expect(result).toHaveProperty('recordId');
      expect(result).toHaveProperty('lumenScore');
      expect(result).toHaveProperty('tier');
      expect(result).toHaveProperty('verdict');
      expect(result).toHaveProperty('citationIntegrity');
      expect(result).toHaveProperty('decisionRecord');
      expect(result).toHaveProperty('evaluation');
      expect(result).toHaveProperty('assuranceCertificate');
    });

    it('should generate a LUMEN Score between 0 and 100', async () => {
      const result = await lumen.evaluate({
        aiOutput: 'Recommend treatment based on symptoms',
        context: { patientAge: 45 },
        humanAction: 'accepted'
      });

      expect(result.lumenScore).toBeGreaterThanOrEqual(0);
      expect(result.lumenScore).toBeLessThanOrEqual(100);
    });

    it('should return a valid tier (1, 2, or 3)', async () => {
      const result = await lumen.evaluate({
        aiOutput: 'Test output',
        humanAction: 'accepted'
      });

      expect([1, 2, 3]).toContain(result.tier);
    });

    it('should return a valid verdict', async () => {
      const result = await lumen.evaluate({
        aiOutput: 'Test output',
        humanAction: 'accepted'
      });

      expect(['ALLOW', 'WARN', 'BLOCK']).toContain(result.verdict);
    });

    it('should include citation integrity score', async () => {
      const result = await lumen.evaluate({
        aiOutput: 'Test output',
        humanAction: 'accepted'
      });

      expect(result.citationIntegrity).toBeGreaterThanOrEqual(0);
      expect(result.citationIntegrity).toBeLessThanOrEqual(1);
    });

    it('should generate a decision record with valid ID', async () => {
      const result = await lumen.evaluate({
        aiOutput: 'Test output',
        humanAction: 'accepted'
      });

      expect(result.recordId).toMatch(/^LUMEN-[A-Z0-9]+-[A-Z0-9]+$/);
      expect(result.decisionRecord.decisionId).toBe(result.recordId);
    });

    it('should handle all human actions', async () => {
      const actions = ['accepted', 'rejected', 'modified', 'deferred'] as const;
      
      for (const action of actions) {
        const result = await lumen.evaluate({
          aiOutput: 'Test output',
          humanAction: action
        });
        expect(result).toBeDefined();
      }
    });
  });

  describe('audit trail', () => {
    it('should record audit events', async () => {
      await lumen.evaluate({
        aiOutput: 'Test output',
        humanAction: 'accepted'
      });

      const trail = lumen.getAuditTrail();
      expect(trail.length).toBeGreaterThan(0);
    });

    it('should include SESSION_STARTED event', () => {
      const trail = lumen.getAuditTrail();
      const sessionEvent = trail.find(e => e.eventType === 'SESSION_STARTED');
      expect(sessionEvent).toBeDefined();
    });

    it('should include DECISION_CREATED event after evaluate', async () => {
      await lumen.evaluate({
        aiOutput: 'Test output',
        humanAction: 'accepted'
      });

      const trail = lumen.getAuditTrail();
      const decisionEvent = trail.find(e => e.eventType === 'DECISION_CREATED');
      expect(decisionEvent).toBeDefined();
    });

    it('should verify audit chain integrity', async () => {
      await lumen.evaluate({ aiOutput: 'Test 1', humanAction: 'accepted' });
      await lumen.evaluate({ aiOutput: 'Test 2', humanAction: 'accepted' });
      
      const integrity = lumen.verifyAuditIntegrity();
      expect(integrity.valid).toBe(true);
    });

    it('should export audit trail as JSON', async () => {
      await lumen.evaluate({ aiOutput: 'Test', humanAction: 'accepted' });
      
      const exported = lumen.exportAuditTrail();
      const parsed = JSON.parse(exported);
      
      expect(parsed).toHaveProperty('tenantId');
      expect(parsed).toHaveProperty('sessionId');
      expect(parsed).toHaveProperty('events');
      expect(Array.isArray(parsed.events)).toBe(true);
    });
  });

  describe('assurance certificate', () => {
    it('should generate valid assurance certificate', async () => {
      const result = await lumen.evaluate({
        aiOutput: 'Clinical recommendation',
        humanAction: 'accepted'
      });

      const cert = result.assuranceCertificate;
      
      expect(cert.fingerprint).toMatch(/^LUMEN-/);
      expect(cert.version).toBe('v1');
      expect(cert.lumenScore).toBe(result.lumenScore);
      expect(cert.frameworksEvaluated).toContain('PHIPA');
      expect(cert.signed).toBe(true);
    });

    it('should include policy pack information', async () => {
      const result = await lumen.evaluate({
        aiOutput: 'Test',
        humanAction: 'accepted'
      });

      expect(result.assuranceCertificate.policyPack).toBe('Ontario Healthcare Privacy Pack');
    });
  });

  describe('policy packs', () => {
    it('should use PHIPA pack for Canadian healthcare', async () => {
      const canadaLumen = new Lumen({
        domain: 'healthcare',
        region: 'canada'
      });

      const result = await canadaLumen.evaluate({
        aiOutput: 'Test',
        humanAction: 'accepted'
      });

      expect(result.decisionRecord.policyContext.packId).toBe('ca-on-healthcare-phipa');
    });

    it('should use HIPAA pack for US healthcare', async () => {
      const usLumen = new Lumen({
        domain: 'healthcare',
        region: 'us'
      });

      const result = await usLumen.evaluate({
        aiOutput: 'Test',
        humanAction: 'accepted'
      });

      expect(result.decisionRecord.policyContext.packId).toBe('us-healthcare-hipaa');
    });
  });
});

describe('DecisionRecord', () => {
  it('should have required fields', async () => {
    const lumen = new Lumen({ domain: 'healthcare', region: 'canada' });
    const result = await lumen.evaluate({
      aiOutput: 'Test',
      humanAction: 'accepted'
    });

    const record = result.decisionRecord;

    expect(record).toHaveProperty('decisionId');
    expect(record).toHaveProperty('tenantId');
    expect(record).toHaveProperty('subjectId');
    expect(record).toHaveProperty('workflowId');
    expect(record).toHaveProperty('requestContext');
    expect(record).toHaveProperty('inputs');
    expect(record).toHaveProperty('aiOutputs');
    expect(record).toHaveProperty('humanAction');
    expect(record).toHaveProperty('policyContext');
    expect(record).toHaveProperty('hashes');
    expect(record).toHaveProperty('createdAt');
    expect(record).toHaveProperty('sdkVersion');
  });

  it('should have valid hashes', async () => {
    const lumen = new Lumen({ domain: 'healthcare', region: 'canada' });
    const result = await lumen.evaluate({
      aiOutput: 'Test',
      humanAction: 'accepted'
    });

    const hashes = result.decisionRecord.hashes;

    expect(hashes.inputsCanonicalHash).toMatch(/^sha256:/);
    expect(hashes.outputsCanonicalHash).toMatch(/^sha256:/);
    expect(hashes.recordHash).toMatch(/^sha256:/);
    expect(hashes.hashAlgorithm).toBe('SHA-256');
  });
});

describe('Evaluation', () => {
  it('should have complete score breakdown', async () => {
    const lumen = new Lumen({ domain: 'healthcare', region: 'canada' });
    const result = await lumen.evaluate({
      aiOutput: 'Test',
      humanAction: 'accepted'
    });

    const breakdown = result.evaluation.scoreBreakdown;

    expect(breakdown).toHaveProperty('finalScore');
    expect(breakdown).toHaveProperty('baseScore');
    expect(breakdown).toHaveProperty('riskModifier');
    expect(breakdown).toHaveProperty('factors');
    expect(breakdown).toHaveProperty('riskRadar');
    expect(Array.isArray(breakdown.factors)).toBe(true);
  });

  it('should have risk radar with all dimensions', async () => {
    const lumen = new Lumen({ domain: 'healthcare', region: 'canada' });
    const result = await lumen.evaluate({
      aiOutput: 'Test',
      humanAction: 'accepted'
    });

    const radar = result.evaluation.scoreBreakdown.riskRadar;

    expect(radar).toHaveProperty('legal');
    expect(radar).toHaveProperty('labour');
    expect(radar).toHaveProperty('safety');
    expect(radar).toHaveProperty('ethics');
    expect(radar).toHaveProperty('cyber');
    expect(radar).toHaveProperty('finance');
    expect(radar).toHaveProperty('reputation');
  });

  it('should include evaluation metrics', async () => {
    const lumen = new Lumen({ domain: 'healthcare', region: 'canada' });
    const result = await lumen.evaluate({
      aiOutput: 'Test',
      humanAction: 'accepted'
    });

    const metrics = result.evaluation.metrics;

    expect(metrics).toHaveProperty('totalLatencyMs');
    expect(metrics).toHaveProperty('checksExecuted');
    expect(metrics).toHaveProperty('checksPassed');
    expect(metrics).toHaveProperty('checksFailed');
    expect(metrics.totalLatencyMs).toBeGreaterThanOrEqual(0);
  });
});
