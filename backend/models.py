from typing import Dict, Any, Tuple, Optional, List

DISCLAIMER = "DiaEase is a prototype decision-support system and is not a medical device or a substitute for professional medical advice."

def normalize_bool(val: Any) -> bool:
    if isinstance(val, bool):
        return val
    if isinstance(val, (int, float)):
        return val != 0
    if isinstance(val, str):
        return val.strip().lower() in ("yes", "y", "true", "t", "1")
    return False

def parse_user_context(data: Dict[str, Any]) -> Tuple[Dict[str, Any], Optional[str]]:
    """
    Validates and normalizes user context parameters.
    Handles both camelCase and snake_case formats.
    """
    if not isinstance(data, dict):
        return {}, "Input payload must be a JSON object"

    # Current glucose
    raw_glucose = data.get("current_glucose") or data.get("glucose") or data.get("currentGlucose")
    if raw_glucose is None:
        return {}, "current_glucose is required"
    try:
        current_glucose = float(raw_glucose)
        if current_glucose <= 0:
            return {}, "current_glucose must be a positive number"
    except (ValueError, TypeError):
        return {}, "current_glucose must be a numeric value"

    # Trend
    raw_trend = data.get("trend") or data.get("glucose_trend") or data.get("glucoseTrend") or "stable"
    trend = str(raw_trend).strip().lower()
    if trend not in ["rising", "stable", "falling", "rapidly_rising", "rapidly_falling"]:
        if "fall" in trend or "down" in trend:
            trend = "falling"
        elif "rise" in trend or "up" in trend:
            trend = "rising"
        else:
            trend = "stable"

    # Insulin taken
    raw_insulin = data.get("insulin_taken") if "insulin_taken" in data else data.get("insulinTaken")
    if raw_insulin is None:
        raw_insulin = data.get("insulin", False)
    insulin_taken = normalize_bool(raw_insulin)

    # Insulin dose
    raw_dose = data.get("insulin_dose") or data.get("insulinDose") or data.get("dose") or 0
    try:
        insulin_dose = max(0.0, float(raw_dose))
    except (ValueError, TypeError):
        insulin_dose = 0.0

    # If dose was provided > 0, insulin_taken can be inferred True
    if insulin_dose > 0:
        insulin_taken = True

    # Time since insulin (in hours)
    raw_time_insulin = data.get("time_since_insulin") or data.get("timeSinceInsulin") or data.get("hoursAgoInsulin") or 0
    try:
        time_since_insulin = max(0.0, float(raw_time_insulin))
    except (ValueError, TypeError):
        time_since_insulin = 0.0

    # Recent meal
    raw_meal = data.get("recent_meal") if "recent_meal" in data else data.get("recentMeal")
    if raw_meal is None:
        raw_meal = data.get("meal", False)
    recent_meal = normalize_bool(raw_meal)

    # Carbs
    raw_carbs = data.get("carbs") or data.get("carbohydrates") or data.get("carbGrams") or data.get("carbohydrate_intake") or 0
    try:
        carbs = max(0.0, float(raw_carbs))
    except (ValueError, TypeError):
        carbs = 0.0

    if carbs > 0:
        recent_meal = True

    # Activity level
    raw_activity = data.get("activity_level") or data.get("activityLevel") or data.get("activity") or "resting"
    activity_str = str(raw_activity).strip().lower()
    if any(k in activity_str for k in ["high", "intense", "heavy", "exercise", "running", "gym", "workout"]):
        activity_level = "intense"
    elif any(k in activity_str for k in ["moderate", "medium", "walking"]):
        activity_level = "moderate"
    elif any(k in activity_str for k in ["light", "low"]):
        activity_level = "light"
    else:
        activity_level = "resting"

    # Time of day
    raw_tod = data.get("time_of_day") or data.get("timeOfDay") or "afternoon"
    time_of_day = str(raw_tod).strip().lower()

    normalized = {
        "current_glucose": current_glucose,
        "trend": trend,
        "insulin_taken": insulin_taken,
        "insulin_dose": insulin_dose,
        "time_since_insulin": time_since_insulin,
        "recent_meal": recent_meal,
        "carbs": carbs,
        "activity_level": activity_level,
        "time_of_day": time_of_day
    }
    return normalized, None
