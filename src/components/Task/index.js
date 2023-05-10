import React, { useCallback, } from "react";
import { Draggable } from "react-beautiful-dnd";
import { withStyles } from "@material-ui/core/styles";
import { Add, AttachFile, Comment } from "@material-ui/icons";
import { Paper, Grid, Typography, IconButton } from "@material-ui/core";
import { EditTaskModal, UserAvatar } from "components";
import { UIContext } from "provider/UIProvider";
import { GetUniqueId } from "api/Common";
// import { UploadFile } from "firebase/Upload";
import { TaskHelpers } from "helpers";
import { taskStyles } from "./styles";
import { uploadMedia } from "services/api/mediaLibrary"
import { toast } from "react-toastify"
import { isCompositeComponent } from "react-dom/test-utils";
import { formatDate } from "utils/dateTime"
import { CreateNewTask, ReorderTasks, SwitchTasks } from "api/Task";
import { BoardHelpers } from "helpers/";

class Task extends React.Component {
  constructor(props) {
    super(props);

    const openedTaskId = parseInt(props.openedTaskId);

    this.state = {
      modalVisible: openedTaskId == this.props.task.id,
      coverImage: "",
      title: "",
      description: "",
      comments: [],
      attachments: [],
      labels: [],
      assigments: [],
      approvalType: "",
    };
  }

  static contextType = UIContext;

  handleTaskClick = () => {
    this.setState({ modalVisible: true });
  };

  closeEditModal = () => {
    this.setState({ modalVisible: false });
  };

  handleTitleChange = (title) => {
    this.setState({ title: title });
    TaskHelpers.HandleTaskPropertyUpdate(
      this.context.renderedBoard,
      this.props.task.uid,
      "title",
      title
    ).catch((err) => console.log(err));
  };

  handleDescriptionChange = (description) => {
    this.setState({ description: description });
    TaskHelpers.HandleTaskPropertyUpdate(
      this.context.renderedBoard,
      this.props.task.uid,
      "description",
      description
    ).catch((err) => console.log(err));
  };

  submitComment = (comment) =>
    new Promise((resolve, reject) => {
      this.setState(
        {
          comments: [...this.state.comments, comment],
        },
        async () => {
          const response = await TaskHelpers.HandleTaskPropertyUpdate(
            this.context.renderedBoard,
            this.props.task.uid,
            "comments",
            this.state.comments
          );
          if (response) {
            resolve("Property updated successfully!");
          } else {
            reject("Property update failed");
          }
        }
      );
    });
  deleteComment = (commentId) => {
    let comments = this.state.comments;
    for (let i = 0; i < comments.length; i++) {
      const comment = comments[i];
      if (comment.id === commentId) {
        // remove id matched comment
        comments.splice(i, 1);
        this.setState({ comments: comments }, () => {
          TaskHelpers.HandleTaskPropertyUpdate(
            this.context.renderedBoard,
            this.props.task.uid,
            "comments",
            this.state.comments
          ).catch((err) => console.log(err));
        });
      }
    }
  };
  editComment = (commentId, comment) => {
    let comments = this.state.comments;
    for (let i = 0; i < comments.length; i++) {
      if (comments[i].id === commentId) {
        // remove id matched comment
        comments[i].text = comment;
        this.setState({ comments: comments }, () => {
          TaskHelpers.HandleTaskPropertyUpdate(
            this.context.renderedBoard,
            this.props.task.uid,
            "comments",
            this.state.comments
          ).catch((err) => console.log(err));
        });
      }
    }
  };


