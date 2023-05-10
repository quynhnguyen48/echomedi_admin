import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";
import dayjs from "dayjs";

import AuthLayout from "layouts/AuthLayout";
import MainLayout from "layouts/MainLayout";
import AuthRoutes from "router/AuthRoutes";
import MainRoutes from "router/MainRoutes";
import { getListRoles } from "services/api/roles";
import "react-toastify/dist/ReactToastify.css";
import { setStaffRoles } from "slice/userSlice";
import { USER_ROLE } from "constants/Authentication";

require("dayjs/locale/vi");
dayjs.locale("vi");

function App() {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.user.currentUser);

  useEffect(() => {
    (async () => {
      const res = await getListRoles();
      if (res?.data) {
        dispatch(
          setStaffRoles(
            res?.data?.roles?.filter(
              (role) => ![USER_ROLE.AUTHENTICATED, USER_ROLE.PUBLIC]?.includes(role.type)
            )
          )
        );
      }
    })();
  }, [dispatch]);

  if (!currentUser) {
    return (
      <AuthLayout>
        <AuthRoutes />
        <ToastContainer />
      </AuthLayout>
    );
  }

  return (
    <MainLayout>
      <MainRoutes />
      <ToastContainer />
    </MainLayout>
  );
}

export default App;
