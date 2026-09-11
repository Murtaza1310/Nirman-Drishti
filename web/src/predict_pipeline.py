"""
SIH Problem Statement 26103 (MoSPI - IPMD)
Unified Prediction & Prescriptive Inference Pipeline
Directly callable by Frontend / Backend REST API
"""

import os
import sys
import json
import joblib
import pandas as pd
import numpy as np
from typing import Dict, Any

# Ensure parent directory is in sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

try:
    from src.prescriptive_engine import generate_prescriptive_plan
except ImportError:
    from prescriptive_engine import generate_prescriptive_plan

BASE_DIR = parent_dir
MODELS_DIR = os.path.join(BASE_DIR, "models")

class ProjectMonitoringPredictor:
    def __init__(self, models_dir: str = MODELS_DIR):
        self.models_dir = models_dir
        
        # Load models and preprocessor
        self.risk_clf = joblib.load(os.path.join(models_dir, "model_risk_classifier.joblib"))
        self.delay_reg = joblib.load(os.path.join(models_dir, "model_delay_regressor.joblib"))
        self.cause_clf = joblib.load(os.path.join(models_dir, "model_root_cause_classifier.joblib"))
        self.preprocessor = joblib.load(os.path.join(models_dir, "preprocessor.joblib"))
        
        with open(os.path.join(models_dir, "model_metadata.json"), "r") as f:
            self.metadata = json.load(f)
            
        self.inv_risk_mapping = {int(k): v for k, v in self.metadata["inv_risk_mapping"].items()}
        self.inv_cause_mapping = {int(k): v for k, v in self.metadata["inv_cause_mapping"].items()}
        
        # Identify index of "On Schedule"
        self.on_schedule_idx = None
        for idx, name_c in self.inv_cause_mapping.items():
            if name_c == "On Schedule":
                self.on_schedule_idx = idx
                break

    def predict_project(self, project_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes end-to-end inference for a single project:
          1. Preprocesses inputs and computes derived financial indicators.
          2. Predicts Risk Level (Low/Medium/High) + class probabilities.
          3. Predicts Expected Time Overrun (months & days).
          4. Diagnoses the Primary Root Cause (grounded in delay context).
          5. Generates the Prescriptive Mitigation Plan + 3-Tier Escalation Matrix.
        """
        name = project_data.get("project_name", "Central Infrastructure Project")
        sector = project_data.get("sector", "Road Transport & Highways")
        state = project_data.get("state", "Multi-State / Central")
        orig_cost = float(project_data.get("original_cost_cr", 500.0))
        ant_cost = float(project_data.get("anticipated_cost_cr", orig_cost))
        cum_exp = float(project_data.get("cumulative_expenditure_cr", 0.0))
        phys_prog = float(project_data.get("physical_progress_pct", 10.0))
        fin_prog = float(project_data.get("financial_progress_pct", (cum_exp / (orig_cost + 1e-3)) * 100))
        
        # Derived indicators
        cost_overrun_cr = max(0.0, ant_cost - orig_cost)
        cost_overrun_pct = round((cost_overrun_cr / (orig_cost + 1e-3)) * 100, 2)
        gap_pct = round(fin_prog - phys_prog, 2)
        cost_escalation = round(ant_cost / (orig_cost + 1e-3), 3)
        burn_ratio = round(cum_exp / (orig_cost + 1e-3), 3)
        log_cost = round(np.log1p(max(0.0, orig_cost)), 3)
        fund_drain_flag = int(gap_pct > 15.0)
        planned_months = float(project_data.get("planned_duration_months", 36.0))
        report_year = int(project_data.get("report_year", 2025))

        # Build feature DataFrame
        features_dict = {
            "sector": [sector],
            "state": [state],
            "original_cost_cr": [orig_cost],
            "anticipated_cost_cr": [ant_cost],
            "cost_overrun_cr": [cost_overrun_cr],
            "cost_overrun_pct": [cost_overrun_pct],
            "cumulative_expenditure_cr": [cum_exp],
            "physical_progress_pct": [phys_prog],
            "financial_progress_pct": [fin_prog],
            "financial_vs_physical_gap_pct": [gap_pct],
            "cost_escalation_ratio": [cost_escalation],
            "expenditure_burn_ratio": [burn_ratio],
            "log_original_cost": [log_cost],
            "fund_drain_anomaly_flag": [fund_drain_flag],
            "planned_duration_months": [planned_months],
            "report_year": [report_year]
        }
        df_input = pd.DataFrame(features_dict)

        # Transform features
        X_proc = self.preprocessor.transform(df_input)

        # 1. Predict Risk Level
        risk_pred_idx = int(self.risk_clf.predict(X_proc)[0])
        risk_label = self.inv_risk_mapping.get(risk_pred_idx, "Medium")
        risk_probs = self.risk_clf.predict_proba(X_proc)[0]
        risk_confidence = round(float(risk_probs[risk_pred_idx]), 4)
        risk_breakdown = {
            "Low": round(float(risk_probs[0]), 3),
            "Medium": round(float(risk_probs[1]), 3),
            "High": round(float(risk_probs[2]), 3)
        }

        # 2. Predict Delay Overrun Duration
        delay_months = max(0.0, float(self.delay_reg.predict(X_proc)[0]))
        if risk_label == "Low" and delay_months < 1.0:
            delay_months = 0.0
        delay_days = int(round(delay_months * 30.4))

        # 3. Predict Root Cause (Contextualized by delay status)
        cause_probs = self.cause_clf.predict_proba(X_proc)[0].copy()
        
        if risk_label == "Low" and delay_months <= 0.5:
            root_cause = "On Schedule"
            cause_confidence = round(float(cause_probs[self.on_schedule_idx]) if self.on_schedule_idx is not None else 0.95, 3)
        else:
            # If project is delayed, exclude "On Schedule" from candidate diagnoses
            if self.on_schedule_idx is not None:
                cause_probs[self.on_schedule_idx] = -1.0
            cause_pred_idx = int(np.argmax(cause_probs))
            root_cause = self.inv_cause_mapping.get(cause_pred_idx, "Land Acquisition & Right of Way")
            cause_confidence = round(float(np.max(cause_probs)), 3)

        # 4. Generate Prescriptive Intervention Plan
        prescriptive_plan = generate_prescriptive_plan(
            project_name=name,
            risk_level=risk_label,
            delay_months=delay_months,
            root_cause=root_cause,
            cost_cr=orig_cost,
            gap_pct=gap_pct,
            state=state,
            sector=sector
        )

        return {
            "project_name": name,
            "sector": sector,
            "state": state,
            "predictions": {
                "risk_level": risk_label,
                "risk_confidence": risk_confidence,
                "risk_probability_distribution": risk_breakdown,
                "predicted_overrun_months": round(delay_months, 1),
                "predicted_overrun_days": delay_days,
                "predicted_root_cause": root_cause,
                "root_cause_confidence": cause_confidence
            },
            "financial_health_indicators": {
                "original_cost_cr": orig_cost,
                "anticipated_cost_cr": ant_cost,
                "cost_overrun_cr": cost_overrun_cr,
                "cost_overrun_pct": cost_overrun_pct,
                "financial_vs_physical_gap_pct": gap_pct,
                "fund_drain_anomaly_detected": bool(fund_drain_flag)
            },
            "prescriptive_decision_support": prescriptive_plan
        }

if __name__ == "__main__":
    predictor = ProjectMonitoringPredictor()
    sample = {
        "project_name": "GORAKHPUR LINK EXPRESSWAY PROJECT (PACKAGE-II)",
        "sector": "Road Transport & Highways",
        "state": "Uttar Pradesh",
        "original_cost_cr": 3240.0,
        "anticipated_cost_cr": 4890.0,
        "cumulative_expenditure_cr": 2100.0,
        "physical_progress_pct": 32.0,
        "financial_progress_pct": 64.8,
        "planned_duration_months": 48.0
    }
    result = predictor.predict_project(sample)
    print(json.dumps(result, indent=2))
