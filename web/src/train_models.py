"""
SIH Problem Statement 26103 (MoSPI - IPMD)
Model Training and Evaluation Pipeline
Trains:
  1. Risk Classifier (XGBoost) -> Low, Medium, High
  2. Delay Regressor (XGBoost Regressor) -> Overrun in months & days
  3. Root Cause Classifier (Random Forest) -> 7 Actionable Root Causes
"""

import os
import json
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.metrics import (
    classification_report, confusion_matrix, accuracy_score, f1_score,
    mean_squared_error, mean_absolute_error, r2_score
)
from xgboost import XGBClassifier, XGBRegressor
from sklearn.ensemble import RandomForestClassifier

BASE_DIR = r"C:\Users\murta\OneDrive\Desktop\SIH Project"
PROCESSED_DATA_PATH = os.path.join(BASE_DIR, "processed_paimana_features.csv")
MODELS_DIR = os.path.join(BASE_DIR, "models")
REPORTS_DIR = os.path.join(BASE_DIR, "reports")

os.makedirs(MODELS_DIR, exist_ok=True)
os.makedirs(REPORTS_DIR, exist_ok=True)

# -------------------------------------------------------------
# 1. Load Data
# -------------------------------------------------------------
print("Loading processed features dataset...")
df = pd.read_csv(PROCESSED_DATA_PATH, low_memory=False)
print(f"Dataset shape: {df.shape}")

# Feature Sets
CATEGORICAL_FEATURES = ["sector", "state"]
NUMERICAL_FEATURES = [
    "original_cost_cr", "anticipated_cost_cr", "cost_overrun_cr", "cost_overrun_pct",
    "cumulative_expenditure_cr", "physical_progress_pct", "financial_progress_pct",
    "financial_vs_physical_gap_pct", "cost_escalation_ratio", "expenditure_burn_ratio",
    "log_original_cost", "fund_drain_anomaly_flag", "planned_duration_months", "report_year"
]
ALL_FEATURES = CATEGORICAL_FEATURES + NUMERICAL_FEATURES

X = df[ALL_FEATURES].copy()
y_risk = df["risk_level"].copy()
y_delay = df["time_overrun_months"].copy()
y_cause = df["root_cause"].copy()

# Map risk level to integers for XGBoost
risk_mapping = {"Low": 0, "Medium": 1, "High": 2}
inv_risk_mapping = {0: "Low", 1: "Medium", 2: "High"}
y_risk_encoded = y_risk.map(risk_mapping)

# Map root cause to integers for multi-class classifier
unique_causes = sorted(y_cause.unique())
cause_mapping = {c: i for i, c in enumerate(unique_causes)}
inv_cause_mapping = {i: c for i, c in enumerate(unique_causes)}
y_cause_encoded = y_cause.map(cause_mapping)

# -------------------------------------------------------------
# 2. Train / Test Split
# -------------------------------------------------------------
print("\nPerforming Stratified 80/20 Train/Test Split...")
X_train, X_test, y_risk_train, y_risk_test, y_delay_train, y_delay_test, y_cause_train, y_cause_test = train_test_split(
    X, y_risk_encoded, y_delay, y_cause_encoded,
    test_size=0.20,
    random_state=42,
    stratify=y_risk_encoded
)
print(f"Train size: {len(X_train):,} samples | Test size: {len(X_test):,} samples")

# -------------------------------------------------------------
# 3. Preprocessor Pipeline (OneHotEncoder + StandardScaler)
# -------------------------------------------------------------
print("\nFitting Feature Preprocessor (One-Hot + StandardScaler)...")
preprocessor = ColumnTransformer(
    transformers=[
        ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), CATEGORICAL_FEATURES),
        ("num", StandardScaler(), NUMERICAL_FEATURES)
    ]
)

X_train_proc = preprocessor.fit_transform(X_train)
X_test_proc = preprocessor.transform(X_test)

# Get transformed feature names
cat_encoder = preprocessor.named_transformers_["cat"]
encoded_cat_names = list(cat_encoder.get_feature_names_out(CATEGORICAL_FEATURES))
feature_names = encoded_cat_names + NUMERICAL_FEATURES
print(f"Total processed feature dimensions: {len(feature_names)}")

# -------------------------------------------------------------
# 4. Train Model 1: Project Delay Risk Classifier (XGBoost)
# -------------------------------------------------------------
print("\n=======================================================")
print("Training Model 1: Project Delay Risk Classifier (XGBoost)")
print("=======================================================")
risk_clf = XGBClassifier(
    n_estimators=160,
    learning_rate=0.08,
    max_depth=6,
    subsample=0.85,
    colsample_bytree=0.85,
    random_state=42,
    eval_metric="mlogloss"
)
risk_clf.fit(X_train_proc, y_risk_train)

y_risk_pred = risk_clf.predict(X_test_proc)
risk_acc = accuracy_score(y_risk_test, y_risk_pred)
risk_f1 = f1_score(y_risk_test, y_risk_pred, average="macro")

print(f"Risk Classifier Accuracy: {risk_acc * 100:.2f}%")
print(f"Risk Classifier Macro F1: {risk_f1:.4f}")
print("\nClassification Report (Risk Level):")
risk_names = ["Low", "Medium", "High"]
print(classification_report(y_risk_test, y_risk_pred, target_names=risk_names))

risk_cm = confusion_matrix(y_risk_test, y_risk_pred).tolist()

