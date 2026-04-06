DiaEase API Reference
POST /api/analyse
Input:
{
  "glucose": 5.4,
  "insulinDose": 2,
  "insulinType": "rapid",
  "hoursAgoInsulin": 1.5,
  "mealPreset": "normal",
  "carbGrams": 30,
  "activity": "resting",
  "trend": "falling"
}

Output:
{
  "riskScore": 55,
  "predictedGlucose30min": 4.1,
  "alertLevel": "warn",
  "iob": 1.2,
  "causalFactors": [
    { "name": "IOB", "weight": 0.35, "value": "1.2U active", "impact": "negative" }
  ]
}


POST /api/simulate
Input:
{
  "baseInput": { ...same as analyse... },
  "twin": { "runKm": 0, "carbsG": 0, "correctionInsulin": 0, "minutesAhead": 45 }
}

Output:
{
  "projectedGlucose": 3.9,
  "trajectory": [{"minute": 0, "glucose": 5.4}, ...60 points],
  "chipStatus": "warn",
  "advice": "Consider a small snack",
  "riskScore": 55
}


POST /api/explain
Input:
{ "riskScore": 55, "glucose": 5.4, "iob": 1.2, "alertLevel": "warn", "causalFactors": [] }

Output:
{ "narrative": "AI explanation string here" }


POST /api/session
Input: Full GlucoseInput + RiskOutput fields
Output: { "sessionId": "uuid" }

GET /api/session?id=uuid
Output: Full session row

POST /api/alerts
Input: { "alertLevel": "warn", "message": "...", "tier": 1, "sessionId": "uuid" }
Output: { "success": true }

GET /api/alerts?sessionId=uuid
Output: Last 20 alert events array

POST /api/passport
Input: { "sessionId": "uuid", "passportData": {} }
Output: { "passportId": "uuid", "passportUrl": "/passport/abc12345" }