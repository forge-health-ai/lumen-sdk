# LUMEN SDK™ — Healthcare Disclaimer

**Effective Date:** February 13, 2026  
**Legal Entity:** Forge Partners Inc.

---

## ⚠️ IMPORTANT: READ BEFORE USE IN HEALTHCARE ENVIRONMENTS

This disclaimer applies to all LUMEN Services including the LUMEN SDK, LUMEN UI, LUMEN API, and associated tools, documentation, and services.

---

## 1. LUMEN Is a Governance Tool — Not a Clinical Tool

LUMEN provides **AI governance scoring and audit trail generation**. It evaluates the *defensibility* of AI-assisted decisions from a governance, compliance, and risk management perspective.

**LUMEN does NOT:**
- Make, recommend, or influence clinical decisions
- Diagnose, treat, prevent, or mitigate any disease or condition
- Serve as a medical device or Software as a Medical Device (SaMD)
- Replace clinical judgment, medical expertise, or standard of care
- Provide legal advice or compliance certification
- Guarantee regulatory compliance in any jurisdiction

## 2. LUMEN Score Interpretation

The LUMEN Score (0-100) is a **governance confidence indicator**, not a clinical safety score.

| What LUMEN Score IS | What LUMEN Score IS NOT |
|---|---|
| A governance defensibility metric | A clinical safety rating |
| An audit support indicator | A regulatory compliance certificate |
| A risk management signal | A guarantee of correctness |
| A policy alignment measure | Legal advice |

**A high LUMEN Score does not mean an AI decision is clinically correct.**  
**A low LUMEN Score does not mean an AI decision is clinically incorrect.**

The LUMEN Score reflects alignment with configured policy packs and governance frameworks. Clinical accuracy is outside LUMEN's scope and responsibility.

## 3. Policy Pack Limitations

LUMEN policy packs encode governance rules derived from legislation, regulations, and frameworks (e.g., PHIPA, HIPAA, NIST AI RMF, CHAI). However:

- **Packs may not reflect the most recent legislative changes.** While our Legislative Intelligence Scanner monitors regulatory sources continuously, there may be delays between a law's enactment and pack updates.
- **Packs are general-purpose.** They may not account for organization-specific policies, bylaws, or contractual obligations.
- **Packs require configuration.** Default settings may not be appropriate for Your specific use case, patient population, or risk tolerance.
- **Packs do not cover all regulations.** Healthcare is regulated at federal, state/provincial, and local levels across multiple domains. LUMEN packs cover major AI-relevant regulations but are not exhaustive.

**You are responsible for validating that selected policy packs are appropriate for Your jurisdiction, use case, and organizational requirements.**

## 4. No Protected Health Information (PHI)

LUMEN Services are designed to operate on **AI output metadata and governance signals** — not on patient data.

**DO NOT submit to LUMEN Services:**
- Patient names, dates of birth, addresses, or contact information
- Medical record numbers, health card numbers, or insurance IDs
- Social Security Numbers or Social Insurance Numbers
- Clinical notes, lab results, imaging data, or diagnostic reports
- Any data element defined as PHI under HIPAA (45 CFR § 160.103)
- Any data element defined as Personal Health Information under PHIPA (s. 4)
- Any data element protected under GDPR, PIPEDA, or equivalent privacy laws

**If Your AI system's output contains PHI**, You must de-identify or anonymize it before submitting to LUMEN for evaluation. Forge Partners Inc. is not a Business Associate under HIPAA and has not executed a BAA. Forge Partners Inc. is not a Health Information Custodian under PHIPA.

## 5. Regulatory Framework Acknowledgment

LUMEN references the following frameworks and regulations in its scoring and policy packs. **Referencing these frameworks does not imply endorsement by, affiliation with, or certification from the organizations that maintain them:**

- **NIST AI Risk Management Framework (AI RMF)** — National Institute of Standards and Technology
- **CHAI** — Coalition for Health AI
- **ISO/IEC 42001** — International Organization for Standardization
- **WHO Ethics & Governance of AI for Health** — World Health Organization
- **HIPAA** — U.S. Department of Health and Human Services
- **PHIPA** — Information and Privacy Commissioner of Ontario
- **PIPEDA / Bill C-27 / AIDA** — Government of Canada
- **FDA AI/ML SaMD Guidance** — U.S. Food and Drug Administration
- **EU AI Act** — European Parliament and Council
- **OECD AI Principles** — Organisation for Economic Co-operation and Development

## 6. Responsibility Matrix

| Responsibility | Owner |
|---|---|
| Clinical decisions and patient outcomes | **Your Organization** |
| Regulatory compliance determination | **Your Organization + Legal Counsel** |
| AI model accuracy and safety | **Your Organization + AI Vendor** |
| Policy pack selection and configuration | **Your Organization** |
| PHI de-identification before LUMEN evaluation | **Your Organization** |
| LUMEN Score interpretation in clinical context | **Your Organization** |
| Governance scoring algorithm accuracy | **Forge Partners Inc.** |
| Policy pack content (best-effort regulatory alignment) | **Forge Partners Inc.** |
| Legislative intelligence monitoring (best-effort) | **Forge Partners Inc.** |
| API availability and performance (per SLA tier) | **Forge Partners Inc.** |

## 7. Jurisdictional Notice

LUMEN Services are developed and maintained in Ontario, Canada by Forge Partners Inc. Users in other jurisdictions are responsible for determining whether LUMEN Services comply with local laws and regulations governing:
- AI governance tools
- Healthcare software
- Data processing and privacy
- Professional licensing and scope of practice

## 8. No Warranty of Regulatory Acceptance

Use of LUMEN Services, including the generation of LUMEN Scores, Defensible Decision Records, and Assurance Certificates, **does not guarantee that any regulatory body, court, auditor, accreditor, or legal authority will accept LUMEN artifacts as sufficient evidence of compliance.** LUMEN artifacts are designed to *support* compliance documentation, not to serve as standalone proof.

## 9. Acknowledgment

By using LUMEN Services, You acknowledge that You have read, understood, and agree to this Healthcare Disclaimer. If You are implementing LUMEN in a healthcare environment, You confirm that:

1. Your organization has conducted its own risk assessment for AI governance
2. You have consulted qualified legal counsel regarding regulatory compliance
3. You understand that LUMEN is a governance tool, not a clinical or legal tool
4. You accept full responsibility for clinical decisions and patient outcomes
5. You will not submit PHI to LUMEN Services
6. You will validate policy pack appropriateness for Your specific use case

---

**Questions about this disclaimer?**  
Contact: legal@forgehealth.ai

© 2026 Forge Partners Inc. All rights reserved.
