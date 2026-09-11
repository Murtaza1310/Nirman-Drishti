"""
SIH Problem Statement 26103 (MoSPI - IPMD)
Prescriptive Decision-Support Engine & Multi-Level Escalation Matrix
"""

from typing import Dict, Any, List

# -------------------------------------------------------------------------
# SOP Knowledge Base mapped to Government of India Regulatory Frameworks
# (PM GatiShakti, RFCTLARR Act 2013, PARIVESH 2.0, CVC Procurement Manual)
# -------------------------------------------------------------------------
MITIGATION_PROTOCOLS = {
    "Land Acquisition & Right of Way": {
        "regulatory_framework": "RFCTLARR Act 2013 & National PM GatiShakti RoW Rules",
        "immediate_actions": [
            "Trigger Section 19 declaration under RFCTLARR Act 2013 for expedited possession.",
            "Integrate parcel cadastral data onto PM GatiShakti NMP (National Master Plan) portal for GIS overlay.",
            "Convene emergency District Level Land Purchase Committee (DLLPC) meeting under District Collector.",
            "Fast-track compensation disbursement via Direct Benefit Transfer (DBT) / Bhoomi Rashi portal to eliminate court injunctions."
        ],
        "statutory_timeline_days": 21,
        "primary_accountable_authority": "District Magistrate / Competent Authority for Land Acquisition (CALA)"
    },
    "Forest & Environmental Clearances": {
        "regulatory_framework": "Forest Conservation Amendment Act 2023 & PARIVESH 2.0 Portal",
        "immediate_actions": [
            "Submit pending Stage-I compliance conditions on PARIVESH 2.0 single-window platform.",
            "Expedite Compensatory Afforestation (CA) land mutation and deposit Net Present Value (NPV) into CAMPA account.",
            "Request special dispensation from Regional Empowered Committee (REC), MoEF&CC for linear project tree-felling permission.",
            "Engage State Wildlife Warden for mitigation plan approval if intersecting eco-sensitive buffer zones."
        ],
        "statutory_timeline_days": 30,
        "primary_accountable_authority": "State Principal Chief Conservator of Forests (PCCF) & MoEF&CC Nodal Officer"
    },
    "Fund Constraint & Financial Stress": {
        "regulatory_framework": "General Financial Rules (GFR) 2017 & Dept of Expenditure (DoE) OM",
        "immediate_actions": [
            "Initiate Revised Cost Estimate (RCE) memorandum for Public Investment Board (PIB) / Cabinet Committee on Economic Affairs (CCEA).",
            "Audit financial vs physical progress S-curve divergence to detect contractor fund misallocation.",
            "Release verified milestone payment tranches within 7 business days to restore contractor working capital.",
            "Review mobilization advance against unconditional bank guarantees under GFR Rule 172."
        ],
        "statutory_timeline_days": 14,
        "primary_accountable_authority": "Integrated Finance Division (IFD) & Ministry Financial Advisor"
    },
    "Contractor / Vendor Non-Performance": {
        "regulatory_framework": "FIDIC / Standard EPC Contract Conditions & CVC Guidelines",
        "immediate_actions": [
            "Issue 14-day statutory Cure Period Notice under General Conditions of Contract (GCC).",
            "Conduct joint site physical audit by Authority Engineer / Independent Engineer (AE/IE).",
            "Invoke Clause for deployment of supplementary machinery/manpower at contractor risk and cost.",
            "Evaluate selective encashment of Performance Security if critical path milestones are missed by > 30%."
        ],
        "statutory_timeline_days": 14,
        "primary_accountable_authority": "Project Director / Executive Engineer (Executing Agency)"
    },
    "Scope & Engineering Design Modifications": {
        "regulatory_framework": "Ministry Technical Sanction Manual & CVC Variation Thresholds",
        "immediate_actions": [
            "Refer structural alignment revision to Proof Consultant / IIT Technical Advisory panel.",
            "Freeze further scope variations beyond statutory 10% limit without inter-departmental consensus.",
            "Obtain fast-track in-principle approval from Central Electricity Authority (CEA) / IRC Technical Committee.",
            "Issue variation order with revised bill of quantities (BOQ) within 15 calendar days."
        ],
        "statutory_timeline_days": 21,
        "primary_accountable_authority": "Chief Engineer / Member Projects"
    },
    "Administrative & Inter-Agency Coordination": {
        "regulatory_framework": "Cabinet Secretariat PRAGATI & Committee of Secretaries (CoS) Guidelines",
        "immediate_actions": [
            "Issue urgent inter-ministerial utility shifting requisition (water pipelines, high-voltage lines, optic fiber).",
            "Convene State Level Empowered Committee (SLEC) chaired by State Chief Secretary.",
            "Appoint dedicated State Nodal Officer to resolve joint inspection deadlocks.",
            "Submit bi-weekly status flash note directly to MoSPI IPMD monitoring cell."
        ],
        "statutory_timeline_days": 10,
        "primary_accountable_authority": "MoSPI Infrastructure & Project Monitoring Division (IPMD)"
    },
    "On Schedule": {
        "regulatory_framework": "Standard MoSPI Routine Project Monitoring Framework",
        "immediate_actions": [
            "Maintain current milestone run-rate and continuous monthly reporting on OCMS / PAIMANA.",
            "Conduct proactive vendor logistics verification for forthcoming long-lead packages.",
            "Monitor financial vs physical progress convergence within standard 5% tolerance band."
        ],
        "statutory_timeline_days": 60,
        "primary_accountable_authority": "Resident Project Manager"
    }
}


