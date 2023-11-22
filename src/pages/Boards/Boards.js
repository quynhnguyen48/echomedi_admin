import React, { useState, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Grid, Typography, Container, Box, Button } from "@material-ui/core";
import { Add } from "@material-ui/icons";
import { AppLayout } from "layouts";
import { Board, AddBoardModal } from "components";
import { UserContext } from "provider/UserProvider";
import { boardsStyles } from "./styles";

const Boards = () => {
  const classes = boardsStyles();

  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.user.currentUser);

  const [modalOpen, setModalOpen] = useState(false);
  const { boards } = useContext(UserContext);

  const handleBoardClick = (boardId) => {
    navigate("/board/" + boardId);
  };

  const handleCreateButton = () => {
    setModalOpen(true);
  };

  return (
    <AppLayout>
      <div className={classes.root}>
        <Container className={classes.container} component="main" maxWidth="lg">
          <Box display="flex" className={classes.boxContainer}>
            <Box p={1} flexGrow={1}>
              <Typography className={classes.title} variant="h6" gutterBottom>
                All Boards
              </Typography>
            </Box>
            {currentUser.role.type == "admin" &&<Box p={1}>
              <Button
                onClick={handleCreateButton}
                variant="contained"
                color="primary"
                size="small"
                className={classes.button}
                startIcon={<Add />}
              >
                Add
              </Button>
            </Box>}
          </Box>
          <Grid className={classes.boardsContainer} container spacing={3}>
            {boards !== undefined &&
              boards.length > 0 &&
              boards.map((value, key) => {
                return (
                  <Grid container key={key} item lg={2} md={2} sm={2} xs={10}>
                    <div onClick={() => handleBoardClick(value.id)}>
                      <Board
                        image={value.coverPhoto}
                        title={value.title}
                        users={value.userData}
                        visibility={value.visibility}
                      />
                    </div>
                  </Grid>
                );
              })}
          </Grid>
          <AddBoardModal open={modalOpen} setOpen={setModalOpen} />
        </Container>
      </div>
    </AppLayout>
  );
};

export default Boards;
