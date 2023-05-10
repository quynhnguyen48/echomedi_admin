import React from "react";
import { Task } from "components";

class TaskColumn extends React.Component {
  shouldComponentUpdate(nextProps) {
    if (nextProps.tasks === this.props.tasks) {
      return false;
    }
    return true;
  }

  render() {
    const { tasks, list, openedTaskId, listOrder, onDragEnd } = this.props;
    return tasks ? (
      tasks.map((task, index) => (
        <Task key={task.id} task={task} index={index} listTitle={list.title} approvalType={list.approvalType} listUID={list.uid} openedTaskId={openedTaskId} listOrder={listOrder} onDragEnd={onDragEnd} />
      ))
    ) : (
      <></>
    );
  }
}

export default TaskColumn;
