import React from "react";
import { UserContext } from "provider/UserProvider";
import { ListHelpers } from "helpers";
import { Droppable, Draggable } from "react-beautiful-dnd";
import { IconButton, Grid, Typography } from "@material-ui/core";
import { AddTaskModal, TaskColumn, ListMenu, RenameMenu } from "components";
import { Add, MoreHoriz } from "@material-ui/icons";
import { withStyles } from "@material-ui/core/styles";
import { listStyles } from "./styles";
import { EditListModal, UserAvatar } from "components";

class List extends React.Component {
  constructor(props) {
    super(props);
    const openedTaskId = parseInt(props.openedTaskId);

    this.state = {
      addCardAnchorEl: null,
      listMenuAnchorEl: null,
      renameMenuAnchorEl: null,
      modalVisible: openedTaskId == props.list.id,
    };
    this.listContainerRef = React.createRef();
  }

  static contextType = UserContext;

  handleNameInputClose = () => {
    this.setState({
      addCardAnchorEl: null,
    });
  };

  handleListMenuClose = () => {
    this.setState({
      listMenuAnchorEl: null,
    });
  };

  handleRenameMenuClose = () => {
    this.setState({
      renameMenuAnchorEl: null,
    });
  };

  handleAddAnotherCardButtonClick = (event) => {
    this.setState({
      addCardAnchorEl: event.currentTarget,
    });
  };

  handleListMenuButtonClick = (event) => {
    this.setState({
      listMenuAnchorEl: event.currentTarget,
    });
  };

  handleRenameButtonClick = () => {
    this.setState({
      renameMenuAnchorEl: this.listContainerRef.current,
    });
  };

  handleDeleteButtonClick = () => {
    let { renderedBoard, setRenderedBoard } = this.context;
    if (renderedBoard && renderedBoard.lists) {
      let newState = { ...renderedBoard };
      console.log('newState', newState);
      newState.lists = newState.lists.filter(l => l.id != this.props.list.id);
      // delete newState.lists[this.props.list.id];
      ListHelpers.HandleDeletingList(renderedBoard, this.props.list.id)
        .then(() => {
          setRenderedBoard(newState);
        })
        .catch((error) => console.log(error));
    }
  };

  handleOpenEditModal = () => {
    this.setState({ modalVisible: true });
  }

  handleCloseEditModal = () => {
    this.setState({modalVisible: false})
  }

  assignMemberToList = (user) => {
    this.setState(
      {
        assigments: [...this.state.assigments, user],
      },
      () => {
        ListHelpers.HandleListPropertyUpdate(
          this.context.renderedBoard,
          list.id,
          "assigments",
          this.state.assigments
        );
      }
    );
  };

  isAdmin = () => {
    const currentUser = this.context.userData;
    return currentUser?.role.type == "admin";
  }

  render() {
    const { classes, createNewTask, list, index, listOrder, onDragEnd } = this.props;
    const currentUser = this.context.userData;

    return (
      <Draggable draggableId={list.uid.toString()} index={index} isDragDisabled={true}>
        {(provided, snapshot) => (
          <div {...provided.draggableProps} ref={provided.innerRef}>
            <div
              className={classes.container}
              style={{ transform: snapshot.isDragging && "rotate(3.5deg)" }}
            >
             <Grid
                container
                {...provided.dragHandleProps}
                ref={this.listContainerRef}
              >
                <Grid item container xs={9} className={classes.title}>
                  {this.props.list.title}
                </Grid>
                {currentUser?.role.type == "admin" && <Grid item container xs={3} justify="flex-end">
                  <IconButton
                    onClick={this.handleListMenuButtonClick}
                    style={{ padding: "8px" }}
                  >
                    <MoreHoriz />
                  </IconButton>
                </Grid>}
                <ListMenu
                  anchorEl={this.state.listMenuAnchorEl}
                  handleClose={this.handleListMenuClose}
                  renameButtonClick={this.handleRenameButtonClick}
                  deleteButtonClick={this.handleDeleteButtonClick}
                  handleOpenEditModal={this.handleOpenEditModal}
                  listId={this.props.list.uid}
                />
                <RenameMenu
                  anchorEl={this.state.renameMenuAnchorEl}
                  handleClose={this.handleRenameMenuClose}
                  listTitle={this.props.list.title}
                  listId={this.props.list.uid}
                />
              </Grid>
              <Droppable droppableId={list.uid} type="task">
                {(provided, snapshot) => (
                  <div
                    className={
                      snapshot.isDraggingOver
                        ? classes.dragging
                        : classes.taskList
                    }
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    <TaskColumn listOrder={listOrder} list={list} tasks={this.props.tasks} openedTaskId={this.props.openedTaskId} onDragEnd={onDragEnd}/>
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
              {this.isAdmin() && <div className={classes.title}>
                <Grid container justify="space-between" alignItems="center">
                  <IconButton
                    className={classes.addAnotherCard}
                    aria-label="cover"
                    onClick={(e) => {
                      this.handleAddAnotherCardButtonClick(e);
                    }}
                  >
                    <Grid item xs={10}>
                      <Typography className={classes.buttonText} component="p">
                        Thêm thẻ mới
                      </Typography>
                    </Grid>
                    <Grid item container xs={2}>
                      <Add className={classes.menuIcon} />
                    </Grid>
                  </IconButton>
                  <AddTaskModal
                    anchorEl={this.state.addCardAnchorEl}
                    handleClose={this.handleNameInputClose}
                    createNewTask={createNewTask}
                    list={list}
                  />
                  <EditListModal
                    list={list}
                    open={this.state.modalVisible}
                    handleClose={this.handleCloseEditModal}
                    assignMemberToList={this.assignMemberToList}
                  />
                </Grid>
              </div>}
            </div>
          </div>
        )}
      </Draggable>
    );
  }
}

export default withStyles(listStyles)(List);
