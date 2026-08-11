function TaskInput(props) {
    return (
        <>
            <input
                type="text"
                value={props.text}
                onChange={(event) => props.setText(event.target.value)}
            />

            <button onClick={props.addTask}>
                {props.editingId !== null ? "更新" : "追加"}
            </button>
        </>
    );
}

export default TaskInput;