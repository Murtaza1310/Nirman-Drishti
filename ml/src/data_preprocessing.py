"""
SIH Problem Statement 26103 (MoSPI - IPMD)
Data Preprocessing and Domain Feature Engineering Pipeline
"""

import re
import pandas as pd
import numpy as np
from datetime import datetime

# -------------------------------------------------------------
# Domain Dictionaries: Sectors & States
# -------------------------------------------------------------
SECTOR_RULES = [
    ("Road Transport & Highways", [
        r"\bNH[-\s]?\d+", r"HIGHWAY", r"EXPRESSWAY", r"BYPASS", r"MORTH", r"NHAI",
        r"FOUR LANING", r"SIX LANING", r"TWO LANE", r"PAVED SHOULDER", r"ROAD",
        r"FLYOVER", r"ROB", r"RING ROAD"
    ]),
    ("Railways", [
        r"RAILWAY", r"\bRAIL\b", r"DOUBLING", r"RVNL", r"GAUGE CONVERSION",
        r"ELECTRIFICATION", r"NEW LINE", r"METRO RAIL", r"IRCON", r"TRAIN"
    ]),
    ("Power & Renewable Energy", [
        r"POWER", r"TRANSMISSION", r"P\.GRID", r"POWERGRID", r"HVDC", r"SUBANSIRI",
        r"HEP", r"HYDRO", r"THERMAL", r"SOLAR", r"NTPC", r"NHPC", r"SUB-STATION",
        r"KV", r"GRID"
    ]),
    ("Petroleum & Natural Gas", [
        r"REFINERY", r"PIPELINE", r"IOCL", r"BPCL", r"HPCL", r"ONGCL", r"GAIL",
        r"CRUDE", r"POL", r"OIL", r"PETROCHEMICAL", r"LPG"
    ]),
    ("Coal & Mines", [
        r"COAL", r"OCP", r"CIL", r"BCCL", r"CCL", r"ECL", r"SECL", r"WCL",
        r"NCL", r"SHAFT", r"MINES", r"MINING", r"LIGNITE", r"NLC"
    ]),
    ("Urban Metro & Transit", [
        r"METRO", r"MRTS", r"RAPID RAIL", r"SUBURBAN"
    ]),
    ("Water Resources & Irrigation", [
        r"BARRAGE", r"CANAL", r"IRRIGATION", r"DAM", r"RIVER", r"WATER SUPPLY"
    ]),
    ("Civil Aviation", [
        r"AIRPORT", r"AAI", r"TERMINAL", r"RUNWAY", r"AIRSTRIP"
    ]),
    ("Ports & Shipping", [
        r"PORT", r"JETTY", r"HARBOUR", r"DOCK", r"WATERWAY"
    ])
]

STATES_DICT = [
    ("Uttar Pradesh", [r"UTTAR PRADESH", r"\bU\.P\.\b", r"\bUP\b", r"LUCKNOW", r"VARANASI", r"KANPUR", r"AYODHYA", r"AGRA"]),
    ("Maharashtra", [r"MAHARASHTRA", r"\bM\.S\.\b", r"MUMBAI", r"PUNE", r"NAGPUR", r"THANE", r"NASHIK"]),
    ("Bihar", [r"BIHAR", r"PATNA", r"GAYA", r"MUZAFFARPUR", r"BHAGALPUR"]),
    ("Assam", [r"ASSAM", r"GUWAHATI", r"JORHAT", r"BONGAIGAON", r"SILCHAR", r"NUMALIGARH"]),
    ("Tamil Nadu", [r"TAMIL NADU", r"\bT\.N\.\b", r"CHENNAI", r"MADURAI", r"COIMBATORE"]),
    ("Odisha", [r"ODISHA", r"ORISSA", r"BHUBANESWAR", r"CUTTACK", r"SAMBALPUR", r"PARADIP"]),
    ("Rajasthan", [r"RAJASTHAN", r"JAIPUR", r"JODHPUR", r"UDAIPUR", r"KOTA"]),
    ("Karnataka", [r"KARNATAKA", r"BENGALURU", r"BANGALORE", r"MYSORE", r"BELGAUM", r"MANGALORE"]),
    ("Madhya Pradesh", [r"MADHYA PRADESH", r"\bM\.P\.\b", r"BHOPAL", r"INDORE", r"JABALPUR", r"GWALIOR"]),
    ("Gujarat", [r"GUJARAT", r"AHMEDABAD", r"SURAT", r"VADODARA", r"RAJKOT", r"KANDLA"]),
    ("West Bengal", [r"WEST BENGAL", r"\bW\.B\.\b", r"KOLKATA", r"HOWRAH", r"SILIGURI", r"HALDIA"]),
    ("Andhra Pradesh", [r"ANDHRA PRADESH", r"\bA\.P\.\b", r"VISAKHAPATNAM", r"VIJAYAWADA", r"TIRUPATI"]),
    ("Telangana", [r"TELANGANA", r"HYDERABAD", r"WARANGAL"]),
    ("Jharkhand", [r"JHARKHAND", r"RANCHI", r"JAMSHEDPUR", r"DHANBAD", r"BOKARO"]),
    ("Chhattisgarh", [r"CHHATTISGARH", r"RAIPUR", r"BILASPUR", r"BHILAI"]),
    ("Punjab", [r"PUNJAB", r"AMRITSAR", r"LUDHIANA", r"JALANDHAR"]),
    ("Haryana", [r"HARYANA", r"GURGAON", r"GURUGRAM", r"FARIDABAD", r"PANIPAT"]),
    ("Kerala", [r"KERALA", r"KOCHI", r"THIRUVANANTHAPURAM", r"KOZHIKODE"]),
    ("Himachal Pradesh", [r"HIMACHAL PRADESH", r"\bH\.P\.\b", r"SHIMLA", r"MANALI", r"KULLU"]),
    ("Uttarakhand", [r"UTTARAKHAND", r"DEHRADUN", r"HARIDWAR", r"RISHIKESH"]),
    ("Jammu & Kashmir", [r"JAMMU & KASHMIR", r"JAMMU AND KASHMIR", r"\bJ&K\b", r"SRINAGAR", r"UDHAMPUR"]),
    ("Arunachal Pradesh", [r"ARUNACHAL PRADESH", r"ARUNACHAL", r"ITANAGAR"]),
    ("Northeast States", [r"MANIPUR", r"MEGHALAYA", r"MIZORAM", r"NAGALAND", r"TRIPURA", r"SIKKIM"]),
    ("Delhi & NCR", [r"DELHI", r"\bNCR\b", r"NOIDA"])
]

