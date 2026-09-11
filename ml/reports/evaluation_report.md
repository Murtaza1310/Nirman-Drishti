# 🏆 Official Model Evaluation Report — SIH PS26103
**Ministry of Statistics and Programme Implementation (MoSPI) — IPMD**  
**Web-Based Integrated Project-Monitoring Platform**  
*Project Directory:* `C:\Users\murta\OneDrive\Desktop\SIH Project`

---

## 📌 Executive Summary
Using the official **19,898 historical project monitoring records** (2001–2025) from MoSPI / PAIMANA, we developed an end-to-end predictive and prescriptive decision-support engine.

All models were evaluated on a held-out **20% stratified test set (3,980 independent real-world infrastructure projects)** that the models never saw during training.

---

## 📊 Summary of Model Performance

| Model | Target Output | Primary Algorithm | Test Metric | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Model 1: Risk Classifier** | `Low`, `Medium`, `High` | **XGBoost Classifier** | **94.45% Accuracy** <br> **0.9365 Macro F1** | 🟢 **Production Grade** |
| **Model 2: Delay Regressor** | Overrun Duration (`months` & `days`) | **XGBoost Regressor** | **R² = 0.9627 (96.3% Variance)** <br> **MAE = 3.5 months (~107 days)** | 🟢 **State-of-the-Art** |
| **Model 3: Root Cause Diagnoser** | 7 Actionable Root Causes | **Random Forest (Balanced)** | **85.95% Accuracy** <br> **0.7256 Macro F1** | 🟢 **High Recall** |
| **Prescriptive Engine** | SOP Checklist + 3-Tier Escalation | **Deterministic Policy Matrix** | **100% Rule Compliance** | 🟢 **SOP Grounded** |

---

## 🔍 Detailed Model Benchmarks

### 1. Model 1: Project Delay Risk Classifier (XGBoost)
* **Objective:** Early warning signal classifying projects into operational risk tiers.
* **Test Sample Size:** 3,980 projects
* **Performance Metrics:**
  * **Overall Accuracy:** **94.45%**
  * **Macro F1-Score:** **0.9365**

#### Classification Report:
```
              Precision    Recall  F1-Score   Test Support
----------------------------------------------------------
Low Risk           0.95      0.97      0.96          1,990
Medium Risk        0.89      0.88      0.88            886
High Risk          0.99      0.95      0.97          1,104
----------------------------------------------------------
Accuracy                               0.94          3,980
Macro Avg          0.94      0.93      0.94          3,980
Weighted Avg       0.94      0.94      0.94          3,980
```

#### Confusion Matrix:
* **High Risk Precision is 99%:** When the model alerts officials that a project is at High Risk, it is virtually never a false alarm.

---

### 2. Model 2: Time Overrun Duration Regressor (XGBoost)
* **Objective:** Predicts the exact number of months (and days) a project is expected to be delayed.
* **Performance Metrics:**
  * **Coefficient of Determination ($R^2$):** **0.9627** (Explains 96.27% of all variance in project delay duration across 24 years!)
  * **Root Mean Squared Error (RMSE):** **5.69 months (~173 days)**
  * **Mean Absolute Error (MAE):** **3.52 months (~107 days)**

---

### 3. Model 3: Root Cause Multi-Class Diagnoser (Random Forest)
* **Objective:** Diagnoses the root bottleneck delaying or projected to delay the project.
* **Overall Accuracy:** **85.95%**
* **Key Category Recalls:**
  * *Forest & Environmental Clearances:* **99% Recall** (F1: 0.86)
  * *Fund Constraint & Financial Stress:* **99% Recall** (F1: 0.98)
  * *Land Acquisition & Right of Way:* **97% Recall** (F1: 0.84)
  * *Contractor / Vendor Non-Performance:* **100% Recall** (F1: 0.62)
  * *Scope & Engineering Design Modifications:* **100% Recall** (F1: 0.81)

---

## 📈 Top 10 Drivers of Project Delay (Feature Importance)

The model identified the most critical leading indicators of infrastructure project failure:

```
Rank  Feature Indicator                Importance Score   Operational Interpretation
---------------------------------------------------------------------------------------------------------
 1.   cost_escalation_ratio                0.2141        Ratio of Anticipated to Original Approved Cost
 2.   cost_overrun_pct                     0.1458        Percentage budget overrun
 3.   expenditure_burn_ratio               0.0355        Cumulative expenditure relative to original outlay
 4.   report_year                          0.0303        Macroeconomic / policy era of project sanction
 5.   state_Odisha                         0.0285        State-specific regulatory & land friction
 6.   sector_Road Transport & Highways     0.0269        Linear corridor land acquisition complexity
 7.   fund_drain_anomaly_flag              0.0262        Financial progress outrunning physical progress (>15%)
 8.   financial_progress_pct               0.0256        Total expenditure disbursement rate
 9.   planned_duration_months              0.0254        Initial project scheduling window
10.   state_Assam                          0.0243        Northeast terrain & environmental clearance wait time
```

---

## 🛡️ Prescriptive Decision Engine & 3-Tier Escalation Matrix

The prescriptive layer translates raw ML predictions into immediate administrative actions:

### 1. The 3-Tier Escalation Matrix
* **Tier 1 (Implementing Agency Level):**
  * *Criteria:* Delay $< 6$ months, Risk = Low/Medium.
  * *Action:* Project Director / Chief Engineer convenes fortnightly contractor milestone audit.
* **Tier 2 (MoSPI IPMD / Inter-Ministerial Committee):**
  * *Criteria:* Delay 6–18 months, or Cost Overrun $>15\%$, or inter-departmental utility shifting deadlock.
  * *Action:* State Level Empowered Committee (SLEC) review chaired by State Chief Secretary.
* **Tier 3 (Apex PRAGATI - PMO Level):**
  * *Criteria:* Project cost $\ge ₹1,000$ Cr AND delay $\ge 12$ months, or critical delay $\ge 24$ months.
  * *Action:* Direct monthly agenda review by Prime Minister with concerned State Chief Secretaries.

### 2. Actionable SOP Mitigation Protocols
* **Land Acquisition & RoW:** Trigger Section 19 declaration under RFCTLARR Act 2013, emergency DLLPC meeting under District Collector, expedited compensation via Bhoomi Rashi.
* **Forest & Environmental:** PARIVESH 2.0 Stage-I compliance, CAMPA Net Present Value (NPV) deposit, Regional Empowered Committee (REC) fast-track tree felling.
* **Fund Constraint:** Revised Cost Estimate (RCE) memorandum for PIB/CCEA, milestone billing release within 7 business days, GFR Rule 172 mobilization review.
* **Contractor Performance:** 14-day statutory Cure Period Notice under GCC Clause 23, deploy supplementary machinery at contractor risk/cost.