  addAttachment = (file) =>
    new Promise(async (resolve, reject) => {
      const toastId = toast.loading("Đang tải lên")
      try {
        const uploadedFiles = [file]
        const promises = uploadedFiles?.map((file) => {
          const formData = new FormData()
          formData.append("files", file)
          return uploadMedia(formData)
        })
        const response = await Promise.all(promises);
        const files = response?.map((item) => item.data);
        if (files) {
          // // onFinish(id, files)
          const fileUrl = "https://api.echomedi.com" + files[0][0].url;
          if (fileUrl) {
            this.setState(
              {
                attachments: [
                  ...this.state.attachments,
                  {
                    // id: id.data,
                    name: file.name,
                    uploadDate: file.uploadDate,
                    fileType: file.fileType,
                    fileUrl: fileUrl,
                  },
                ],
              },
              async () => {
                const response = await TaskHelpers.HandleTaskPropertyUpdate(
                  this.context.renderedBoard,
                  this.props.task.uid,
                  "attachments",
                  this.state.attachments
                );
                if (response) {
                  resolve("Property updated successfully!");
                } else {
                  reject("Property update failed");
                }
              });

          }
        }
      } catch (error) {
        // toast.error(getErrorMessage(error));
      } finally {
        toast.dismiss(toastId)
      }

      // const id = await GetUniqueId();
      // const fileUrl = await UploadFile(file, id.data);
      // if (fileUrl) {
      //   this.setState(
      //     {
      //       attachments: [
      //         ...this.state.attachments,
      //         {
      //           id: id.data,
      //           name: file.name,
      //           uploadDate: file.uploadDate,
      //           fileType: file.fileType,
      //           fileUrl: fileUrl,
      //         },
      //       ],
      //     },
      //     async () => {
      //       const response = await TaskHelpers.HandleTaskPropertyUpdate(
      //         this.context.renderedBoard,
      //         this.props.task.id,
      //         "attachments",
      //         this.state.attachments
      //       );
      //       if (response) {
      //         resolve("Property updated successfully!");
      //       } else {
      //         reject("Property update failed");
      //       }
      //     }
      //   );
      // }
    });

  deleteAttachment = (attachmentId) => {
    let attachments = this.state.attachments;
    for (let i = 0; i < attachments.length; i++) {
      const attachment = attachments[i];
      if (attachment.id === attachmentId) {
        // remove id matched comment
        attachments.splice(i, 1);
        this.setState({ attachments: attachments }, () => {
          TaskHelpers.HandleTaskPropertyUpdate(
            this.context.renderedBoard,
            this.props.task.uid,
            "attachments",
            this.state.attachments
          ).catch((err) => console.log(err));
        });
      }
    }
  };

  handleSearchedImageClick = (regular) => {
    this.setState(
      {
        coverImage: regular,
      },
      () => {
        TaskHelpers.HandleTaskPropertyUpdate(
          this.context.renderedBoard,
          this.props.task.uid,
          "coverImage",
          this.state.coverImage
        );
      }
    );
  };

  addLabel = (label) => {
    this.setState(
      {
        labels: [...this.state.labels, label],
      },
      () => {
        TaskHelpers.HandleTaskPropertyUpdate(
          this.context.renderedBoard,
          this.props.task.uid,
          "labels",
          this.state.labels
        );
      }
    );
  };

  deleteLabel = (labelId) => {
    let labels = this.state.labels;
    for (let i = 0; i < labels.length; i++) {
      const label = labels[i];
      if (label.id === labelId) {
        // remove id matched label
        labels.splice(i, 1);
        this.setState({ labels: labels }, () => {
          TaskHelpers.HandleTaskPropertyUpdate(
            this.context.renderedBoard,
            this.props.task.uid,
            "labels",
            this.state.labels
          ).catch((err) => console.log(err));
        });
      }
    }
  };

  assignMemberToTask = (user) => {
    console.log('assignMemberToTask')
    this.setState(
      {
        assigments: [...this.state.assigments, user],
      },
      () => {
        TaskHelpers.HandleTaskPropertyUpdate(
          this.context.renderedBoard,
          this.props.task.uid,
          "assigments",
          this.state.assigments
        );
        TaskHelpers.EmailNotifyUser(user, this.props.task);

      }
    );
  };

  emailNotifyUser = (user) => {
    TaskHelpers.EmailNotifyUser(user, this.props.task);
  }

  removeAssignedMember = (uid) => {
    let assigments = this.state.assigments;
    for (let i = 0; i < assigments.length; i++) {
      assigments = assigments.filter((a) => a.id !== uid);
      this.setState({ assigments: assigments }, () => {
        TaskHelpers.HandleTaskPropertyUpdate(
          this.context.renderedBoard,
          this.props.task.uid,
          "assigments",
          this.state.assigments
        ).catch((err) => console.log(err));
      });
    }
  };

