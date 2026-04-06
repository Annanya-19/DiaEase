from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import joblib
import numpy as np


app = FastAPI(title="DiaEase ML Service - 2 Layer System")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# === LAYER 1: Global pretrained GBM model ===
global_model = joblib.load("model.pkl")
feature_names = ['glucose','iob','carbs','activity','hour','trend',
                 'mins_since_meal','glucose_velocity','prev_hypo_24h']

# === LAYER 2: Personal calibration per user ===
personal_factors = {}

def get_user_profile(user_id: str):
    if user_id not in personal_factors:
        personal_factors[user_id] = {
            "iob_sensitivity": 1.0,
            "glucose_sensitivity": 1.0,
            "feedback_count": 0,
            "correct_predictions": 0,
            "total_predictions": 0,
            "prediction_history": []
        }
    return personal_factors[user_id]

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
    user_id: Optional[str] = None

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
    predicted_risk: float
    actual_hypo: int
    actual_glucose: Optional[float] = None

@app.post("/predict")
def predict(req: PredictRequest):
    X = [[req.glucose, req.iob, req.carbs, req.activity,
          req.hour, req.trend, req.mins_since_meal,
          req.glucose_velocity, req.prev_hypo_24h]]

    proba = global_model.predict_proba(X)[0]
    base_risk = float(proba[1])

    personal_risk = base_risk
    layer2_active = False
    personalization_progress = 0
    feedback_needed = 5

    if req.user_id:
        pf = get_user_profile(req.user_id)
        feedback_count = pf["feedback_count"]
        personalization_progress = min(feedback_count, 10)
        feedback_needed = max(0, 5 - feedback_count)

        if feedback_count >= 5:
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
        "feedbackNeeded": feedback_needed
    }

@app.post("/feedback")
def feedback(req: FeedbackRequest):
    pf = get_user_profile(req.user_id)

    pf["feedback_count"] += 1
    pf["total_predictions"] += 1

    predicted_hypo = req.predicted_risk > 0.65
    actually_hypo = req.actual_hypo == 1

    if predicted_hypo == actually_hypo:
        pf["correct_predictions"] += 1

    pf["prediction_history"].append({
        "predicted_risk": req.predicted_risk,
        "actual_hypo": req.actual_hypo,
        "glucose": req.glucose,
        "iob": req.iob
    })

    if len(pf["prediction_history"]) > 20:
        pf["prediction_history"] = pf["prediction_history"][-20:]

    if pf["feedback_count"] >= 5:
        history = pf["prediction_history"]
        missed_hypos = [h for h in history if h["predicted_risk"] < 0.4 and h["actual_hypo"] == 1]
        false_alarms = [h for h in history if h["predicted_risk"] > 0.65 and h["actual_hypo"] == 0]

        if len(missed_hypos) > len(false_alarms):
            pf["iob_sensitivity"] = min(1.5, pf["iob_sensitivity"] + 0.05)
            pf["glucose_sensitivity"] = min(1.5, pf["glucose_sensitivity"] + 0.05)
        elif len(false_alarms) > len(missed_hypos):
            pf["iob_sensitivity"] = max(0.5, pf["iob_sensitivity"] - 0.05)
            pf["glucose_sensitivity"] = max(0.5, pf["glucose_sensitivity"] - 0.05)

    accuracy = pf["correct_predictions"] / pf["total_predictions"] if pf["total_predictions"] > 0 else 0
    feedbacks_remaining = max(0, 5 - pf["feedback_count"])

    if pf["feedback_count"] >= 5:
        layer2_msg = "Layer 2 active - model is personalised to you"
    else:
        layer2_msg = f"Layer 2 activates in {feedbacks_remaining} more feedbacks"

    return {
        "status": "feedback recorded",
        "feedbackCount": pf["feedback_count"],
        "personalAccuracy": round(accuracy * 100, 1),
        "layer2Active": pf["feedback_count"] >= 5,
        "iobSensitivity": round(pf["iob_sensitivity"], 3),
        "glucoseSensitivity": round(pf["glucose_sensitivity"], 3),
        "message": layer2_msg
    }

@app.get("/personal-profile/{user_id}")
def get_profile(user_id: str):
    if user_id not in personal_factors:
        return {"user_id": user_id, "feedback_count": 0, "layer2_active": False}
    pf = personal_factors[user_id]
    accuracy = round(pf["correct_predictions"] / max(1, pf["total_predictions"]) * 100, 1)
    return {
        "user_id": user_id,
        "feedback_count": pf["feedback_count"],
        "layer2_active": pf["feedback_count"] >= 5,
        "iob_sensitivity": pf["iob_sensitivity"],
        "glucose_sensitivity": pf["glucose_sensitivity"],
        "accuracy": accuracy
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