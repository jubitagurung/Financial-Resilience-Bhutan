from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)  # allows your HTML site to call this API

# ── Storage file (acts as a simple database)
DATA_FILE = "scores.json"

# ── Helpers ──────────────────────────────────────────────────────────────
def load_scores():
    """Read all scores from the JSON file."""
    if not os.path.exists(DATA_FILE):
        return []
    with open(DATA_FILE, "r") as f:
        return json.load(f)

def save_scores(scores):
    """Write all scores back to the JSON file."""
    with open(DATA_FILE, "w") as f:
        json.dump(scores, f, indent=2)

# ── Routes ───────────────────────────────────────────────────────────────

@app.route("/")
def home():
    return jsonify({"message": "Smart Budget Bhutan — Quiz API is running."})


# POST /save  — save a new quiz result
# Body (JSON): { "name": "Jubita", "score": 9, "total": 12, "points": 115, "streak": 4 }
@app.route("/save", methods=["POST"])
def save_result():
    data = request.get_json()

    # --- validate required fields
    name   = str(data.get("name", "")).strip()[:30]
    score  = data.get("score")
    total  = data.get("total")
    points = data.get("points", 0)
    streak = data.get("streak", 0)

    if not name:
        return jsonify({"error": "Name is required."}), 400
    if score is None or total is None:
        return jsonify({"error": "score and total are required."}), 400
    if not (0 <= int(score) <= int(total)):
        return jsonify({"error": "score must be between 0 and total."}), 400

    pct = round(int(score) / int(total) * 100)

    entry = {
        "name":    name,
        "score":   int(score),
        "total":   int(total),
        "pct":     pct,
        "points":  int(points),
        "streak":  int(streak),
        "date":    datetime.now().strftime("%d %b %Y"),
        "time":    datetime.now().strftime("%H:%M")
    }

    scores = load_scores()
    scores.append(entry)
    save_scores(scores)

    return jsonify({"message": "Score saved!", "entry": entry}), 201


# GET /history?name=Jubita  — get all results for one user
@app.route("/history", methods=["GET"])
def get_history():
    name = request.args.get("name", "").strip().lower()

    if not name:
        return jsonify({"error": "name query param is required."}), 400

    scores = load_scores()

    # find entries matching this name (case-insensitive)
    user_scores = [
        s for s in scores
        if s["name"].lower() == name
    ]

    if not user_scores:
        return jsonify({"found": False, "results": []}), 200

    # sort newest first
    user_scores.reverse()

    best = max(user_scores, key=lambda x: x["points"])

    return jsonify({
        "found":    True,
        "name":     user_scores[0]["name"],
        "attempts": len(user_scores),
        "best":     best,
        "results":  user_scores
    }), 200


# GET /stats  — overall quiz statistics (no names exposed)
@app.route("/stats", methods=["GET"])
def get_stats():
    scores = load_scores()

    if not scores:
        return jsonify({
            "total_attempts": 0,
            "avg_pct":        0,
            "perfect_scores": 0
        }), 200

    total     = len(scores)
    avg_pct   = round(sum(s["pct"] for s in scores) / total)
    perfect   = sum(1 for s in scores if s["pct"] == 100)

    return jsonify({
        "total_attempts": total,
        "avg_pct":        avg_pct,
        "perfect_scores": perfect
    }), 200


# DELETE /clear?name=Jubita  — let a user delete their own history
@app.route("/clear", methods=["DELETE"])
def clear_history():
    name = request.args.get("name", "").strip().lower()

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
