from flask import Flask, request, jsonify, session
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3, os, json
from functools import wraps
from flask import send_from_directory

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "change-this-in-production")

allowed_origins = os.environ.get("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
CORS(app, supports_credentials=True, origins=allowed_origins)

DB = os.path.join(BASE_DIR, "quill.db")

# ── Database ──────────────────────────────────────────────────────────────────

def get_db():
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with get_db() as db:
        db.executescript("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                created_at TEXT DEFAULT (date('now'))
            );
            CREATE TABLE IF NOT EXISTS projects (
                id TEXT PRIMARY KEY,
                user_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                target_words INTEGER DEFAULT 80000,
                deadline TEXT,
                created_at TEXT,
                FOREIGN KEY (user_id) REFERENCES users(id)
            );
            CREATE TABLE IF NOT EXISTS sessions (
                id TEXT PRIMARY KEY,
                user_id INTEGER NOT NULL,
                project_id TEXT NOT NULL,
                date TEXT NOT NULL,
                duration INTEGER DEFAULT 0,
                words_delta INTEGER DEFAULT 0,
                activity TEXT DEFAULT 'writing',
                notes TEXT,
                FOREIGN KEY (user_id) REFERENCES users(id)
            );
        """)

init_db()

# ── Auth helpers ──────────────────────────────────────────────────────────────

def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if "user_id" not in session:
            return jsonify({"error": "Not authenticated"}), 401
        return f(*args, **kwargs)
    return decorated

# ── Auth routes ───────────────────────────────────────────────────────────────

@app.route("/api/register", methods=["POST"])
def register():
    data = request.json
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400
    try:
        with get_db() as db:
            db.execute(
                "INSERT INTO users (email, password) VALUES (?, ?)",
                (email, generate_password_hash(password))
            )
        with get_db() as db:
            user = db.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
        session["user_id"] = user["id"]
        session["email"] = user["email"]
        return jsonify({"id": user["id"], "email": user["email"]})
    except sqlite3.IntegrityError:
        return jsonify({"error": "An account with that email already exists"}), 409

@app.route("/api/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    with get_db() as db:
        user = db.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
    if not user or not check_password_hash(user["password"], password):
        return jsonify({"error": "Invalid email or password"}), 401
    session["user_id"] = user["id"]
    session["email"] = user["email"]
    return jsonify({"id": user["id"], "email": user["email"]})

@app.route("/api/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"ok": True})

@app.route("/api/me")
def me():
    if "user_id" not in session:
        return jsonify({"user": None})
    return jsonify({"user": {"id": session["user_id"], "email": session["email"]}})

# ── Projects ──────────────────────────────────────────────────────────────────

@app.route("/api/projects", methods=["GET"])
@login_required
def get_projects():
    with get_db() as db:
        rows = db.execute("SELECT * FROM projects WHERE user_id = ? ORDER BY created_at", (session["user_id"],)).fetchall()
    return jsonify([dict(r) for r in rows])

@app.route("/api/projects", methods=["POST"])
@login_required
def create_project():
    data = request.json
    with get_db() as db:
        db.execute(
            "INSERT INTO projects (id, user_id, title, target_words, deadline, created_at) VALUES (?,?,?,?,?,?)",
            (data["id"], session["user_id"], data["title"], data.get("targetWords", 80000), data.get("deadline"), data.get("createdAt"))
        )
    return jsonify(data)

# ── Sessions ──────────────────────────────────────────────────────────────────

@app.route("/api/sessions", methods=["GET"])
@login_required
def get_sessions():
    with get_db() as db:
        rows = db.execute("SELECT * FROM sessions WHERE user_id = ? ORDER BY date DESC", (session["user_id"],)).fetchall()
    return jsonify([dict(r) for r in rows])

@app.route("/api/sessions", methods=["POST"])
@login_required
def create_session():
    data = request.json
    with get_db() as db:
        db.execute(
            "INSERT INTO sessions (id, user_id, project_id, date, duration, words_delta, activity, notes) VALUES (?,?,?,?,?,?,?,?)",
            (data["id"], session["user_id"], data["projectId"], data["date"],
             data.get("duration", 0), data.get("wordsDelta", 0), data.get("activity", "writing"), data.get("notes", ""))
        )
    return jsonify(data)

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_react(path):
    if path and os.path.exists(os.path.join(BASE_DIR, "dist", path)):
        return send_from_directory(os.path.join(BASE_DIR, "dist"), path)
    return send_from_directory(os.path.join(BASE_DIR, "dist"), "index.html")

if __name__ == "__main__":
    app.run(debug=True, port=5000)
