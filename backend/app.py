import os
import sys
from flask import Flask, request, jsonify
from flask_cors import CORS

# Add parent directory to sys.path if needed
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from agent import DiaEaseAgent
import database
from models import DISCLAIMER

app = Flask(__name__)
# Enable CORS for all routes and origins
CORS(app, resources={r"/api/*": {"origins": "*"}})

agent = DiaEaseAgent()

@app.route("/", methods=["GET"])
def index():
    return jsonify({
        "service": "DiaEase AI Agent Backend",
        "status": "online",
        "endpoints": [
            "POST /api/analyze",
            "POST /api/action/propose",
            "POST /api/action/approve",
            "POST /api/action/dismiss",
            "GET /api/history",
            "GET /api/recommendation",
            "GET /api/health"
        ],
        "disclaimer": DISCLAIMER
    })

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "healthy",
        "agent": "DiaEase Decision-Support Agent",
        "version": "1.0-mvp",
        "features": [
            "hypoglycaemia_risk_assessment",
            "30min_glucose_prediction",
            "smart_action_agent_with_approval",
            "adaptive_pattern_recommendation"
        ]
    })

# =============================================================================
# FEATURE 1, 2, 3: POST /api/analyze
# =============================================================================
@app.route("/api/analyze", methods=["POST"])
def analyze():
    """
    Main agent workflow endpoint:
    Accepts user health context, assesses risk, predicts 30-min trajectory,
    and proposes a follow-up action if risk warrants it.
    """
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Request body must be valid JSON"}), 400

    result, err = agent.run_agent_workflow(data)
    if err:
        return jsonify({"error": err}), 400

    return jsonify(result), 200

# =============================================================================
# FEATURE 3: SMART ACTION AGENT WITH USER APPROVAL
# =============================================================================
@app.route("/api/action/propose", methods=["POST"])
def propose_action():
    """
    Allows explicitly generating/proposing an agent action based on health context.
    """
    data = request.get_json(silent=True) or {}
    from models import parse_user_context
    ctx, err = parse_user_context(data)
    if err:
        return jsonify({"error": err}), 400

    risk = agent.assess_risk(ctx)
    prediction = agent.predict_trajectory(ctx)
    proposed = agent.decide_and_propose_action(ctx, risk, prediction)

    if not proposed:
        return jsonify({
            "action_proposed": False,
            "message": "Current context is stable; no urgent action proposed.",
            "disclaimer": DISCLAIMER
        }), 200

    return jsonify({
        "action_proposed": True,
        "action": proposed,
        "disclaimer": DISCLAIMER
    }), 200

@app.route("/api/action/approve", methods=["POST"])
def approve_action():
    """
    User clicks [ APPROVE ] on a proposed action.
    The agent executes the action and returns the execution result.
    """
    data = request.get_json(silent=True) or {}
    action_id = data.get("action_id") or data.get("id") or data.get("actionId")

    if not action_id:
        return jsonify({"error": "action_id is required to approve an action"}), 400

    execution = agent.execute_action(action_id)
    if not execution.get("success"):
        return jsonify(execution), 404

    return jsonify(execution), 200

@app.route("/api/action/dismiss", methods=["POST"])
def dismiss_action():
    """
    User clicks [ DISMISS ] on a proposed action.
    The agent updates the status to dismissed without executing.
    """
    data = request.get_json(silent=True) or {}
    action_id = data.get("action_id") or data.get("id") or data.get("actionId")

    if not action_id:
        return jsonify({"error": "action_id is required to dismiss an action"}), 400

    dismissal = agent.dismiss_action(action_id)
    if not dismissal.get("success"):
        return jsonify(dismissal), 404

    return jsonify(dismissal), 200

# =============================================================================
# FEATURE 4: ADAPTIVE PATTERN RECOMMENDATION & HISTORY
# =============================================================================
@app.route("/api/history", methods=["GET"])
def get_history():
    """
    Returns logged user sessions and history.
    """
    limit = request.args.get("limit", default=50, type=int)
    history = database.get_history_entries(limit=limit)
    return jsonify({
        "count": len(history),
        "history": history
    }), 200

@app.route("/api/recommendation", methods=["GET"])
def get_recommendation():
    """
    Analyzes historical entries for recurring patterns and returns tailored recommendations.
    """
    recommendation = agent.analyze_patterns()
    recommendation["disclaimer"] = DISCLAIMER
    return jsonify(recommendation), 200

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"Starting DiaEase AI Agent Backend on http://127.0.0.1:{port}")
    app.run(host="0.0.0.0", port=port, debug=True)
