"""
Policy pack definitions for LUMEN SDK API.

Comprehensive compliance packs for healthcare AI systems with realistic regulatory checks
referencing actual sections of laws and regulations.

Copyright 2026 Forge Partners Inc.
"""

from typing import Dict, List, Any

PACKS: Dict[str, Dict[str, Any]] = {
    "ca-on-phipa": {
        "name": "Ontario PHIPA Healthcare Pack",
        "jurisdiction": "Canada — Ontario",
        "version": "v2026-Q1-r3",
        "tier": "free",
        "frameworks": ["PHIPA", "PIPEDA", "NIST AI RMF"],
        "checks": [
            {
                "checkId": "phipa-001",
                "name": "Consent Verification",
                "severity": "critical",
                "description": "Verify patient consent for AI-assisted decision per PHIPA s.18"
            },
            {
                "checkId": "phipa-002", 
                "name": "Data Residency",
                "severity": "critical",
                "description": "Verify data remains within Canadian jurisdiction per PHIPA s.10"
            },
            {
                "checkId": "phipa-003",
                "name": "Minimum Necessary",
                "severity": "high",
                "description": "Ensure only minimum necessary PHI accessed per PHIPA s.30"
            },
            {
                "checkId": "phipa-004",
                "name": "Custodian Accountability",
                "severity": "critical",
                "description": "Verify health information custodian accountability per PHIPA s.11"
            },
            {
                "checkId": "phipa-005",
                "name": "Disclosure Limits",
                "severity": "high",
                "description": "Validate disclosure limitations per PHIPA s.37-38"
            },
            {
                "checkId": "phipa-006",
                "name": "Access Controls",
                "severity": "high", 
                "description": "Verify appropriate access controls per PHIPA s.13"
            },
            {
                "checkId": "phipa-007",
                "name": "Accuracy Requirements",
                "severity": "medium",
                "description": "Check information accuracy standards per PHIPA s.14"
            },
            {
                "checkId": "phipa-008",
                "name": "Retention Limits",
                "severity": "medium",
                "description": "Validate data retention compliance per PHIPA s.15"
            },
            {
                "checkId": "phipa-009",
                "name": "Third Party Agreements",
                "severity": "high",
                "description": "Verify information agent agreements per PHIPA s.17"
            },
            {
                "checkId": "phipa-010",
                "name": "Breach Notification",
                "severity": "critical",
                "description": "Check privacy breach handling per PHIPA s.12.1"
            },
            {
                "checkId": "phipa-011",
                "name": "Patient Access Rights",
                "severity": "medium",
                "description": "Validate patient access provisions per PHIPA s.52"
            },
            {
                "checkId": "phipa-012",
                "name": "Correction Rights",
                "severity": "medium",
                "description": "Ensure correction process compliance per PHIPA s.55"
            },
            {
                "checkId": "phipa-013",
                "name": "Circle of Care",
                "severity": "high",
                "description": "Verify circle of care provisions per PHIPA s.20"
            },
            {
                "checkId": "phipa-014",
                "name": "Administrative Safeguards",
                "severity": "high",
                "description": "Check administrative safeguards per PHIPA Regulation 329/04"
            },
            {
                "checkId": "phipa-015",
                "name": "Technical Safeguards",
                "severity": "critical",
                "description": "Verify technical safeguards per PHIPA Regulation 329/04"
            }
        ]
    },
    
    "us-fed-hipaa": {
        "name": "US Federal HIPAA Compliance Pack",
        "jurisdiction": "United States — Federal",
        "version": "v2026-Q1-r3",
        "tier": "free",
        "frameworks": ["HIPAA", "HITECH", "NIST AI RMF"],
        "checks": [
            {
                "checkId": "hipaa-001",
                "name": "Minimum Necessary Standard",
                "severity": "critical",
                "description": "Ensure minimum necessary PHI use per 45 CFR 164.502(b)"
            },
            {
                "checkId": "hipaa-002",
                "name": "Business Associate Agreement",
                "severity": "critical", 
                "description": "Verify BAA compliance per 45 CFR 164.502(e)"
            },
            {
                "checkId": "hipaa-003",
                "name": "Authorization Requirements",
                "severity": "critical",
                "description": "Check authorization validity per 45 CFR 164.508"
            },
            {
                "checkId": "hipaa-004",
                "name": "Access Controls",
                "severity": "critical",
                "description": "Verify access control standards per 45 CFR 164.312(a)"
            },
            {
                "checkId": "hipaa-005",
                "name": "Audit Controls",
                "severity": "high",
                "description": "Check audit control implementation per 45 CFR 164.312(b)"
            },
            {
                "checkId": "hipaa-006",
                "name": "Integrity Controls",
                "severity": "high",
                "description": "Verify data integrity per 45 CFR 164.312(c)"
            },
            {
                "checkId": "hipaa-007",
                "name": "Transmission Security",
                "severity": "critical",
                "description": "Check transmission security per 45 CFR 164.312(e)"
            },
            {
                "checkId": "hipaa-008",
                "name": "Encryption Standards",
                "severity": "high",
                "description": "Verify encryption implementation per 45 CFR 164.312(a)(2)(iv)"
            },
            {
                "checkId": "hipaa-009",
                "name": "De-identification Standards",
                "severity": "high",
                "description": "Check de-identification methods per 45 CFR 164.514"
            },
            {
                "checkId": "hipaa-010",
                "name": "Breach Notification",
                "severity": "critical",
                "description": "Verify breach notification per 45 CFR 164.400"
            },
            {
                "checkId": "hipaa-011",
                "name": "Individual Rights",
                "severity": "high",
                "description": "Ensure individual access rights per 45 CFR 164.524"
            },
            {
                "checkId": "hipaa-012",
                "name": "Amendment Rights",
                "severity": "medium",
                "description": "Check amendment process per 45 CFR 164.526"
            },
            {
                "checkId": "hipaa-013",
                "name": "Accounting Disclosures",
                "severity": "medium",
                "description": "Verify disclosure accounting per 45 CFR 164.528"
            },
            {
                "checkId": "hipaa-014",
                "name": "Administrative Safeguards",
                "severity": "high",
                "description": "Check administrative safeguards per 45 CFR 164.308"
            },
            {
                "checkId": "hipaa-015",
                "name": "Physical Safeguards",
                "severity": "high",
                "description": "Verify physical safeguards per 45 CFR 164.310"
            },
            {
                "checkId": "hipaa-016",
                "name": "Workforce Training",
                "severity": "medium",
                "description": "Check workforce training per 45 CFR 164.308(a)(5)"
            },
            {
                "checkId": "hipaa-017",
                "name": "Contingency Plan",
                "severity": "high",
                "description": "Verify contingency planning per 45 CFR 164.308(a)(7)"
            },
            {
                "checkId": "hipaa-018",
                "name": "Risk Assessment",
                "severity": "high",
                "description": "Check risk assessment per 45 CFR 164.308(a)(1)"
            }
        ]
    },
    
    "ca-fed-pipeda": {
        "name": "Canada Federal PIPEDA Pack",
        "jurisdiction": "Canada — Federal",
        "version": "v2026-Q1-r3",
        "tier": "free",
        "frameworks": ["PIPEDA", "NIST AI RMF"],
        "checks": [
            {
                "checkId": "pipeda-001",
                "name": "Consent Requirements",
                "severity": "critical",
                "description": "Verify meaningful consent per PIPEDA Principle 3"
            },
            {
                "checkId": "pipeda-002",
                "name": "Purpose Limitation",
                "severity": "high",
                "description": "Check purpose specification per PIPEDA Principle 2"
            },
            {
                "checkId": "pipeda-003",
                "name": "Collection Limitation",
                "severity": "high",
                "description": "Verify collection limits per PIPEDA Principle 4"
            },
            {
                "checkId": "pipeda-004",
                "name": "Use Limitation",
                "severity": "high",
                "description": "Check use restrictions per PIPEDA Principle 5"
            },
            {
                "checkId": "pipeda-005",
                "name": "Disclosure Limitation",
                "severity": "high",
                "description": "Verify disclosure limits per PIPEDA Principle 6"
            },
            {
                "checkId": "pipeda-006",
                "name": "Accuracy Requirements",
                "severity": "medium",
                "description": "Check accuracy standards per PIPEDA Principle 6"
            },
            {
                "checkId": "pipeda-007",
                "name": "Safeguards",
                "severity": "critical",
                "description": "Verify security safeguards per PIPEDA Principle 7"
            },
            {
                "checkId": "pipeda-008",
                "name": "Openness",
                "severity": "medium",
                "description": "Check transparency requirements per PIPEDA Principle 8"
            },
            {
                "checkId": "pipeda-009",
                "name": "Individual Access",
                "severity": "high",
                "description": "Verify access rights per PIPEDA Principle 9"
            },
            {
                "checkId": "pipeda-010",
                "name": "Challenging Compliance",
                "severity": "medium",
                "description": "Check complaint mechanisms per PIPEDA Principle 10"
            },
            {
                "checkId": "pipeda-011",
                "name": "Cross-Border Transfers",
                "severity": "high",
                "description": "Verify transfer protections per PIPEDA s.4.1.3"
            },
            {
                "checkId": "pipeda-012",
                "name": "Breach Notification",
                "severity": "critical",
                "description": "Check breach reporting per PIPEDA s.10.1"
            }
        ]
    },
    
    "us-fed-fda-aiml": {
        "name": "US FDA AI/ML Medical Device Pack",
        "jurisdiction": "United States — FDA",
        "version": "v2026-Q1-r3",
        "tier": "pro",
        "frameworks": ["FDA AI/ML Guidance", "ISO 14155", "ISO 13485"],
        "checks": [
            {
                "checkId": "fda-001",
                "name": "Software as Medical Device",
                "severity": "critical",
                "description": "Verify SaMD classification per FDA Digital Health Guidelines"
            },
            {
                "checkId": "fda-002",
                "name": "Clinical Validation",
                "severity": "critical",
                "description": "Check clinical validation per FDA AI/ML Guidance 2021"
            },
            {
                "checkId": "fda-003",
                "name": "Algorithm Change Control",
                "severity": "high",
                "description": "Verify change control per FDA PCCP Framework"
            },
            {
                "checkId": "fda-004",
                "name": "Real-World Monitoring",
                "severity": "high",
                "description": "Check RWM plan per FDA AI/ML Action Plan"
            },
            {
                "checkId": "fda-005",
                "name": "Bias Assessment",
                "severity": "critical",
                "description": "Verify bias evaluation per FDA AI Bias Guidance"
            },
            {
                "checkId": "fda-006",
                "name": "Explainability",
                "severity": "high",
                "description": "Check AI explainability per FDA Interpretability Guidance"
            },
            {
                "checkId": "fda-007",
                "name": "Training Data Quality",
                "severity": "critical",
                "description": "Verify training data per FDA ML Data Guidelines"
            },
            {
                "checkId": "fda-008",
                "name": "Performance Monitoring",
                "severity": "high",
                "description": "Check performance tracking per FDA PCCP"
            },
            {
                "checkId": "fda-009",
                "name": "Risk Management",
                "severity": "critical",
                "description": "Verify risk controls per ISO 14971 and FDA"
            },
            {
                "checkId": "fda-010",
                "name": "Human Factors",
                "severity": "high",
                "description": "Check usability per FDA Human Factors Guidance"
            },
            {
                "checkId": "fda-011",
                "name": "Cybersecurity",
                "severity": "critical",
                "description": "Verify cybersecurity per FDA Cybersecurity Guidelines"
            },
            {
                "checkId": "fda-012",
                "name": "Labeling Requirements",
                "severity": "high",
                "description": "Check AI labeling per FDA Digital Health Guidance"
            },
            {
                "checkId": "fda-013",
                "name": "510(k) Predicate",
                "severity": "medium",
                "description": "Verify predicate comparison per FDA 510(k) AI Guidance"
            },
            {
                "checkId": "fda-014",
                "name": "Post-Market Surveillance",
                "severity": "high",
                "description": "Check surveillance plan per FDA MDSR requirements"
            }
        ]
    },
    
    "us-fed-nist-ai": {
        "name": "NIST AI Risk Management Pack",
        "jurisdiction": "United States — Federal",
        "version": "v2026-Q1-r3",
        "tier": "free",
        "frameworks": ["NIST AI RMF 1.0", "NIST Cybersecurity Framework"],
        "checks": [
            {
                "checkId": "nist-001",
                "name": "AI Risk Governance",
                "severity": "critical",
                "description": "Verify governance structure per NIST AI RMF GOVERN function"
            },
            {
                "checkId": "nist-002",
                "name": "Human-AI Configuration",
                "severity": "high",
                "description": "Check human-AI teaming per NIST AI RMF MAP-1.1"
            },
            {
                "checkId": "nist-003",
                "name": "Impact Assessment",
                "severity": "high",
                "description": "Verify impact analysis per NIST AI RMF MAP-1.2"
            },
            {
                "checkId": "nist-004",
                "name": "AI System Categorization",
                "severity": "medium",
                "description": "Check system categorization per NIST AI RMF MAP-1.3"
            },
            {
                "checkId": "nist-005",
                "name": "Risk Tolerance",
                "severity": "high",
                "description": "Verify risk tolerance per NIST AI RMF MAP-1.4"
            },
            {
                "checkId": "nist-006",
                "name": "Data Quality",
                "severity": "critical",
                "description": "Check data quality per NIST AI RMF MEASURE-2.1"
            },
            {
                "checkId": "nist-007",
                "name": "Performance Monitoring",
                "severity": "high",
                "description": "Verify monitoring per NIST AI RMF MEASURE-2.2"
            },
            {
                "checkId": "nist-008",
                "name": "Risk Controls",
                "severity": "critical",
                "description": "Check risk controls per NIST AI RMF MANAGE-1.1"
            },
            {
                "checkId": "nist-009",
                "name": "Incident Response",
                "severity": "high",
                "description": "Verify incident response per NIST AI RMF MANAGE-1.2"
            },
            {
                "checkId": "nist-010",
                "name": "Continuous Improvement",
                "severity": "medium",
                "description": "Check improvement process per NIST AI RMF MANAGE-1.3"
            }
        ]
    },
    
    "eu-ai-act": {
        "name": "EU AI Act Compliance Pack",
        "jurisdiction": "European Union",
        "version": "v2026-Q1-r3",
        "tier": "pro",
        "frameworks": ["EU AI Act", "GDPR", "MDR"],
        "checks": [
            {
                "checkId": "ai-act-001",
                "name": "AI System Classification",
                "severity": "critical",
                "description": "Verify risk classification per EU AI Act Article 6"
            },
            {
                "checkId": "ai-act-002",
                "name": "Prohibited Practices",
                "severity": "critical",
                "description": "Check prohibited AI per EU AI Act Article 5"
            },
            {
                "checkId": "ai-act-003",
                "name": "High-Risk Requirements",
                "severity": "critical",
                "description": "Verify high-risk compliance per EU AI Act Chapter 3"
            },
            {
                "checkId": "ai-act-004",
                "name": "Data Governance",
                "severity": "critical",
                "description": "Check data governance per EU AI Act Article 10"
            },
            {
                "checkId": "ai-act-005",
                "name": "Technical Documentation",
                "severity": "high",
                "description": "Verify documentation per EU AI Act Article 11"
            },
            {
                "checkId": "ai-act-006",
                "name": "Record Keeping",
                "severity": "high",
                "description": "Check record keeping per EU AI Act Article 12"
            },
            {
                "checkId": "ai-act-007",
                "name": "Transparency Requirements",
                "severity": "high",
                "description": "Verify transparency per EU AI Act Article 13"
            },
            {
                "checkId": "ai-act-008",
                "name": "Human Oversight",
                "severity": "critical",
                "description": "Check human oversight per EU AI Act Article 14"
            },
            {
                "checkId": "ai-act-009",
                "name": "Accuracy Requirements",
                "severity": "high",
                "description": "Verify accuracy standards per EU AI Act Article 15"
            },
            {
                "checkId": "ai-act-010",
                "name": "Robustness Testing",
                "severity": "high",
                "description": "Check robustness per EU AI Act Article 15"
            },
            {
                "checkId": "ai-act-011",
                "name": "Cybersecurity",
                "severity": "critical",
                "description": "Verify cybersecurity per EU AI Act Article 15"
            },
            {
                "checkId": "ai-act-012",
                "name": "Bias Mitigation",
                "severity": "critical",
                "description": "Check bias controls per EU AI Act Article 10"
            },
            {
                "checkId": "ai-act-013",
                "name": "Conformity Assessment",
                "severity": "critical",
                "description": "Verify conformity per EU AI Act Article 43"
            },
            {
                "checkId": "ai-act-014",
                "name": "CE Marking",
                "severity": "critical",
                "description": "Check CE marking per EU AI Act Article 48"
            },
            {
                "checkId": "ai-act-015",
                "name": "Post-Market Monitoring",
                "severity": "high",
                "description": "Verify monitoring per EU AI Act Article 72"
            },
            {
                "checkId": "ai-act-016",
                "name": "Incident Reporting",
                "severity": "critical",
                "description": "Check incident reporting per EU AI Act Article 73"
            }
        ]
    }
}


