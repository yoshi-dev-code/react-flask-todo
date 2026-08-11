import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Todo from "./pages/Todo";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
    return (
        <Routes>
            <Route path="/" element={<Login />} />

            <Route
                path="/register"
                element={<Register />}
            />

            <Route
                path="/todo"
                element={
                    <ProtectedRoute>
                        <Todo />
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
}

export default App;