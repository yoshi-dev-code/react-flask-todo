import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    function login() {
        if (username.trim() === "" || password.trim() === "") {
            alert("ユーザー名とパスワードを入力してください");
            return;
        }

        fetch("http://127.0.0.1:5000/login", {
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
                    alert(data.message);
                }
            });
    }

    return (
        <div>
            <h1>ログイン</h1>

            <input
                type="text"
                placeholder="ユーザー名"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
            />

            <input
                type="password"
                placeholder="パスワード"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
            />

            <button onClick={login}>
                ログイン
            </button>
        </div>
    );
}

export default Login;