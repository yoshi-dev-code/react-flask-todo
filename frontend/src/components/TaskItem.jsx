function TaskItem(props) {
    return (
        <li
            style={{
                textDecoration: props.task.completed
                    ? "line-through"
                    : "none"
            }}
        >
            {props.task.text}

            <button onClick={() => props.toggleTask(props.task)}>
                完了
            </button>

            <button
                onClick={() => {
                    props.setEditingId(props.task.id);
                    props.setText(props.task.text);
                }}
            >
                編集
            </button>

            <button onClick={() => props.deleteTask(props.task.id)}>
                削除
            </button>
        </li>
    );
}

export default TaskItem;