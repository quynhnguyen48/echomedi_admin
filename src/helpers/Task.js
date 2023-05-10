import { UpdateTaskProperty, EmailNotifyAssignedUser, ApproveTask } from "api/Task";

const HandleTaskPropertyUpdate = (board, taskId, property, data) =>
  new Promise((resolve, reject) => {
    if (board && taskId && property && data) {
      // board.tasks[taskId][property] = data;
      UpdateTaskProperty({
        // boardId: board.id,
        taskId: taskId,
        property: property,
        data: data || " ",
      })
        .then(() => resolve(board))
        .catch((err) => reject(err));
    } else {
      reject("Missing parameters");
    }
  });

const HandleTaskApproval = (taskId, userId, approve) => 
  new Promise((resolve, reject) => {
    if (taskId && userId) {
      // board.tasks[taskId][property] = data;
      ApproveTask({
        // boardId: board.id,
        taskId,
        userId,
        approve,
      })
        .then((res) => resolve(res))
        .catch((err) => reject(err));
    } else {
      reject("Missing parameters");
    }
  });

const EmailNotifyUser = (user, task) =>
  new Promise((resolve, reject) => {
    if (user && task) {
      // board.tasks[taskId][property] = data;
      EmailNotifyAssignedUser(task.uid, user.id)
        .then(() => {
          resolve();
        })
        .catch((err) => reject(err));
    } else {
      reject("Missing parameters");
    }
  });


const TaskHelpers = {
  HandleTaskPropertyUpdate: HandleTaskPropertyUpdate,
  EmailNotifyUser: EmailNotifyUser,
  HandleTaskApproval,
};

export default TaskHelpers;
