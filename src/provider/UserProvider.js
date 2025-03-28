import React from "react";

export const UserContext = React.createContext();

const UserProvider = ({
  userData,
  setUserData,
  boards,
  setBoards,
  setOpenBackdrop,
  renderedBoard,
  setRenderedBoard,
  loadRenderedBoard,
  children,
}) => {
  return (
    <UserContext.Provider
      value={{
        userData,
        setUserData,
        boards,
        setBoards,
        setOpenBackdrop,
        renderedBoard,
        setRenderedBoard,
        loadRenderedBoard,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
