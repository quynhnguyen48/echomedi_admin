import { useCallback, useEffect, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import classNames from "classnames"
import { toast } from "react-toastify"

import Button from "components/Button"
import Input from "components/Input"
import Select from "components/Select"
import Datepicker from "components/Datepicker"
import { CUSTOMER_TAG, GENDER } from "constants/Customer"
import { REGION_DATA } from "constants/Regions"
import { createNewUser, getListUsers, updateUser } from "services/api/users"
import { createNewPatient } from "services/api/patient";
import { createMedicalService } from "services/api/medicalService";
import { randomPassword } from "utils/string"
import { getErrorMessage } from "utils/error"

const CustomersForm = ({ data, fromCheckIn, onUpdateGuestUserCheckin, onCloseModal, slotInfo }) => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [districtList, setDistrictList] = useState([])
  const [wardList, setWardList] = useState([])
  const [loadingCustomers, setLoadingCustomers] = useState(false)
  const [customersData, setCustomersData] = useState([])
  const [bookingHour, setBookingHour] = useState("");

  const validationSchema = yup.object({
    // email: yup
    //   .string()
    //   .trim()
    //   // .required("Email is required")
    //   .matches(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/g, "Email is not in correct format"),
    // full_name: yup.string().required("First name is required"),
    // // lastName: yup.string().required("Last name is required"),
    // phone: yup
    //   .string()
    //   .trim()
    //   .matches(/^[0-9]*$/, "Phone number is not in correct format"),
    // address: yup.object({
    //   province: yup.object().required("City is required").nullable(),
    //   district: yup.object().required("District is required").nullable(),
    //   ward: yup.object().required("Ward is required").nullable(),
    //   address: yup.string().required("Address is required"),
    // }),
    // birthday: yup.date().required().typeError("Date of birth is required"),
    // gender: yup.string().required("Gender is required"),
    // customerTag: yup.string().required().typeError("Customer Tag is required"),
    // referral: yup.object().nullable(),
  })

  const {
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      code: data?.code || "",
      email: data?.email || "",
      firstName: data?.firstName || "",
      lastName: data?.lastName || "",
      gender: data?.gender || "",
      phone: data?.phone || "",
      birthday: !!data?.birthday ? new Date(data?.birthday) : null,
      address: {
        province: data?.address?.province || null,
        district: data?.address?.district || null,
        ward: data?.address?.ward || null,
        address: data?.address?.address || "",
      },
      customerTag:
        data?.customerTag === "referral"
          ? CUSTOMER_TAG.REFERRAL
          : data?.customerTag === "new"
            ? CUSTOMER_TAG.NEW_CUSTOMER
            : null,
      referral: data?.referral
        ? {
          value: data?.referral?.id,
          label: `${data?.referral?.firstName} ${data?.referral?.lastName} (${data?.referral?.code})`,
        }
        : null,
    },
  })

  const provincesList = REGION_DATA

  // init district list
  useEffect(() => {
    if (data?.address?.province) {
      let chosenProvince = provincesList?.find((item) => item.id === data?.address?.province?.id)
      setDistrictList(chosenProvince?.level2s)
    }
  }, [data?.address?.province, provincesList])

  // init ward list
  useEffect(() => {
    if (data?.address?.district) {
      let chosenDistrict = districtList?.find(
        (districtItem) => districtItem.id === data?.address?.district.id
      )
      setWardList(
        chosenDistrict?.level3s?.map((ward) => {
          return { value: ward.id, label: ward.name }
        })
      )
    }
  }, [data?.address?.district, districtList])

  const provinceFormatted = () => {
    return provincesList.map((province) => ({
      value: province.id,
      label: province.name,
    }))
  }

  const bookingHours = () => {
    let result = [];
    for (let i = 0; i < 24; ++i) {
      result.push({
        value: `${i}:00`,
        label: `${i}:00`,
      });
      result.push({
        value: `${i}:30`,
        label: `${i}:30`,
      });
    }
    return result;
  }

  const handleSearchCustomer = useCallback((value) => {
    if (!value) return
    setLoadingCustomers(true)
    getListUsers(
      { pageSize: 1000 },
      {
        $or: [
          { firstName: { $containsi: value } },
          { lastName: { $containsi: value } },
          { code: { $containsi: value } },
        ],
      }
    )
      .then((res) => {
        if (res.data) {
          setCustomersData(
            res.data?.map((customer) => ({
              value: customer?.id,
              label: `${customer?.firstName} ${customer?.lastName} (${customer?.code})`,
            }))
          )
        }
        setLoadingCustomers(false)
      })
      .catch(() => {
        setLoadingCustomers(false)
      })
  }, [])

  const onSubmit = async (formData) => {
    try {
      setLoading(true)
      const payload = {
        ...formData,
      }
      if (data?.id) {
        await updateUser(data?.id, payload)
        toast.success("Customer updated successfully")
      } else {
        const password = randomPassword()
        const res = await createMedicalService(payload )
        if (res.data) {
          if (fromCheckIn) {
            onUpdateGuestUserCheckin(res.data.user)
          } else {
            navigate(-1)
            toast.success("Customer updated successfully")
          }
        }
      }
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <Controller
            name="label"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Input
                onChange={onChange}
                value={value}
                name="label"
                label="Tên gói"
                placeholder={"Nhập Tên gói"}
                errors={errors?.firstName?.message}
              />
            )}
          />
          <Controller
            name="code"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Input
                onChange={onChange}
                value={value}
                name="code"
                label="Code"
                placeholder={"Nhập Code"}
                errors={errors?.firstName?.message}
              />
            )}
          />
          <Controller
            name="host"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Input
                onChange={onChange}
                value={value}
                name="host"
                label="Host"
                placeholder={"Nhập Host"}
                errors={errors?.firstName?.message}
              />
            )}
          />
          <Controller
            name="price"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Input
                onChange={onChange}
                value={value}
                name="price"
                label="Price"
                placeholder={"Nhập Price"}
                errors={errors?.firstName?.message}
              />
            )}
          />
          <Controller
            name="group_service"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Input
                onChange={onChange}
                value={value}
                name="group_service"
                label="Group Service"
                placeholder={"Nhập Group Service"}
                errors={errors?.firstName?.message}
              />
            )}
          />
        </div>
      </div>

      <div className="flex gap-x-4 mt-10">
        <Button className="fill-primary" type="submit" loading={loading}>
          Lưu
        </Button>
        <Button
          btnType="outline"
          type="reset"
          onClick={() => (fromCheckIn ? onCloseModal() : navigate(-1))}
        >
          Huỷ
        </Button>
      </div>
    </form>
  )
}

export default CustomersForm
