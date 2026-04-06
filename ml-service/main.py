from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import joblib
import numpy as np
from collections import defaultdict

app = FastAPI(title="DiaEase ML Service - 2 Layer System")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# === LAYER 1: Global pretrained GBM model ===
global_model = joblib.load("model.pkl")
feature_names = ['glucose','iob','carbs','activity','hour','trend',
                 'mins_since_meal','glucose_velocity','prev_hypo_24h']

# === LAYER 2: Personal calibration per user ===
# Stores correction factors learned from each user's feedback
personal_factors = defaultdict(lambda: {
    "iob_sensitivity": 1.0,      # multiplier on IOB effect
    "glucose_sensitivity": 1.0,  # multiplier on glucose risk
    "feedback_count": 0,
    "correct_predictions": 0,
    "total_predictions": 0,
    "prediction_history": []     # last 20 predictions vs actuals
})

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
    user_id: Optional[str] = None  # for Layer 2 personalization

class FeedbackRequest(BaseModel):
    user_id: str
    glucose: float
    iob: float
    carbs: float
    activity: int
    hour: int
    trend: int
    mins_since_meal: float
    glucose_velocity: Optional[float] = -0.1
    prev_hypo_24h: Optional[int] = 0
    predicted_risk: float          # what we predicted
    actual_hypo: int               # 1 if hypo occurred, 0 if not
    actual_glucose: Optional[float] = None

@app.post("/predict")
def predict(req: PredictRequest):
    X = [[req.glucose, req.iob, req.carbs, req.activity,
          req.hour, req.trend, req.mins_since_meal,
          req.glucose_velocity, req.prev_hypo_24h]]

    # === LAYER 1: Global model prediction ===
    proba = global_model.predict_proba(X)[0]
    base_risk = float(proba[1])

    # === LAYER 2: Apply personal calibration if user has feedback history ===
    personal_risk = base_risk
    layer2_active = False
    personalization_progress = 0

    if req.user_id and req.user_id in personal_factors:
        pf = personal_factors[req.user_id]
        feedback_count = pf["feedback_count"]
        personalization_progress = min(feedback_count, 10)

        if feedback_count >= 5:
            # Apply learned sensitivity factors
            layer2_active = True
            iob_adjustment = (req.iob * (pf["iob_sensitivity"] - 1.0)) * 0.1
            glucose_adjustment = ((req.glucose - 5.0) * (pf["glucose_sensitivity"] - 1.0)) * 0.05
            personal_risk = base_risk + iob_adjustment + glucose_adjustment
            personal_risk = max(0.0, min(1.0, personal_risk))

    final_risk = int(personal_risk * 100)
    alert = "safe" if final_risk < 40 else "warn" if final_risk < 65 else "danger"
    predicted_glucose = round(max(1.5, min(20,
        req.glucose - (req.iob * 1.4) + (req.carbs * 0.03)
    )), 2)

    importances = {
        f: round(float(i), 3)
        for f, i in zip(feature_names, global_model.feature_importances_)
    }

    return {
        "riskScore": final_risk,
        "alertLevel": alert,
        "predictedGlucose30min": predicted_glucose,
        "hypoProba": round(personal_risk, 3),
        "confidence": round(float(max(proba)) * 100, 1),
        "featureImportances": importances,
        "modelVersion": "gbm-v1-ohio",
        "layer2Active": layer2_active,
        "personalizationProgress": personalization_progress,
        "feedbackNeeded": max(0, 5 - personal_factors[req.user_id]["feedback_count"]) if req.user_id else 5
    }

@app.post("/feedback")
def feedback(req: FeedbackRequest):
    pf = personal_factors[req.user_id]

    # Record this feedback
    pf["feedback_count"] += 1
    pf["total_predictions"] += 1

    # Was prediction correct?
    predicted_hypo = req.predicted_risk > 0.65
    actually_hypo = req.actual_hypo == 1

    if predicted_hypo == actually_hypo:
        pf["correct_predictions"] += 1

    # Store history
    pf["prediction_history"].append({
        "predicted_risk": req.predicted_risk,
        "actual_hypo": req.actual_hypo,
        "glucose": req.glucose,
        "iob": req.iob
    })
    # Keep only last 20
    if len(pf["prediction_history"]) > 20:
        pf["prediction_history"] = pf["prediction_history"][-20:]

    # === LAYER 2 CALIBRATION ===
    # After 5+ feedback events, learn personal sensitivity factors
    if pf["feedback_count"] >= 5:
        history = pf["prediction_history"]

        # Cases where we predicted no hypo but hypo occurred
        # = patient is MORE sensitive than global model thinks
        missed_hypos = [h for h in history if h["predicted_risk"] < 0.4 and h["actual_hypo"] == 1]

        # Cases where we predicted hypo but none occurred  
        # = patient is LESS sensitive than global model thinks
        false_alarms = [h for h in history if h["predicted_risk"] > 0.65 and h["actual_hypo"] == 0]

        # Adjust IOB sensitivity based on missed/false alarms
        if len(missed_hypos) > len(false_alarms):
            # Under-predicting risk — increase sensitivity
            pf["iob_sensitivity"] = min(1.5, pf["iob_sensitivity"] + 0.05)
            pf["glucose_sensitivity"] = min(1.5, pf["glucose_sensitivity"] + 0.05)
        elif len(false_alarms) > len(missed_hypos):
            # Over-predicting risk — decrease sensitivity
            pf["iob_sensitivity"] = max(0.5, pf["iob_sensitivity"] - 0.05)
            pf["glucose_sensitivity"] = max(0.5, pf["glucose_sensitivity"] - 0.05)

    accuracy = pf["correct_predictions"] / pf["total_predictions"] if pf["total_predictions"] > 0 else 0

    return {
        "status": "feedback recorded",
        "feedbackCount": pf["feedback_count"],
        "personalAccuracy": round(accuracy * 100, 1),
        "layer2Active": pf["feedback_count"] >= 5,
        "iobSensitivity": round(pf["iob_sensitivity"], 3),
        "glucoseSensitivity": round(pf["glucose_sensitivity"], 3),
        "message": f"Layer 2 {'active' if pf['feedback_count'] >= 5 else f'activates in {5 - pf[chr(34)]feedback_count[chr(34)]} more feedbacks'}"
    }

@app.get("/personal-profile/{user_id}")
def get_profile(user_id: str):
    if user_id not in personal_factors:
        return {"user_id": user_id, "feedback_count": 0, "layer2_active": False}
    pf = personal_factors[user_id]
    return {
        "user_id": user_id,
        "feedback_count": pf["feedback_count"],
        "layer2_active": pf["feedback_count"] >= 5,
        "iob_sensitivity": pf["iob_sensitivity"],
        "glucose_sensitivity": pf["glucose_sensitivity"],
        "accuracy": round(pf["correct_predictions"] / max(1, pf["total_predictions"]) * 100, 1)
    }

@app.get("/health")
def health():
    return {
        "status": "ok",
        "model": "gbm-v1-ohio",
        "layer1": "GradientBoostingClassifier trained on CGM data",
        "layer2": "Personal calibration via feedback loop",
        "active_users": len(personal_factors)
    }