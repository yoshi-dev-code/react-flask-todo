function TaskInput(props) {
    return (
        <div className="task-input">
            <input
                className="task-input-field"
                type="text"
                placeholder="タスクを入力..."
                value={props.text}
                onChange={(event) => props.setText(event.target.value)}
            />

            <button
                className="add-button"
                onClick={props.addTask}
            >
                {props.editingId !== null ? "更新" : "追加"}
            </button>
        </div>
    );
}

export default TaskInput;