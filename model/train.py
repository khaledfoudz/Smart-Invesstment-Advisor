# ==========================================
# IMPORT LIBRARIES
# ==========================================

import pandas as pd
import numpy as np

from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score, f1_score, classification_report,
    confusion_matrix, silhouette_score
)

from xgboost import XGBClassifier


# ==========================================
# LOAD DATASETS
# ==========================================

retail_df = pd.read_csv("egyptian_retail_investors_synthetic.csv")
historical_df = pd.read_csv("egypt_investment_historical_dataset.csv")


# ==========================================
# FEATURE SELECTION
# ==========================================

retail_df = retail_df.drop("Index", axis=1)

# All features used by the final classifier (wealth + behavior).
all_features = [
    "Monthly_Net_Income_EGP",
    "Total_Liquid_Savings_EGP",
    "Monthly_Fixed_Expenses_EGP",
    "Outstanding_Debt_EGP",
    "Financial_Dependents",
    "Investment_Horizon_Years",
    "Reaction_to_Loss_Ordinal",
    "Investment_Experience_Ordinal",
    "Liquidity_Preference_Ordinal",
    "Familiarity_Volatility_Ordinal",
    "Financial_Stability_Index",
    "Behavioral_Risk_Index"
]

# Subset used ONLY for clustering: behavior/risk-related columns.
# Wealth columns (income, savings, expenses, debt) are deliberately
# excluded here -- see note below FIX #2.
risk_features = [
    "Investment_Horizon_Years",
    "Reaction_to_Loss_Ordinal",
    "Investment_Experience_Ordinal",
    "Liquidity_Preference_Ordinal",
    "Familiarity_Volatility_Ordinal",
    "Behavioral_Risk_Index"
]

X = retail_df[all_features].copy()


# ==========================================
# HANDLE MISSING VALUES (FIX #1)
# ==========================================
# ~44% of rows had at least one NaN among the selected features.
# StandardScaler/PCA/KMeans cannot handle NaN, so we impute with
# the median (robust to outliers, appropriate for skewed financial data).

print("Rows with at least one missing value (before imputation):",
      X.isnull().any(axis=1).sum(), "/", len(X))

imputer = SimpleImputer(strategy="median")
X_imputed = pd.DataFrame(
    imputer.fit_transform(X),
    columns=all_features,
    index=X.index
)

print("Rows with missing values after imputation:",
      X_imputed.isnull().any(axis=1).sum(), "/", len(X_imputed))


# ==========================================
# SCALING (full feature set, used by the classifier)
# ==========================================

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X_imputed)


# ==========================================
# PCA (on full feature set, for the classifier)
# ==========================================

pca = PCA(n_components=0.95, random_state=42)
X_pca = pca.fit_transform(X_scaled)

print("\nPCA components kept:", pca.n_components_,
      "out of", X_scaled.shape[1], "original features")
print("Explained variance ratio (cumulative):",
      round(np.sum(pca.explained_variance_ratio_), 4))


# ==========================================
# KMEANS CLUSTERING (FIX #2: cluster on behavior only)
# ==========================================
# PROBLEM FOUND DURING TESTING:
# Clustering on ALL features (including income/savings/debt) made
# KMeans split investors mainly by WEALTH, not by risk attitude.
# Two clusters ended up with almost identical mean Behavioral_Risk_Index
# (4.0 vs 4.0), differing only in income/savings. A test with 8 manual
# scenarios spanning "very conservative" to "very aggressive" showed
# 6 of 8 falling into the same "Growth" bucket, and a deliberately
# extreme "very aggressive" input was never classified as Aggressive,
# because it wasn't wealthy enough -- even though all behavioral
# answers were maxed out. Silhouette score for k=4 on all features
# was also weak (0.19).
#
# FIX: cluster only on behavior/risk-related columns (risk_features).
# Wealth still feeds into the final XGBoost classifier (all_features),
# it's just not used to DEFINE the segments. This separates "how much
# money someone has" from "how much risk they're willing to take",
# which is the actual concept Investor_Profile is meant to capture.

risk_scaler = StandardScaler()
X_risk_scaled = risk_scaler.fit_transform(X_imputed[risk_features])

print("\nSilhouette scores by k (on risk/behavior features):")
for k in [3, 4, 5]:
    km_test = KMeans(n_clusters=k, random_state=42, n_init=10)
    labels_test = km_test.fit_predict(X_risk_scaled)
    score = silhouette_score(X_risk_scaled, labels_test, sample_size=2000, random_state=42)
    print(f"  k={k}: silhouette={score:.4f}")

kmeans = KMeans(
    n_clusters=4,
    random_state=42,
    n_init=10
)

retail_df["Cluster"] = kmeans.fit_predict(X_risk_scaled)


# ==========================================
# CLUSTER ANALYSIS
# ==========================================

retail_df["Behavioral_Risk_Index_Imputed"] = X_imputed["Behavioral_Risk_Index"].values
retail_df["Investment_Horizon_Years_Imputed"] = X_imputed["Investment_Horizon_Years"].values

cluster_summary = retail_df.groupby("Cluster")[
    ["Behavioral_Risk_Index_Imputed", "Investment_Horizon_Years_Imputed"]
].mean()

print("\nCluster Summary (mean values):")
print(cluster_summary)
print("\nCluster sizes:")
print(retail_df["Cluster"].value_counts().sort_index())


# ==========================================
# ASSIGN INVESTOR PROFILES (FIX #3)
# ==========================================
# Rank clusters by Behavioral_Risk_Index alone. With clustering now done
# on behavior-only features, this index cleanly separates the 4 clusters
# (unlike before, where two clusters had nearly identical risk means).

