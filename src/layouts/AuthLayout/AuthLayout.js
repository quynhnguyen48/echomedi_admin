import React from "react";
import Footer from "./Footer";
import { containerStyles, AuthTheme } from "./styles";
import { ThemeProvider } from "@material-ui/styles";
import UserProvider from "provider/UserProvider";


const AuthLayout = ({ children }) => {
  const classes = containerStyles();
  return (
    <ThemeProvider theme={AuthTheme}>
      <UserProvider
        userData={{}}
      >
      <div className={classes.root}>
        <>{children}</>
        <Footer />
      </div>
      </UserProvider>
    </ThemeProvider>
  );
};

export default AuthLayout;