# -------------------------------------------------------------
# 5. Train Model 2: Time Overrun Duration Regressor (XGBoost)
# -------------------------------------------------------------
print("\n=======================================================")
print("Training Model 2: Time Overrun Duration Regressor (XGBoost)")
print("=======================================================")
delay_reg = XGBRegressor(
    n_estimators=160,
    learning_rate=0.08,
    max_depth=6,
    subsample=0.85,
    colsample_bytree=0.85,
    random_state=42
)
delay_reg.fit(X_train_proc, y_delay_train)

y_delay_pred = delay_reg.predict(X_test_proc)
y_delay_pred = np.clip(y_delay_pred, 0.0, None)  # Overrun cannot be negative

delay_rmse = np.sqrt(mean_squared_error(y_delay_test, y_delay_pred))
delay_mae = mean_absolute_error(y_delay_test, y_delay_pred)
delay_r2 = r2_score(y_delay_test, y_delay_pred)

print(f"Delay Regressor R2 Score: {delay_r2:.4f} ({delay_r2*100:.2f}% variance explained)")
print(f"Delay Regressor RMSE: {delay_rmse:.2f} months (~{delay_rmse*30.4:.0f} days)")
print(f"Delay Regressor MAE: {delay_mae:.2f} months (~{delay_mae*30.4:.0f} days)")

# -------------------------------------------------------------
# 6. Train Model 3: Root Cause Multi-Class Diagnoser
# -------------------------------------------------------------
print("\n=======================================================")
print("Training Model 3: Root Cause Multi-Class Diagnoser (Random Forest)")
print("=======================================================")
cause_clf = RandomForestClassifier(
    n_estimators=150,
    max_depth=12,
    class_weight="balanced",
    random_state=42,
    n_jobs=-1
)
cause_clf.fit(X_train_proc, y_cause_train)

y_cause_pred = cause_clf.predict(X_test_proc)
cause_acc = accuracy_score(y_cause_test, y_cause_pred)
cause_f1 = f1_score(y_cause_test, y_cause_pred, average="macro")

print(f"Root Cause Classifier Accuracy: {cause_acc * 100:.2f}%")
print(f"Root Cause Classifier Macro F1: {cause_f1:.4f}")
print("\nClassification Report (Root Cause):")
print(classification_report(y_cause_test, y_cause_pred, target_names=unique_causes, zero_division=0))

# -------------------------------------------------------------
# 7. Extract Key Feature Importances
# -------------------------------------------------------------
print("\nTop 10 Feature Importances for Risk Classifier:")
importances = risk_clf.feature_importances_
top_idx = np.argsort(importances)[::-1][:10]
top_features = []
for idx in top_idx:
    print(f"  {feature_names[idx]:35s}: {importances[idx]:.4f}")
    top_features.append({"feature": feature_names[idx], "importance": float(importances[idx])})

# -------------------------------------------------------------
# 8. Save Models & Reports
# -------------------------------------------------------------
print("\nSaving trained models and preprocessor pipelines...")
joblib.dump(risk_clf, os.path.join(MODELS_DIR, "model_risk_classifier.joblib"))
joblib.dump(delay_reg, os.path.join(MODELS_DIR, "model_delay_regressor.joblib"))
joblib.dump(cause_clf, os.path.join(MODELS_DIR, "model_root_cause_classifier.joblib"))
joblib.dump(preprocessor, os.path.join(MODELS_DIR, "preprocessor.joblib"))

meta = {
    "risk_mapping": risk_mapping,
    "inv_risk_mapping": inv_risk_mapping,
    "cause_mapping": cause_mapping,
    "inv_cause_mapping": inv_cause_mapping,
    "categorical_features": CATEGORICAL_FEATURES,
    "numerical_features": NUMERICAL_FEATURES,
    "feature_names": feature_names,
    "training_date": str(pd.Timestamp.now())
}
with open(os.path.join(MODELS_DIR, "model_metadata.json"), "w") as f:
    json.dump(meta, f, indent=2)

# Evaluation report payload
metrics_report = {
    "total_records": len(df),
    "train_samples": len(X_train),
    "test_samples": len(X_test),
    "model_1_risk_classifier": {
        "algorithm": "XGBoost Classifier",
        "accuracy": round(float(risk_acc), 4),
        "macro_f1": round(float(risk_f1), 4),
        "confusion_matrix": risk_cm,
        "classes": risk_names
    },
    "model_2_delay_regressor": {
        "algorithm": "XGBoost Regressor",
        "r2_score": round(float(delay_r2), 4),
        "rmse_months": round(float(delay_rmse), 2),
        "mae_months": round(float(delay_mae), 2),
        "rmse_days": int(round(float(delay_rmse) * 30.4)),
        "mae_days": int(round(float(delay_mae) * 30.4))
    },
    "model_3_root_cause_classifier": {
        "algorithm": "Random Forest Classifier (Balanced)",
        "accuracy": round(float(cause_acc), 4),
        "macro_f1": round(float(cause_f1), 4),
        "classes": unique_causes
    },
    "top_10_features": top_features
}

with open(os.path.join(REPORTS_DIR, "evaluation_metrics.json"), "w") as f:
    json.dump(metrics_report, f, indent=2)

print(f"\nAll models and evaluation metrics successfully saved to:\n  - {MODELS_DIR}\n  - {REPORTS_DIR}")
