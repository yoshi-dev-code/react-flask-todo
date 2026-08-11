import { useNavigate } from "react-router-dom";
import TaskList from "../components/Tasklist";
import TaskInput from "../components/TaskInput";
import { useEffect, useState } from "react";

function Todo() {
    const [tasks, setTasks] = useState([]);
    const [text, setText] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [username, setUsername] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
    
        fetch("http://127.0.0.1:5000/tasks", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            
            .then((response) => {
                if (!response.ok) {
                    throw new Error("認証エラー");
                }

                return response.json();
            })
            .then((data) => {
                setTasks(data);
            })
            .catch(() => {
                localStorage.removeItem("token");
                navigate("/");
            });
    }, [navigate]);

    useEffect(() => {
        const token = localStorage.getItem("token");

        fetch("http://127.0.0.1:5000/me", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("ユーザー情報の取得に失敗しました");
                }

                return response.json();
            })
            .then((data) => {
                setUsername(data.username);
            })
            .catch(() => {
                localStorage.removeItem("token");
                navigate("/");
            });
    }, [navigate]);

    function deleteTask(id) {
        const token = localStorage.getItem("token");

        fetch(`http://127.0.0.1:5000/tasks/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("削除に失敗しました");
                }

                return response.json();
            })    
            .then(() => {
                setTasks(
                    tasks.filter((task) => task.id !== id)
                );
            })
            .catch((error) => {
                alert(error.message);
            });
    }

    function addTask() {
        if (text.trim() === "") {
            return;
        }

        const cleanText = text.trim();

        if (editingId !== null) {
            const editingTask = tasks.find(
                (task) => task.id === editingId
            );

            const token = localStorage.getItem("token");

            fetch(`http://127.0.0.1:5000/tasks/${editingId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    text: cleanText,
                    completed: editingTask.completed
                })
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("編集に失敗しました");
                    }

                    return response.json();
                })
                .then(() => {
                    const newTasks = tasks.map((task) => {
                        if (task.id === editingId) {
                            return {
                                ...task,
                                text: cleanText
                            };
                        }

                        return task;
                    });

                    setTasks(newTasks);
                    setEditingId(null);
                    setText("");
                })
                .catch((error) => {
                    alert(error.message);
                });

            return;
        }

        const token = localStorage.getItem("token");

        fetch("http://127.0.0.1:5000/tasks", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                text: cleanText
            })
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("追加に失敗しました");
                }

                return response.json();

            })
            .then((newTask) => {
                setTasks([...tasks, newTask]);
                setText("");
            })
            .catch((error) => {
                alert(error.message);
            });
    }

    function toggleTask(task) {
        const updatedTask = {
            ...task,
            completed: !task.completed
        };

        const token = localStorage.getItem("token");

        fetch(`http://127.0.0.1:5000/tasks/${task.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(updatedTask)
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("完了状態の更新に失敗しました");
                }

                return response.json();
            })
            .then(() => {
                const newTasks = tasks.map((currentTask) => {
                    if (currentTask.id === task.id) {
                        return updatedTask;
                    }

                    return currentTask;
                });

                setTasks(newTasks);
            })
            .catch((error) => {
                alert(error.message);
            });
    }

    function logout() {
        localStorage.removeItem("token");
        navigate("/");
    }

    return (
        <div>
            <h1>Todoリスト</h1>

            <p>ようこそ、{username}さん</p>

            <button onClick={logout}>
                ログアウト
            </button>

            <TaskInput
                text={text}
                setText={setText}
                addTask={addTask}
                editingId={editingId}
            />

            <TaskList
                tasks={tasks}
                toggleTask={toggleTask}
                deleteTask={deleteTask}
                setEditingId={setEditingId}
                setText={setText}
            />
        </div>
    );
}

export default Todo;