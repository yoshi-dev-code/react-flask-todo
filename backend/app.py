from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    jwt_required,
    get_jwt_identity
)
from werkzeug.security import generate_password_hash, check_password_hash
from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import timedelta

import os
import psycopg2


app = Flask(__name__)
CORS(app)

app.config["JWT_SECRET_KEY"] = os.environ.get(
    "JWT_SECRET_KEY",
    "dev_secret_key_change_later"
)
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)

jwt = JWTManager(app)

DATABASE_URL = os.environ.get("DATABASE_URL")


def get_db_connection():
    return psycopg2.connect(DATABASE_URL)


def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users(
            id SERIAL PRIMARY KEY,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS tasks(
            id SERIAL PRIMARY KEY,
            text TEXT NOT NULL,
            completed BOOLEAN NOT NULL DEFAULT FALSE,
            user_id INTEGER
        )
    """)

    conn.commit()
    cursor.close()
    conn.close()


@app.route("/tasks", methods=["GET"])
@jwt_required()
def get_tasks():
    user_id = int(get_jwt_identity())

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT id, text, completed
        FROM tasks
        WHERE user_id = %s
        """,
        (user_id,)
    )

    rows = cursor.fetchall()

    cursor.close()
    conn.close()

    tasks = []

    for row in rows:
        tasks.append({
            "id": row[0],
            "text": row[1],
            "completed": row[2]
        })

    return jsonify(tasks)


@app.route("/tasks", methods=["POST"])
@jwt_required()
def add_task():
    data = request.get_json()

    text = data["text"]
    user_id = int(get_jwt_identity())

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO tasks (text, completed, user_id)
        VALUES (%s, %s, %s)
        RETURNING id
        """,
        (text, False, user_id)
    )

    new_id = cursor.fetchone()[0]

    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({
        "id": new_id,
        "text": text,
        "completed": False
    }), 201


@app.route("/tasks/<int:task_id>", methods=["DELETE"])
@jwt_required()
def delete_task(task_id):
    user_id = int(get_jwt_identity())

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        "DELETE FROM tasks WHERE id = %s AND user_id = %s",
        (task_id, user_id)
    )

    conn.commit()
    cursor.close()
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
    user_id = int(get_jwt_identity())

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        UPDATE tasks
        SET text = %s,
            completed = %s
        WHERE id = %s AND user_id = %s
        """,
        (text, completed, task_id, user_id)
    )

    conn.commit()
    cursor.close()
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

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT id, username, password
        FROM users
        WHERE username = %s
        """,
        (username,)
    )

    user = cursor.fetchone()

    cursor.close()
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

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            """
            INSERT INTO users (username, password)
            VALUES (%s, %s)
            """,
            (username, password_hash)
        )

        conn.commit()

    except psycopg2.IntegrityError:
        conn.rollback()
        cursor.close()
        conn.close()

        return jsonify({
            "message": "そのユーザー名はすでに使われています"
        }), 400

    cursor.close()
    conn.close()

    return jsonify({
        "message": "ユーザー登録成功"
    }), 201


@app.route("/me", methods=["GET"])
@jwt_required()
def me():
    user_id = int(get_jwt_identity())

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT username FROM users WHERE id = %s",
        (user_id,)
    )

    user = cursor.fetchone()

    cursor.close()
    conn.close()

    return jsonify({
        "username": user[0]
    })


init_db()

if __name__ == "__main__":
    app.run(debug=True)