# DiaEase AI Agent Backend & REST APIs

Decision-support AI Agent backend for the **DiaEase** MVP hackathon project.

> **Safety Disclaimer**:
> DiaEase is a prototype decision-support system and is not a medical device or a substitute for professional medical advice.

---

## Getting Started

### 1. Install Dependencies
```bash
pip install -r backend/requirements.txt
```

### 2. Run the Backend Server
```bash
python backend/app.py
```
The server will start at `http://127.0.0.1:5000` (or the port defined by `PORT` env var). CORS is enabled for all origins.

### 3. Run Automated Tests
```bash
python backend/test_agent.py
```

---

## REST API Reference

### 1. Complete Agent Workflow Analysis
**`POST /api/analyze`**

Evaluates hypoglycaemia risk, projects 30-minute glucose trajectory, logs entry to history, and proposes a follow-up action if risk is elevated.

#### Request Body (JSON)
Both snake_case and camelCase keys are accepted.
```json
{
  "current_glucose": 82,
  "trend": "falling",
  "insulin_taken": "yes",
  "insulin_dose": 3.5,
  "time_since_insulin": 1.0,
  "recent_meal": "no",
  "carbs": 0,
  "activity_level": "moderate",
  "time_of_day": "afternoon"
}
```

#### Response Body (JSON - 200 OK)
```json
{
  "session_id": 1,
  "risk_level": "HIGH",
  "risk_score": 85,
  "factors": [
    "Borderline low current glucose (82 mg/dL)",
    "Falling glucose trend",
    "Recent insulin administration (3.5 U active peak at 1h)",
    "Lack of recent carbohydrate buffer with active insulin",
    "Physical activity"
  ],
  "explanation": "The current context indicates elevated near-term hypoglycaemia risk driven by borderline low current glucose (82 mg/dl), falling glucose trend, recent insulin administration (3.5 u active peak at 1h). Prompt follow-up is recommended to prevent a potential low.",
  "prediction": {
    "current_glucose": 82,
    "predicted_glucose": 65,
    "direction": "falling",
    "trajectory": [
      {"minute": 0, "glucose": 82},
      {"minute": 10, "glucose": 76},
      {"minute": 20, "glucose": 70},
      {"minute": 30, "glucose": 65}
    ]
  },
  "action_proposed": true,
  "proposed_action": {
    "id": "act_a1b2c3d4",
    "action": "glucose_recheck_reminder",
    "title": "30-Minute Glucose Re-Check Reminder",
    "message": "Your current context suggests increased risk. Would you like to set a glucose re-check reminder?",
    "requires_approval": true,
    "status": "proposed"
  },
  "disclaimer": "DiaEase is a prototype decision-support system and is not a medical device or a substitute for professional medical advice."
}
```

---

### 2. Propose Action Explicitly
**`POST /api/action/propose`**

Generates a recommended agent action for a given context.
```json
{
  "current_glucose": 78,
  "trend": "falling",
  "insulin_taken": true,
  "insulin_dose": 2.0,
  "activity_level": "moderate"
}
```

---

### 3. Approve Action
**`POST /api/action/approve`**

Called when the user clicks **[ APPROVE ]** on the UI. Executes the proposed action and updates its status to `executed`.

#### Request Body
```json
{
  "action_id": "act_a1b2c3d4"
}
```

#### Response Body
```json
{
  "success": true,
  "status": "executed",
  "message": "Follow-up reminder '30-Minute Glucose Re-Check Reminder' has been scheduled and recorded in DiaEase decision log.",
  "action": {
    "id": "act_a1b2c3d4",
    "status": "executed",
    "action": "glucose_recheck_reminder",
    "title": "30-Minute Glucose Re-Check Reminder"
  }
}
```

---

### 4. Dismiss Action
**`POST /api/action/dismiss`**

Called when the user clicks **[ DISMISS ]** on the UI. Updates status to `dismissed` without executing.

#### Request Body
```json
{
  "action_id": "act_a1b2c3d4"
}
```

#### Response Body
```json
{
  "success": true,
  "status": "dismissed",
  "message": "Action proposal was dismissed by user.",
  "action": {
    "id": "act_a1b2c3d4",
    "status": "dismissed"
  }
}
```

---

### 5. View History
**`GET /api/history?limit=20`**

Returns recorded history entries and past proposed actions.

---

### 6. Adaptive Pattern Recommendation
**`GET /api/recommendation`**

Analyzes previous session history.
- If fewer than 3 entries: returns `pattern_detected: false` with guidance to log more entries.
- If repeated risk factors are found: returns personalized pattern insight and proactive recommendation.
