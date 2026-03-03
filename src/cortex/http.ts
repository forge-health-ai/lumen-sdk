/**
 * LUMEN SDK™ — HTTP Transport (Zero Dependencies)
 * 
 * © 2026 Forge Partners Inc. All rights reserved.
 * CONFIDENTIAL AND PROPRIETARY.
 */

import * as https from 'https';
import * as http from 'http';
import { LumenAuthError, LumenRateLimitError, LumenNetworkError } from './errors';

export interface HttpRequestOptions {
  baseUrl: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  apiKey: string;
  body?: unknown;
  timeout: number;
  service: 'cortex' | 'policy' | 'scanner';
}

export interface HttpResponse<T = unknown> {
  status: number;
  data: T;
  durationMs: number;
}

const SDK_VERSION = '2.0.0';

export async function httpRequest<T>(opts: HttpRequestOptions): Promise<HttpResponse<T>> {
  const start = Date.now();
  const fullUrl = new URL(opts.path, opts.baseUrl);
  const isHttps = fullUrl.protocol === 'https:';

  const requestOpts: https.RequestOptions = {
    hostname: fullUrl.hostname,
    port: fullUrl.port || (isHttps ? 443 : 80),
    path: fullUrl.pathname + fullUrl.search,
    method: opts.method,
    headers: {
      'Authorization': `Bearer ${opts.apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': `LumenSDK/${SDK_VERSION}`,
      'X-Lumen-SDK-Version': SDK_VERSION,
    },
    timeout: opts.timeout,
  };

  return new Promise<HttpResponse<T>>((resolve, reject) => {
    const mod = isHttps ? https : http;
    const req = mod.request(requestOpts, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        const status = res.statusCode || 0;
        const durationMs = Date.now() - start;

        if (status === 401 || status === 403) {
          return reject(new LumenAuthError(`HTTP ${status} from ${opts.service}`));
        }
        if (status === 429) {
          const retryAfter = parseInt(res.headers['retry-after'] || '60', 10) * 1000;
          return reject(new LumenRateLimitError(retryAfter));
        }

        let parsed: T;
        try {
          parsed = data ? JSON.parse(data) : ({} as T);
        } catch {
          return reject(new LumenNetworkError(opts.service, `Invalid JSON from ${opts.service}`));
        }

        if (status >= 400) {
          const msg = (parsed as Record<string, string>)?.message || `HTTP ${status}`;
          return reject(new LumenNetworkError(opts.service, msg));
        }

        resolve({ status, data: parsed, durationMs });
      });
    });

    req.on('error', (err) => reject(new LumenNetworkError(opts.service, err.message)));
    req.on('timeout', () => {
      req.destroy();
      reject(new LumenNetworkError(opts.service, `Timeout after ${opts.timeout}ms`));
    });

    if (opts.body) {
      req.write(JSON.stringify(opts.body));
    }
    req.end();
  });
}

/**
 * Retry wrapper with exponential backoff.
 * Only retries on 5xx / network errors (not auth / rate-limit / validation).
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number,
  service: 'cortex' | 'policy' | 'scanner'
): Promise<T> {
  let lastErr: Error | undefined;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err as Error;
      // Don't retry auth, rate-limit, or validation errors
      if (err instanceof LumenAuthError || err instanceof LumenRateLimitError) throw err;
      if (attempt < maxRetries) {
        await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)));
      }
    }
  }
  throw lastErr;
}
