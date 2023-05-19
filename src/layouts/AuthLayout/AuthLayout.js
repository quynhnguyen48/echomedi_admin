import React from "react";
import Footer from "./Footer";
import { containerStyles, AuthTheme } from "./styles";
import { ThemeProvider } from "@material-ui/styles";
import UserProvider from "provider/UserProvider";
import { useState, useEffect } from "react";

const AuthLayout = ({ children }) => {
  const classes = containerStyles();
  
  useEffect(() => {
    console.log('asd')
    var request = window.indexedDB.open("echomedi", 1)
    request.onsuccess = event => {
      setDb(request.result);
    };
    var db = null;
    var collection = "echomedi";
    request.onupgradeneeded = (event) => {
      db = event.target.result
      db.createObjectStore(collection, {
        // Giá trị cột key tự động tăng
        autoIncrement: true
      })
      console.log('asd')
      setDb(db);
      // db.transaction(collection, "readwrite")
      //   .objectStore(collection)
      //   .add({token: loginRes.data?.jwt})
    };

    db.transaction("echomedi", "readwrite")
          .objectStore("echomedi")
          .put({
            id: 1, token: loginRes.data?.jwt
          }, 1);


        var request = db.transaction("echomedi").objectStore("echomedi").get(1);
        request.onsuccess = (event) => {
          console.log(`Value is: ${event.target.result.token}`)
            navigator.serviceWorker
              .register('firebase-messaging-sw.js')
              .then(function (registration) {
                return registration.scope;
              })
              .catch(function (err) {
                return err;
              });
        }
  }, [])

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
