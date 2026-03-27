from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import joblib

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

model          = joblib.load("model.pkl")
encoders       = joblib.load("encoders.pkl")
target_encoder = joblib.load("target_encoder.pkl")

class InvestmentInput(BaseModel):
    age: float
    salary: float
    savings: float
    investment_value: float
    risk_tolerance: str
    investment_horizon: str

@app.post("/predict")
def predict(data: InvestmentInput):
    try:
        risk_encoded    = encoders["Risk_Tolerance"].transform([data.risk_tolerance])[0]
        horizon_encoded = encoders["Investment_Horizon"].transform([data.investment_horizon])[0]
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid input value: {e}")

    user_df = pd.DataFrame([{
        "Age":                data.age,
        "Salary":             data.salary,
        "Savings":            data.savings,
        "Investment_Value":   data.investment_value,
        "Risk_Tolerance":     risk_encoded,
        "Investment_Horizon": horizon_encoded
    }])

    user_df    = user_df[model.feature_names_in_]
    prediction = model.predict(user_df)[0]
    result     = target_encoder.inverse_transform([prediction])[0]

    return {"recommendation": result}