  approveTask = (user, approve) => {
    let assigments = this.state.assigments;
    assigments = assigments.map((a) => {
      if (a.id == user.id) a.approved = approve;
      return a;
    });

    this.setState({ assigments: assigments }, () => {
      TaskHelpers.HandleTaskApproval(
        this.props.task.id,
        user.id,
        approve,
      )
      .then((res) => {
        if (res.approved) {
          const index = this.props.listOrder.indexOf(this.props.listUID);
          const result = { 
            destination: {
              droppableId: this.props.listOrder[index + 1],
              index: 0,
            }, 
            source: {
              droppableId: this.props.listOrder[index],
              index: this.props.index,
            }, 
            draggableId: this.props.task.uid, 
            type: "task" 
          };
          this.props.onDragEnd(result);
        }
      })
      .catch((err) => console.log(err));
      // const result = { 
      //   destination: {
      //     droppableId: 
      //   }, 
      //   source, draggableId, type };
      // onDragEnd()
    });
  }

  componentDidMount() {
    const {
      coverImage,
      title,
      description,
      comments,
      attachments,
      labels,
      assigments,
    } = this.props.task;
    this.setState({
      coverImage: coverImage || "",
      title: title || " ",
      description: description || " ",
      comments: comments || [],
      attachments: attachments || [],
      labels: labels || [],
      assigments: assigments || [],
    });
  }