FOREST_HIGH_RISK_STATES = {
    "Jharkhand", "Odisha", "Assam", "Arunachal Pradesh",
    "Northeast States", "Chhattisgarh", "Uttarakhand"
}

def detect_sector(text):
    text_upper = str(text).upper()
    for sector_name, patterns in SECTOR_RULES:
        for p in patterns:
            if re.search(p, text_upper):
                return sector_name
    return "Other Infrastructure"

def detect_state(text):
    text_upper = str(text).upper()
    for state_name, patterns in STATES_DICT:
        for p in patterns:
            if re.search(p, text_upper):
                return state_name
    return "Multi-State / Central"

def assign_grounded_root_cause(row):
    """
    Synthesizes domain features and narratives to derive realistic, actionable root-cause categories.
    """
    delay = row.get("time_overrun_months", 0)
    risk = row.get("delay_risk_level", "Low")
    
    if delay <= 0 or risk == "Low":
        return "On Schedule"

    narrative = str(row.get("delay_narrative", "")).lower()
    name = str(row.get("project_name", "")).upper()
    state = str(row.get("state", ""))
    sector = str(row.get("sector", ""))
    cost_overrun_pct = row.get("cost_overrun_pct", 0)
    gap_pct = row.get("financial_vs_physical_gap_pct", 0)
    phys_pct = row.get("physical_progress_pct", 0)

    # 1. Text-based regex from delay narrative if present
    if "land" in narrative or "right of way" in narrative or "row" in narrative:
        return "Land Acquisition & Right of Way"
    if "forest" in narrative or "environment" in narrative or "wildlife" in narrative:
        return "Forest & Environmental Clearances"
    if "fund" in narrative or "finance" in narrative or "budget" in narrative:
        return "Fund Constraint & Financial Stress"
    if "contractor" in narrative or "vendor" in narrative or "agency" in narrative:
        return "Contractor / Vendor Non-Performance"
    if "court" in narrative or "litigation" in narrative or "agitation" in narrative or "order" in narrative:
        return "Legal Disputes & Local Agitations"

    # 2. Domain heuristics based on structural indicators
    if state in FOREST_HIGH_RISK_STATES and sector in ["Power & Renewable Energy", "Railways", "Road Transport & Highways"] and delay > 12:
        return "Forest & Environmental Clearances"
        
    if sector in ["Road Transport & Highways", "Railways", "Urban Metro & Transit"]:
        if any(term in name for term in ["BYPASS", "RING ROAD", "EXPRESSWAY", "DOUBLING", "FOUR LANING", "SIX LANING"]) or delay >= 18:
            return "Land Acquisition & Right of Way"
            
    if cost_overrun_pct > 30 and gap_pct > 15:
        return "Fund Constraint & Financial Stress"
        
    if cost_overrun_pct > 25 and delay > 24:
        return "Scope & Engineering Design Modifications"
        
    if phys_pct < 40 and delay > 15:
        return "Contractor / Vendor Non-Performance"

    return "Administrative & Inter-Agency Coordination"


