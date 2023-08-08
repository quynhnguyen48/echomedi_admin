import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Button from "components/Button";
import Datepicker from "components/Datepicker";
import Drawer from "components/Drawer";
import Icon from "components/Icon";
import Input from "components/Input";
import Select from "components/Select";
import Textarea from "components/Textarea";
import PieChart from "components/PieChart";
import axios from "../../services/axios";
import SignaturePad from "signature_pad";
import { toast } from "react-toastify"
import { uploadMedia } from "services/api/mediaLibrary"

const Theme = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [openDrawer, setOpenDrawer] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassowrd, setConfirmNewPassword] = useState("");
  const [signaturePad, setSignaturePad] = useState(null);
  const currentUser = useSelector((state) => state.user.currentUser);


  function dataURLtoFile(dataurl, filename) {
    var arr = dataurl.split(','),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[arr.length - 1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  const getBase64FromUrl = async (url) => {
    const data = await fetch(url);
    const blob = await data.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob); 
      reader.onloadend = () => {
        const base64data = reader.result;   
        resolve(base64data);
      }
    });
  }

  const uploadFile = () =>
    new Promise(async (resolve, reject) => {
      const canvas = document.querySelector("canvas");

      var file = dataURLtoFile(signaturePad.toDataURL(),'test.png');
      const toastId = toast.loading("Đang tải lên")
      

      try {
        const uploadedFiles = [file]
        const promises = uploadedFiles?.map((file) => {
          const formData = new FormData()
          formData.append("files", file)
          formData.append("ref", "plugin::users-permissions.user")
          formData.append("refId", currentUser.id)
          formData.append("field", "signature")
          return uploadMedia(formData)
        })
      } catch (error) {
        // toast.error(getErrorMessage(error));
      } finally {
        toast.dismiss(toastId)
      }
    })

  useEffect(() => {
    const canvas = document.querySelector("canvas");

    let signaturePad = new SignaturePad(canvas);
    setSignaturePad(signaturePad);

    const fetchData = async () => {
      const data = await getBase64FromUrl(process.env.REACT_APP_API_URL + currentUser.signature.url);

      signaturePad.fromDataURL(data, {width: 300, height: 150})
    }

    fetchData()
  }, []);

  return (
    <div className="space-y-2 px-6 mt-4">
      <div className="flex items-center gap-x-2">
      </div>
      <div className="bg-form p-6 space-y-2">
        <label>Chữ ký</label>
        <canvas style={{backgroundColor: 'white'}}/>
        <button
          type="button"
          className="flex flex-col items-center bg-gray2 py-8 rounded-xl"
          onClick={async () => {
            await uploadFile();
          }}
        >
          <b className="font-bold text-24 text-primary mt-4">Xác nhận</b>
        </button>
        <button
          type="button"
          className="flex flex-col items-center bg-gray2 py-8 rounded-xl"
          onClick={async () => {
            signaturePad.clear();
          }}
        >
          <b className="font-bold text-24 text-primary mt-4">Xóa</b>
        </button>
      </div>
    </div>
  );
};

export default Theme;
