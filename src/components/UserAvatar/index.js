import React from "react";
import { Avatar, Typography } from "@material-ui/core";

const UserAvatar = ({ user, styles, isTask, approved }) => {
  console.log('approved', user)
  return (
    <div>
      {user && user.picture ? (
        <Avatar
          className={styles}
          src={user.picture}
          alt={user.name + " avatar"}
          style={{
            borderRadius: "8px",
            width: isTask && "35px",
            height: isTask && "35px",
          }}
        />
      ) : (
        <Avatar
          className={styles}
          alt="user avatar"
          src={user && user.picture}
          style={{
            borderRadius: "8px",
            width: isTask && "100%",
            height: isTask && "35px",
            backgroundColor: approved == null ? "gray" : (!approved ? "red" : "green"),
          }}
        >
          <Typography >
            {(user && user.fullname && user.fullname[0]) ?? (user && user.username && user.username[0])}
          </Typography>
        </Avatar>
      )}
    </div>
  );
};

export default UserAvatar;
