# LUMEN SDK™ — Terms of Service

**Effective Date:** February 13, 2026  
**Last Updated:** February 13, 2026  
**Legal Entity:** Forge Partners Inc.

---

## 1. Acceptance of Terms

By installing, accessing, or using the LUMEN SDK, LUMEN UI components, LUMEN API, or any associated services (collectively, "LUMEN Services"), you ("User," "You," or "Your") agree to be bound by these Terms of Service ("Terms"). If You are accepting these Terms on behalf of an organization, You represent and warrant that You have the authority to bind that organization.

If You do not agree to these Terms, do not install, access, or use LUMEN Services.

## 2. Description of Services

LUMEN Services provide software tools for **governance scoring, audit trail generation, and compliance documentation** related to artificial intelligence systems in healthcare and other regulated industries.

LUMEN Services include:
- **LUMEN SDK** (`@forgehealth/lumen-sdk`) — Runtime governance scoring library
- **LUMEN UI** (`@forgehealth/lumen-ui`) — React visualization components
- **LUMEN API** (`api.forgelumen.ca`) — Hosted Policy Packs and evaluation endpoints
- **LUMEN Scanner** — Legislative intelligence monitoring (internal service)

## 3. CRITICAL HEALTHCARE DISCLAIMERS

### 3.1 Not Medical Advice
**LUMEN IS NOT A MEDICAL DEVICE, CLINICAL DECISION SUPPORT SYSTEM, OR DIAGNOSTIC TOOL.** LUMEN does not provide medical advice, clinical recommendations, diagnoses, treatment plans, or any form of clinical decision-making. LUMEN scores, verdicts, and reports are **governance and compliance artifacts only**.

### 3.2 Not Legal Compliance Certification
**A LUMEN Score does not constitute legal compliance certification, regulatory approval, or legal advice.** LUMEN scores are informational indicators designed to support — not replace — Your organization's compliance processes. A high LUMEN Score does not guarantee compliance with any law, regulation, or standard. A low LUMEN Score does not necessarily indicate non-compliance.

### 3.3 Not a Substitute for Professional Judgment
**LUMEN does not replace professional legal, regulatory, clinical, or ethical judgment.** Users are solely responsible for:
- All clinical decisions made with or without AI assistance, regardless of LUMEN Score
- Determining the applicability of any regulation to their specific use case
- Engaging qualified legal counsel for compliance determinations
- Engaging qualified clinical professionals for patient care decisions
- Validating that LUMEN policy packs are appropriate for their jurisdiction and use case

### 3.4 No PHI Processing
LUMEN Services are designed to evaluate **AI outputs and metadata** — not to process, store, or transmit Protected Health Information (PHI) as defined by HIPAA, Personal Health Information as defined by PHIPA, or equivalent protected data under any applicable privacy law. **Users must not submit PHI, patient data, or personally identifiable health information to LUMEN Services.** If PHI is inadvertently submitted, Forge Partners Inc. accepts no responsibility for its handling.

### 3.5 Clinical Outcome Disclaimer
**Forge Partners Inc. bears no responsibility for clinical outcomes, patient harm, adverse events, misdiagnoses, treatment errors, or any healthcare-related consequences** arising from decisions made using, informed by, or associated with LUMEN scores, verdicts, certificates, or reports — whether directly or indirectly.

## 4. License and Intellectual Property

### 4.1 Open-Source Components
The LUMEN SDK and LUMEN UI are licensed under the Apache License, Version 2.0. See the LICENSE file in each repository for full terms.

### 4.2 Hosted Services
Access to LUMEN API (hosted policy packs, legislative intelligence, evaluation endpoints) is governed by these Terms and requires a valid API key. Hosted services are **not** open-source and are proprietary to Forge Partners Inc.

### 4.3 Trademarks
"LUMEN," "LUMEN SDK," "LUMEN Score," "Defensible Decision Record," and the LUMEN logo are trademarks of Forge Partners Inc. You may not use these marks in any manner that suggests endorsement, affiliation, or sponsorship by Forge Partners Inc. without prior written consent.

### 4.4 Policy Pack Content
Policy pack content (regulatory rules, scoring criteria, legislative mappings) is proprietary intellectual property of Forge Partners Inc. Policy packs are licensed for use within LUMEN Services only and may not be extracted, reverse-engineered, or redistributed.

## 5. API Key Terms

