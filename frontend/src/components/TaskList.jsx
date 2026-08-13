import TaskItem from "./TaskItem";

function TaskList(props) {

    if (props.tasks.length === 0) {
        return <p className="empty-message">タスクはまだありません</p>
    }

    return (
        <ul className="task-list">
            {props.tasks.map((task) => (
                <TaskItem
                    key={task.id}
                    task={task}
                    toggleTask={props.toggleTask}
                    deleteTask={props.deleteTask}
                    setEditingId={props.setEditingId}
                    setText={props.setText}
                    processingId={props.processingId}
                />
            ))}
        </ul>
    );
}

export default TaskList;