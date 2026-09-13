"""
SIH 2026 - Problem Statement 26103 (MoSPI)
Integrated Project-Monitoring Platform: Prescriptive Decision Engine
---------------------------------------------------------------------
Transforms predictive outputs (Predicted Delay, Risk Level, Root Cause, S-Curve Gap)
into actionable administrative directives, statutory SOP workflows, multi-level
escalation triggers, and quantitative "What-If" scenario simulations.
"""

import json
from dataclasses import dataclass
from typing import List, Dict, Any, Optional

@dataclass
class ProjectPrediction:
    project_code: str
    project_name: str
    agency: str
    original_cost_cr: float
    anticipated_cost_cr: float
    predicted_delay_months: float
    predicted_risk_level: str  # 'Low', 'Medium', 'High'
    root_cause: str
    financial_vs_physical_gap: float  # expenditure % - physical progress %

# Statutory SOP Playbook mapped to Government of India Regulatory Frameworks
SOP_ACTION_PLAYBOOK = {
    "Land Acquisition & Right of Way": {
        "framework": "RFCTLARR Act 2013 (Right to Fair Compensation in Land Acquisition) & State Direct Purchase Rules",
        "immediate_actions": [
            "Trigger District Level Land Purchase Committee (DLLPC) for direct private negotiation to bypass prolonged compulsory acquisition.",
            "Verify publication status of Section 11 (preliminary notification) and Section 19 (declaration of public purpose) under RFCTLARR Act.",
            "Establish dedicated land escrow account and deposit 100% compensation + 100% solatium for immediate land handover."
        ],
        "statutory_milestones": [
            "Joint Land Measurement Survey (JLMS) within 21 days.",
            "Disbursement of Resettlement & Rehabilitation (R&R) awards under Section 31.",
            "Formal physical possession certificate issuance by District Collector."
        ],
        "escalation_tier": {
            "Low": "Project Director coordinates with District Revenue Officer (SDM).",
            "Medium": "Divisional Commissioner / State Secretary (Revenue) intervention.",
            "High": "Escalate to PMG (Project Monitoring Group) / Cabinet Secretariat & State Chief Secretary via PRAGATI review."
        },
        "recovery_factor_per_month_expedited": 0.85
    },
    "Forest & Environmental Clearance": {
        "framework": "Forest (Conservation) Act 1980 & MoEFCC PARIVESH 2.0 Clearance Workflow",
        "immediate_actions": [
            "Fast-track Stage-II approval through State Level Expert Appraisal Committee (SEAC) on PARIVESH portal.",
            "Coordinate with State Forest Department to identify non-forest land for Compensatory Afforestation (CA) within 30 days.",
            "Transfer necessary NPV (Net Present Value) and CA funds into State CAMPA account."
        ],
        "statutory_milestones": [
            "Fulfillment of Stage-I 16-point compliance certificate.",
            "Final Tree Felling Permission (TFP) under Working Plan Code.",
            "MoEFCC Regional Office site inspection & Stage-II clearance issuance."
        ],
        "escalation_tier": {
            "Low": "Liaison Officer with Divisional Forest Officer (DFO).",
            "Medium": "Principal Chief Conservator of Forests (PCCF) monthly state review.",
            "High": "MoEFCC Central Forest Advisory Committee (FAC) fast-track docket & PMG portal flag."
        },
        "recovery_factor_per_month_expedited": 0.90
    },
    "Contractor / Vendor Underperformance": {
        "framework": "General Conditions of Contract (GCC), FIDIC Pink Book & CVC Guidelines",
        "immediate_actions": [
            "Issue formal 14-day Cure Notice under GCC Clause 63 / Default Clause.",
            "Conduct joint plant, machinery, and manpower deployment audit against baseline DPR schedule.",
            "Invoke interim Liquidated Damages (LD) at 0.5% per week of delay (capped at 10% contract value)."
        ],
        "statutory_milestones": [
            "Submission of revised resource mobilization plan within 10 days.",
            "Offloading of delayed milestone components to secondary subcontractor at contractor risk and cost.",
            "Contract termination and invocation of Performance Bank Guarantee (PBG) if no progress within 28 days."
        ],
        "escalation_tier": {
            "Low": "Engineer-in-Charge enforces milestone recovery plan.",
            "Medium": "CMD / Board of Directors review of implementing PSU.",
            "High": "Debarment / Blacklisting proposal submitted under GFR 2017 Rule 151; Fast-track retendering."
        },
        "recovery_factor_per_month_expedited": 0.70
    },
    "Fund Constraint & Financing": {
        "framework": "GFR 2017 Rule 140, Revised Cost Estimate (RCE) Guidelines & Department of Expenditure",
        "immediate_actions": [
            "Prepare and submit Revised Cost Estimate (RCE-I/II) to Public Investment Board (PIB) / EFC.",
            "Seek interim liquidity line or bridge financing from sovereign infrastructure funds (NIIF / PFC / REC).",
            "Reallocate unspent budget from delayed auxiliary components to critical path packages."
        ],
        "statutory_milestones": [
            "Inter-ministerial Appraisal Committee review within 30 days.",
            "Cabinet Committee on Economic Affairs (CCEA) approval for revised outlay.",
            "Release of budget allocation via Single Nodal Agency (SNA) / Treasury portal."
        ],
        "escalation_tier": {
            "Low": "Internal financial advisor budget reallocation.",
            "Medium": "Secretary of Administrative Ministry & Expenditure Secretary meeting.",
            "High": "Cabinet Committee on Economic Affairs (CCEA) / Finance Minister special sanction."
        },
        "recovery_factor_per_month_expedited": 0.80
    },
    "Legal / Court Litigation": {
        "framework": "Commercial Courts Act 2015 & Arbitration and Conciliation (Amendment) Act 2019",
        "immediate_actions": [
            "File urgent application for vacation of stay under Article 226 citing Section 20A of Specific Relief Act (prohibiting injunctions on infrastructure projects).",
            "File caveat in appellate courts / High Court Division Bench.",
            "Refer commercial dispute to Conciliation Committee of Independent Experts (CCIE) for out-of-court mediation."
        ],
        "statutory_milestones": [
            "Submission of Counter Affidavit within 14 days.",
            "Hearing in designated Commercial Division / High Court green bench.",
            "Execution of binding conciliation settlement agreement."
        ],
        "escalation_tier": {
            "Low": "Government Standing Counsel urgent listing motion.",
            "Medium": "Solicitor General / Additional Solicitor General brief.",
            "High": "Inter-Ministerial Legal Cell escalation & Special Leave Petition (SLP) in Supreme Court."
        },
        "recovery_factor_per_month_expedited": 0.75
    },
    "Scope & Design Changes": {
        "framework": "MoRTH / Indian Road Congress (IRC) / CEA Technical Audit Guidelines",
        "immediate_actions": [
            "Appoint Third-Party Technical Auditor (IIT / NIT) for geo-technical and structural design review.",
            "Freeze all non-essential variation orders; validate Scope Modification Matrix.",
            "Issue revised Good for Construction (GFC) drawings for critical-path foundation works within 21 days."
        ],
        "statutory_milestones": [
            "Finalization of Geo-technical investigation report.",
            "Technical Advisory Committee (TAC) sign-off on design amendment.",
            "Approval of Variation Order within statutory 15% budget tolerance."
        ],
        "escalation_tier": {
            "Low": "Chief Engineer / Design Consultant technical workshop.",
            "Medium": "Technical Member / Director of executing PSU.",
            "High": "National Technical Advisory Committee review."
        },
        "recovery_factor_per_month_expedited": 0.85
    },
    "General Execution Delay": {
        "framework": "MoSPI Project Monitoring Guidelines & PMG Best Practices",
        "immediate_actions": [
            "Crash the critical path (Fast-tracking / Crashing method): introduce double-shift working hours.",
            "Deploy IoT-based site monitoring / drone surveillance for daily progress tracking.",
            "Resolve inter-agency utility conflicts (power transmission line / water mains relocation)."
        ],
        "statutory_milestones": [
            "Revised Milestone S-curve baseline agreed by all contractors.",
            "Bi-weekly digital compliance report submitted to MoSPI PMD.",
            "Quarterly physical milestone audit by independent inspection agency."
        ],
        "escalation_tier": {
            "Low": "Field Project Director daily review.",
            "Medium": "Ministry Nodal Officer fortnightly coordination meeting.",
            "High": "MoSPI IPMD Flash Report red flag & PMG monthly agenda item."
        },
        "recovery_factor_per_month_expedited": 0.75
    }
}

