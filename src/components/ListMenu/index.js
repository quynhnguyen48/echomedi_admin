import React, { useState } from "react";
import {
  Typography,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
} from "@material-ui/core";
import { PopMenu, listMenuStyles } from "./styles";

const ListMenu = ({
  anchorEl,
  handleClose,
  renameButtonClick,
  deleteButtonClick,
  handleOpenEditModal,
}) => {
  const classes = listMenuStyles();
  const [displayDeleteDialog, setDisplayDeleteDialog] = useState(false);

  const closeDeleteDialog = () => {
    setDisplayDeleteDialog(false);
  };

  return (
    <PopMenu
      id="customized-menu"
      anchorEl={anchorEl}
      keepMounted
      open={Boolean(anchorEl)}
      onClose={handleClose}
    >
      <Grid container style={{ outline: "0" }} justify="center">
        <Grid
          item
          xs={12}
          className={classes.itemContainer}
          onClick={() => {
            renameButtonClick();
            handleClose();
          }}
        >
          <Typography variant="body2" className={classes.buttonText}>
            Sửa tên
          </Typography>
        </Grid>
        <Grid
          item
          xs={12}
          className={classes.itemContainer}
          onClick={() => {
            handleOpenEditModal();
          }}
        >
          <Typography variant="body2" className={classes.buttonText}>
            Chỉnh sửa
          </Typography>
        </Grid>
        <Grid
          item
          xs={12}
          className={classes.itemContainer}
          onClick={() => {
            setDisplayDeleteDialog(true);
          }}
        >
          <Typography variant="body2" className={classes.buttonText}>
            Xóa
          </Typography>
        </Grid>
        <Dialog
          open={displayDeleteDialog}
          onClose={closeDeleteDialog}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle>{"Delete this list with all the tasks in it?"}</DialogTitle>
          <DialogActions>
            <Button onClick={closeDeleteDialog} color="primary">
              Go Back
            </Button>
            <Button
              onClick={() => {
                handleClose();
                closeDeleteDialog()
                deleteButtonClick();
              }}
              style={{ color: "#f44336" }}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Grid>
    </PopMenu>
  );
};

export default ListMenu;