sorted_clusters = cluster_summary["Behavioral_Risk_Index_Imputed"].sort_values().index.tolist()

cluster_to_profile = {
    sorted_clusters[0]: "Conservative Investor",
    sorted_clusters[1]: "Balanced Investor",
    sorted_clusters[2]: "Growth Investor",
    sorted_clusters[3]: "Aggressive Investor"
}

retail_df["Investor_Profile"] = retail_df["Cluster"].map(cluster_to_profile)

print("\nInvestor Profile distribution:")
print(retail_df["Investor_Profile"].value_counts())


# ==========================================
# PREPARE DATA FOR XGBOOST
# ==========================================

y = retail_df["Investor_Profile"]

profile_mapping = {
    "Conservative Investor": 0,
    "Balanced Investor": 1,
    "Growth Investor": 2,
    "Aggressive Investor": 3
}

reverse_profile_mapping = {v: k for k, v in profile_mapping.items()}

y = y.map(profile_mapping)


# ==========================================
# TRAIN / VALIDATION / TEST SPLIT (FIX #4)
# ==========================================
# 70% train / 15% validation / 15% test.
# The classifier is trained on X_pca (full feature set, wealth + behavior)
# so it can use income/savings/etc. as predictive signals even though
# those columns did not define the cluster labels themselves.

X_train, X_temp, y_train, y_temp = train_test_split(
    X_pca, y,
    test_size=0.30,
    random_state=42,
    stratify=y
)

X_val, X_test, y_val, y_test = train_test_split(
    X_temp, y_temp,
    test_size=0.50,
    random_state=42,
    stratify=y_temp
)

print("\nSplit sizes -> train:", len(X_train),
      "val:", len(X_val), "test:", len(X_test))


# ==========================================
# TRAIN XGBOOST
# ==========================================

model = XGBClassifier(
    n_estimators=200,
    max_depth=5,
    learning_rate=0.1,
    subsample=0.8,
    colsample_bytree=0.8,
    objective="multi:softprob",
    num_class=4,
    random_state=42,
    eval_metric="mlogloss"
)

model.fit(
    X_train, y_train,
    eval_set=[(X_val, y_val)],
    verbose=False
)


# ==========================================
# EVALUATE MODEL (FIX #5: more than accuracy)
# ==========================================

val_predictions = model.predict(X_val)
test_predictions = model.predict(X_test)

val_accuracy = accuracy_score(y_val, val_predictions)
test_accuracy = accuracy_score(y_test, test_predictions)

val_f1 = f1_score(y_val, val_predictions, average="macro")
test_f1 = f1_score(y_test, test_predictions, average="macro")

print("\n===== Model Performance =====")
print("Validation Accuracy:", round(val_accuracy * 100, 2), "%")
print("Validation F1 (macro):", round(val_f1, 4))
print("Test Accuracy:", round(test_accuracy * 100, 2), "%")
print("Test F1 (macro):", round(test_f1, 4))

print("\nClassification Report (Test Set):")
print(classification_report(
    y_test, test_predictions,
    target_names=list(profile_mapping.keys())
))

print("Confusion Matrix (Test Set):")
print(confusion_matrix(y_test, test_predictions))


# ==========================================
# CLEAN HISTORICAL DATA
# ==========================================

historical_df["Base_Instrument"] = historical_df["Instrument_Name"].str.replace(
    r" Variant-\d+", "", regex=True
)

historical_summary = historical_df.groupby(
    ["Base_Instrument", "Asset_Class", "Risk_Category"],
    as_index=False
).agg({
    "Sharpe_Ratio": "mean",
    "Expected_Annual_Return": "mean"
})


# ==========================================
# PROFILE TO RISK MAPPING
# ==========================================

profile_to_risk = {
    "Conservative Investor": "Low",
    "Balanced Investor": "Medium",
    "Growth Investor": "High",
    "Aggressive Investor": "High"
}


# ==========================================
# INVESTMENT DESCRIPTIONS
# ==========================================

investment_info = {
    "EGX30 Index Fund": "Invests in Egypt's largest companies.",
    "Commercial International Bank (CIB) Stock": "Investment in one of Egypt's leading banks.",
    "Equity Mutual Funds": "A diversified portfolio of stocks.",
    "EGX Sector ETFs": "Exchange traded funds tracking market sectors.",
    "Government Bonds": "Low-risk investment backed by the government.",
    "Money Market Funds": "Short-term investment with high liquidity.",
    "Certificates of Deposit": "Fixed-income investment with stable returns.",
    "1-Year Treasury Bills": "Government-issued short-term debt instrument.",
    "Balanced Mutual Funds": "Combination of stocks and bonds.",
    "Corporate Bond Funds": "Invests in bonds issued by companies.",
    "Egyptian REITs": "Real estate investment trusts.",
    "USD Certificates (EGP Equivalent)": "Certificate linked to USD value."
}


# ==========================================
# PERSIST ARTIFACTS FOR THE API SERVICE
# ==========================================

import joblib

joblib.dump(model, "model.pkl")
joblib.dump(scaler, "scaler.pkl")
joblib.dump(pca, "pca.pkl")
joblib.dump(reverse_profile_mapping, "reverse_profile_mapping.pkl")
joblib.dump(historical_summary, "historical_summary.pkl")
joblib.dump(profile_to_risk, "profile_to_risk.pkl")
joblib.dump(all_features, "all_features.pkl")

print("\nArtifacts saved: model.pkl, scaler.pkl, pca.pkl, "
      "reverse_profile_mapping.pkl, historical_summary.pkl, "
      "profile_to_risk.pkl, all_features.pkl")
