import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom"
import { BrowserView, isMobile } from 'react-device-detect';

import Sidebar from "components/Sidebar";
import { JWT_TOKEN, USER_ROLE } from "constants/Authentication";
import { getMe } from "services/api/users";
import { setCurrentUser } from "slice/userSlice";
import { getErrorMessage } from "utils/error";
import { formatStrapiArr, formatStrapiObj } from "utils/strapi"
import { getAllBoards, getBoard, getBoardDetail } from "api/Board";
import UserProvider from "provider/UserProvider";
import UIProvider from "provider/UIProvider";
import { initializeFirebase } from '../push-notification';

const MainLayout = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [renderedBoard, setRenderedBoard] = useState();
  const [openBackdrop, setOpenBackdrop] = useState(false);
  const [boards, setBoards] = useState([]);
  const [userData, setUserData] = useState();

  useEffect(() => {
    initializeFirebase();
  }, [])

  const loadRenderedBoard = async (b) => {
    const toastId = toast.loading("Đang tải ...")
    if (b)
    await getBoardDetail(b.id)
    .then((response) => {
      // let tmp = formatStrapiObj(response);
      setRenderedBoard(response);
      toast.dismiss(toastId)
    });
  };

  // useEffect(() => {
  //   loadRenderedBoard
  // }, []);

  useEffect(() => {
    (async () => {
      try {
        const userRes = await getMe();
        if (
          ![USER_ROLE.PUBLIC, USER_ROLE.AUTHENTICATED].includes(
            userRes?.data?.role?.type
          )
        ) {
          dispatch(setCurrentUser(userRes.data));
          setUserData(userRes.data)
        } else {
          localStorage.removeItem(JWT_TOKEN);
          throw new Error("You don't have permission to access");
        }
      } catch (error) {
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          dispatch(setCurrentUser(null));
          setUserData(null)
          localStorage.removeItem(JWT_TOKEN);
          navigate("/login");
        }
        // toast.error(getErrorMessage(error));
      }
    })();
  }, [dispatch, navigate]);

  // useEffect(() => {
  //   if (isMobile && location.pathname === '/') {
  //     navigate('/check-in')
  //   }
  // }, [location.pathname, navigate])

  useEffect(() => {
    if (location.pathname.startsWith('/board')) {
      getAllBoards()
        .then((response) => {
          let tmp = formatStrapiArr(response);
          setBoards(tmp);
        });
    }
  }, [location.pathname, navigate])

  return (
    <UIProvider
      openBackdrop={openBackdrop}
      setOpenBackdrop={setOpenBackdrop}
      renderedBoard={renderedBoard}
      setRenderedBoard={setRenderedBoard}
      loadRenderedBoard={loadRenderedBoard}
      userData={userData}
      currentUser={userData}
    >
      <UserProvider
        currentUser={userData}
        userData={userData}
        boards={boards}
        setBoards={setBoards}
        setOpenBackdrop={setOpenBackdrop}
        renderedBoard={renderedBoard}
        setRenderedBoard={setRenderedBoard}
        loadRenderedBoard={loadRenderedBoard}
      >
        <div className="flex">
          {/* <BrowserView> */}
            <Sidebar />
          {/* </BrowserView> */}
          <div className="flex-1 overflow-x-hidden">{children}</div>
        </div>
      </UserProvider>
    </UIProvider>
  );
};

export default MainLayout;
