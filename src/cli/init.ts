#!/usr/bin/env node
/**
 * LUMEN SDK™ — Interactive Setup CLI
 * 
 * Usage: npx @forgehealth/lumen-sdk init
 * 
 * This CLI uses ONLY Node.js built-in modules (readline, fs, path, https).
 * Zero external dependencies. Zero postinstall hooks. Zero security flags.
 * Works everywhere Node 18+ runs.
 * 
 * @copyright 2026 Forge Partners Inc.
 * @license Apache-2.0
 */

import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG_FILENAME = '.lumenrc.json';
const PORTAL_URL = 'https://forgelumen.ca/developer';
const TOS_URL = 'https://forgelumen.ca/terms-of-service';
const DISCLAIMER_URL = 'https://forgelumen.ca/healthcare-disclaimer';
const DOCS_URL = 'https://github.com/forge-health-ai/lumen-sdk#readme';

interface LumenRcConfig {
  $schema: string;
  version: string;
  domain: string;
  region: string;
  packs: string[];
  apiKey?: string;
  enforcementMode: string;
  createdAt: string;
  createdBy: string;
}

// Available jurisdictions and their default packs
const JURISDICTIONS: Record<string, { name: string; region: string; packs: string[]; description: string }> = {
  '1': {
    name: 'Canada — Ontario (PHIPA)',
    region: 'canada',
    packs: ['ca-on-phipa'],
    description: 'Personal Health Information Protection Act + PIPEDA',
  },
  '2': {
    name: 'Canada — Federal (PIPEDA/AIDA)',
    region: 'canada',
    packs: ['ca-fed-pipeda'],
    description: 'PIPEDA + Artificial Intelligence and Data Act',
  },
  '3': {
    name: 'United States — HIPAA',
    region: 'us',
    packs: ['us-fed-hipaa'],
    description: 'HIPAA + HITECH Act',
  },
  '4': {
    name: 'United States — FDA AI/ML',
    region: 'us',
    packs: ['us-fed-fda-aiml'],
    description: 'FDA Software as Medical Device + AI/ML guidance',
  },
  '5': {
    name: 'United States — NIST AI RMF',
    region: 'us',
    packs: ['us-fed-nist-ai'],
    description: 'NIST AI Risk Management Framework 1.0',
  },
  '6': {
    name: 'European Union — AI Act',
    region: 'eu',
    packs: ['eu-ai-act'],
    description: 'EU Artificial Intelligence Act + GDPR',
  },
  '7': {
    name: 'Multiple jurisdictions',
    region: 'global',
    packs: [],
    description: 'Select specific packs manually',
  },
};

const ALL_PACKS: Record<string, { name: string; jurisdiction: string; tier: 'free' | 'pro' }> = {
  'ca-on-phipa':     { name: 'Ontario PHIPA Healthcare',        jurisdiction: 'Canada — Ontario',    tier: 'free' },
  'ca-fed-pipeda':   { name: 'Canadian Federal AI Governance',  jurisdiction: 'Canada — Federal',    tier: 'pro' },
  'us-fed-hipaa':    { name: 'US HIPAA Healthcare',             jurisdiction: 'United States',       tier: 'free' },
  'us-fed-fda-aiml': { name: 'US FDA AI/ML Medical Device',     jurisdiction: 'United States',       tier: 'pro' },
  'us-fed-nist-ai':  { name: 'NIST AI Risk Management',         jurisdiction: 'United States',       tier: 'pro' },
  'eu-ai-act':       { name: 'EU AI Act Compliance',            jurisdiction: 'European Union',      tier: 'pro' },
};

// ============================================================================
// TERMINAL HELPERS — Zero dependencies
// ============================================================================

