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
import { toast } from "react-toastify"
import { uploadMedia } from "services/api/mediaLibrary"
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import PrescriptionFormItem from "./PrescriptionFormItem"
import Page from "components/Page"
import {
  getPatientSource,
  updatePatientSource,
  createPatientSource,
} from "services/api/patientSource";
import { formatStrapiArr, formatStrapiObj } from "utils/strapi";

const DRUG_DEFAULT = {
  label: '',
  value: '',
}

const Theme = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [openDrawer, setOpenDrawer] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [patientSource, setPatientSource] = useState([]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassowrd, setConfirmNewPassword] = useState("");
  const [signaturePad, setSignaturePad] = useState(null);
  const currentUser = useSelector((state) => state.user.currentUser);
  const [loading, setLoading] = useState(false)


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

      var file = dataURLtoFile(signaturePad.toDataURL(), 'test.png');
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

  const validationSchema = yup.object({
    // en: yup.string().required("English content is required"),
    // vi: yup.string().required("Vietnamese content is required"),
  });

  const onSubmit = async (values) => {
    const { relationship } = values
    console.log('asd', relationship)

    try {
      // setLoading(true)
      // if (patientId) {
      relationship.forEach(p => {
        if (p.id) {
          updatePatientSource(p.id, {
            data: {
              ...p,
              image: p.image?.data?.id
            }
          })
        } else {
          createPatientSource({
            data: {
              ...p,
            }
          })
        }

        // let rs = relationship.map(r => {
        //   let res = { ...r };
        //   res.patient = { full_name: res.label };
        //   res.label = res.ten;
        //   return res;
        // })

        // setRelationships(rs);
      });
      // await fetchPrescriptionData(prescriptionData?.id)
      // }
      toast.success("Cập nhật mối quan hệ thành công")
      // onClose()
    } catch (error) {
      console.log('errror', error)
      // toast.error(getErrorMessage(error))
    } finally {
      setLoading(false)
    }

  }

  const {
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {

    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "relationship",
  })

  useEffect(() => {
    ; (async () => {
      try {
        const res = await getPatientSource()
        const data = formatStrapiArr(res?.data);
        setPatientSource(data);
        let rs = data.map(r => {
          r.uid = r.id;
          r.label = r.label;
          r.value = r.value;
          return r;
        })
        reset({
          relationship: rs
        })
        // setRelationship(res.data.relationships);
      } catch (error) { }
    })()
  }, [])

  return (
    <Page title="Nguồn bệnh nhân" parentUrl="/settings">
      <form className="flex flex-col gap-4 mt-2" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-3 px-6 mt-4">
          <div className="bg-form p-6 space-y-2">
            {fields.map((item, index) => (
              <PrescriptionFormItem
                key={index}
                index={index}
                item={item}
                setValue={setValue}
                getValues={getValues}
                control={control}
                errors={errors}
                remove={remove}
              />
            ))}
          </div>
          <div className="flex flex-col-2">
          <Button className="fill-primary self-end mr-10" type="submit" loading={loading}>
            Lưu
          </Button>
          <Button
            className="self-start"
            type="button"
            btnType="text"
            btnSize="auto"
            icon={<Icon name="add-circle" className="fill-primary w-6 h-6" />}
            onClick={() => append({ ...DRUG_DEFAULT })}
          >
            <span className="text-16 text-primary">Thêm nguồn mới</span>
          </Button>
          </div>
        </div>

      </form>
    </Page>
  );
};

export default Theme;
