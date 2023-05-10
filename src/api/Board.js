import { JWT_TOKEN } from "constants/Authentication";


export const CreateNewBoard = (boardData) =>
  new Promise(async (resolve, reject) => {
    try {
      let response = await fetch(process.env.REACT_APP_API_URL + `/api/boards`, {
        method: "POST",
        headers: new Headers({
          "Content-type": "application/json; charset=UTF-8",
        }),
        body: JSON.stringify({data: boardData}),
      });
      resolve(await response.json());
    } catch (err) {
      reject(err);
    }
  });

export const UpdateBoardProperty = (body) =>
  new Promise(async (resolve, reject) => {
    try {
      let response = await fetch(process.env.REACT_APP_API_URL + `/board`, {
        method: "PUT",
        headers: new Headers({
          "Content-type": "application/json; charset=UTF-8",
        }),
        body: JSON.stringify(body),
      });
      resolve(await response.json());
    } catch (err) {
      reject(err);
    }
  });

export const GetUserRelatedBoards = (body) =>
  new Promise(async (resolve, reject) => {
    try {
      let response = await fetch(
        process.env.REACT_APP_API_URL + `/user/boards`,
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

export const GetBoardRelatedUsers = (body) =>
  new Promise(async (resolve, reject) => {
    try {
      let response = await fetch(
        process.env.REACT_APP_API_URL + `/board/users`,
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

export const InviteUser = (body) =>
  new Promise(async (resolve, reject) => {
    try {
      let response = await fetch(
        process.env.REACT_APP_API_URL + `/board/invite`,
        {
          method: "PUT",
          headers: new Headers({
            "Content-type": "application/json; charset=UTF-8",
          }),
          body: JSON.stringify(body),
        }
      );
      resolve(response.json());
    } catch (err) {
      reject(err);
    }
  });

  export const getAllBoards = (body) =>
  new Promise(async (resolve, reject) => {
    try {
      let response = await fetch(
        process.env.REACT_APP_API_URL + `/api/boards`,
        {
          method: "GET",
          headers: new Headers({
            "Content-type": "application/json; charset=UTF-8",
          }),
          body: JSON.stringify(body),
        }
      );
      resolve(response.json());
    } catch (err) {
      reject(err);
    }
  });

  export const getBoard = (id) =>
  new Promise(async (resolve, reject) => {
    const token = localStorage.getItem(JWT_TOKEN);
    try {
      let response = await fetch(
        process.env.REACT_APP_API_URL + `/api/boards/` + id + "?populate=tasks.list&&populate=lists",
        {
          method: "GET",
          headers: new Headers({
            "Content-type": "application/json; charset=UTF-8",
            "Authorization": token && ("Bearer " + token),
          }),
        }
      );
      resolve(response.json());
    } catch (err) {
      reject(err);
    }
  });

  export const getBoardDetail = (id) =>
  new Promise(async (resolve, reject) => {
    const token = localStorage.getItem(JWT_TOKEN);
    try {
      let response = await fetch(
        process.env.REACT_APP_API_URL + `/api/boards/get-board/` + id,
        {
          method: "GET",
          headers: new Headers({
            "Content-type": "application/json; charset=UTF-8",
            "Authorization": token && ("Bearer " + token),
          }),
        }
      );
      resolve(response.json());
    } catch (err) {
      reject(err);
    }
  });

export const RemoveUser = (body) =>
  new Promise(async (resolve, reject) => {
    const token = localStorage.getItem(JWT_TOKEN);
    try {
      let response = await fetch(
        process.env.REACT_APP_API_URL + `/user/boards`,
        {
          method: "PUT",
          headers: new Headers({
            "Content-type": "application/json; charset=UTF-8",
            "Authorization": token && ("Bearer " + token),
          }),
          body: JSON.stringify(body),
        }
      );
      resolve(response.json());
    } catch (err) {
      reject(err);
    }
  });
