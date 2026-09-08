import uuid
import math
from typing import Dict, Any, List, Tuple, Optional
from models import DISCLAIMER
import database

class DiaEaseAgent:
    """
    DiaEase Intelligent Decision-Support Agent for Hypoglycaemia Risk Mitigation.
    Executes the 4-phase workflow:
    1. Hypoglycaemia Risk Assessment
    2. 30-Minute Glucose Prediction Trajectory
    3. Autonomous Follow-up Decision & Action Proposal Engine
    4. Adaptive Pattern Recommendation from Historic Records
    """

    def __init__(self):
        database.init_db()

    # =========================================================================
    # FEATURE 1: HYPOGLYCAEMIA RISK ASSESSMENT
    # =========================================================================
    def assess_risk(self, ctx: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyzes multi-factorial diabetes context to calculate risk score (0-100),
        risk level (LOW, MODERATE, HIGH), primary contributing factors, and explanation.
        """
        glucose = ctx["current_glucose"]
        trend = ctx["trend"]
        insulin_taken = ctx["insulin_taken"]
        insulin_dose = ctx["insulin_dose"]
        time_since_insulin = ctx["time_since_insulin"]
        recent_meal = ctx["recent_meal"]
        carbs = ctx["carbs"]
        activity = ctx["activity_level"]
        time_of_day = ctx["time_of_day"]

        score = 0
        factors: List[str] = []

        # 1. Baseline Glucose Level Proximity to Hypo (<70 mg/dL)
        if glucose < 60:
            score += 65
            factors.append(f"Severely low current glucose ({glucose:g} mg/dL)")
        elif glucose < 70:
            score += 55
            factors.append(f"Current glucose below clinical target ({glucose:g} mg/dL)")
        elif glucose < 80:
            score += 40
            factors.append(f"Borderline low current glucose ({glucose:g} mg/dL)")
        elif glucose < 90:
            score += 25
            factors.append(f"Lower-normal glucose range ({glucose:g} mg/dL)")
        elif glucose <= 140:
            score += 10
        elif glucose <= 180:
            score += 5
        else:
            score += 2  # Hyperglycaemia present, low baseline hypo risk

        # 2. Glucose Trend Impact
        if trend in ["falling", "rapidly_falling"]:
            if glucose < 90:
                score += 30
            else:
                score += 20
            factors.append("Falling glucose trend")
        elif trend == "stable":
            # Neutral
            pass
        elif trend in ["rising", "rapidly_rising"]:
            score = max(0, score - 15)

        # 3. Active Insulin / Insulin on Board (IOB) Kinetics
        if insulin_taken and insulin_dose > 0:
            if time_since_insulin <= 1.5:
                # Peak insulin pharmacodynamics
                insulin_weight = min(28, 14 + int(insulin_dose * 3.5))
                score += insulin_weight
                factors.append(f"Recent insulin administration ({insulin_dose:g} U active peak at {time_since_insulin:g}h)")
            elif time_since_insulin <= 3.5:
                # Active tail
                insulin_weight = min(18, 8 + int(insulin_dose * 2.0))
                score += insulin_weight
                factors.append(f"Active insulin on board ({insulin_dose:g} U taken {time_since_insulin:g}h ago)")
            else:
                score += 4
        elif insulin_taken:
            # Insulin taken without dose specified
            score += 15
            factors.append("Recent insulin administration")

        # 4. Carbohydrate Intake Counter-action
        if recent_meal and carbs > 0:
            if carbs >= 40:
                score = max(5, score - 22)
            elif carbs >= 20:
                score = max(5, score - 14)
            else:
                score = max(5, score - 6)
        elif not recent_meal and insulin_taken and (glucose < 100 or activity in ["moderate", "intense"]):
            score += 10
            factors.append("Lack of recent carbohydrate buffer with active insulin")

        # 5. Physical Activity Clearance Acceleration
        if activity == "intense":
            score += 24
            factors.append("Intense physical activity accelerating glucose clearance")
            if insulin_taken and time_since_insulin <= 3.0:
                score += 8  # Exercise-induced insulin sensitivity surge
        elif activity == "moderate":
            score += 15
            factors.append("Physical activity")
        elif activity == "light":
            score += 5

        # 6. Time of Day Context (Nocturnal Vulnerability)
        if time_of_day in ["night", "bedtime", "late_night"]:
            if glucose < 95 or (insulin_taken and time_since_insulin <= 2.5):
                score += 8
                factors.append("Elevated nocturnal hypoglycaemia vulnerability window")

        # Clamp score to [0, 100]
        risk_score = max(0, min(100, int(round(score))))

        # Determine Risk Level Category
        if risk_score >= 68:
            risk_level = "HIGH"
        elif risk_score >= 38:
            risk_level = "MODERATE"
        else:
            risk_level = "LOW"

        # Generate Plain-English Explanation
        explanation = self._build_explanation(risk_level, risk_score, factors, ctx)

        return {
            "risk_level": risk_level,
            "risk_score": risk_score,
            "factors": factors,
            "explanation": explanation,
            "disclaimer": DISCLAIMER
        }

    def _build_explanation(self, risk_level: str, score: int, factors: List[str], ctx: Dict[str, Any]) -> str:
        if risk_level == "HIGH":
            if factors:
                factor_summary = ", ".join(factors[:3]).lower()
                return f"The current context indicates elevated near-term hypoglycaemia risk driven by {factor_summary}. Prompt follow-up is recommended to prevent a potential low."
            return "The current context suggests increased near-term hypoglycaemia risk."
        elif risk_level == "MODERATE":
            if factors:
                factor_summary = ", ".join(factors[:2]).lower()
                return f"Moderate hypoglycaemia risk identified due to {factor_summary}. Close monitoring of your glucose trajectory is advised."
            return "Moderate risk of hypoglycaemic trend detected based on your current context."
        else:
            return "Current glucose readings and context remain stable. Near-term hypoglycaemia risk is low."

    # =========================================================================
    # FEATURE 2: 30-MINUTE GLUCOSE PREDICTION
    # =========================================================================
    def predict_trajectory(self, ctx: Dict[str, Any]) -> Dict[str, Any]:
        """
        Simulates near-term glucose trajectory across minutes 0, 10, 20, 30
        using transparent multi-factorial simulation dynamics.
        """
        current_glucose = float(ctx["current_glucose"])
        trend = ctx["trend"]
        insulin_taken = ctx["insulin_taken"]
        insulin_dose = ctx["insulin_dose"]
        time_since_insulin = ctx["time_since_insulin"]
        carbs = ctx["carbs"]
        recent_meal = ctx["recent_meal"]
        activity = ctx["activity_level"]

        # Calculate 30-minute delta components
        # 1. Trend velocity component (mg/dL per 30 mins)
        if trend in ["rapidly_falling"]:
            trend_delta_30 = -24.0
        elif trend == "falling":
            trend_delta_30 = -13.0
        elif trend in ["rapidly_rising"]:
            trend_delta_30 = +22.0
        elif trend == "rising":
            trend_delta_30 = +12.0
        else:
            trend_delta_30 = 0.0

        # 2. Insulin consumption component
        insulin_delta_30 = 0.0
        if insulin_taken and insulin_dose > 0:
            if time_since_insulin <= 1.5:
                insulin_delta_30 = -min(22.0, insulin_dose * 4.5)
            elif time_since_insulin <= 3.0:
                insulin_delta_30 = -min(14.0, insulin_dose * 2.8)
            else:
                insulin_delta_30 = -min(5.0, insulin_dose * 1.0)
        elif insulin_taken:
            insulin_delta_30 = -8.0

        # 3. Carbohydrate absorption component
        carb_delta_30 = 0.0
        if recent_meal and carbs > 0:
            carb_delta_30 = min(28.0, carbs * 0.45)

        # 4. Activity glucose consumption
        activity_delta_30 = 0.0
        if activity == "intense":
            activity_delta_30 = -10.0
        elif activity == "moderate":
            activity_delta_30 = -5.0
        elif activity == "light":
            activity_delta_30 = -2.0

        total_projected_delta = trend_delta_30 + insulin_delta_30 + carb_delta_30 + activity_delta_30

        # Build trajectory at minute 0, 10, 20, 30
        trajectory = []
        for minute in [0, 10, 20, 30]:
            fraction = minute / 30.0
            # Non-linear quadratic progression for realistic physiological response
            progression = math.pow(fraction, 1.1)
            projected = current_glucose + (total_projected_delta * progression)
            # Physiological floor at 40 mg/dL for prototype simulation
            projected = max(40.0, min(400.0, round(projected, 1)))
            trajectory.append({
                "minute": minute,
                "glucose": int(round(projected))
            })

        predicted_glucose = trajectory[-1]["glucose"]

        # Trajectory direction
        delta = predicted_glucose - current_glucose
        if delta <= -3:
            direction = "falling"
        elif delta >= 3:
            direction = "rising"
        else:
            direction = "stable"

        return {
            "current_glucose": int(round(current_glucose)),
            "predicted_glucose": predicted_glucose,
            "direction": direction,
            "trajectory": trajectory
        }

    # =========================================================================
    # FEATURE 3: SMART ACTION AGENT WITH USER APPROVAL
    # =========================================================================
    def decide_and_propose_action(self, ctx: Dict[str, Any], risk: Dict[str, Any], prediction: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Agent decides whether follow-up is appropriate and proposes an action
        that explicitly requires user approval or dismissal.
        """
        risk_level = risk["risk_level"]
        risk_score = risk["risk_score"]
        pred_glucose = prediction["predicted_glucose"]

        action_id = f"act_{uuid.uuid4().hex[:8]}"

        if risk_level == "HIGH" or pred_glucose < 70 or risk_score >= 68:
            action_name = "glucose_recheck_reminder"
            title = "30-Minute Glucose Re-Check Reminder"
            message = "Your current context suggests increased risk. Would you like to set a glucose re-check reminder?"
            action_obj = database.save_action(
                action_id=action_id,
                action_name=action_name,
                title=title,
                message=message,
                status="proposed",
                details={
                    "risk_level": risk_level,
                    "risk_score": risk_score,
                    "predicted_glucose": pred_glucose,
                    "recommended_time_minutes": 30,
                    "prompt_type": "urgent_recheck"
                }
            )
            action_obj["requires_approval"] = True
            return action_obj

        elif risk_level == "MODERATE" or pred_glucose < 85:
            action_name = "trend_monitoring_alert"
            title = "Proactive Trend Monitoring Notice"
            message = "Moderate hypoglycaemia risk detected with current activity and insulin. Would you like to enable a proactive glucose check-in in 45 minutes?"
            action_obj = database.save_action(
                action_id=action_id,
                action_name=action_name,
                title=title,
                message=message,
                status="proposed",
                details={
                    "risk_level": risk_level,
                    "risk_score": risk_score,
                    "predicted_glucose": pred_glucose,
                    "recommended_time_minutes": 45,
                    "prompt_type": "moderate_monitoring"
                }
            )
            action_obj["requires_approval"] = True
            return action_obj

        else:
            # Low risk: No critical follow-up required
            return None

    def execute_action(self, action_id: str) -> Dict[str, Any]:
        """
        Executes an action ONLY upon explicit user approval.
        Updates action status in database and returns execution receipt.
        """
        action = database.get_action_by_id(action_id)
        if not action:
            return {
                "success": False,
                "error": f"Action ID '{action_id}' not found"
            }

        if action["status"] == "executed":
            return {
                "success": True,
                "status": "executed",
                "message": "Action was already executed.",
                "action": action
            }

        execution_message = f"Follow-up reminder '{action['title']}' has been scheduled and recorded in DiaEase decision log."
        updated = database.update_action_status(
            action_id=action_id,
            status="executed",
            execution_result=execution_message
        )

        return {
            "success": True,
            "status": "executed",
            "message": execution_message,
            "action": updated
        }

    def dismiss_action(self, action_id: str) -> Dict[str, Any]:
        """
        User chooses to dismiss the agent's proposed action.
        """
        action = database.get_action_by_id(action_id)
        if not action:
            return {
                "success": False,
                "error": f"Action ID '{action_id}' not found"
            }

        updated = database.update_action_status(
            action_id=action_id,
            status="dismissed",
            execution_result="Dismissed by user."
        )

        return {
            "success": True,
            "status": "dismissed",
            "message": "Action proposal was dismissed by user.",
            "action": updated
        }

    # =========================================================================
    # FEATURE 4: ADAPTIVE PATTERN RECOMMENDATION
    # =========================================================================
    def analyze_patterns(self) -> Dict[str, Any]:
        """
        Analyzes logged entries from history to identify recurring risk triggers.
        Returns recommendations if patterns exist, or explains that more data is required.
        """
        history = database.get_history_entries(limit=30)

        # Insufficient data rule: require at least 3 entries
        if len(history) < 3:
            return {
                "pattern_detected": False,
                "total_entries": len(history),
                "message": "Keep logging a few more entries to unlock personalized patterns."
            }

        # 1. Check for recurring exercise + active insulin risk
        activity_insulin_risk_count = 0
        for entry in history:
            is_active = entry["activity_level"] in ["moderate", "intense"]
            has_insulin = entry["insulin_taken"] or (entry["insulin_dose"] > 0)
            is_elevated = entry["risk_level"] in ["HIGH", "MODERATE"]
            if is_active and has_insulin and is_elevated:
                activity_insulin_risk_count += 1

        if activity_insulin_risk_count >= 2:
            return {
                "pattern_detected": True,
                "pattern_type": "activity_plus_insulin",
                "occurrences": activity_insulin_risk_count,
                "message": "A similar combination of activity and recent insulin has appeared in previous elevated-risk entries.",
                "recommendation": "Continue logging glucose around activity so DiaEase can better understand your pattern."
            }

        # 2. Check for recurring bedtime / nocturnal risk without carbs
        nocturnal_risk_count = 0
        for entry in history:
            is_night = entry["time_of_day"] in ["night", "bedtime", "late_night"]
            no_meal = not entry["recent_meal"] or (entry["carbs"] == 0)
            is_elevated = entry["risk_level"] in ["HIGH", "MODERATE"]
            if is_night and no_meal and is_elevated:
                nocturnal_risk_count += 1

        if nocturnal_risk_count >= 2:
            return {
                "pattern_detected": True,
                "pattern_type": "nocturnal_fasting_risk",
                "occurrences": nocturnal_risk_count,
                "message": "Multiple evening entries show elevated hypoglycaemia risk when entering sleep without carbohydrate intake.",
                "recommendation": "Consider reviewing bedtime routine and discussing pre-sleep glucose management with your care team."
            }

        # 3. Check for falling trend + rapid drop recurrence
        falling_drop_count = sum(1 for entry in history if entry["trend"] == "falling" and entry["risk_level"] in ["HIGH", "MODERATE"])
        if falling_drop_count >= 2:
            return {
                "pattern_detected": True,
                "pattern_type": "rapid_falling_recurrence",
                "occurrences": falling_drop_count,
                "message": "Recurring downward glucose trajectories detected during active daytime hours.",
                "recommendation": "Track carb intake timings closely relative to insulin doses to stabilize trends."
            }

        # General baseline pattern
        return {
            "pattern_detected": True,
            "pattern_type": "stable_baseline",
            "message": "Your logged entries show balanced patterns across recent checks.",
            "recommendation": "Continue regular context logging before meals and physical activity."
        }

    # =========================================================================
    # UNIFIED AGENT PIPELINE
    # =========================================================================
    def run_agent_workflow(self, raw_data: Dict[str, Any]) -> Tuple[Dict[str, Any], Optional[str]]:
        """
        Executes the complete end-to-end AI Agent pipeline:
        1. Parse & validate context
        2. Assess Hypoglycaemia Risk
        3. Predict 30-min Glucose Trajectory
        4. Decide whether follow-up is needed & Propose Action
        5. Persist analysis to history
        6. Return unified agent response
        """
        from models import parse_user_context

        ctx, err = parse_user_context(raw_data)
        if err:
            return {}, err

        # 1. Risk Assessment
        risk = self.assess_risk(ctx)

        # 2. Glucose Prediction
        prediction = self.predict_trajectory(ctx)

        # 3. Action Decision Engine
        proposed_action = self.decide_and_propose_action(ctx, risk, prediction)

        # 4. Save to history
        entry_id = database.save_history_entry(ctx, risk, prediction, proposed_action)

        response = {
            "session_id": entry_id,
            "current_context": ctx,
            "risk_assessment": {
                "risk_level": risk["risk_level"],
                "risk_score": risk["risk_score"],
                "factors": risk["factors"],
                "explanation": risk["explanation"]
            },
            # Top-level direct fields for simple frontend consumption
            "risk_level": risk["risk_level"],
            "risk_score": risk["risk_score"],
            "factors": risk["factors"],
            "explanation": risk["explanation"],
            "prediction": prediction,
            "proposed_action": proposed_action,
            "action_proposed": proposed_action is not None,
            "disclaimer": DISCLAIMER
        }

        return response, None
