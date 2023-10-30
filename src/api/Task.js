export const CreateNewTask = (body) =>
  new Promise(async (resolve, reject) => {
    try {
      let response = await fetch(process.env.REACT_APP_API_URL + `/api/tasks`, {
        method: "POST",
        headers: new Headers({
          "Content-type": "application/json; charset=UTF-8",
        }),
        body: JSON.stringify({data: body}),
      });
      resolve(await response.json());
    } catch (err) {
      reject(err);
    }
  });

export const ReorderTasks = (body) =>
  new Promise(async (resolve, reject) => {
    try {
      let response = await fetch(
        process.env.REACT_APP_API_URL + `/task-reorder`,
        {
          method: "PUT",
          headers: new Headers({
            "Content-type": "application/json; charset=UTF-8",
          }),
          body: JSON.stringify(body),
        }
      );
      resolve(await response.json());
    } catch (err) {
      reject(err);
    }
  });

export const SwitchTasks = (home, foreign) =>
  new Promise(async (resolve, reject) => {
    try {
      let response = await fetch(
        process.env.REACT_APP_API_URL + `/api/lists/task-switch`,
        {
          method: "POST",
          headers: new Headers({
            "Content-type": "application/json; charset=UTF-8",
          }),
          body: JSON.stringify({home, foreign}),
        }
      );
      resolve(await response.json());
    } catch (err) {
      reject(err);
    }
  });

export const UpdateTaskProperty = (body) =>
  new Promise(async (resolve, reject) => {
    try {
      let response = await fetch(
        process.env.REACT_APP_API_URL + `/api/tasks/task-update-property`,
        {
          method: "POST",
          headers: new Headers({
            "Content-type": "application/json; charset=UTF-8",
          }),
          body: JSON.stringify(body),
        }
      );
      resolve(await response.json());
    } catch (err) {
      reject(err);
    }
  });

export const ApproveTask = (body) =>
  new Promise(async (resolve, reject) => {
    try {
      let response = await fetch(
        process.env.REACT_APP_API_URL + `/api/tasks/approve-task`,
        {
          method: "POST",
          headers: new Headers({
            "Content-type": "application/json; charset=UTF-8",
          }),
          body: JSON.stringify(body),
        }
      );
      window.location.reload();
      resolve(await response.json());
    } catch (err) {
      reject(err);
    }
  });

export const EmailNotifyAssignedUser = (taskId, userId) =>
  new Promise(async (resolve, reject) => {
    try {
      const body = {
        taskId,
        userId,
      };
      let response = await fetch(
        process.env.REACT_APP_API_URL + `/api/tasks/email-notify-assigned-user`,
        {
          method: "POST",
          headers: new Headers({
            "Content-type": "application/json; charset=UTF-8",
          }),
          body: JSON.stringify(body),
        }
      );
      resolve(await response.json());
    } catch (err) {
      reject(err);
    }
  });