class PrescriptiveDecisionEngine:
    def __init__(self):
        self.playbook = SOP_ACTION_PLAYBOOK

    def generate_recommendations(self, pred: ProjectPrediction) -> Dict[str, Any]:
        cause_key = self._match_cause(pred.root_cause)
        sop = self.playbook.get(cause_key, self.playbook["General Execution Delay"])
        escalation_level = sop["escalation_tier"].get(pred.predicted_risk_level, sop["escalation_tier"]["Medium"])
        
        anomaly_warning = None
        if pred.financial_vs_physical_gap > 20.0:
            anomaly_warning = (
                f"S-CURVE ANOMALY DETECTED: Budget burn rate exceeds physical progress by "
                f"{pred.financial_vs_physical_gap:.1f}%. Immediate physical audit recommended before next milestone payment disbursement."
            )
            
        return {
            "project_metadata": {
                "project_code": pred.project_code,
                "project_name": pred.project_name,
                "agency": pred.agency,
                "original_cost_cr": pred.original_cost_cr,
                "anticipated_cost_cr": pred.anticipated_cost_cr,
                "predicted_delay_months": pred.predicted_delay_months,
                "predicted_risk_level": pred.predicted_risk_level
            },
            "root_cause_identified": cause_key,
            "statutory_governance_framework": sop["framework"],
            "anomaly_audit_alert": anomaly_warning,
            "escalation_protocol": {
                "risk_tier": pred.predicted_risk_level,
                "authorized_officer": escalation_level
            },
            "immediate_sop_directives": sop["immediate_actions"],
            "statutory_target_milestones": sop["statutory_milestones"]
        }

    def simulate_what_if(self, pred: ProjectPrediction, months_expedited: float) -> Dict[str, Any]:
        cause_key = self._match_cause(pred.root_cause)
        sop = self.playbook.get(cause_key, self.playbook["General Execution Delay"])
        factor = sop["recovery_factor_per_month_expedited"]
        
        effective_delay_recovered = min(pred.predicted_delay_months, months_expedited * factor)
        revised_predicted_delay = max(0.0, pred.predicted_delay_months - effective_delay_recovered)
        
        monthly_burn_rate = (pred.anticipated_cost_cr - pred.original_cost_cr) / max(1.0, pred.predicted_delay_months) if pred.predicted_delay_months > 0 else 0
        projected_cost_savings = round(monthly_burn_rate * effective_delay_recovered, 2)
        revised_anticipated_cost = max(pred.original_cost_cr, round(pred.anticipated_cost_cr - projected_cost_savings, 2))
        
        if revised_predicted_delay > 24.0:
            revised_risk = "High"
        elif revised_predicted_delay > 6.0:
            revised_risk = "Medium"
        else:
            revised_risk = "Low"
            
        return {
            "intervention": f"Expedite '{cause_key}' resolution by {months_expedited} month(s)",
            "baseline": {
                "delay_months": round(pred.predicted_delay_months, 1),
                "risk_level": pred.predicted_risk_level,
                "anticipated_cost_cr": pred.anticipated_cost_cr
            },
            "simulated_outcome": {
                "schedule_recovered_months": round(effective_delay_recovered, 1),
                "revised_delay_months": round(revised_predicted_delay, 1),
                "revised_risk_level": revised_risk,
                "projected_cost_savings_cr": projected_cost_savings,
                "revised_anticipated_cost_cr": revised_anticipated_cost
            }
        }

    def _match_cause(self, raw_cause: str) -> str:
        if not raw_cause:
            return "General Execution Delay"
        for key in self.playbook.keys():
            if key.lower() in raw_cause.lower() or any(w in raw_cause.lower() for w in key.lower().split()):
                return key
        return "General Execution Delay"

if __name__ == "__main__":
    engine = PrescriptiveDecisionEngine()
    
    proj1 = ProjectPrediction(
        project_code="180100221",
        project_name="SUBANSIRI LOWER H.E.P (8X250 MW)",
        agency="NHPC",
        original_cost_cr=6285.33,
        anticipated_cost_cr=26075.54,
        predicted_delay_months=188.0,
        predicted_risk_level="High",
        root_cause="Forest & Environmental Clearance; Land Acquisition",
        financial_vs_physical_gap=281.8
    )
    
    print("=" * 80)
    print("PRESCRIPTIVE DECISION DIRECTIVE: SAMPLE HIGH-RISK PROJECT")
    print("=" * 80)
    directive = engine.generate_recommendations(proj1)
    print(json.dumps(directive, indent=2))
    
    print("\n" + "=" * 80)
    print("WHAT-IF SCENARIO SIMULATION: EXPEDITING CLEARANCES BY 12 MONTHS")
    print("=" * 80)
    simulation = engine.simulate_what_if(proj1, months_expedited=12.0)
    print(json.dumps(simulation, indent=2))
