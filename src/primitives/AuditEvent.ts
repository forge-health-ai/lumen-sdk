/**
 * LUMEN SDK - AuditEvent Primitive
 * 
 * Append-only event stream that is the heart of defensibility.
 * Every state change emits an AuditEvent. The chain is tamper-evident
 * through hash linking.
 * 
 * @module @forge/lumen-sdk
 * @copyright 2026 Forge Partners Inc.
 * @license Apache-2.0
 */

export type AuditEventType =
  | 'DECISION_CREATED'
  | 'DECISION_UPDATED'
  | 'EVIDENCE_RETRIEVED'
  | 'AI_OUTPUT_GENERATED'
  | 'EVALUATION_STARTED'
  | 'EVALUATION_COMPLETED'
  | 'SIGNAL_EMITTED'
  | 'ALERT_CREATED'
  | 'ALERT_ACKNOWLEDGED'
  | 'ALERT_RESOLVED'
  | 'ALERT_DISMISSED'
  | 'POLICY_PACK_LOADED'
  | 'POLICY_PACK_UPDATED'
  | 'DRIFT_DETECTED'
  | 'BREAK_GLASS_REQUESTED'
  | 'BREAK_GLASS_APPROVED'
  | 'BREAK_GLASS_DENIED'
  | 'RECORD_SIGNED'
  | 'RECORD_EXPORTED'
  | 'SESSION_STARTED'
  | 'SESSION_ENDED';

export interface AuditActor {
  /** Actor type */
  type: 'USER' | 'SYSTEM' | 'SERVICE';
  /** Actor identifier */
  id: string;
  /** Actor role (if user) */
  role?: string;
  /** Service name (if service) */
  serviceName?: string;
}

/**
 * AuditEvent - Immutable event record
 * 
 * Design: Each event contains a hash of the previous event,
 * creating a tamper-evident chain. Any modification to a past
 * event breaks the chain.
 */
export interface AuditEvent {
  /** Unique event identifier */
  eventId: string;
  
  /** Event type */
  eventType: AuditEventType;
  
  /** Related decision ID (if applicable) */
  decisionId?: string;
  
  /** Related evaluation ID (if applicable) */
  evaluationId?: string;
  
  /** ISO timestamp */
  timestamp: string;
  
  /** Actor who triggered this event */
  actor: AuditActor;
  
  /** Event payload (JSON-serializable) */
  payload: Record<string, unknown>;
  
  /** Hash of this event's payload */
  payloadHash: string;
  
  /** Hash of the previous event (chain linking) */
  previousHash: string;
  
  /** Sequence number in the chain */
  sequence: number;
  
  /** Tenant ID */
  tenantId: string;
  
  /** Session ID for correlation */
  sessionId: string;
}

/**
 * AuditChain - In-memory audit event chain
 */
export class AuditChain {
  private events: AuditEvent[] = [];
  private currentSequence = 0;
  private tenantId: string;
  private sessionId: string;
  
  constructor(tenantId: string, sessionId: string) {
    this.tenantId = tenantId;
    this.sessionId = sessionId;
  }
  
  /**
   * Append an event to the chain
   */
  append(
    eventType: AuditEventType,
    actor: AuditActor,
    payload: Record<string, unknown>,
    decisionId?: string,
    evaluationId?: string
  ): AuditEvent {
    const timestamp = new Date().toISOString();
    const sequence = this.currentSequence++;
    const previousHash = this.events.length > 0 
      ? this.events[this.events.length - 1].payloadHash 
      : 'GENESIS';
    
    const payloadHash = this.hashPayload(payload, timestamp, sequence);
    
    const event: AuditEvent = {
      eventId: this.generateEventId(),
      eventType,
      decisionId,
      evaluationId,
      timestamp,
      actor,
      payload,
      payloadHash,
      previousHash,
      sequence,
      tenantId: this.tenantId,
      sessionId: this.sessionId
    };
    
    this.events.push(event);
    return event;
  }
  
  /**
   * Get all events in the chain
   */
  getEvents(): AuditEvent[] {
    return [...this.events];
  }
  
  /**
   * Get events for a specific decision
   */
  getEventsForDecision(decisionId: string): AuditEvent[] {
    return this.events.filter(e => e.decisionId === decisionId);
  }
  
  /**
   * Verify chain integrity
   */
  verifyIntegrity(): { valid: boolean; brokenAt?: number } {
    for (let i = 1; i < this.events.length; i++) {
      const current = this.events[i];
      const previous = this.events[i - 1];
      
      if (current.previousHash !== previous.payloadHash) {
        return { valid: false, brokenAt: i };
      }
    }
    return { valid: true };
  }
  
  /**
   * Export chain as JSON
   */
  export(): string {
    return JSON.stringify({
      tenantId: this.tenantId,
      sessionId: this.sessionId,
      exportedAt: new Date().toISOString(),
      eventCount: this.events.length,
      events: this.events
    }, null, 2);
  }
  
  private hashPayload(payload: Record<string, unknown>, timestamp: string, sequence: number): string {
    const str = JSON.stringify({ payload, timestamp, sequence });
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return 'audit:' + Math.abs(hash).toString(16).padStart(16, '0');
  }
  
  private generateEventId(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `EVT-${timestamp}-${random}`;
  }
}

/**
 * Convenience function to create a system actor
 */
export function systemActor(serviceName: string): AuditActor {
  return {
    type: 'SYSTEM',
    id: 'LUMEN-SDK',
    serviceName
  };
}

/**
 * Convenience function to create a user actor
 */
export function userActor(userId: string, role?: string): AuditActor {
  return {
    type: 'USER',
    id: userId,
    role
  };
}

export default AuditEvent;