def determine_escalation_tier(risk_level: str, delay_months: float, cost_cr: float, gap_pct: float) -> Dict[str, Any]:
    """
    Computes the 3-Tier Multi-Level Administrative Escalation Matrix.
    """
    # Tier 3: Apex Level (PMO PRAGATI / Union Cabinet Committee)
    # Mega projects (> ₹1,000 Cr) with high delay, or critical delay > 18 months
    if (cost_cr >= 1000.0 and delay_months >= 12.0) or delay_months >= 24.0 or (risk_level == "High" and gap_pct >= 25.0):
        return {
            "tier": "Tier 3: Apex PRAGATI Review (PMO Level)",
            "escalation_target": "Prime Minister's Office (PRAGATI) & Cabinet Secretary",
            "action_urgency": "CRITICAL / IMMEDIATE ACTION (Within 72 Hours)",
            "urgency_score": 95,
            "governance_mechanism": "Direct monthly agenda review by PM with concerned State Chief Secretaries and Union Secretaries."
        }

    # Tier 2: Ministerial & Inter-Ministerial (MoSPI IPMD / Committee of Secretaries)
    if risk_level in ["High", "Medium"] or delay_months >= 6.0 or gap_pct >= 15.0 or cost_cr >= 500.0:
        return {
            "tier": "Tier 2: Ministerial & Inter-Ministerial Review (MoSPI IPMD)",
            "escalation_target": "Secretary, MoSPI & Inter-Ministerial Empowered Committee",
            "action_urgency": "HIGH PRIORITY (Within 7 Business Days)",
            "urgency_score": 75,
            "governance_mechanism": "State-level Empowered Committee (SLEC) review chaired by State Chief Secretary with Union Nodal Officers."
        }

    # Tier 1: Project Implementing Agency (PIA) Internal Execution
    return {
        "tier": "Tier 1: Implementing Agency Operational Level",
        "escalation_target": "Project Director / Chief Engineer (NHAI / RVNL / NTPC / Executing Agency)",
        "action_urgency": "STANDARD SUPERVISORY MONITORING",
        "urgency_score": 35,
        "governance_mechanism": "Routine fortnightly project review meeting and contractor milestone audit."
    }


def generate_prescriptive_plan(
    project_name: str,
    risk_level: str,
    delay_months: float,
    root_cause: str,
    cost_cr: float = 500.0,
    gap_pct: float = 0.0,
    state: str = "Multi-State / Central",
    sector: str = "Road Transport & Highways"
) -> Dict[str, Any]:
    """
    Generates an actionable, executive prescriptive action plan combining
    regulatory SOP checklists and administrative escalation level.
    """
    protocol = MITIGATION_PROTOCOLS.get(root_cause, MITIGATION_PROTOCOLS["Administrative & Inter-Agency Coordination"])
    escalation = determine_escalation_tier(risk_level, delay_months, cost_cr, gap_pct)

    # Anomaly warnings
    anomaly_warnings = []
    if gap_pct >= 15.0:
        anomaly_warnings.append(
            f"WARNING: Financial expenditure exceeds physical completion by {gap_pct:.1f}%. Risk of contractor liquidity exhaustion!"
        )
    if delay_months >= 18.0:
        anomaly_warnings.append(
            f"CRITICAL: Project has exceeded timeline by {delay_months:.1f} months. Requires statutory Revised Cost Estimate (RCE) appraisal."
        )

    return {
        "project_name": project_name,
        "risk_classification": risk_level,
        "forecasted_delay_months": round(float(delay_months), 1),
        "forecasted_delay_days": int(round(float(delay_months) * 30.4)),
        "diagnosed_root_cause": root_cause,
        "regulatory_framework": protocol["regulatory_framework"],
        "accountable_authority": protocol["primary_accountable_authority"],
        "compliance_window_days": protocol["statutory_timeline_days"],
        "immediate_action_checklist": protocol["immediate_actions"],
        "escalation_tier": escalation["tier"],
        "escalation_target": escalation["escalation_target"],
        "action_urgency": escalation["action_urgency"],
        "urgency_score": escalation["urgency_score"],
        "governance_mechanism": escalation["governance_mechanism"],
        "anomaly_warnings": anomaly_warnings
    }

if __name__ == "__main__":
    # Test simulation
    plan = generate_prescriptive_plan(
        project_name="DELHI-AMRITSAR-KATRA EXPRESSWAY (PACKAGE-IV)",
        risk_level="High",
        delay_months=22.5,
        root_cause="Land Acquisition & Right of Way",
        cost_cr=4500.0,
        gap_pct=28.5,
        state="Punjab",
        sector="Road Transport & Highways"
    )
    import json
    print(json.dumps(plan, indent=2))
