import { useState } from "react";

import Button from "components/Button";
import Datepicker from "components/Datepicker";
import Drawer from "components/Drawer";
import Icon from "components/Icon";
import Input from "components/Input";
import Select from "components/Select";
import Textarea from "components/Textarea";
import PieChart from "components/PieChart";
import axios from "../../services/axios";
import { toast } from "react-toastify"

const Theme = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [openDrawer, setOpenDrawer] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassowrd, setConfirmNewPassword] = useState("");

  return (
    <div className="space-y-2 px-6 mt-4">
      <div className="flex items-center gap-x-2">
      </div>
      <div className="bg-form p-6 space-y-2">
        <Input label="Mật khẩu hiện tại" placeholder=""
          type="password"
          value={currentPassword}
          onChange={e => setCurrentPassword(e.target.value)}
        />
        <Input label="Mật khẩu mới" placeholder="" 
          value={newPassword}
          type="password"
          onChange={e => setNewPassword(e.target.value)}
        />
        <Input label="Nhập lại mật khẩu mới" placeholder="" 
          value={confirmNewPassowrd}
          type="password"
          onChange={e => setConfirmNewPassword(e.target.value)}
        />
        <button
            type="button"
            className="flex flex-col items-center bg-gray2 py-8 rounded-xl"
            onClick={() => {
              console.log(currentPassword, newPassword, confirmNewPassowrd)
              axios.post("/auth/change-password", {
                currentPassword,
                password: newPassword,
                passwordConfirmation: confirmNewPassowrd,
              })
                .catch(e => {
                  console.log('response', e)
                  toast.error(e.response.data.error.message)
                })
                .then(response => {
                  if (response?.status == 200) {
                    toast.success('Đổi mật khẩu thành công')
                  }
                })
                .finally(() => {
                });
            }}
          >
            <b className="font-bold text-24 text-primary mt-4">Xác nhận</b>
          </button>
      </div>
    </div>
  );
};

export default Theme;