  render() {
    const { classes, task, index } = this.props;
    const {
      coverImage,
      title,
      comments,
      attachments,
      labels,
      assigments,
    } = this.state;
    const { renderedBoard } = this.context;
    let avatarCounter = 0;

    // const onFinish = useCallback(
    //   async (id, files) => {
    //     // let payload = cloneDeep(testResults)
    //     // if (payload?.[id]) {
    //     //   payload[id] = [...payload[id], ...files]
    //     // } else {
    //     //   payload = {
    //     //     ...payload,
    //     //     [id]: files,
    //     //   }
    //     // }
    //     // await updateTreatment(medicalRecordId, {
    //     //   testResults: payload,
    //     // })
    //     // await fetchData()
    //   },
    //   []
    // )

    // const onRemove = useCallback(
    //   async (id, value) => {
    //     try {
    //       let payload = cloneDeep(testResults)
    //       payload[id] = payload[id]?.filter((item) => item.id !== value.id)
    //       await updateTreatment(medicalRecordId, {
    //         testResults: payload,
    //       })
    //       // await fetchData()
    //     } catch (error) {}
    //   },
    //   [fetchData, medicalRecordId, testResults]
    // )

    // const uploadAssets = useCallback(
    //   async (id, e) => {
    //     const toastId = toast.loading("Đang tải lên")
    //     try {
    //       const uploadedFiles = [...e.target.files]
    //       const promises = uploadedFiles?.map((file) => {
    //         const formData = new FormData()
    //         formData.append("files", file)
    //         return uploadMedia(formData)
    //       })
    //       const response = await Promise.all(promises)
    //       const files = flatten(response?.map((item) => item.data))
    //       if (files) {
    //         onFinish(id, files)
    //       }
    //     } catch (error) {
    //       // toast.error(getErrorMessage(error));
    //     } finally {
    //       toast.dismiss(toastId)
    //     }
    //   },
    //   [onFinish]
    // )

    return (
      <Draggable draggableId={task.uid.toString()} index={index} isDragDisabled={true}>
        {(provided, snapshot) => (
          <div
            className={
              snapshot.isDragging ? classes.dragging : classes.container
            }
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            ref={provided.innerRef}
          >
            <Paper
              className={classes.paper}
              style={{ transform: snapshot.isDragging && "rotate(3.5deg)" }}
              onClick={this.handleTaskClick}
              onMouseEnter={() =>
                this.setState({
                  taskHover: true,
                })
              }
              onMouseLeave={() =>
                this.setState({
                  taskHover: false,
                })
              }
            >
              {coverImage && (
                <img
                  alt="task-cover"
                  className={classes.cover}
                  src={coverImage}
                />
              )}
              <Grid container>
                <Grid item xs={10}>
                  <Typography
                    className={classes.title}
                    variant="body1"
                    gutterBottom
                  >
                    {title}
                  </Typography>
                </Grid>
                <Grid
                  item
                  container
                  xs={12}
                  justify="flex-start"
                  style={{ marginBottom: "16px" }}
                >
                  {labels &&
                    labels.map((label, index) => {
                      return (
                        <Grid
                          className={classes.labelContainer}
                          style={{ backgroundColor: label.color.hex }}
                          item
                          container
                          alignItems="center"
                          justify="space-around"
                          index={index}
                        >
                          <Grid item xs={10}>
                            <Typography className={classes.labelText}>
                              {label.input}
                            </Typography>
                          </Grid>
                        </Grid>
                      );
                    })}
                </Grid>
              </Grid>
              {assigments?.map((user, index) => {
                  avatarCounter += 1;
                  return (
                    <Grid item container sm xs={8} className={classes.member}>
                        <Grid item xs style={{ maxWidth: "48px", marginBottom: "5px" }}>
                          <UserAvatar user={user} styles={classes.avatar} approved={user.approved}/>
                        </Grid>
                        <Grid
                          item
                          container
                          alignItems="center"
                          xs
                          style={{ maxWidth: "180px" }}
                        >
                          <Typography className={classes.name}>
                            {user.fullname ?? user.username}
                          </Typography>
                        </Grid>
                      </Grid>
                  );
                })}
              <Grid item container xs={12}>
                
                {assigments && assigments.length > 3 && (
                  <Grid item className={classes.othersContainer}>
                    <Typography
                      className={classes.othersInfo}
                      variant="body2"
                      gutterBottom
                    >
                      +{assigments.length - 3} Others
                    </Typography>
                  </Grid>
                )}
                <Grid
                  item
                  container
                  xs
                  justify="flex-end"
                  className={classes.propertyCounter}
                >
                  {comments && comments.length > 0 && (
                    <Grid
                      item
                      container
                      justify="center"
                      alignItems="center"
                      xs={4}
                      style={{ maxWidth: "35px" }}
                    >
                      <Comment className={classes.propertyIcon} />
                      {comments.length}
                    </Grid>
                  )}
                  {attachments && attachments.length > 0 && (
                    <Grid
                      item
                      container
                      justify="center"
                      alignItems="center"
                      xs={4}

                      style={{ maxWidth: "35px" }}
                    >
                      <AttachFile className={classes.propertyIcon} />
                      {attachments.length}
                    </Grid>
                  )}
                </Grid>
              </Grid>
              <Grid item justify="flex-end" container xs={12}>
                <Grid item alignItems="right" className={classes.othersContainer}>
                  <Typography
                    variant="body2"
                    gutterBottom
                    className={classes.propertyCounter}
                  >
                    {formatDate(task.createdAt, "H:mm DD/MM/YYYY")}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
            <EditTaskModal
              open={this.state.modalVisible}
              handleClose={this.closeEditModal}
              editTitle={this.handleTitleChange}
              editDescription={this.handleDescriptionChange}
              coverImage={this.state.coverImage}
              labels={this.state.labels}
              listTitle={this.props.listTitle}
              approvalType={this.props.approvalType}
              taskTitle={this.state.title}
              description={this.state.description}
              comments={this.state.comments}
              assigments={this.state.assigments}
              addImageToTask={this.handleSearchedImageClick}
              submitComment={this.submitComment}
              deleteComment={this.deleteComment}
              editComment={this.editComment}
              attachments={this.state.attachments}
              addAttachment={this.addAttachment}
              deleteAttachment={this.deleteAttachment}
              addLabel={this.addLabel}
              deleteLabel={this.deleteLabel}
              assignMemberToTask={this.assignMemberToTask}
              removeAssignedMember={this.removeAssignedMember}
              emailNotifyUser={this.emailNotifyUser}
              approveTask={this.approveTask}
              onDragEnd={this.props.onDragEnd}
              approvable={this.props.task.approvable}
              taskId={this.props.task.id}
            />
          </div>
        )}
      </Draggable>
    );
  }
}

export default withStyles(taskStyles)(Task);