### 5.1 Key Issuance
API keys are issued to named organizations or individuals. Each key is for a single organization's use. Keys may not be shared, resold, or transferred.

### 5.2 Usage Tiers

| Tier | Monthly Evaluations | Policy Packs | Support | Price |
|------|-------------------|--------------|---------|-------|
| Free | 1,000 | 2 packs | Community | $0/mo |
| Pro | 50,000 | All packs | Email (48h) | $99/mo |
| Enterprise | Unlimited | All packs + custom | Dedicated SLA | Custom |

### 5.3 Rate Limiting
Requests exceeding Your tier's allocation will receive HTTP 429 responses. Overages are not charged on Free tier; Pro and Enterprise tiers may have overage provisions per their agreements.

### 5.4 Key Revocation
Forge Partners Inc. reserves the right to revoke API keys for:
- Violation of these Terms
- Abuse, excessive load, or denial-of-service patterns
- Non-payment (Pro/Enterprise tiers)
- Use in systems that could cause patient harm through LUMEN Score manipulation

## 6. Data Handling

### 6.1 What LUMEN Processes
LUMEN evaluates:
- AI model output text (anonymized/de-identified)
- Decision context metadata (domain, region, use case type)
- Human action indicators (accepted, rejected, modified)
- Policy pack identifiers

### 6.2 What LUMEN Does NOT Process
LUMEN must not be used to process:
- Protected Health Information (PHI)
- Personally Identifiable Information (PII) of patients
- Raw clinical data (lab results, imaging, notes)
- Social Security Numbers, health card numbers, or equivalent identifiers

### 6.3 Data Retention
- **Free tier:** Evaluation metadata retained for 30 days, then deleted
- **Pro tier:** Evaluation metadata retained for 1 year
- **Enterprise tier:** Configurable retention per agreement
- **Audit records:** Generated locally in Your environment; Forge Partners Inc. does not retain copies unless using hosted evaluation endpoints

## 7. Indemnification

### 7.1 User Indemnification
You agree to indemnify, defend, and hold harmless Forge Partners Inc., its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including reasonable legal fees) arising from:
- Your use of LUMEN Services
- Your violation of these Terms
- Clinical decisions made using or informed by LUMEN scores
- Your failure to comply with applicable healthcare regulations
- PHI or PII inadvertently submitted to LUMEN Services
- Any claim that Your use of LUMEN caused patient harm

### 7.2 Limitation of Liability
**TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, FORGE PARTNERS INC. SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO:**
- **Loss of revenue, profits, or data**
- **Clinical or patient outcomes**
- **Regulatory fines or penalties**
- **Reputational harm**
- **Cost of substitute services**

**WHETHER ARISING FROM CONTRACT, TORT, NEGLIGENCE, STRICT LIABILITY, OR OTHERWISE, EVEN IF FORGE PARTNERS INC. HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.**

**FORGE PARTNERS INC.'S TOTAL AGGREGATE LIABILITY SHALL NOT EXCEED THE GREATER OF (A) THE AMOUNTS PAID BY YOU FOR LUMEN SERVICES IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM, OR (B) ONE HUNDRED CANADIAN DOLLARS (CAD $100).**

## 8. Warranty Disclaimer

**LUMEN SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, ACCURACY, OR COMPLETENESS.**

**FORGE PARTNERS INC. DOES NOT WARRANT THAT:**
- LUMEN scores will be accurate, complete, or current
- Policy packs will reflect all applicable regulations at all times
- Legislative intelligence will capture every regulatory change
- LUMEN Services will be uninterrupted, error-free, or secure
- LUMEN Services will meet Your specific compliance requirements

## 9. Governing Law

These Terms are governed by the laws of the Province of Ontario and the federal laws of Canada applicable therein, without regard to conflict of law principles. Any disputes shall be resolved in the courts of Ontario, Canada.

## 10. Changes to Terms

Forge Partners Inc. reserves the right to modify these Terms at any time. Material changes will be communicated via:
- Update to this document with a new "Last Updated" date
- Notice on the LUMEN developer portal
- Email notification for Pro and Enterprise tier users

Continued use of LUMEN Services after changes constitutes acceptance of the updated Terms.

## 11. Contact

**Forge Partners Inc.**  
Email: legal@forgehealth.ai  
Web: https://forgehealth.ai  

For security issues: security@forgehealth.ai (see SECURITY.md)

---

© 2026 Forge Partners Inc. All rights reserved.
