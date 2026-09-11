# NIRMAN-Drishti: AI-Powered Infrastructure Project Monitoring & Early Warning Decision Support System

[![Smart India Hackathon 2026](https://img.shields.io/badge/SIH-2026-orange.svg)](https://www.sih.gov.in/)
[![Problem Statement](https://img.shields.io/badge/MoSPI-PS26103-blue.svg)](https://mospi.gov.in/)
[![Next.js 16](https://img.shields.io/badge/Frontend-Next.js%2016-black.svg)](https://nextjs.org/)
[![Python ML](https://img.shields.io/badge/AI%2FML-XGBoost%20%7C%20Random%20Forest-green.svg)](https://scikit-learn.org/)

> **Smart India Hackathon 2026 Problem Statement ID: 26103**  
> **Sponsoring Agency:** Ministry of Statistics and Programme Implementation (MoSPI) — Infrastructure & Project Monitoring Division (IPMD)  
> **Platform Name:** NIRMAN-Drishti (National Infrastructure Risk & Milestone Assessment Network)

---

## 📌 Executive Summary

India's central infrastructure projects (costing ₹150+ Crore) frequently suffer from time overruns and escalating budgets due to execution bottlenecks such as land acquisition, delayed statutory clearances, contractor underperformance, and fund flow disruptions.

**NIRMAN-Drishti** transforms national project monitoring from reactive status reporting into an **AI-driven Predictive & Prescriptive Early Warning Decision Support System**. Trained on **25 years of official MoSPI PAIMANA records (2001–2025)** and tracking **1,012 active infrastructure initiatives**, NIRMAN-Drishti delivers:
1. **Predictive Delay & Risk Scoring**: Classifies delay risk (High / Medium / Low) with 94.45% accuracy and forecasts delay duration in months and days ($R^2 = 0.96$).
2. **Root Cause Diagnosis**: Identifies the primary operational bottleneck (Land Acquisition, Forest Clearances, Funding Constraints, Contractor Issues, or Scope Changes).
3. **Prescriptive Standard Operating Procedures (SOPs)**: Recommends time-bound regulatory interventions mapped to the **PM GatiShakti Multi-Modal Portal** and **RFCTLARR Act 2013**.
4. **3-Tier Administrative Escalation Matrix**: Tier-1 (Implementing Agency CPM) $\rightarrow$ Tier-2 (MoSPI IPMD Oversight) $\rightarrow$ Tier-3 (PMO PRAGATI Review).

---

## 🗂️ Repository Structure

```
nirman-drishti/
├── web/                               # Fullstack Next.js 16 Web Application
│   ├── app/
│   │   ├── api/                       # REST API Endpoints
│   │   │   ├── portfolio/summary/     # National KPIs (₹ 18.94 Lakh Cr, 1,012 projects)
│   │   │   ├── projects/              # Filtered, searched & paginated project directory
│   │   │   ├── projects/[id]/predict/ # Live AI diagnosis by project code
│   │   │   ├── analytics/overview/    # State & Sector risk distributions
│   │   │   └── predict/               # Custom simulation sandbox endpoint
│   │   ├── globals.css                # Polished governmental design & typography
│   │   ├── layout.tsx                 # Root layout with responsive viewport & analytics
│   │   └── page.tsx                   # Interactive 5-tab dashboard (Home, Projects, Analysis, Map, AI)
│   ├── components/                    # UI primitives & design elements
│   ├── lib/
│   │   ├── ongoing_projects.json      # 1,012 real active projects database
│   │   ├── flagship_analysis.json     # Detailed root cause & SOP metadata
│   │   ├── project_coords.json        # Coordinates across 23 Indian states
│   │   ├── predictor.ts               # Next.js inference bridge & fail-safe engine
│   │   └── predict_bridge.py          # Portable Python CLI inference bridge
│   ├── models/                        # Serialized ML model weights
│   ├── src/                           # Feature preprocessing & inference logic
│   ├── package.json                   # Web dependencies
│   └── tsconfig.json                  # TypeScript configuration
│
├── ml/                                # Machine Learning Core
│   ├── models/                        # Trained Model Weights & Metadata
│   │   ├── model_risk_classifier.joblib       # Model 1: Risk Level Classifier (XGBoost)
│   │   ├── model_delay_regressor.joblib       # Model 2: Overrun Duration Regressor (XGBoost)
│   │   ├── model_root_cause_classifier.joblib # Model 3: Root Cause Diagnoser (Random Forest)
│   │   ├── preprocessor.joblib                # Robust feature encoder & scaler
│   │   └── model_metadata.json                # Feature lists & label mappings
│   ├── src/                           # Python Engineering & Inference Modules
│   │   ├── data_preprocessing.py      # Feature engineering (S-curve gap, burn ratios)
│   │   ├── train_models.py            # Model training & hyperparameter tuning
│   │   ├── predict_pipeline.py        # Unified inference class (ProjectMonitoringPredictor)
│   │   └── prescriptive_engine.py     # PM GatiShakti SOPs & 3-Tier Escalation
│   ├── notebooks/
│   │   └── 01_Model_Training_Pipeline.ipynb   # Interactive self-contained Jupyter notebook
│   └── reports/
│       ├── evaluation_report.md               # Detailed evaluation report
│       ├── evaluation_metrics.json            # Model benchmark metrics
│       └── model_performance_dashboard.png   # Confusion matrix & feature importances
│
├── data/                              # Verified Official Datasets
│   ├── paimana_master_dataset.csv     # 19,898 historical records (2001–2025)
│   ├── ongoing_projects_master.csv    # 1,012 currently ongoing projects
│   └── processed_paimana_features.csv # Engineered dataset with domain indicators
│
├── requirements.txt                   # Python dependencies
└── README.md                          # Platform documentation & setup guide
```

---

## 📊 Machine Learning Models & Evaluation Benchmark

| Model | Architecture | Target / Metric | Benchmark Performance |
|---|---|---|---|
| **Model 1: Delay Risk Classifier** | XGBoost Classifier | Risk Tier (`Low`, `Medium`, `High`) | **94.45% Accuracy** \| **0.9365 Macro F1** (99% Precision on High Risk) |
| **Model 2: Overrun Duration Regressor** | XGBoost Regressor | Overrun Duration (`Months` & `Days`) | **$R^2 = 0.9627$** \| RMSE = 5.69 months \| MAE = 3.52 months |
| **Model 3: Root Cause Diagnoser** | Random Forest Classifier | Primary Operational Bottleneck | **85.95% Accuracy** \| **0.7256 Macro F1** |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **Python** (3.10 to 3.14)

### 2. Python Environment Setup
```bash
pip install -r requirements.txt
```

### 3. Run Web Application
```bash
cd web
npm install --legacy-peer-deps
npm run dev
```
Open **`http://localhost:3000`** in your browser.

---

## 🏛️ Built for Smart India Hackathon 2026
*Ministry of Statistics and Programme Implementation (MoSPI) — Infrastructure & Project Monitoring Division (IPMD)*
