function TaskItem(props) {
    const isProcessing = props.processingId === props.task.id;
    
    return (
        <li className="task-item">
            <span
                className={
                    props.task.completed
                        ? "task-text completed"
                        : "task-text"
                }
            >
                {props.task.text}
            </span>

            <div className="task-actions">
                <button
                    className="complete-button"
                    onClick={() => props.toggleTask(props.task)}
                    disabled={isProcessing}
                >
                    {props.task.completed ? "戻す" : "完了"}
                </button>

                <button
                    className="edit-button"
                    onClick={() => {
                        props.setEditingId(props.task.id);
                        props.setText(props.task.text);
                    }}
                    disabled={isProcessing}
                >
                    編集
                </button>

                <button
                    className="delete-button"
                    onClick={() => props.deleteTask(props.task.id)}
                    disabled={isProcessing}
                >
                    削除
                </button>
            </div>
        </li>
    );
}

export default TaskItem;