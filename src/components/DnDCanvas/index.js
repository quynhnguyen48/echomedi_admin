import React from "react";
import shortid from "shortid";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { IconButton, Grid, Typography } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import { Add } from "@material-ui/icons";
import { AddListModal, ListColumn } from "components";
import { UserContext } from "provider/UserProvider";
import { BoardHelpers } from "helpers";
import { canvasStyles } from "./styles";
import { EditListModal, UserAvatar } from "components";

class DndCanvas extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      anchorEl: null,
      modalVisible: true,
    };
  }
  static contextType = UserContext;

  componentDidUpdate(prevProps) {
    const board = this.context.renderedBoard;
    if (prevProps.board !== board) {
      if (board) {
        if (board.lists) {
          let newLists = {};
          board.lists.forEach(l => {
            l.taskUIDs = [];
            l.taskIDs = [];
            board.tasks?.forEach(t => {
              if (t.list?.uid == l.uid) {
                l.taskUIDs.push(t.uid);
                l.taskIDs.push(t.id);
              }
            });
            newLists[l.uid] = l;
          })
          let newListOrder = board.lists.map(l => l.uid);
          this.setState({
            listOrder: newListOrder,
            lists: newLists,
          });
          let newTasks =  {};
          board.tasks.forEach(l => {
            newTasks[l.uid] = l;
          })
          if (board.tasks) {
            this.setState({
              tasks:newTasks,
            });
          }
        }
      }
    }
  }
  componentDidMount() {
    if (this.context.renderedBoard) {
      const board = this.context.renderedBoard;
      if (board) {
        if (board.lists) {
          this.setState({
            listOrder: board.listOrder,
            lists: board.lists,
          });
          if (board.tasks) {
            this.setState({
              tasks: board.tasks,
            });
          }
        }
      }
    }
  }

  onDragEnd = (result) => {
    const { destination, source, draggableId, type } = result;
    const board = this.context.renderedBoard;

    // no list to drop
    if (!destination) {
      return;
    }

    // dropping to same list same place
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // triggers when reordering lists
    if (type === "list") {
      const newListOrder = Array.from(this.state.listOrder);
      newListOrder.splice(source.index, 1);
      newListOrder.splice(destination.index, 0, draggableId);

      const updatedState = {
        ...this.state,
        listOrder: newListOrder,
      };
      this.setState(updatedState);
      BoardHelpers.HandleListReordering(board, newListOrder)
        .then((renderedBoard) => this.context.setRenderedBoard(renderedBoard))
        .catch((err) => console.log(err));
      return;
    }

    const home = this.state.lists[source.droppableId];
    const foreign = this.state.lists[destination.droppableId];

    // triggers when reordering tasks in the same list
    if (home === foreign) {
      const newTaskIds = Array.from(home.taskUIDs);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);

      const newHome = {
        ...home,
        taskUIDs: newTaskIds,
      };

      const newState = {
        ...this.state,
        lists: {
          ...this.state.lists,
          [newHome.id]: newHome,
        },
      };
      this.setState(newState);
      BoardHelpers.HandleTaskReordering(board, newHome.id, newTaskIds)
        .then((renderedBoard) => this.context.setRenderedBoard(renderedBoard))
        .catch((err) => console.log(err));
      return;
    }

    // codes below only works when moving a task one list to another
    const homeTaskUIDs = Array.from(home.taskUIDs);
    homeTaskUIDs.splice(source.index, 1);
    let homeTaskIDs = [];
    homeTaskUIDs.forEach(l => {
      board.tasks?.forEach(t => {
        if (t.uid == l) {
          homeTaskIDs.push(t.id);
        }
      });
    })
    const newHome = {
      ...home,
      taskIDs: homeTaskIDs,
      taskUIDs: homeTaskUIDs,
    };

    let foreignTaskUIDs;
    if (foreign.taskUIDs) {
      foreignTaskUIDs = Array.from(foreign.taskUIDs);
    } else {
      foreignTaskUIDs = [];
    }
    foreignTaskUIDs.splice(destination.index, 0, draggableId);
    let foreignTaskIDs = [];
    foreignTaskUIDs.forEach(l => {
      board.tasks?.forEach(t => {
        if (t.uid == l) {
          foreignTaskIDs.push(t.id);
        }
      });
    })
    const newForeign = {
      ...foreign,
      taskIDs: foreignTaskIDs,
      taskUIDs: foreignTaskUIDs,
    };

    const newState = {
      ...this.state,
      lists: {
        ...this.state.lists,
        [newHome.uid]: newHome,
        [newForeign.uid]: newForeign,
      },
    };
    this.setState(newState);

    if (this.context.renderedBoard) {
      const board = this.context.renderedBoard;
      let newTasks =  {};
      board.tasks.forEach(l => {
        newTasks[l.uid] = l;
      })
      newTasks[draggableId].assigments = newForeign.defaultAssigments ?? [];
      if (board.tasks) {
        this.setState({
          tasks:newTasks,
        });
      }
    }

    // BoardHelpers.HandleTaskSwitching(board, newState.lists, newHome, newForeign)
    //   .then((renderedBoard) => this.context.setRenderedBoard(renderedBoard))
    //   .catch((err) => console.log(err));
  };

  createNewList = async (title) => {
    let updatedState = { ...this.state };
    const listId = shortid.generate();
    let list;
    const board = this.context.renderedBoard;

    if (updatedState.lists !== undefined) {
      // board doesn't have any list
      list = {
        uid: listId,
        title: title,
        taskUIDs: [],
        approvalType: "any"
      };
      updatedState.lists[listId] = list;
      if (!Array.isArray(updatedState.listOrder)) {
        updatedState.listOrder = [];
      }
      updatedState.listOrder.push(listId);
      this.setState(updatedState);
      BoardHelpers.HandleListCreation(
        board,
        updatedState.lists,
        list,
        updatedState.listOrder
      )
        .then((res) => {
          list.id = res.data.id;
          updatedState.lists[listId] = list;
          this.setState(updatedState);
          // this.context.setRenderedBoard(renderedBoard);
        })
        .catch((err) => console.log(err));
    } else {
      list = {
        uid: listId,
        title: title,
        taskUIDs: [],
        approvalType: "any"
      };
      updatedState.lists = {
        [listId]: list,
      };
      updatedState.listOrder = [listId];
      this.setState(updatedState);
      BoardHelpers.HandleListCreation(
        board,
        updatedState.lists,
        list,
        updatedState.listOrder
      )
        .then((renderedBoard) => {
          this.context.setRenderedBoard(renderedBoard);
        })
        .catch((err) => console.log(err));
    }
  };

  createNewTask = (listId, title) => {
    let updatedState = { ...this.state };
    let taskCount;
    let task;
    const board = this.context.renderedBoard;
    const list = updatedState.lists[listId];
    const taskId = shortid.generate();

    if (updatedState.tasks !== undefined) {
      taskCount = Object.keys(updatedState.tasks).length;
      task = {
        uid: taskId,
        title: title,
        assigments: list.defaultAssigments,
      };
      updatedState.tasks[taskId] = task;
      if (updatedState.lists[listId].taskUIDs)
        updatedState.lists[listId].taskUIDs.push(taskId);
      else updatedState.lists[listId].taskUIDs = [taskId];
      this.setState(updatedState);
      BoardHelpers.HandleTaskCreation(
        board,
        updatedState.lists[listId].id,
        updatedState.tasks,
        task,
        updatedState.lists[listId].taskUIDs
      )
        .then((renderedBoard) => {
          this.context.setRenderedBoard(renderedBoard);
        })
        .catch((err) => console.log(err));
    } else {
      taskCount = 0;
      task = {
        uid: taskId,
        title: title,
        assigments: list.defaultAssigments,
      };
      updatedState.tasks = {
        [taskId]: task,
      };
      if (updatedState.lists[listId].taskUIDs)
        updatedState.lists[listId].taskUIDs.push(taskId);
      else updatedState.lists[listId].taskUIDs = [taskId];
      this.setState(updatedState);
      BoardHelpers.HandleTaskCreation(
        board,
        updatedState.lists[listId].id,
        updatedState.tasks,
        task,
        updatedState.lists[listId].taskUIDs
      )
        .then((renderedBoard) => {
          this.context.setRenderedBoard(renderedBoard);
        })
        .catch((err) => console.log(err));
    }
  };

  handleAddAnotherListButtonClick = (event) => {
    this.setState({
      ...this.state,
      anchorEl: event.currentTarget,
    });
  };

  handleNameInputClose = () => {
    this.setState({
      ...this.state,
      anchorEl: null,
    });
  };

  isAdmin = () => {
    const currentUser = this.context.userData;
    return currentUser?.role.type == "admin";
  }

  render() {
    const { classes } = this.props;
    return (
      <DragDropContext onDragEnd={this.onDragEnd}>
        <Droppable droppableId="all-lists" direction="horizontal" type="list">
          {(provided) => (
            <div
              style={{ display: "flex" }}
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {this.state.listOrder &&
                this.state.lists &&
                this.state.listOrder.map((listId, index) => {
                  const list = this.state.lists[listId];
                  if (list && list.uid) {
                    return (
                      <ListColumn
                        key={list.uid}
                        list={list}
                        listOrder={this.state.listOrder}
                        taskMap={this.state.tasks}
                        index={index}
                        openedTaskId={this.props.openedTaskId}
                        createNewTask={this.createNewTask}
                        onDragEnd={this.onDragEnd}
                      />
                    );
                  }
                })}
              {provided.placeholder}
              {this.isAdmin() && <div style={{ padding: "0px 8px" }}>
                <IconButton
                  onClick={(e) => this.handleAddAnotherListButtonClick(e)}
                  className={classes.addAnotherList}
                  aria-label="add-another-list"
                >
                  <Grid item xs={10}>
                    <Typography className={classes.buttonText} component="p">
                      Add another list
                    </Typography>
                  </Grid>
                  <Grid item container xs={2}>
                    <Add />
                  </Grid>
                </IconButton>
                <AddListModal
                  anchorEl={this.state.anchorEl}
                  handleClose={this.handleNameInputClose}
                  createNewList={this.createNewList}
                />
                
              </div>}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    );
  }
}

export default withStyles(canvasStyles)(DndCanvas);
