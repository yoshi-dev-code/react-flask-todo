import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const API_URL = import.meta.env.VITE_API_URL;

    function register() {

        if (username.trim() === "") {
            setError("ユーザー名を入力してください");
            return;
        }

        if (password.length < 8) {
            setError("パスワードは8文字以上にしてください");
            return;
        }

        setError("");
        setLoading(true);

        fetch(`${API_URL}/register`, {
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
                if (data.message === "ユーザー登録成功") {
                    navigate("/");
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
                <h1>新規登録</h1>

                <p className="auth-subtitle">
                    アカウントを作成
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
                    placeholder="パスワード（8文字以上）"
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
                    onClick={register}
                    disabled={loading}
                >
                    {loading ? "登録中..." : "登録"}
                </button>

                <button
                    className="auth-link-button"
                    onClick={() => navigate("/")}
                >
                    ログイン画面に戻る
                </button>
            </div>
        </div>
    );
}

export default Register;