import React from "react";
import { Grid } from "@material-ui/core";
import { DndCanvas } from "components";
import { listAreaStyles } from "./styles";

const ListArea = ({ board, openedTaskId }) => {
  const classes = listAreaStyles();

  return (
    <div className={classes.root}>
      <Grid
        style={{
          backgroundColor: "#F8F9FD",
        }}
        className={classes.container}
        container
      >
        <DndCanvas board={board} openedTaskId={openedTaskId}/>
      </Grid>
    </div>
  );
};

export default ListArea;
