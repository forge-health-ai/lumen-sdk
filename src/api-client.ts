/**
 * LUMEN SDK - API Client
 * 
 * Client for connecting to hosted LUMEN API for remote policy packs
 * and defensible record storage.
 * 
 * @copyright 2026 Forge Partners Inc.
 * @license Apache-2.0
 */

import * as https from 'https';
import * as http from 'http';

export interface LumenAPIClientConfig {
  /** API key for authentication */
  apiKey: string;
  /** Base URL for the API (default: https://api.forgelumen.ca/v1) */
  baseUrl?: string;
}

export interface PackSummary {
  id: string;
  name: string;
  version: string;
  jurisdiction: {
    country: string;
    region: string;
  };
  framework: string;
  lastUpdated: string;
  ruleCount: number;
}

export interface PackDetails extends PackSummary {
  rules: Array<{
    id: string;
    section: string;
    title: string;
    description: string;
    category: string;
    severity: string;
  }>;
}

export interface PackEvaluationRequest {
  context: Record<string, unknown>;
}

export interface PackEvaluationResponse {
  packId: string;
  evaluationId: string;
  timestamp: string;
  results: Array<{
    ruleId: string;
    section: string;
    title: string;
    passed: boolean;
    reason: string;
    severity: string;
  }>;
  summary: {
    totalRules: number;
    passed: number;
    failed: number;
    criticalFailures: number;
  };
}

export interface UsageStats {
  organizationId: string;
  currentPeriod: {
    startDate: string;
    endDate: string;
  };
  evaluations: {
    total: number;
    allowed: number;
    warned: number;
    blocked: number;
  };
  apiCalls: {
    total: number;
    successful: number;
    failed: number;
  };
  quota: {
    limit: number;
    used: number;
    remaining: number;
  };
}

export interface APIError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export class LumenAPIError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: Record<string, unknown>;

  constructor(message: string, statusCode: number, code: string, details?: Record<string, unknown>) {
    super(message);
    this.name = 'LumenAPIError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

/**
 * LUMEN API Client
 * 
 * Provides access to hosted policy packs and cloud evaluation services.
 * Falls back to bundled packs when API is unavailable.
 */
export class LumenAPIClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timeout: number = 10000;
  private readonly maxRetries: number = 1;

  constructor(config: LumenAPIClientConfig) {
    if (!config.apiKey) {
      throw new LumenAPIError('API key is required', 401, 'MISSING_API_KEY');
    }
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.forgelumen.ca/v1';
  }

  /**
   * Make an HTTP request with retry logic
   */
  private async request<T>(
    method: string,
    path: string,
    body?: Record<string, unknown>
  ): Promise<T> {
    const url = new URL(path, this.baseUrl);
    const isHttps = url.protocol === 'https:';
    
    const options: https.RequestOptions = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': `LumenSDK-Node/${this.getSDKVersion()}`,
        'X-Lumen-SDK-Version': this.getSDKVersion()
      },
      timeout: this.timeout
    };

    let lastError: Error | undefined;
    
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await this.makeRequest<T>(options, body, isHttps);
        return response;
      } catch (error) {
        lastError = error as Error;
        
        // Only retry on 5xx errors or network failures
        if (error instanceof LumenAPIError) {
          if (error.statusCode < 500) {
            throw error; // Don't retry 4xx errors
          }
        }
        
        if (attempt < this.maxRetries) {
          // Wait before retry (exponential backoff)
          await this.delay(1000 * Math.pow(2, attempt));
        }
      }
    }
    
    throw lastError;
  }

  /**
   * Execute the HTTP request
   */
  private makeRequest<T>(
    options: https.RequestOptions,
    body?: Record<string, unknown>,
    isHttps: boolean = true
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const requestModule = isHttps ? https : http;
      
      const req = requestModule.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          const statusCode = res.statusCode || 0;
          
          // Handle empty response
          if (!data) {
            if (statusCode >= 200 && statusCode < 300) {
              resolve({} as T);
              return;
            }
            reject(new LumenAPIError('Empty response', statusCode, 'EMPTY_RESPONSE'));
            return;
          }
          
          // Parse JSON response
          let parsed: unknown;
          try {
            parsed = JSON.parse(data);
          } catch {
            reject(new LumenAPIError('Invalid JSON response', statusCode, 'INVALID_JSON'));
            return;
          }
          
          // Handle error responses
          if (statusCode >= 400) {
            const errorData = parsed as APIError;
            reject(new LumenAPIError(
              errorData.message || `HTTP ${statusCode} error`,
              statusCode,
              errorData.code || `HTTP_${statusCode}`,
              errorData.details
            ));
            return;
          }
          
          resolve(parsed as T);
        });
      });
      
      req.on('error', (error) => {
        reject(new LumenAPIError(
          `Network error: ${error.message}`,
          0,
          'NETWORK_ERROR'
        ));
      });
      
      req.on('timeout', () => {
        req.destroy();
        reject(new LumenAPIError(
          `Request timeout after ${this.timeout}ms`,
          0,
          'TIMEOUT'
        ));
      });
      
      if (body) {
        req.write(JSON.stringify(body));
      }
      
      req.end();
    });
  }

  /**
   * Delay helper for retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get SDK version
   */
  private getSDKVersion(): string {
    return '1.0.0';
  }

  /**
   * List available policy packs for this API key
   * GET /packs
   */
  async listPacks(): Promise<PackSummary[]> {
    return this.request<PackSummary[]>('GET', '/packs');
  }

  /**
   * Get full details of a policy pack including all rules
   * GET /packs/{packId}
   */
  async getPack(packId: string): Promise<PackDetails> {
    if (!packId) {
      throw new LumenAPIError('Pack ID is required', 400, 'MISSING_PACK_ID');
    }
    return this.request<PackDetails>('GET', `/packs/${encodeURIComponent(packId)}`);
  }

  /**
   * Evaluate context against a policy pack
   * POST /packs/{packId}/evaluate
   */
  async evaluate(packId: string, context: Record<string, unknown>): Promise<PackEvaluationResponse> {
    if (!packId) {
      throw new LumenAPIError('Pack ID is required', 400, 'MISSING_PACK_ID');
    }
    
    return this.request<PackEvaluationResponse>(
      'POST', 
      `/packs/${encodeURIComponent(packId)}/evaluate`,
      { context }
    );
  }

  /**
   * Get usage statistics for this API key
   * GET /usage
   */
  async getUsage(): Promise<UsageStats> {
    return this.request<UsageStats>('GET', '/usage');
  }

  /**
   * Check if the API is reachable
   * Returns true if the API responds with a valid status
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.request<{ status: string }>('GET', '/health');
      return true;
    } catch {
      return false;
    }
  }
}

export default LumenAPIClient;
