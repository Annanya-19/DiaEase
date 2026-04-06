from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import joblib
import numpy as np

app = FastAPI(title="DiaEase ML Service")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

model = joblib.load("model.pkl")
feature_names = ['glucose','iob','carbs','activity','hour','trend',
                 'mins_since_meal','glucose_velocity','prev_hypo_24h']

class PredictRequest(BaseModel):
    glucose: float
    iob: float
    carbs: float
    activity: int
    hour: int
    trend: int
    mins_since_meal: float
    glucose_velocity: Optional[float] = -0.1
    prev_hypo_24h: Optional[int] = 0

@app.post("/predict")
def predict(req: PredictRequest):
    X = [[req.glucose, req.iob, req.carbs, req.activity,
          req.hour, req.trend, req.mins_since_meal,
          req.glucose_velocity, req.prev_hypo_24h]]
    
    proba = model.predict_proba(X)[0]
    risk = int(proba[1] * 100)
    alert = "safe" if risk < 40 else "warn" if risk < 65 else "danger"
    predicted_glucose = round(max(1.5, min(20,
        req.glucose - (req.iob * 1.4) + (req.carbs * 0.03)
    )), 2)
    importances = {
        f: round(float(i), 3)
        for f, i in zip(feature_names, model.feature_importances_)
    }

    return {
        "riskScore": risk,
        "alertLevel": alert,
        "predictedGlucose30min": predicted_glucose,
        "hypoProba": round(float(proba[1]), 3),
        "confidence": round(float(max(proba)) * 100, 1),
        "featureImportances": importances,
        "modelVersion": "gbm-v1-ohio"
    }

@app.post("/feedback")
def feedback(req: PredictRequest, actual_hypo: int = 0):
    X = [[req.glucose, req.iob, req.carbs, req.activity,
          req.hour, req.trend, req.mins_since_meal,
          req.glucose_velocity, req.prev_hypo_24h]]
    model.fit(X, [actual_hypo])
    return {"status": "model updated"}

@app.get("/health")
def health():
    return {"status": "ok", "model": "gbm-v1-ohio", "features": feature_names}