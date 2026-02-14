# DEMO_SCRIPT.md — The Ultimate LUMEN Demo Guide

> **For:** Sean Murray (Founder, Forge Partners Inc.)  
> **Purpose:** Demo LUMEN SDK to Google, investors, or enterprise buyers  
> **Duration:** 15-18 minutes  
> **Date:** February 13, 2026

---

## Demo Environment Setup (Before the Meeting)

### Prerequisites
- **Node.js 18+** installed
- **Clean terminal** with large font (recommend iTerm2 or Warp)
- **Terminal theme:** Dark background, green/white text (hacker aesthetic)

### Pre-Demo Checklist
- [ ] **TWO terminal tabs** ready: one for install/code, one for running
- [ ] **Scanner Dashboard** open in a browser tab (don't show it yet)
- [ ] **GitHub repo** open in another tab
- [ ] **Close all other apps** — full screen terminal
- [ ] **Pre-run `npm install`** once so node_modules is cached (install will look instant)
- [ ] **Have `demo.ts` pre-typed** but ready to make a small edit live
- [ ] **Terminal font size: 24pt minimum** — everyone in the room must read the output

---

## The Demo Flow (15-18 minutes)

---

## ACT 1: THE HOOK (2 minutes)

### Opening Line (Memorize This)

> *"Every healthcare AI decision will eventually be questioned. By a regulator. By a lawyer. By a patient's family. The question isn't IF — it's whether you have the answer when they ask."*

**Pause. Let it land.**

> *"Today I'm going to show you how one npm install gives every healthcare AI application a defensible decision record, runtime governance, and regulatory compliance — in 5 lines of code."*

---

## ACT 2: THE INSTALL (3 minutes)

### Live in Terminal

```bash
mkdir lumen-demo && cd lumen-demo
npm init -y
npm install @forgehealth/lumen-sdk
```

### While It Installs, Say This

> *"Zero dependencies in our CLI. Enterprise security teams block postinstall scripts — we have none. This installs in 3 seconds, works behind corporate proxies, and passes every SBOM audit."*

### Run the Init Wizard

```bash
npx @forgehealth/lumen-sdk init
```

### Walk Through the Interactive Wizard

1. **Select jurisdiction:** "Ontario — PHIPA" (or pick based on audience)
2. **API key:** Skip for now (free tier)
3. **Enforcement mode:** "ADVISORY" 
   - *Explain:* "Advisory means score but don't block. Hospitals set their own risk tolerance."
4. **Legal acknowledgment:** Accept

### Close the Act

> *"That just generated a `.lumenrc.json` config file. The SDK auto-discovers it. Zero configuration in your code."*

---

## ACT 3: THE EVALUATION — The Money Shot (5 minutes)

### Create `demo.ts`

> *"Have this pre-typed in a file, but pretend to type the key parts."*

```typescript
import { Lumen } from '@forgehealth/lumen-sdk';

const lumen = new Lumen();

const result = lumen.evaluate({
  domain: 'healthcare',
  region: 'ontario',
  useCase: 'clinical-decision-support',
  model: 'gpt-4',
  dataClassification: 'phi',
  hasConsentProtocol: true,
  populationSize: 50000,
  isAutonomous: false,
  hasHumanOverride: true,
  description: 'AI-assisted sepsis prediction model analyzing patient vitals, lab results, and clinical notes to generate early warning alerts for ICU nurses'
});

console.log('LUMEN Score:', result.score);
console.log('Verdict:', result.verdict);
console.log('Tier:', result.tier);
console.log('Risk Radar:', JSON.stringify(result.riskRadar, null, 2));
console.log('Frameworks:', result.frameworks);
```

### Run It

```bash
npx ts-node demo.ts
```

### When the Output Appears — PAUSE

**Let them read it.**

### Walk Through Each Piece

> *"LUMEN Score 72 out of 100. This is a Tier 2 — Operational with conditions."*

> *"The Risk Radar breaks it down across 10 domains aligned to CHAI — the Coalition for Health AI. These aren't our made-up categories. Mayo Clinic, Duke Health, Google, and WHO defined these domains."*

**Point to each domain score:**

> *"Clinical Safety scored 8 out of 10 because there's human override. Privacy scored 6 because we're processing PHI — the PHIPA pack flagged collection limitation requirements."*

> *"The verdict is REVIEW — meaning a human should validate before this goes live. If we'd said `hasHumanOverride: false`, this would have been DENY."*

> *"This entire evaluation took under 50 milliseconds. It doesn't slow down the inference pipeline."*

### The "Holy Shit" Moment

**Make a small edit live:**

> *"Watch what happens when I change `isAutonomous: false` to `true`..."*

```typescript
isAutonomous: true,  // Changed from false
```

**Re-run:**

```bash
npx ts-node demo.ts
```

**Watch the score DROP dramatically.**

---

## ACT 4: THE POLICY PACKS — The Regulatory Depth (3 minutes)

### Transition

> *"Let me show you what's inside a policy pack."*

### Show the Pack Contents

```typescript
import { getPackById } from '@forgehealth/lumen-sdk/packs';

const phipa = getPackById('ca-on-phipa');
console.log('Pack:', phipa.name);
console.log('Framework:', phipa.framework);
console.log('Rules:', phipa.rules.length);
phipa.rules.forEach(r => console.log(`  [${r.severity}] ${r.id}: ${r.title}`));
```

### Talking Points

> *"That's 18 real PHIPA rules — section 4 definitions, section 12 collection limitation, section 17 use limitation, breach notification. These aren't summaries. These are evaluator functions that check your specific context against the actual legislation."*

> *"We shipped PHIPA for Ontario and HIPAA for the US this week. Colorado's AI Act is next. We're building packs for every jurisdiction where healthcare AI operates."*

> *"And here's the key — when Ontario IPC publishes new AI guidance, like they did last week, our packs UPDATE. That's the subscription value."*

---

## ACT 5: THE INTELLIGENCE ENGINE — The Moat (3 minutes)

### Switch to Browser

**Open the Scanner Dashboard.**

> *"This is what feeds the policy packs."*

### Show the Dashboard

- Findings
- Jurisdiction coverage
- Sources

### Talking Points

> *"We're monitoring 50+ legislative sources across every Canadian province and territory, 14 US states, 8 federal agencies, and 12 international frameworks. Daily. Automated."*

**Click on a finding:**

> *"This one — Ontario IPC just published guidance that AI training data falls under PHIPA collection provisions. Most hospitals don't know this yet. Our customers do, because their PHIPA pack already reflects it."*

> *"This is the moat. Superwise can block PHI at runtime. We can tell you WHY it's blocked, WHICH regulation requires it, and WHEN that regulation changed."*

---

## ACT 6: THE GOOGLE INTEGRATION STORY (2 minutes)

### Draw on Whiteboard or Show a Slide

```
[Your Healthcare AI App]
        ↓
[Vertex AI / Gemini] → generates clinical output
        ↓
[Google Judge Model] → evaluates quality, coherence, safety
        ↓
[LUMEN SDK] → evaluates regulatory compliance, clinical risk, governance
        ↓
[Scored Output + Decision Record] → clinician sees result with LUMEN Score
```

### Talking Points

> *"Judge Model answers: 'Is this a good response?' LUMEN answers: 'Is this a SAFE, COMPLIANT, DEFENSIBLE response?' They're complementary layers."*

> *"We want to be the healthcare governance layer on Google Cloud. Every Vertex AI healthcare deployment should have LUMEN in the pipeline."*

---

## ACT 7: THE CLOSE (1 minute)

### Three Things to Remember

> *"Three things to remember:
> 1. Five lines of code. One npm install. Runtime governance for healthcare AI.
> 2. Every score produces a signed, auditable decision record. When the regulator asks, you have receipts.
> 3. We're monitoring legislation across North America so our customers don't have to."*

**Pause.**

> *"Questions?"*

---

## Pro Tips for Maximum Impact

| Tip | Why It Matters |
|-----|----------------|
| **Terminal font size: 24pt minimum** | Everyone in the room must read the output |
| **Pre-run `npm install` once** | Cache node_modules — install looks instant (impressive) |
| **Have `demo.ts` ready** | Make a small edit live (change `isAutonomous: false` to `true`) — the "holy shit" moment |

### If Asked: "How Is the Score Calculated?"

> *"We score across 10 CHAI-aligned domains using Multi-Criteria Decision Analysis with Monte Carlo confidence intervals. The methodology is documented and designed for third-party audit. The exact weighting is our proprietary IP — like a credit score, you know the factors, and we publish those, but the precise formula is our competitive advantage."*

### If Asked About Competitors

> *"Superwise is the closest. They're horizontal — AI governance broadly. We're healthcare-only. They block PHI. We score compliance across 10 domains, monitor legislation in real-time, and produce defensible decision records with regulatory traceability. Different product for a different buyer."*

### Name Drop Naturally

> *"The Coalition for Health AI — that's Mayo Clinic, Duke, Google, WHO — they defined the 10 assurance domains. We score against them."*

---

## Emergency Recovery

| Problem | Solution |
|---------|----------|
| npm install fails | Have a pre-built project in `~/lumen-demo-backup/` |
| TypeScript errors | Have a pre-compiled `.js` version ready |
| Question you can't answer | *"That's on our v1.2 roadmap — I'd love to show you when it ships in April"* |

---

## Demo Day Checklist

- [ ] Node.js 18+ confirmed
- [ ] Terminal tabs ready (2)
- [ ] Font size 24pt+
- [ ] node_modules cached (pre-ran install)
- [ ] `demo.ts` ready with sepsis example
- [ ] Scanner Dashboard tab open
- [ ] GitHub repo tab open
- [ ] All other apps closed
- [ ] Whiteboard or slide for Google integration diagram
- [ ] `~/lumen-demo-backup/` ready
- [ ] Backup `.js` version ready

---

**© 2026 Forge Partners Inc. All rights reserved.**  
**For internal use only — do not distribute.**
