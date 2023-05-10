import React from "react";
import { footerStyles } from "./styles";
import {
  Grid,
  CssBaseline,
  Typography,
  Divider,
  Link,
} from "@material-ui/core";
import { UIContext } from "provider/UIProvider";
import GitHubIcon from "@material-ui/icons/GitHub";

const Footer = () => {
  const classes = footerStyles();
  const { showFooter } = React.useContext(UIContext);

  return (
    <div
      style={{ display: showFooter === true ? "flex" : "none" }}
      className={classes.root}
    >
      <CssBaseline />
    </div>
  );
};

export default Footer;
