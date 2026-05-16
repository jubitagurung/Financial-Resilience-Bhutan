from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import json
import os
import re
import time
from datetime import datetime
from pathlib import Path

app = Flask(__name__)
CORS(app, origins=[
    "http://localhost",
    "http://127.0.0.1",
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "https://yourdomain.com"
])

DATA_FILE = Path(__file__).parent / "scores.json"

limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["60 per minute"],
    storage_uri="memory://"
)

# ── Helpers ──────────────────────────────────────────────────────────────

def sanitize_name(name):
    name = re.sub(r'[^\w\s\-\'\.]', '', str(name))
    return name.strip()[:50]

def load_scores():
    if not DATA_FILE.exists():
        return []
    try:
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        print(f"❌ Error loading scores: {e}")
        return []

def save_scores(scores):
    """
    Write scores directly to the JSON file.
    Retries up to 5 times with a short delay to handle OneDrive/antivirus
    file locks on Windows — the atomic rename trick does NOT work when
    OneDrive is syncing the folder (WinError 5 / Access Denied).
    """
    last_error = None
    for attempt in range(5):
        try:
            with open(DATA_FILE, "w", encoding="utf-8") as f:
                json.dump(scores, f, indent=2, ensure_ascii=False)
            print(f"✅ Saved {len(scores)} records")
            return True
        except PermissionError as e:
            last_error = e
            print(f"⚠️  Write locked (attempt {attempt + 1}/5), retrying in 0.3s…")
            time.sleep(0.3)
        except Exception as e:
            print(f"❌ Error saving scores: {e}")
            return False
    print(f"❌ Could not save after 5 attempts: {last_error}")
    return False

# ── Routes ───────────────────────────────────────────────────────────────

@app.route("/")
def home():
    return jsonify({"message": "Smart Budget Bhutan — Quiz API is running."})


@app.route("/save", methods=["POST"])
@limiter.limit("10 per minute")
def save_result():
    data = request.get_json(silent=True) or {}

    name = sanitize_name(data.get("name", ""))
    if not name:
        return jsonify({"error": "Valid name is required."}), 400
    if len(name) > 50:
        return jsonify({"error": "Name is too long (max 50 characters)."}), 400

    try:
        score  = int(data.get("score"))
        total  = int(data.get("total"))
        points = int(data.get("points", 0))
        streak = int(data.get("streak", 0))
    except (TypeError, ValueError):
        return jsonify({"error": "score and total must be valid integers."}), 400

    if not (0 <= score <= total):
        return jsonify({"error": "Score must be between 0 and total questions."}), 400

    entry = {
        "name":   name,
        "score":  score,
        "total":  total,
        "pct":    round(score / total * 100),
        "points": points,
        "streak": streak,
        "date":   datetime.now().strftime("%d %b %Y"),
        "time":   datetime.now().strftime("%H:%M")
    }

    scores = load_scores()
    scores.append(entry)

    if save_scores(scores):
        return jsonify({"message": "Score saved successfully!", "entry": entry}), 201
    else:
        # Still return 201 — localStorage already has the data on the client
        return jsonify({"message": "Saved to memory only (file locked).", "entry": entry}), 201


@app.route("/history", methods=["GET"])
def get_history():
    name = sanitize_name(request.args.get("name", "")).lower()
    if not name:
        return jsonify({"error": "name query param is required."}), 400

    scores = load_scores()
    user_scores = [s for s in scores if s["name"].lower() == name]

    if not user_scores:
        return jsonify({"found": False, "results": []}), 200

    user_scores.reverse()
    best = max(user_scores, key=lambda x: x["points"])

    return jsonify({
        "found":    True,
        "name":     user_scores[0]["name"],
        "attempts": len(user_scores),
        "best":     best,
        "results":  user_scores
    }), 200


@app.route("/stats", methods=["GET"])
def get_stats():
    scores = load_scores()
    if not scores:
        return jsonify({"total_attempts": 0, "avg_pct": 0, "perfect_scores": 0}), 200

    total   = len(scores)
    avg_pct = round(sum(s["pct"] for s in scores) / total)
    perfect = sum(1 for s in scores if s["pct"] == 100)

    return jsonify({
        "total_attempts": total,
        "avg_pct":        avg_pct,
        "perfect_scores": perfect
    }), 200


@app.route("/clear", methods=["DELETE"])
def clear_history():
    name = sanitize_name(request.args.get("name", "")).lower()
    if not name:
        return jsonify({"error": "name query param is required."}), 400

    scores = load_scores()
    before = len(scores)
    scores = [s for s in scores if s["name"].lower() != name]
    save_scores(scores)
    removed = before - len(scores)
    return jsonify({"message": f"Removed {removed} record(s) for '{name}'."}), 200


if __name__ == "__main__":
    app.run(debug=True, port=5000)