const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const BLUE = '\x1b[34m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const WHITE = '\x1b[37m';

function print(text: string): void {
  process.stdout.write(text + '\n');
}

function blank(): void {
  print('');
}

function header(): void {
  blank();
  print(`${BOLD}${BLUE}  ╔══════════════════════════════════════════════╗${RESET}`);
  print(`${BOLD}${BLUE}  ║          ${WHITE}LUMEN SDK™ Setup${BLUE}                    ║${RESET}`);
  print(`${BOLD}${BLUE}  ║   ${DIM}${WHITE}Defensible AI Decisions for Healthcare${BLUE}   ║${RESET}`);
  print(`${BOLD}${BLUE}  ╚══════════════════════════════════════════════╝${RESET}`);
  blank();
}

function success(text: string): void {
  print(`  ${GREEN}✔${RESET} ${text}`);
}

function info(text: string): void {
  print(`  ${BLUE}ℹ${RESET} ${text}`);
}

function warn(text: string): void {
  print(`  ${YELLOW}⚠${RESET} ${text}`);
}

// ============================================================================
// INTERACTIVE PROMPTS — Uses only Node readline
// ============================================================================

function createInterface(): readline.Interface {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

function ask(rl: readline.Interface, question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(`  ${question}`, (answer) => {
      resolve(answer.trim());
    });
  });
}

// ============================================================================
// API KEY VALIDATION — Uses only Node https
// ============================================================================

function validateApiKey(key: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (!key || key === '') {
      resolve(true); // Empty = skip, valid
      return;
    }

    // Check format first
    if (!key.startsWith('lumen_pk_')) {
      resolve(false);
      return;
    }

    // Try to validate against the API (best effort, don't block on network failure)
    const options = {
      hostname: 'api.forgelumen.ca',
      path: '/v1/keys/validate',
      method: 'GET',
      headers: { 'X-API-Key': key },
      timeout: 5000,
    };

    const req = https.request(options, (res) => {
      resolve(res.statusCode === 200);
    });

    req.on('error', () => {
      // Network error — don't block setup, accept the key format
      resolve(true);
    });

    req.on('timeout', () => {
      req.destroy();
      resolve(true); // Don't block on timeout
    });

    req.end();
  });
}

// ============================================================================
// MAIN SETUP FLOW
// ============================================================================

