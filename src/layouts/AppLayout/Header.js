import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppBar, Toolbar, IconButton, Typography } from "@material-ui/core";
import { Dashboard, Apps } from "@material-ui/icons";
import Menu from "./Menu";
import { headerStyles } from "./styles";
import { UIContext } from "provider/UIProvider";

const Header = () => {
  const navigate = useNavigate();
    const classes = headerStyles();
  const { showAllBoards, renderedBoard } = useContext(UIContext);

  return (
    <div className={classes.root}>
      <AppBar className={classes.appbar} position="static">
        <Toolbar className={classes.toolbar}>
          <IconButton
            edge="start"
            className={classes.menuButton}
            aria-label="menu"
            onClick={() => navigate("/boards")}
          >
            <Dashboard className={classes.menuIcon} />
            <Typography variant="h6" className={classes.menuTitle}>
              ECHO MEDI BOARDS
            </Typography>
          </IconButton>
          {showAllBoards === true ? (
            <div className={classes.boardsContainer}>
              <Typography className={classes.title}>
                {renderedBoard?.title}
              </Typography>
              <IconButton
                onClick={() => navigate("/boards")}
                className={classes.allBoardsButton}
              >
                <Apps className={classes.allBoardsIcon} />
                <Typography className={classes.allBoardsText}>
                  All Boards
                </Typography>
              </IconButton>
            </div>
          ) : (
            <div className={classes.boardsContainer}></div>
          )}
          {/* <Menu /> */}
        </Toolbar>
      </AppBar>
    </div>
  );
};

export default Header;
