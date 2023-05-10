import React from "react";
import { footerStyles, AuthTheme } from "./styles";
import {
  Grid,
  CssBaseline,
  Typography,
  Divider,
  Link,
} from "@material-ui/core";
import GitHubIcon from '@material-ui/icons/GitHub';

const Footer = () => {
  const classes = footerStyles(AuthTheme);

  return (
    <div className={classes.root}>
      <CssBaseline />
      
    </div>
  );
};

export default Footer;