def parse_date_to_months(date_str):
    if pd.isna(date_str):
        return np.nan
    s = str(date_str).strip()
    # Format: MM/YYYY or MM-YYYY
    m = re.search(r"(\d{1,2})[/-](\d{4})", s)
    if m:
        month = int(m.group(1))
        year = int(m.group(2))
        return year * 12 + month
    return np.nan


def load_and_engineer_features(csv_path):
    print(f"Loading raw dataset from: {csv_path}")
    df = pd.read_csv(csv_path, low_memory=False)
    print(f"Loaded {len(df):,} raw records.")

    # Combined text for entity extraction
    combined_text = df["project_name"].fillna("") + " " + df["agency"].fillna("")

    print("Extracting Sector and State domain features...")
    df["sector"] = combined_text.apply(detect_sector)
    df["state"] = combined_text.apply(detect_state)

    # Clean numeric fields
    numeric_cols = [
        "original_cost_cr", "anticipated_cost_cr", "cost_overrun_cr",
        "cost_overrun_pct", "cumulative_expenditure_cr",
        "physical_progress_pct", "financial_progress_pct",
        "financial_vs_physical_gap_pct", "time_overrun_months"
    ]
    for c in numeric_cols:
        df[c] = pd.to_numeric(df[c], errors="coerce").fillna(0.0)

    # Impute physical_progress_pct if missing:
    # Use financial_progress_pct bounded between 0 and 100 as reasonable baseline
    missing_phys = df["physical_progress_pct"] == 0.0
    df.loc[missing_phys, "physical_progress_pct"] = df.loc[missing_phys, "financial_progress_pct"].clip(0, 100)

    # Recompute financial vs physical gap (Key MoSPI S-Curve Indicator)
    df["financial_vs_physical_gap_pct"] = (df["financial_progress_pct"] - df["physical_progress_pct"]).round(2)

    # Additional Engineered Features
    df["cost_escalation_ratio"] = (df["anticipated_cost_cr"] / (df["original_cost_cr"] + 1e-3)).clip(0.5, 10.0).round(3)
    df["expenditure_burn_ratio"] = (df["cumulative_expenditure_cr"] / (df["original_cost_cr"] + 1e-3)).clip(0.0, 10.0).round(3)
    df["log_original_cost"] = np.log1p(df["original_cost_cr"].clip(lower=0)).round(3)
    
    # Financial Drain Anomaly Flag (MoSPI Key Risk Metric)
    # Triggered if financial expenditure outpaces physical completion by > 15%
    df["fund_drain_anomaly_flag"] = (df["financial_vs_physical_gap_pct"] > 15.0).astype(int)

    # Calculate planned duration in months
    appr_months = df["approval_date"].apply(parse_date_to_months)
    orig_doc_months = df["original_doc"].apply(parse_date_to_months)
    df["planned_duration_months"] = (orig_doc_months - appr_months).clip(1, 240).fillna(36.0)

    # Grounded Root Cause Target
    print("Deriving grounded root-cause target classification...")
    df["root_cause"] = df.apply(assign_grounded_root_cause, axis=1)

    # Clean targets
    df["time_overrun_months"] = df["time_overrun_months"].clip(lower=0.0).astype(float)
    df["delay_duration_days"] = (df["time_overrun_months"] * 30.4).round(0).astype(int)
    
    # Clean risk level (Low, Medium, High)
    def clean_risk(r, delay_m):
        if r in ["Low", "Medium", "High"]:
            return r
        if delay_m <= 0: return "Low"
        elif delay_m <= 12: return "Medium"
        else: return "High"
    df["risk_level"] = [clean_risk(r, d) for r, d in zip(df["delay_risk_level"], df["time_overrun_months"])]

    print("Feature engineering complete!")
    print("\nTarget Distributions:")
    print("--- Risk Level ---")
    print(df["risk_level"].value_counts())
    print("\n--- Root Cause ---")
    print(df["root_cause"].value_counts())
    print("\n--- Delay Overrun Stats (Months) ---")
    print(df["time_overrun_months"].describe().round(1))

    return df

if __name__ == "__main__":
    csv_path = r"C:\Users\murta\OneDrive\Desktop\SIH Project\paimana_master_dataset.csv"
    processed_df = load_and_engineer_features(csv_path)
    output_path = r"C:\Users\murta\OneDrive\Desktop\SIH Project\processed_paimana_features.csv"
    processed_df.to_csv(output_path, index=False)
    print(f"\nProcessed features saved to: {output_path}")
