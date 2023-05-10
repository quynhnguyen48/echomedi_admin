import React, { useState, useContext, useEffect, useCallback, useRef, useMemo } from "react";
import { Typography, Grid, Avatar } from "@material-ui/core";
import { UserAvatar } from "components";
import { UserContext } from "provider/UserProvider";
import { PopMenu, menuStyles } from "./styles";
import { useDispatch } from "react-redux";
import { resetPageIndex } from "slice/tableSlice";
import { getListStaffs, updateStaff } from "services/api/staff";
import { debounce } from "lodash";

const AssignMemberMenu = ({
  anchorEl,
  handleClose,
  assigments,
  assignMemberToTask,
  assignMemberToList,
}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [detailData, setDetailData] = useState();
  const [searchKey, setSearchKey] = useState(null);
  const fetchIdRef = useRef(0);
  const dispatch = useDispatch();

  const eventHandler = (sk) => {
    console.log('sk', sk)
    // const fetchId = ++fetchIdRef.current;
    if (sk) {
      try {
        setLoading(true);
        let filters = {};
        if (sk?.length) {
          setDetailData(null);
          filters = {
            $or: [
              {
                username: { $containsi: sk },
              },
              {
                email: { $containsi: sk },
              },
            ],
          };
        }
        getListStaffs(
          {
            pageSize: 10,
            page: 1,
          },
          filters
        ).then((res) => {
        if (res.data) {
          setData(res.data);
          setMemberList(res.data);
          setPageCount(res?.data?.meta?.pagination?.pageCount);
        }})
      } catch (error) {
        console.log('error', error)
      } finally {
        setLoading(false);
      }
    }
  };

  const fetchData = useCallback(
    debounce(eventHandler, 300),
    []
  );

  const classes = menuStyles();

  const { renderedBoard } = useContext(UserContext);

  const [input, setInput] = useState("");
  const [memberList, setMemberList] = useState([]);

  const handleMemberClick = (user) => {
    if (typeof assignMemberToTask === "function") assignMemberToTask(user);
    if (typeof assignMemberToList === "function") assignMemberToList(user);
    handleClose();
  };

  // useEffect(() => {
  //   if (input.length > 0) {
  //     const list = memberList.filter((member) => {
  //       const name = member.name.toUpperCase();
  //       const text = input.toUpperCase();
  //       return name.includes(text);
  //     });
  //     setMemberList(list);
  //   }
  // }, [input]);

  // useEffect(() => {
  //   fetchData({pageIndex: 0, pageSize: 10});
  // }, [searchKey])

  // useEffect(() => {
  //   if (assigments && renderedBoard?.userData) {
  //     const list = renderedBoard.userData.filter(
  //       (user) => !assigments.includes(user.uid)
  //     );
  //     setMemberList(list);
  //   }
  // }, [assigments, renderedBoard?.userData]);

  const handleOnKeyDown = (e) => {
    e.stopPropagation();
  };

  return (
    <div>
      <PopMenu
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={() => {
          handleClose();
          setInput("");
        }}
      >
        <Grid className={classes.header} container>
          <Grid item xs={12}>
            <Typography className={classes.headerTitle} component="p">
              Assign Member
            </Typography>
          </Grid>
        </Grid>
        <Grid className={classes.content} item container>
          <Grid item container xs={12} className={classes.inputContainer}>
            <input
              value={searchKey}
              onChange={async (e) => {
                // dispatch(resetPageIndex());
                await setSearchKey(e.target.value);
                fetchData(e.target.value);
              }}
              placeholder="Name"
              type="text"
              className={classes.input}
              onKeyDown={handleOnKeyDown}
            />
          </Grid>
        </Grid>
        {/* {renderedBoard?.userData &&
          renderedBoard?.userData.length !== assigments.length && (
            <Grid item container className={classes.membersContainer} xs={11}> */}
              {memberList &&
                memberList.map((user, index) => {
                  return (
                    <Grid
                      index={index}
                      item
                      container
                      xs={12}
                      className={classes.member}
                      onClick={() => handleMemberClick(user)}
                    >
                      <Grid item xs style={{ maxWidth: "32px" }}>
                        <UserAvatar user={user} styles={classes.avatar} />
                      </Grid>
                      <Grid
                        item
                        container
                        alignItems="center"
                        xs
                        style={{ maxWidth: "180px" }}
                      >
                        <Typography className={classes.name}>
                          {user.fullname ?? user.username}
                        </Typography>
                      </Grid>
                    </Grid>
                  );
                })}
            {/* </Grid>
          )} */}
      </PopMenu>
    </div>
  );
};

export default AssignMemberMenu;
