import React from "react";
import { List } from "components";

class ListColumn extends React.Component {
  render() {
    const { list, taskMap, index, createNewTask, openedTaskId, listOrder, onDragEnd } = this.props;
    let tasks;

    if (list.taskUIDs) {
      tasks = list.taskUIDs.map((taskId) => taskMap[taskId]);
    }
    return (
      <div>
        <List
          listOrder={listOrder}
          list={list}
          tasks={tasks}
          index={index}
          openedTaskId={openedTaskId}
          createNewTask={createNewTask}
          onDragEnd={onDragEnd}
        />
      </div>
    );
  }
}

export default ListColumn;
