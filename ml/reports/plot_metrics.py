import os
import json
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np

REPORTS_DIR = r"C:\Users\murta\OneDrive\Desktop\SIH Project\reports"
with open(os.path.join(REPORTS_DIR, "evaluation_metrics.json")) as f:
    metrics = json.load(f)

fig, axes = plt.subplots(1, 2, figsize=(15, 6))

# Plot 1: Confusion Matrix for Risk Classifier
cm = np.array(metrics["model_1_risk_classifier"]["confusion_matrix"])
classes = metrics["model_1_risk_classifier"]["classes"]
acc_val = metrics["model_1_risk_classifier"]["accuracy"] * 100

sns.heatmap(cm, annot=True, fmt="d", cmap="Blues", ax=axes[0],
            xticklabels=classes, yticklabels=classes, cbar=False)
axes[0].set_title(f"Risk Classifier Confusion Matrix (Accuracy: {acc_val:.1f}%)", fontsize=12, fontweight="bold")
axes[0].set_xlabel("Predicted Risk Level")
axes[0].set_ylabel("Actual Risk Level")

# Plot 2: Top Feature Importances
top_feats = metrics["top_10_features"]
feat_names = [f["feature"].replace("sector_", "").replace("state_", "") for f in top_feats][::-1]
feat_scores = [f["importance"] for f in top_feats][::-1]

axes[1].barh(feat_names, feat_scores, color="#1f77b4", edgecolor="black", alpha=0.85)
axes[1].set_title("Top 10 Drivers of Project Delay Risk (XGBoost)", fontsize=12, fontweight="bold")
axes[1].set_xlabel("Feature Importance Score")

plt.tight_layout()
out_fig = os.path.join(REPORTS_DIR, "model_performance_dashboard.png")
plt.savefig(out_fig, dpi=200)
print(f"Performance dashboard plot saved to: {out_fig}")
