# LUMEN™ — Healthcare Disclaimer

**Effective Date:** February 13, 2026  
**Last Updated:** February 13, 2026  
**Governing Entity:** Forge Partners Inc. (Ontario Corporation)

**This Healthcare Disclaimer is incorporated into and forms part of the LUMEN Terms of Service. Capitalized terms not defined herein have the meanings given to them in the Terms of Service.**

---

## ⚠️ THIS DISCLAIMER MUST BE READ IN ITS ENTIRETY BEFORE DEPLOYING LUMEN IN ANY HEALTHCARE ENVIRONMENT

---

## 1. NATURE AND PURPOSE OF LUMEN

1.1 LUMEN is a **governance support tool** that generates informational indicators — specifically LUMEN Scores, Defensible Decision Records, and Assurance Certificates — to assist organizations in documenting and evaluating the governance posture of AI-assisted decisions.

1.2 LUMEN operates at the **governance layer** of AI systems. It does not interact with, influence, modify, or contribute to clinical workflows, patient care pathways, diagnostic processes, treatment decisions, or any direct patient-facing function.

1.3 LUMEN evaluates **AI outputs and metadata** against configured Policy Packs. It does not evaluate clinical correctness, diagnostic accuracy, treatment appropriateness, or patient outcomes.

## 2. WHAT LUMEN IS NOT

**LUMEN IS NOT, AND SHALL NOT BE USED AS OR CONSTRUED AS, ANY OF THE FOLLOWING:**

2.1 **Not a Medical Device.** LUMEN is not a medical device, medical software, or Software as a Medical Device (SaMD) within the meaning of:
- The *Food and Drugs Act* (Canada), R.S.C. 1985, c. F-27, and the *Medical Devices Regulations*, SOR/98-282;
- The *Federal Food, Drug, and Cosmetic Act* (U.S.), 21 U.S.C. §§ 301 et seq.;
- The *Medical Device Regulation* (EU) 2017/745 (MDR);
- Health Canada's guidance on Software as a Medical Device;
- The FDA's guidance on Clinical Decision Support Software; or
- Any equivalent classification under any other applicable law.

LUMEN has not been reviewed, cleared, authorized, approved, licensed, or registered by Health Canada, the U.S. Food and Drug Administration, the European Medicines Agency, or any other medical device regulatory authority in any jurisdiction.

2.2 **Not Clinical Decision Support (CDS).** LUMEN does not meet the definition of Clinical Decision Support under:
- Section 520(o)(1)(E) of the Federal Food, Drug, and Cosmetic Act (21 U.S.C. § 360j(o)(1)(E)); or
- Health Canada's guidance on CDS software.

LUMEN does not: (a) acquire, process, or analyze medical data; (b) provide patient-specific diagnostic or treatment recommendations; (c) support or inform any clinical decision for any individual patient; or (d) apply clinical knowledge, logic, or algorithms to patient data.

2.3 **Not Legal Advice or Compliance Certification.** LUMEN does not provide legal advice. No LUMEN output — including Scores, Records, Certificates, Policy Pack evaluations, or legislative intelligence — constitutes:
- A legal opinion;
- A compliance certification, attestation, or audit report;
- A representation that You are in compliance with any law, regulation, standard, or guideline;
- A substitute for advice from qualified legal counsel; or
- Evidence sufficient, on its own, to establish regulatory compliance in any proceeding.

2.4 **Not a Data Processor for PHI.** LUMEN is not designed, intended, or authorized to process, store, transmit, or handle Protected Health Information (PHI) or Personal Health Information as defined under applicable law. Forge Partners Inc. is not:
- A "Business Associate" under HIPAA (45 C.F.R. § 160.103);
- A "Health Information Custodian" under PHIPA (S.O. 2004, c. 3, Sched. A, s. 3);
- An "Agent" of a Health Information Custodian under PHIPA (s. 17); or
- A "Processor" of health data under the GDPR (Regulation (EU) 2016/679, Art. 4(8)) in the context of special category health data (Art. 9).

## 3. LUMEN SCORE — AUTHORITATIVE INTERPRETATION

3.1 **Definition.** The LUMEN Score is a numerical indicator (0–100) that reflects the degree to which an AI-assisted decision aligns with the governance rules encoded in the configured Policy Packs at the time of evaluation.

3.2 **What the LUMEN Score Measures:**
- Alignment with configured governance Policy Packs
- Presence of required audit and documentation elements
- Adherence to configured non-negotiable governance constraints
- Risk classification against configured risk tiers

