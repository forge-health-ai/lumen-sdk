/**
 * LUMEN SDK™ — Custom Error Classes
 * 
 * © 2026 Forge Partners Inc. All rights reserved.
 * CONFIDENTIAL AND PROPRIETARY.
 */

export class LumenError extends Error {
  public readonly code: string;
  public readonly statusCode?: number;
  public readonly details?: Record<string, unknown>;

  constructor(message: string, code: string, statusCode?: number, details?: Record<string, unknown>) {
    super(message);
    this.name = 'LumenError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export class LumenAuthError extends LumenError {
  constructor(message: string = 'Authentication failed. Check your API key.', details?: Record<string, unknown>) {
    super(message, 'AUTH_ERROR', 401, details);
    this.name = 'LumenAuthError';
  }
}

export class LumenRateLimitError extends LumenError {
  public readonly retryAfterMs: number;

  constructor(retryAfterMs: number = 60000, details?: Record<string, unknown>) {
    super(`Rate limit exceeded. Retry after ${retryAfterMs}ms.`, 'RATE_LIMIT', 429, details);
    this.name = 'LumenRateLimitError';
    this.retryAfterMs = retryAfterMs;
  }
}

export class LumenEvaluationError extends LumenError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'EVALUATION_ERROR', 500, details);
    this.name = 'LumenEvaluationError';
  }
}

export class LumenNetworkError extends LumenError {
  public readonly service: 'cortex' | 'policy' | 'scanner';

  constructor(service: 'cortex' | 'policy' | 'scanner', message: string, details?: Record<string, unknown>) {
    super(`${service} service error: ${message}`, 'NETWORK_ERROR', 0, details);
    this.name = 'LumenNetworkError';
    this.service = service;
  }
}

export class LumenValidationError extends LumenError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'LumenValidationError';
  }
}
