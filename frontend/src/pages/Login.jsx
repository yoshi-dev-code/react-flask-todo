import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");

    const navigate = useNavigate();

    const API_URL = import.meta.env.VITE_API_URL;

    function login() {
        if (username.trim() === "" || password.trim() === "") {
            alert("ユーザー名とパスワードを入力してください");
            return;
        }

        setError("");
        setLoading(true);

        fetch(`${API_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        })
            .then((response) => response.json())
            .then((data) => {
                console.log(data);

                if (data.message === "ログイン成功") {

                    localStorage.setItem(
                        "token",
                        data.access_token
                    );

                    navigate("/todo");
                } else {
                    setError(data.message);
                }
            })
            .catch(() => {
                setError("通信に失敗しました");
            })
            .finally(() => {
                setLoading(false);
            });
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1>ログイン</h1>

                <p className="auth-subtitle">
                    Todoアプリへログイン
                </p>

                <input
                    className="auth-input"
                    type="text"
                    placeholder="ユーザー名"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                />

                <input
                    className="auth-input"
                    type="password"
                    placeholder="パスワード"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                />

                {error && (
                    <p className="error-message">
                        {error}
                    </p>
                )}

                <button
                    className="auth-button"
                    onClick={login}
                    disabled={loading}
                >
                    {loading ? "ログイン中..." : "ログイン"}
                </button>

                <button
                    className="auth-link-button"
                    onClick={() => navigate("/register")}
                >
                    新規登録はこちら
                </button>
            </div>
        </div>
    );
}

export default Login;