3.3 **What the LUMEN Score Does NOT Measure:**
- Clinical accuracy, safety, efficacy, or appropriateness
- Legal compliance (de jure)
- Patient outcomes or patient safety
- AI model quality, bias, or fairness (except as reflected in configured Policy Pack rules)
- Regulatory approval status
- Organizational compliance posture

3.4 **Interpretation Limitations.**
- A **high LUMEN Score** does not mean an AI decision is clinically correct, legally compliant, or safe.
- A **low LUMEN Score** does not mean an AI decision is clinically incorrect, legally non-compliant, or unsafe.
- LUMEN Scores are **not comparable** across different Policy Pack configurations or versions.
- LUMEN Scores may change for the same input if Policy Packs are updated, reflecting changes in the governance landscape rather than changes in clinical merit.

## 4. POLICY PACK LIMITATIONS

4.1 **Best-Effort Coverage.** Policy Packs are developed through analysis of publicly available legislation, regulations, guidance documents, and frameworks. Forge Partners uses commercially reasonable efforts to maintain accuracy and currency, including through its Legislative Intelligence Scanner. However:

(a) **Policy Packs may not reflect the most recent legislative, regulatory, or judicial developments.** There is an inherent delay between the publication of a legal change and its incorporation into a Policy Pack.

(b) **Policy Packs may not cover all applicable laws in Your jurisdiction.** Healthcare is regulated at federal, provincial/state, territorial, and municipal levels across multiple domains (privacy, professional regulation, facility licensing, quality assurance, etc.). Policy Packs focus on AI-relevant governance provisions and are not exhaustive.

(c) **Policy Packs encode general rules.** They do not account for organization-specific policies, bylaws, accreditation standards, contractual obligations, or professional practice standards applicable to Your Authorized Users.

(d) **Policy Packs require configuration.** Default configurations may not be appropriate for Your specific use case, patient population, clinical domain, or organizational risk tolerance.

(e) **Policy Pack content reflects Forge Partners' interpretation.** Regulatory provisions are often subject to varying interpretations. Policy Pack rules represent one commercially reasonable interpretation but may differ from interpretations adopted by regulators, courts, or legal counsel.

4.2 **Your Validation Obligation.** **You are solely responsible for validating that the Policy Packs You select and configure are appropriate, sufficient, and correctly calibrated for Your jurisdiction, use case, clinical domain, patient population, and organizational requirements.** Forge Partners recommends that You engage qualified legal counsel to review Policy Pack selection and configuration.

## 5. LEGISLATIVE INTELLIGENCE LIMITATIONS

5.1 The LUMEN Legislative Intelligence Scanner monitors publicly available legislative, regulatory, and standard-setting sources across multiple jurisdictions. This monitoring is provided on a best-effort basis.

5.2 **Forge Partners does not warrant that the Legislative Intelligence Scanner will:**
- Detect every relevant legislative, regulatory, or judicial development;
- Detect such developments in real time or within any specific timeframe;
- Correctly assess the relevance or impact of detected developments;
- Cover all applicable sources in all jurisdictions; or
- Remain operational without interruption.

5.3 **You should not rely solely on LUMEN legislative intelligence for regulatory monitoring.** You should maintain independent processes — including engagement of legal counsel — for monitoring developments that affect Your regulatory obligations.

## 6. RESPONSIBILITY MATRIX

| Domain | Responsible Party |
|---|---|
| All clinical decisions and patient care | **You / Your Organization** |
| Patient outcomes, safety, and adverse events | **You / Your Organization** |
| Regulatory compliance determinations | **You / Your Organization + Legal Counsel** |
| AI model accuracy, safety, and validation | **You / Your Organization + AI Vendor** |
| Selection and configuration of Policy Packs | **You / Your Organization** |
| Validation that LUMEN is appropriate for Your use case | **You / Your Organization** |
| De-identification of PHI/PII before submission to LUMEN | **You / Your Organization** |
| Interpretation of LUMEN Scores in clinical/regulatory context | **You / Your Organization** |
| Professional obligations of Authorized Users | **You / Your Organization** |
| LUMEN governance scoring engine (as described in Documentation) | **Forge Partners Inc.** |
| Policy Pack content accuracy (best-effort) | **Forge Partners Inc.** |
| Legislative intelligence monitoring (best-effort) | **Forge Partners Inc.** |
| API availability (per applicable SLA) | **Forge Partners Inc.** |

## 7. FRAMEWORK AND STANDARD ATTRIBUTION

7.1 LUMEN Policy Packs reference and draw upon the following frameworks, regulations, and standards. **Such reference does not imply endorsement by, affiliation with, partnership with, or certification from the organizations that develop or maintain these frameworks:**

