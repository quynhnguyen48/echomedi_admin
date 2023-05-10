import { RenameList, DeleteList, UpdateListProperty } from "api/List";

const HandleRenamingList = (board, listId, title) =>
  new Promise((resolve, reject) => {
    if (board && listId && title) {
      let list;
      board.lists.forEach(l => {
        if (l.uid == listId) {
          l.title = title;
          list = l;
        }
      });
      HandleListPropertyUpdate({
        boardId: board.id,
        property: listId,
        data: title,
      })
        .then(() => resolve(board))
        .catch((err) => reject(err));
    } else {
      reject("Missing parameters");
    }
  });

const HandleDeletingList = (board, listId) =>
  new Promise((resolve, reject) => {
    if (board && listId) {
      DeleteList({
        boardId: board.id,
        listId: listId,
      })
        .then(() => resolve(true))
        .catch((err) => reject(err));
    } else {
      reject("Missing parameters");
    }
  });

const HandleListPropertyUpdate = (board, listId, property, data) =>
  new Promise((resolve, reject) => {
    if (board && listId && property && data) {
      // board.tasks[taskId][property] = data;
      UpdateListProperty({
        // boardId: board.id,
        id: listId,
        property: property,
        data: data || " ",
      })
        .then(() => resolve(board))
        .catch((err) => reject(err));
    } else {
      reject("Missing parameters");
    }
  });


const ListHelpers = {
  HandleListPropertyUpdate: HandleListPropertyUpdate,
  HandleRenamingList: HandleRenamingList,
  HandleDeletingList: HandleDeletingList,
};

export default ListHelpers;
