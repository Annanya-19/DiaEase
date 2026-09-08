import sqlite3
import os
import json
from datetime import datetime
from typing import Dict, Any, List, Optional

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "diaease.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # History table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            current_glucose REAL NOT NULL,
            trend TEXT NOT NULL,
            insulin_taken INTEGER NOT NULL,
            insulin_dose REAL DEFAULT 0,
            time_since_insulin REAL DEFAULT 0,
            recent_meal INTEGER NOT NULL,
            carbs REAL DEFAULT 0,
            activity_level TEXT NOT NULL,
            time_of_day TEXT,
            risk_score INTEGER NOT NULL,
            risk_level TEXT NOT NULL,
            predicted_glucose REAL,
            factors TEXT,
            action_proposed TEXT
        )
    """)

    # Actions table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS actions (
            id TEXT PRIMARY KEY,
            timestamp TEXT NOT NULL,
            action TEXT NOT NULL,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            status TEXT NOT NULL, -- proposed, approved, dismissed, executed
            details TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    """)

    conn.commit()
    conn.close()

def save_history_entry(context: Dict[str, Any], risk: Dict[str, Any], prediction: Optional[Dict[str, Any]] = None, action: Optional[Dict[str, Any]] = None) -> int:
    conn = get_db_connection()
    cursor = conn.cursor()
    now_iso = datetime.now().isoformat()

    cursor.execute("""
        INSERT INTO history (
            timestamp, current_glucose, trend, insulin_taken, insulin_dose,
            time_since_insulin, recent_meal, carbs, activity_level, time_of_day,
            risk_score, risk_level, predicted_glucose, factors, action_proposed
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        now_iso,
        float(context.get("current_glucose", 100)),
        str(context.get("trend", "stable")).lower(),
        1 if context.get("insulin_taken") in [True, "yes", "YES", "true", 1] else 0,
        float(context.get("insulin_dose", 0) or 0),
        float(context.get("time_since_insulin", 0) or 0),
        1 if context.get("recent_meal") in [True, "yes", "YES", "true", 1] else 0,
        float(context.get("carbs", 0) or 0),
        str(context.get("activity_level", "resting")),
        str(context.get("time_of_day", "day")),
        int(risk.get("risk_score", 0)),
        str(risk.get("risk_level", "LOW")),
        float(prediction.get("predicted_glucose", 0)) if prediction else None,
        json.dumps(risk.get("factors", [])),
        action.get("action") if action else None
    ))

    entry_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return entry_id

def get_history_entries(limit: int = 50) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM history ORDER BY id DESC LIMIT ?", (limit,))
    rows = cursor.fetchall()
    conn.close()

    results = []
    for r in rows:
        results.append({
            "id": r["id"],
            "timestamp": r["timestamp"],
            "current_glucose": r["current_glucose"],
            "trend": r["trend"],
            "insulin_taken": bool(r["insulin_taken"]),
            "insulin_dose": r["insulin_dose"],
            "time_since_insulin": r["time_since_insulin"],
            "recent_meal": bool(r["recent_meal"]),
            "carbs": r["carbs"],
            "activity_level": r["activity_level"],
            "time_of_day": r["time_of_day"],
            "risk_score": r["risk_score"],
            "risk_level": r["risk_level"],
            "predicted_glucose": r["predicted_glucose"],
            "factors": json.loads(r["factors"]) if r["factors"] else [],
            "action_proposed": r["action_proposed"]
        })
    return results

def save_action(action_id: str, action_name: str, title: str, message: str, status: str = "proposed", details: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    conn = get_db_connection()
    cursor = conn.cursor()
    now_iso = datetime.now().isoformat()

    cursor.execute("""
        INSERT OR REPLACE INTO actions (id, timestamp, action, title, message, status, details, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        action_id,
        now_iso,
        action_name,
        title,
        message,
        status,
        json.dumps(details or {}),
        now_iso,
        now_iso
    ))
    conn.commit()
    conn.close()

    return {
        "id": action_id,
        "action": action_name,
        "title": title,
        "message": message,
        "status": status,
        "details": details or {},
        "timestamp": now_iso
    }

def update_action_status(action_id: str, status: str, execution_result: Optional[str] = None) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    now_iso = datetime.now().isoformat()

    cursor.execute("SELECT * FROM actions WHERE id = ?", (action_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return None

    details = json.loads(row["details"]) if row["details"] else {}
    if execution_result:
        details["execution_result"] = execution_result

    cursor.execute("""
        UPDATE actions
        SET status = ?, details = ?, updated_at = ?
        WHERE id = ?
    """, (status, json.dumps(details), now_iso, action_id))
    conn.commit()

    cursor.execute("SELECT * FROM actions WHERE id = ?", (action_id,))
    updated_row = cursor.fetchone()
    conn.close()

    return {
        "id": updated_row["id"],
        "action": updated_row["action"],
        "title": updated_row["title"],
        "message": updated_row["message"],
        "status": updated_row["status"],
        "details": json.loads(updated_row["details"]) if updated_row["details"] else {},
        "updated_at": updated_row["updated_at"]
    }

def get_action_by_id(action_id: str) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM actions WHERE id = ?", (action_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    return {
        "id": row["id"],
        "action": row["action"],
        "title": row["title"],
        "message": row["message"],
        "status": row["status"],
        "details": json.loads(row["details"]) if row["details"] else {},
        "created_at": row["created_at"],
        "updated_at": row["updated_at"]
    }

def clear_all_data():
    """Utility for clean testing if needed."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM history")
    cursor.execute("DELETE FROM actions")
    conn.commit()
    conn.close()