**Canadian:**
- Personal Health Information Protection Act, 2004 (PHIPA) — Government of Ontario
- Personal Information Protection and Electronic Documents Act (PIPEDA) — Government of Canada
- Bill C-27 / Artificial Intelligence and Data Act (AIDA) — Parliament of Canada
- Directive on Automated Decision-Making — Treasury Board of Canada Secretariat
- Pan-Canadian Health Data Strategy — Health Canada / Canada Health Infoway

**United States:**
- Health Insurance Portability and Accountability Act (HIPAA) — U.S. Department of Health and Human Services
- AI Risk Management Framework (AI RMF 1.0) — National Institute of Standards and Technology (NIST)
- Artificial Intelligence/Machine Learning (AI/ML)-Based Software as a Medical Device — U.S. Food and Drug Administration (FDA)
- Executive Order on Safe, Secure, and Trustworthy AI — The White House
- State-level AI and privacy legislation (Colorado, California, Virginia, and others)

**International:**
- Coalition for Health AI (CHAI) — Assurance Standards
- ISO/IEC 42001:2023 — AI Management System (International Organization for Standardization)
- Ethics and Governance of Artificial Intelligence for Health — World Health Organization (WHO)
- OECD Principles on Artificial Intelligence — Organisation for Economic Co-operation and Development
- EU Artificial Intelligence Act — European Parliament and Council of the European Union
- IEEE 7000 Series — Ethically Aligned Design (Institute of Electrical and Electronics Engineers)

7.2 All trademarks, service marks, and trade names referenced above are the property of their respective owners.

## 8. JURISDICTIONAL APPLICABILITY

8.1 LUMEN Services are developed and maintained in Ontario, Canada.

8.2 If You use LUMEN Services in a jurisdiction other than Ontario, Canada, You are solely responsible for determining whether and how local laws apply to Your use, including but not limited to:
- Healthcare privacy and data protection laws
- Medical device and health software regulations
- Professional licensing and scope of practice requirements
- AI-specific legislation and governance requirements
- Consumer protection laws
- Cross-border data transfer restrictions

8.3 Forge Partners makes no representation that LUMEN Services are appropriate or available for use in any particular jurisdiction. Availability of Policy Packs for a jurisdiction does not constitute a representation that LUMEN Services comply with that jurisdiction's laws.

## 9. PROFESSIONAL OBLIGATIONS

9.1 If Your Authorized Users include regulated health professionals (including physicians, nurses, pharmacists, allied health professionals, or other licensed or registered practitioners), those individuals remain fully subject to their professional obligations, standards of practice, and codes of ethics.

9.2 Use of LUMEN Services does not modify, limit, or discharge any professional obligation of any Authorized User. Professional standards of care are determined by applicable law, professional colleges, regulatory bodies, and accepted clinical practice — not by LUMEN Scores or Policy Pack configurations.

9.3 No LUMEN output may be cited as a defence to a claim of professional misconduct, negligence, or breach of standard of care.

## 10. ACKNOWLEDGMENT AND CONSENT

**BY CREATING AN ACCOUNT, GENERATING AN API KEY, INSTALLING THE SDK, OR OTHERWISE USING LUMEN SERVICES, YOU ACKNOWLEDGE AND CONSENT THAT:**

10.1 You have read this Healthcare Disclaimer in its entirety and understand its contents.

10.2 You understand that LUMEN is a governance support tool — not a medical device, clinical decision support system, legal advisor, or compliance certification service.

10.3 You accept sole and exclusive responsibility for all clinical decisions, patient outcomes, and regulatory compliance associated with Your use of AI systems evaluated by LUMEN.

10.4 You will not submit PHI or patient PII to LUMEN Services.

10.5 You will engage qualified legal counsel to advise on the regulatory implications of deploying LUMEN in Your specific environment.

10.6 You will validate that selected Policy Packs are appropriate for Your jurisdiction, use case, and organizational requirements.

10.7 You will not represent LUMEN Scores, Certificates, or Records as regulatory approvals, compliance certifications, or evidence of clinical safety.

10.8 You understand that Forge Partners Inc. bears no responsibility for clinical outcomes or regulatory consequences arising from Your use of LUMEN Services.

---

**Questions regarding this Healthcare Disclaimer should be directed to:**

**Forge Partners Inc.**  
Toronto, Ontario, Canada  
legal@forgehealth.ai

**For security vulnerabilities:** security@forgehealth.ai (see SECURITY.md)

---

© 2026 Forge Partners Inc. All rights reserved.

*This disclaimer was prepared with reference to applicable Canadian federal and Ontario provincial law, U.S. federal law, and relevant international frameworks. Organizations operating in other jurisdictions should seek independent legal advice regarding the applicability of this disclaimer to their specific circumstances.*