async function main(): Promise<void> {
  const rl = createInterface();

  try {
    header();

    // Check if config already exists
    const configPath = path.resolve(process.cwd(), CONFIG_FILENAME);
    if (fs.existsSync(configPath)) {
      warn(`${CONFIG_FILENAME} already exists in this directory.`);
      const overwrite = await ask(rl, `${YELLOW}Overwrite? (y/N):${RESET} `);
      if (overwrite.toLowerCase() !== 'y') {
        info('Setup cancelled. Existing configuration preserved.');
        rl.close();
        return;
      }
      blank();
    }

    // ── Step 1: Jurisdiction ────────────────────────────────────────────
    print(`  ${BOLD}${WHITE}Step 1 of 4 — Select your jurisdiction${RESET}`);
    blank();
    
    for (const [key, jur] of Object.entries(JURISDICTIONS)) {
      const tag = key === '7' ? `${DIM}(advanced)${RESET}` : '';
      print(`    ${CYAN}${key}${RESET}  ${jur.name} ${tag}`);
      print(`       ${DIM}${jur.description}${RESET}`);
    }
    blank();

    let jurisdictionChoice = '';
    while (!JURISDICTIONS[jurisdictionChoice]) {
      jurisdictionChoice = await ask(rl, `${WHITE}Select (1-7):${RESET} `);
      if (!JURISDICTIONS[jurisdictionChoice]) {
        warn('Please enter a number from 1 to 7.');
      }
    }

    const selected = JURISDICTIONS[jurisdictionChoice];
    let selectedPacks = [...selected.packs];
    let selectedRegion = selected.region;

    // If "Multiple jurisdictions", let them pick packs
    if (jurisdictionChoice === '7') {
      blank();
      print(`  ${BOLD}${WHITE}Available Policy Packs:${RESET}`);
      blank();

      const packKeys = Object.keys(ALL_PACKS);
      for (let i = 0; i < packKeys.length; i++) {
        const pack = ALL_PACKS[packKeys[i]];
        const tierBadge = pack.tier === 'free' 
          ? `${GREEN}FREE${RESET}` 
          : `${YELLOW}PRO${RESET}`;
        print(`    ${CYAN}${i + 1}${RESET}  ${pack.name} [${tierBadge}]`);
        print(`       ${DIM}${pack.jurisdiction} — ${packKeys[i]}${RESET}`);
      }
      blank();

      const packChoice = await ask(rl, `${WHITE}Select packs (comma-separated, e.g. 1,3):${RESET} `);
      const packIndices = packChoice.split(',').map(s => parseInt(s.trim()) - 1);

      for (const idx of packIndices) {
        if (idx >= 0 && idx < packKeys.length) {
          selectedPacks.push(packKeys[idx]);
        }
      }

      if (selectedPacks.length === 0) {
        selectedPacks = ['ca-on-phipa']; // Safe default
      }

      selectedRegion = 'global';
    }

    success(`Jurisdiction: ${selected.name}`);
    success(`Policy packs: ${selectedPacks.join(', ')}`);
    blank();

    // ── Step 2: API Key ─────────────────────────────────────────────────
    print(`  ${BOLD}${WHITE}Step 2 of 4 — API Key (optional)${RESET}`);
    blank();
    info('An API key enables hosted policy packs that update automatically');
    info('when legislation changes. Without one, you get bundled packs');
    info('(updated with each npm release).');
    blank();
    info(`Free tier: 1,000 evaluations/month, 2 packs`);
    info(`Get a key: ${CYAN}${PORTAL_URL}${RESET}`);
    blank();

    const apiKey = await ask(rl, `${WHITE}API Key (or press Enter to skip):${RESET} `);
    
    if (apiKey) {
      const valid = await validateApiKey(apiKey);
      if (valid) {
        success('API key accepted');
      } else {
        warn('Key format not recognized. Expected: lumen_pk_live_... or lumen_pk_test_...');
        warn('Saving anyway — you can update it later in .lumenrc.json');
      }
    } else {
      info('No API key — using bundled policy packs (offline mode)');
    }
    blank();

    // ── Step 3: Enforcement Mode ────────────────────────────────────────
    print(`  ${BOLD}${WHITE}Step 3 of 4 — Enforcement Mode${RESET}`);
    blank();
    print(`    ${CYAN}1${RESET}  ${GREEN}ADVISORY${RESET} ${DIM}(recommended)${RESET}`);
    print(`       ${DIM}Warn only — never blocks. Scores and records every decision.${RESET}`);
    print(`    ${CYAN}2${RESET}  ${YELLOW}GUARDED${RESET}`);
    print(`       ${DIM}Block recommended — human can override with reason.${RESET}`);
    print(`    ${CYAN}3${RESET}  ${YELLOW}STRICT${RESET}`);
    print(`       ${DIM}Block required — explicit override signal needed.${RESET}`);
    blank();

    let modeChoice = '';
    const modeMap: Record<string, string> = { '1': 'ADVISORY', '2': 'GUARDED', '3': 'STRICT' };
    while (!modeMap[modeChoice]) {
      modeChoice = await ask(rl, `${WHITE}Select (1-3, default 1):${RESET} `) || '1';
    }
    const enforcementMode = modeMap[modeChoice];
    success(`Enforcement: ${enforcementMode}`);
    blank();

    // ── Step 4: Legal Acknowledgment ────────────────────────────────────
    print(`  ${BOLD}${WHITE}Step 4 of 4 — Legal Acknowledgment${RESET}`);
    blank();
    print(`  ${DIM}By proceeding, you acknowledge that:${RESET}`);
    blank();
    print(`  ${DIM}1. LUMEN is a governance tool — not a medical device or CDS${RESET}`);
    print(`  ${DIM}2. LUMEN Scores are governance indicators, not clinical safety ratings${RESET}`);
    print(`  ${DIM}3. You will not submit PHI or patient PII to LUMEN${RESET}`);
    print(`  ${DIM}4. Your organization is responsible for clinical decisions${RESET}`);
    blank();
    print(`  ${DIM}Terms of Service: ${CYAN}${TOS_URL}${RESET}`);
    print(`  ${DIM}Healthcare Disclaimer: ${CYAN}${DISCLAIMER_URL}${RESET}`);
    blank();

    const accepted = await ask(rl, `${WHITE}Do you acknowledge these terms? (y/N):${RESET} `);
    if (accepted.toLowerCase() !== 'y') {
      blank();
      warn('Setup cancelled. You must acknowledge the terms to use LUMEN.');
      info(`Review the terms at: ${CYAN}${TOS_URL}${RESET}`);
      blank();
      rl.close();
      process.exit(0);
    }
    success('Terms acknowledged');
    blank();

    // ── Write Config ────────────────────────────────────────────────────
    const config: LumenRcConfig = {
      $schema: 'https://forgelumen.ca/schemas/lumenrc.json',
      version: '1.0.0',
      domain: 'healthcare',
      region: selectedRegion,
      packs: selectedPacks,
      enforcementMode,
      createdAt: new Date().toISOString(),
      createdBy: `lumen-sdk-init`,
    };

    if (apiKey) {
      config.apiKey = apiKey;
    }

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');
    success(`Configuration saved to ${CONFIG_FILENAME}`);
    blank();

    // ── Add .lumenrc.json to .gitignore if it contains an API key ───────
    if (apiKey) {
      const gitignorePath = path.resolve(process.cwd(), '.gitignore');
      let gitignoreContent = '';
      
      if (fs.existsSync(gitignorePath)) {
        gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
      }

      if (!gitignoreContent.includes(CONFIG_FILENAME)) {
        const entry = `\n# LUMEN SDK config (contains API key)\n${CONFIG_FILENAME}\n`;
        fs.appendFileSync(gitignorePath, entry);
        success(`Added ${CONFIG_FILENAME} to .gitignore (API key protection)`);
      }
    }

    // ── Show next steps ─────────────────────────────────────────────────
    blank();
    print(`  ${BOLD}${GREEN}✔ LUMEN SDK is ready!${RESET}`);
    blank();
    print(`  ${BOLD}${WHITE}Next: Add this to your code:${RESET}`);
    blank();
    print(`  ${DIM}┌──────────────────────────────────────────────────────────┐${RESET}`);
    print(`  ${DIM}│${RESET} ${CYAN}import${RESET} { Lumen } ${CYAN}from${RESET} '${GREEN}@forgehealth/lumen-sdk${RESET}';        ${DIM}│${RESET}`);
    print(`  ${DIM}│${RESET}                                                          ${DIM}│${RESET}`);
    print(`  ${DIM}│${RESET} ${CYAN}const${RESET} lumen = ${CYAN}new${RESET} Lumen();  ${DIM}// reads .lumenrc.json${RESET}       ${DIM}│${RESET}`);
    print(`  ${DIM}│${RESET}                                                          ${DIM}│${RESET}`);
    print(`  ${DIM}│${RESET} ${CYAN}const${RESET} result = ${CYAN}await${RESET} lumen.evaluate({                  ${DIM}│${RESET}`);
    print(`  ${DIM}│${RESET}   aiOutput: modelResponse,                               ${DIM}│${RESET}`);
    print(`  ${DIM}│${RESET}   context: clinicalContext,                               ${DIM}│${RESET}`);
    print(`  ${DIM}│${RESET}   humanAction: '${GREEN}accepted${RESET}'                               ${DIM}│${RESET}`);
    print(`  ${DIM}│${RESET} });                                                       ${DIM}│${RESET}`);
    print(`  ${DIM}│${RESET}                                                          ${DIM}│${RESET}`);
    print(`  ${DIM}│${RESET} console.log(result.lumenScore);  ${DIM}// 78${RESET}                   ${DIM}│${RESET}`);
    print(`  ${DIM}│${RESET} console.log(result.verdict);     ${DIM}// 'ALLOW'${RESET}              ${DIM}│${RESET}`);
    print(`  ${DIM}└──────────────────────────────────────────────────────────┘${RESET}`);
    blank();
    print(`  ${DIM}Docs:      ${CYAN}${DOCS_URL}${RESET}`);
    print(`  ${DIM}Portal:    ${CYAN}${PORTAL_URL}${RESET}`);
    print(`  ${DIM}Config:    ${CYAN}./${CONFIG_FILENAME}${RESET}`);
    blank();
    print(`  ${DIM}© 2026 Forge Partners Inc.${RESET}`);
    blank();

    rl.close();
  } catch (error) {
    rl.close();
    console.error('\n  Error during setup:', error);
    process.exit(1);
  }
}

// Run
main();
