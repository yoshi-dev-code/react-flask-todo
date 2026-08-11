import TaskItem from "./TaskItem";

function TaskList(props) {
    return (
        <ul>
            {props.tasks.map((task) => (
                <TaskItem
                    key={task.id}
                    task={task}
                    toggleTask={props.toggleTask}
                    deleteTask={props.deleteTask}
                    setEditingId={props.setEditingId}
                    setText={props.setText}
                />
            ))}
        </ul>
    );
}

export default TaskList;