def get_all_packs() -> Dict[str, Dict[str, Any]]:
    """
    Get all available policy packs.
    
    Returns:
        Dict: All policy pack definitions
    """
    return PACKS


def get_pack_by_id(pack_id: str) -> Dict[str, Any] | None:
    """
    Get a specific policy pack by ID.
    
    Args:
        pack_id: Policy pack identifier
        
    Returns:
        Dict | None: Policy pack definition if found, None otherwise
    """
    return PACKS.get(pack_id)


def get_packs_by_tier(tier: str) -> Dict[str, Dict[str, Any]]:
    """
    Get policy packs filtered by tier.
    
    Args:
        tier: Tier to filter by ('free' or 'pro')
        
    Returns:
        Dict: Policy packs for the specified tier
    """
    return {
        pack_id: pack_data 
        for pack_id, pack_data in PACKS.items() 
        if pack_data.get("tier") == tier
    }


def get_pack_summary() -> List[Dict[str, Any]]:
    """
    Get summary information for all packs.
    
    Returns:
        List: Summary of all policy packs
    """
    summaries = []
    for pack_id, pack_data in PACKS.items():
        summaries.append({
            "pack_id": pack_id,
            "name": pack_data["name"],
            "jurisdiction": pack_data["jurisdiction"],
            "version": pack_data["version"],
            "tier": pack_data["tier"],
            "frameworks": pack_data["frameworks"],
            "checks_count": len(pack_data["checks"])
        })
    return summaries