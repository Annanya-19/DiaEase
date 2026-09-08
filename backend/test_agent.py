import unittest
import json
import os
import sys

# Ensure backend folder is in path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import app
import database

class DiaEaseAgentTestCase(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()
        # Clean test database
        database.clear_all_data()

    def tearDown(self):
        database.clear_all_data()

    # =========================================================================
    # SCENARIO A: Normal/Stable Context -> LOW Risk
    # =========================================================================
    def test_scenario_a_low_risk(self):
        payload = {
            "current_glucose": 115,
            "trend": "stable",
            "insulin_taken": "no",
            "insulin_dose": 0,
            "time_since_insulin": 0,
            "recent_meal": "no",
            "carbs": 0,
            "activity_level": "resting",
            "time_of_day": "afternoon"
        }
        res = self.client.post("/api/analyze", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.get_json()

        self.assertEqual(data["risk_level"], "LOW", f"Expected LOW risk, got {data['risk_level']}")
        self.assertLess(data["risk_score"], 40, f"Expected risk_score < 40, got {data['risk_score']}")
        self.assertIn("explanation", data)
        self.assertIn("disclaimer", data)
        self.assertIn("prediction", data)
        self.assertEqual(data["prediction"]["direction"], "stable")
        self.assertEqual(data["prediction"]["current_glucose"], 115)
        self.assertEqual(data["prediction"]["predicted_glucose"], 115)

    # =========================================================================
    # SCENARIO B: Moderate-Risk Context -> MODERATE Risk
    # =========================================================================
    def test_scenario_b_moderate_risk(self):
        payload = {
            "current_glucose": 95,
            "trend": "stable",
            "insulin_taken": "yes",
            "insulin_dose": 2.0,
            "time_since_insulin": 2.5,
            "recent_meal": "no",
            "carbs": 0,
            "activity_level": "moderate",
            "time_of_day": "afternoon"
        }
        res = self.client.post("/api/analyze", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.get_json()

        self.assertEqual(data["risk_level"], "MODERATE", f"Expected MODERATE risk, got {data['risk_level']}")
        self.assertGreaterEqual(data["risk_score"], 38)
        self.assertLess(data["risk_score"], 68)
        self.assertIn("prediction", data)
        self.assertTrue(len(data["factors"]) > 0)

    # =========================================================================
    # SCENARIO C: Falling Glucose + Insulin + Activity -> HIGH Risk
    # =========================================================================
    def test_scenario_c_high_risk(self):
        payload = {
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
        res = self.client.post("/api/analyze", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.get_json()

        self.assertEqual(data["risk_level"], "HIGH", f"Expected HIGH risk, got {data['risk_level']}")
        self.assertGreaterEqual(data["risk_score"], 68, f"Expected risk_score >= 68, got {data['risk_score']}")
        self.assertTrue(any("falling" in f.lower() for f in data["factors"]))
        self.assertTrue(any("insulin" in f.lower() for f in data["factors"]))
        self.assertTrue(any("activity" in f.lower() for f in data["factors"]))

        # Agent must have proposed an action requiring user approval
        self.assertTrue(data["action_proposed"])
        proposed = data["proposed_action"]
        self.assertIsNotNone(proposed)
        self.assertEqual(proposed["action"], "glucose_recheck_reminder")
        self.assertTrue(proposed["requires_approval"])
        self.assertEqual(proposed["status"], "proposed")

    # =========================================================================
    # FEATURE 2: 30-Minute Glucose Prediction Trajectory
    # =========================================================================
    def test_prediction_trajectory(self):
        payload = {
            "current_glucose": 82,
            "trend": "falling",
            "insulin_taken": True,
            "insulin_dose": 3.0,
            "time_since_insulin": 1.0,
            "recent_meal": False,
            "carbs": 0,
            "activity_level": "intense"
        }
        res = self.client.post("/api/analyze", json=payload)
        self.assertEqual(res.status_code, 200)
        pred = res.get_json()["prediction"]

        self.assertEqual(pred["current_glucose"], 82)
        self.assertLess(pred["predicted_glucose"], 82)
        self.assertEqual(pred["direction"], "falling")
        self.assertEqual(len(pred["trajectory"]), 4)
        minutes = [p["minute"] for p in pred["trajectory"]]
        self.assertEqual(minutes, [0, 10, 20, 30])
        self.assertEqual(pred["trajectory"][0]["glucose"], 82)
        self.assertEqual(pred["trajectory"][-1]["glucose"], pred["predicted_glucose"])

    # =========================================================================
    # FEATURE 3: Action Approval and Dismissal Workflow
    # =========================================================================
    def test_action_approval_workflow(self):
        # 1. Trigger high risk analysis to get a proposed action
        payload = {
            "current_glucose": 75,
            "trend": "falling",
            "insulin_taken": True,
            "insulin_dose": 4.0,
            "time_since_insulin": 1.0,
            "activity_level": "moderate"
        }
        res = self.client.post("/api/analyze", json=payload)
        data = res.get_json()
        self.assertTrue(data["action_proposed"])
        action_id = data["proposed_action"]["id"]

        # 2. User approves action
        approve_res = self.client.post("/api/action/approve", json={"action_id": action_id})
        self.assertEqual(approve_res.status_code, 200)
        appr_data = approve_res.get_json()
        self.assertTrue(appr_data["success"])
        self.assertEqual(appr_data["status"], "executed")
        self.assertEqual(appr_data["action"]["status"], "executed")

    def test_action_dismissal_workflow(self):
        # 1. Propose an action directly
        prop_res = self.client.post("/api/action/propose", json={
            "current_glucose": 78,
            "trend": "falling",
            "insulin_taken": True,
            "insulin_dose": 2.5,
            "time_since_insulin": 1.0,
            "activity_level": "moderate"
        })
        self.assertEqual(prop_res.status_code, 200)
        action_id = prop_res.get_json()["action"]["id"]

        # 2. User dismisses action
        dismiss_res = self.client.post("/api/action/dismiss", json={"action_id": action_id})
        self.assertEqual(dismiss_res.status_code, 200)
        dis_data = dismiss_res.get_json()
        self.assertTrue(dis_data["success"])
        self.assertEqual(dis_data["status"], "dismissed")
        self.assertEqual(dis_data["action"]["status"], "dismissed")

    # =========================================================================
    # FEATURE 4: History and Adaptive Pattern Recommendation
    # =========================================================================
    def test_insufficient_history_pattern(self):
        # Zero or 1 entry
        self.client.post("/api/analyze", json={"current_glucose": 110, "trend": "stable"})
        rec_res = self.client.get("/api/recommendation")
        self.assertEqual(rec_res.status_code, 200)
        rec_data = rec_res.get_json()
        self.assertFalse(rec_data["pattern_detected"])
        self.assertIn("Keep logging a few more entries", rec_data["message"])

    def test_adaptive_pattern_detection_exercise_insulin(self):
        # Log 3 entries that show recurring exercise + insulin risk
        for _ in range(3):
            self.client.post("/api/analyze", json={
                "current_glucose": 82,
                "trend": "falling",
                "insulin_taken": True,
                "insulin_dose": 3.0,
                "time_since_insulin": 1.0,
                "activity_level": "moderate"
            })

        # History should now have 3 entries
        hist_res = self.client.get("/api/history")
        self.assertEqual(hist_res.status_code, 200)
        self.assertEqual(hist_res.get_json()["count"], 3)

        # Recommendation should detect activity + insulin pattern
        rec_res = self.client.get("/api/recommendation")
        self.assertEqual(rec_res.status_code, 200)
        rec_data = rec_res.get_json()
        self.assertTrue(rec_data["pattern_detected"])
        self.assertEqual(rec_data["pattern_type"], "activity_plus_insulin")
        self.assertIn("activity and recent insulin", rec_data["message"])
        self.assertIn("recommendation", rec_data)

if __name__ == "__main__":
    unittest.main()
