import { useNavigate } from "react-router-dom";
import TaskList from "../components/TaskList";
import TaskInput from "../components/TaskInput";
import { useEffect, useState } from "react";

function Todo() {
    const [tasks, setTasks] = useState([]);
    const [text, setText] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [username, setUsername] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [processingId, setProcessingId] = useState(null);

    const navigate = useNavigate();

    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const token = localStorage.getItem("token");
    
        fetch(`${API_URL}/tasks`, {
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
    }, [navigate, API_URL]);

    useEffect(() => {
        const token = localStorage.getItem("token");

        fetch(`${API_URL}/me`, {
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
    }, [navigate, API_URL]);

    function deleteTask(id) {
        setError("");
        setProcessingId(id);

        const token = localStorage.getItem("token");

        fetch(`${API_URL}/tasks/${id}`, {
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
            .catch(() => {
                setError("削除に失敗しました");
            })
            .finally(() => {
            setProcessingId(null);
            });
    }

    function addTask() {
        if (text.trim() === "") {
            return;
        }

        setError("");
        setLoading(true);

        const cleanText = text.trim();

        if (editingId !== null) {
            const editingTask = tasks.find(
                (task) => task.id === editingId
            );

            const token = localStorage.getItem("token");

            fetch(`${API_URL}/tasks/${editingId}`, {
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
                    setError("編集に失敗しました");
                })
                .finally(() => {
                    setLoading(false);
                });

            return;
        }

        const token = localStorage.getItem("token");

        fetch(`${API_URL}/tasks`, {
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
                setError("追加に失敗しました");
            })
            .finally(() => {
                setLoading(false);
            });
    }

    function toggleTask(task) {
        setError("");

        const updatedTask = {
            ...task,
            completed: !task.completed
        };

        const token = localStorage.getItem("token");

        fetch(`${API_URL}/tasks/${task.id}`, {
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
                setError("完了状態の更新に失敗しました");
            });
    }

    function logout() {
        localStorage.removeItem("token");
        navigate("/");
    }

    return (
        <div className="todo-page">
            <div className="todo-card">
                <div className="todo-header">
                    <div>
                        <h1>Todoリスト</h1>
                        <p>ようこそ、{username}さん</p>
                    </div>

                    <button
                        className="logout-button"
                        onClick={logout}
                    >
                        ログアウト
                    </button>
                </div>

                {error && (
                    <p className="error-message">
                        {error}
                    </p>
                )}

                <TaskInput
                    text={text}
                    setText={setText}
                    addTask={addTask}
                    editingId={editingId}
                    loading={loading}
                />

                <TaskList
                    tasks={tasks}
                    toggleTask={toggleTask}
                    deleteTask={deleteTask}
                    setEditingId={setEditingId}
                    setText={setText}
                    processingId={processingId}
                />
            </div>
        </div>
    );    
}

export default Todo;