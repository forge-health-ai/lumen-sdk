/**
 * LUMEN SDK - Policy Packs Index
 * 
 * Export all bundled policy packs and utilities.
 * 
 * @copyright 2026 Forge Partners Inc.
 * @license Apache-2.0
 */

export { caOnPhipa } from './ca-on-phipa';
export { usFedHipaa } from './us-fed-hipaa';

import { caOnPhipa, type EvaluationContext as PhipaContext, type EvaluationResult as PhipaResult } from './ca-on-phipa';
import { usFedHipaa, type EvaluationContext as HipaaContext, type EvaluationResult as HipaaResult } from './us-fed-hipaa';

// Unified types for external use
export type PackEvaluationContext = PhipaContext | HipaaContext;
export type PackEvaluationResult = PhipaResult | HipaaResult;

/**
 * All bundled policy packs
 */
export const bundledPacks = {
  'ca-on-phipa': caOnPhipa,
  'us-fed-hipaa': usFedHipaa
} as const;

/**
 * Get a bundled policy pack by its ID
 * @param id The policy pack ID (e.g., 'ca-on-phipa', 'us-fed-hipaa')
 * @returns The policy pack or undefined if not found
 */
export function getPackById(id: string): typeof caOnPhipa | typeof usFedHipaa | undefined {
  return bundledPacks[id as keyof typeof bundledPacks];
}

/**
 * List all available bundled policy packs
 * @returns Array of policy pack metadata
 */
export function listAvailablePacks(): Array<{
  id: string;
  name: string;
  version: string;
  jurisdiction: { country: string; region: string };
  framework: string;
  lastUpdated: string;
  ruleCount: number;
}> {
  return Object.values(bundledPacks).map(pack => ({
    id: pack.id,
    name: pack.name,
    version: pack.version,
    jurisdiction: pack.jurisdiction,
    framework: pack.framework,
    lastUpdated: pack.lastUpdated,
    ruleCount: pack.rules.length
  }));
}

/**
 * Check if a bundled pack exists
 * @param id The policy pack ID
 * @returns True if the pack is bundled
 */
export function hasBundledPack(id: string): boolean {
  return id in bundledPacks;
}
