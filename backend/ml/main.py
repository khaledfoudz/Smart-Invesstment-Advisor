from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import pandas as pd
import numpy as np
import joblib
import logging
import traceback

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("smia-ml")
print(">>> main.py loaded — NEW VERSION WITH LOGGING <<<", flush=True)
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

model               = joblib.load("model.pkl")
scaler              = joblib.load("scaler.pkl")
pca                 = joblib.load("pca.pkl")
reverse_profile_map = joblib.load("reverse_profile_mapping.pkl")
historical_summary  = joblib.load("historical_summary.pkl")
profile_to_risk     = joblib.load("profile_to_risk.pkl")
all_features        = joblib.load("all_features.pkl")

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

class InvestmentInput(BaseModel):
    income: float
    savings: float
    expenses: float
    debt: float
    dependents: int
    horizon: int    = Field(ge=2, le=15)
    reaction: int    = Field(ge=1, le=5)
    experience: int  = Field(ge=1, le=5)
    liquidity: int   = Field(ge=1, le=5)
    volatility: int  = Field(ge=1, le=5)

@app.post("/predict")
def predict(data: InvestmentInput):
    try:
        # Same derived features as training (FIX #6 in train.py)
        raw_stability = data.savings / (data.expenses + 1)
        financial_stability = float(np.clip(4 + raw_stability, 4, 10))

        behavioral_risk = float(np.clip(
            (data.reaction + data.experience + data.liquidity + data.volatility) / 4,
            1, 5
        ))

        user_data = pd.DataFrame([{
            "Monthly_Net_Income_EGP":          data.income,
            "Total_Liquid_Savings_EGP":        data.savings,
            "Monthly_Fixed_Expenses_EGP":      data.expenses,
            "Outstanding_Debt_EGP":            data.debt,
            "Financial_Dependents":            data.dependents,
            "Investment_Horizon_Years":        data.horizon,
            "Reaction_to_Loss_Ordinal":        data.reaction,
            "Investment_Experience_Ordinal":   data.experience,
            "Liquidity_Preference_Ordinal":    data.liquidity,
            "Familiarity_Volatility_Ordinal":  data.volatility,
            "Financial_Stability_Index":       financial_stability,
            "Behavioral_Risk_Index":           behavioral_risk,
        }])[all_features]

        user_scaled = scaler.transform(user_data)
        user_pca    = pca.transform(user_scaled)

        prediction    = model.predict(user_pca)[0]
        probabilities = model.predict_proba(user_pca)[0]

        confidence        = float(np.max(probabilities) * 100)
        investor_profile  = reverse_profile_map[prediction]
        target_risk       = profile_to_risk[investor_profile]

        candidates = historical_summary[
            historical_summary["Risk_Category"] == target_risk
        ].sort_values(by="Sharpe_Ratio", ascending=False)

        if candidates.empty:
            raise HTTPException(status_code=500, detail="No matching investments for this risk category")

        best   = candidates.iloc[0]
        others = candidates.iloc[1:4]["Base_Instrument"].tolist()

        investment_name = best["Base_Instrument"]
        description = investment_info.get(investment_name, "Investment description not available.")

        return {
            "recommendation":   investment_name,
            "description":      description,
            "category":         best["Asset_Class"],
            "investor_profile": investor_profile,
            "dbRisk":           target_risk,
            "confidence":       round(confidence, 2),
            "other_options":    others,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        logger.error("=== PREDICTION ERROR ===")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))