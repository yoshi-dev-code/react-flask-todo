from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
import os
import sqlite3
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

from datetime import timedelta

app.config["JWT_SECRET_KEY"] = os.environ.get(
    "jwt_SECRET_key",
    "dev_secret_key_change_later"
)
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)

jwt = JWTManager(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "tasks.db")


def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS tasks(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            text TEXT NOT NULL,
            completed INTEGER NOT NULL DEFAULT 0
            )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL
            )
    """)
    
    conn.commit()
    conn.close()
    
@app.route("/tasks", methods=["GET"])
@jwt_required()
def get_tasks():
    
    user_id = get_jwt_identity()
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT id, text, completed
        FROM tasks
        WHERE user_id = ?
        """,
        (user_id,)
    )
    
    rows = cursor.fetchall()

    conn.close()

    tasks = []

    for row in rows:
        tasks.append({
            "id": row[0],
            "text": row[1],
            "completed": bool(row[2])
        })

    return jsonify(tasks)    
    
@app.route("/tasks", methods=["POST"])
@jwt_required()
def add_task():
    data = request.get_json()
    
    text = data["text"]
    user_id = get_jwt_identity()
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute(
        "INSERT INTO tasks (text, completed, user_id) VALUES (?, ?, ?)",
        (text, 0, user_id)
    ) 
    
    conn.commit()
    
    new_id = cursor.lastrowid
    
    conn.close()
    
    return jsonify({
        "id": new_id,
        "text": text,
        "completed": False
    }), 201
    
@app.route("/tasks/<int:task_id>", methods=["DELETE"])
@jwt_required()
def delete_task(task_id):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    user_id = get_jwt_identity()
    
    cursor.execute(
        "DELETE FROM tasks WHERE id = ? AND user_id = ?",
        (task_id, user_id)
    )
    
    conn.commit()
    conn.close()
    
    return jsonify({
        "message": "削除しました"
    })
    
@app.route("/tasks/<int:task_id>", methods=["PUT"])
@jwt_required()
def update_task(task_id):
    data = request.get_json()
    
    text = data["text"]
    completed = data["completed"]
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    user_id = get_jwt_identity()
    
    cursor.execute(
        """
        UPDATE tasks
        SET text = ?,
            completed = ?
        WHERE id = ? AND user_id = ?
        """,
        (text, int(completed), task_id, user_id)
    )
    
    conn.commit()
    conn.close()
    
    return jsonify({
        "id": task_id,
        "text": text,
        "completed": completed
    })

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    username = data["username"]
    password = data["password"]

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute(
        "SELECT id, username, password FROM users WHERE username = ?",
        (username,)
    )

    user = cursor.fetchone()

    conn.close()

    if user and check_password_hash(user[2], password):
        
        access_token = create_access_token(
            identity=str(user[0])
        )
        
        return jsonify({
            "message": "ログイン成功",
            "access_token": access_token
        }), 200

    return jsonify({
        "message": "ログイン失敗"
    }), 401
    
@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    username = data["username"]
    password = data["password"]
    
    if username.strip() == "":
        return jsonify({
            "message": "ユーザー名を入力してください"
        }), 400
        
    if len(password) < 8:
        return jsonify({
            "message": "パスワードは8文字以上にしてください"    
        }), 400

    password_hash = generate_password_hash(password)

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        cursor.execute(
            "INSERT INTO users (username, password) VALUES (?, ?)",
            (username, password_hash)
        )

        conn.commit()

    except sqlite3.IntegrityError:
        conn.close()

        return jsonify({
            "message": "そのユーザー名はすでに使われています"
        }), 400

    conn.close()

    return jsonify({
        "message": "ユーザー登録成功"
    }), 201 
    
@app.route("/me", methods=["GET"])
@jwt_required()
def me():
    user_id = get_jwt_identity()

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute(
        "SELECT username FROM users WHERE id = ?",
        (user_id,)
    )

    user = cursor.fetchone()

    conn.close()

    return jsonify({
        "username": user[0]
    })                 
        
init_db()

if __name__ == "__main__":
    app.run(debug=True)    