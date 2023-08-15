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
import { createNewPatient, getPatientByPhone } from "services/api/patient";
import { randomPassword } from "utils/string"
import { getErrorMessage } from "utils/error"

const SOURCES = [
  {
    value: 'app',
    label: 'APP'
  },
  {
    value: 'web',
    label: 'WEB'
  },
  {
    value: 'app_be',
    label: 'App BE'
  },
  {
    value: 'other',
    label: 'Khác'
  }
];

const CustomersForm = ({ data, fromCheckIn, onUpdateGuestUserCheckin, onCloseModal, slotInfo }) => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [districtList, setDistrictList] = useState([])
  const [wardList, setWardList] = useState([])
  const [loadingCustomers, setLoadingCustomers] = useState(false)
  const [customersData, setCustomersData] = useState([])
  const [bookingHour, setBookingHour] = useState("");
  const [patientExist, setPatientExist] = useState(false);

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
      source: data?.source ? {
        id: data?.source,
      } : null,
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
        source: formData?.source?.id,
        username: formData.email,
        referral: formData?.referral?.value,
        customerTag: formData.customerTag === CUSTOMER_TAG.REFERRAL ? "referral" : "new",
      }
      if (data?.id) {
        await updateUser(data?.id, payload)
        toast.success("Customer updated successfully")
      } else {
        const password = randomPassword()
        const res = await createNewPatient({ data: payload })
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


  const handleSearchCustomerByPhone = (e) => {
    const toastId = toast.loading("Tìm khách hàng")
    getPatientByPhone(e.target.value)
      .then((res) => {
        if (res.data) {
          setPatientExist(true);
        }
        setLoadingCustomers(false)
      })
      .catch(() => {
        setPatientExist(false);
      })
      .then(() => {
        toast.dismiss(toastId);
      });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <p>{JSON.stringify(slotInfo)}</p>
      <div className="grid grid-cols-2 gap-6 my-4">
      </div>
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <Controller
            name="full_name"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Input
                onChange={onChange}
                value={value}
                name="firstName"
                label="Họ và tên"
                placeholder={"Nhập Họ và tên"}
                errors={errors?.firstName?.message}
              />
            )}
          />
          <div className="space-y-2">
            <label className="font-16 font-bold">Giới tính</label>
            <div className="grid grid-cols-2 gap-x-6">
              <Controller
                name="gender"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <>
                    {[GENDER.MALE, GENDER.FEMALE]?.map((gender) => (
                      <Button
                        key={gender}
                        onChange={onchange}
                        type="button"
                        className={classNames("w-full h-14 pl-6 !justify-start capitalize", {
                          "bg-primary text-white font-bold": value === gender,
                          "bg-primary/10 text-primary font-normal": value !== gender,
                        })}
                        onClick={() => setValue("gender", gender)}
                      >
                        {gender == "male" ? "Nam" : "Nữ"}
                      </Button>
                    ))}
                    {errors?.gender?.message && (
                      <p className="text-12 text-error mt-1">{errors?.gender?.message}</p>
                    )}
                  </>
                )}
              />
            </div>
          </div>
          {data && (
            <Controller
              name="code"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Input
                  onChange={onChange}
                  value={value}
                  name="code"
                  label="Customer ID"
                  placeholder="Customer Id"
                  disabled
                />
              )}
            />
          )}
          <Controller
            name="email"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Input
                onChange={onChange}
                value={value}
                name="email"
                label="Email"
                placeholder={"Nhập Email"}
                errors={errors?.email?.message}
              />
            )}
          />
          <div>
            <Controller
              name="phone"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Input
                  onChange={onChange}
                  onBlur={handleSearchCustomerByPhone}
                  value={value}
                  name="phone"
                  label="Số điện thoại"
                  placeholder={"Nhập số điện thoại"}
                  errors={errors?.phone?.message}
                />
              )}
            />
            {patientExist && <p className="text-red">Số điện thoại đã tồn tại</p>}
          </div>
          <Controller
            name="birthday"
            control={control}
            render={({ field: { value, ref } }) => (
              <Datepicker
                label="Ngày sinh"
                value={value}
                onChange={(date) => {
                  setValue("birthday", date)
                }}
                errors={errors?.birthday?.message}
              />
            )}
          />
        </div>

        <div className="grid grid-cols-3 gap-x-6">
          <div className="w-full">
            <Controller
              name="address.province"
              control={control}
              render={({ field: { value, ref } }) => (
                <Select
                  placeholder="Chọn thành phố"
                  label="Thành phố"
                  name="address.province"
                  onChange={(e) => {
                    setValue(
                      "address.province",
                      { id: e.value, name: e.label },
                      { shouldDirty: true, shouldValidate: true }
                    )
                    let chosenProvince = provincesList?.find((item) => item.id === e.value)

                    setDistrictList(
                      chosenProvince?.level2s?.map((district) => {
                        return {
                          value: district.id,
                          label: district.name,
                          ...district,
                        }
                      })
                    )

                    setValue("address.district", null, { shouldDirty: true })
                    setValue("address.ward", null, { shouldDirty: true })
                  }}
                  value={value && { value: value?.id, label: value?.name }}
                  options={provinceFormatted()}
                  errors={errors?.address?.province?.message}
                />
              )}
            />
          </div>
          <div className="w-full">
            <Controller
              name="address.district"
              control={control}
              render={({ field: { value, ref } }) => (
                <Select
                  isDisabled={!getValues("address.province")}
                  placeholder="Chọn quận"
                  label="Quận"
                  name="address.district"
                  onChange={(e) => {
                    setValue(
                      "address.district",
                      { id: e.value, name: e.label },
                      { shouldDirty: true, shouldValidate: true }
                    )
                    let chosenDistrict = districtList.filter(
                      (districtItem) => districtItem.id === e.value
                    )

                    setWardList(
                      chosenDistrict[0]?.level3s?.map((ward) => {
                        return { value: ward.name, label: ward.name }
                      })
                    )

                    setValue("address.ward", null)
                  }}
                  value={value && { value: value?.id, label: value?.name }}
                  options={districtList}
                  errors={errors?.address?.district?.message}
                />
              )}
            />
          </div>
          <div className="w-full">
            <Controller
              name="address.ward"
              control={control}
              render={({ field: { value, ref } }) => (
                <Select
                  isDisabled={!getValues("address.district")}
                  placeholder="Chọn phường"
                  label="Phường"
                  name="address.ward"
                  onChange={(e) => {
                    setValue(
                      "address.ward",
                      { id: e.value, name: e.label },
                      { shouldDirty: true, shouldValidate: true }
                    )
                  }}
                  value={value && { value: value?.id, label: value?.name }}
                  options={wardList}
                  errors={errors?.address?.ward?.message}
                />
              )}
            />
          </div>
        </div>

        <Controller
          name="address.address"
          control={control}
          render={({ field: { onChange, value } }) => (
            <Input
              name="address.address"
              label="Địa chỉ"
              placeholder={"Nhập địa chỉ"}
              value={value}
              onChange={onChange}
              errors={errors?.address?.address?.message}
            />
          )}
        />
        <Controller
            name="source"
            control={control}
            render={({ field: { onChange, value, ref } }) => (
              <Select
                placeholder="Chọn nguồn"
                label="Nguồn"
                name="source"
                options={SOURCES}
                value={value && SOURCES.find((s) => s.value === value.id)}
                onChange={(e) => {
                  setValue(
                    "source",
                    { id: e.value },
                    {
                      shouldValidate: true,
                      shouldDirty: true,
                    }
                  )
                }}
                errors={errors?.category?.message}
              />
            )}
          />
        {/* <div className="grid grid-cols-2 gap-x-6">
          <div className="space-y-2">
            <label className="font-16 font-bold">Customer Tag</label>
            <div className="grid grid-cols-2 gap-x-6">
              <Controller
                name="customerTag"
                control={control}
                render={({ field: { value } }) => (
                  <>
                    {[CUSTOMER_TAG.NEW_CUSTOMER, CUSTOMER_TAG.REFERRAL]?.map((tag) => (
                      <Button
                        key={tag}
                        onChange={onchange}
                        type="button"
                        className={classNames("w-full h-14 pl-6 !justify-start capitalize", {
                          "bg-primary text-white font-bold": value === tag,
                          "bg-primary/10 text-primary font-normal": value !== tag,
                        })}
                        onClick={() =>
                          setValue("customerTag", tag, {
                            shouldDirty: true,
                            shouldValidate: true,
                          })
                        }
                      >
                        {tag}
                      </Button>
                    ))}
                    {errors?.customerTag?.message && (
                      <p className="text-12 text-error mt-1">{errors?.customerTag?.message}</p>
                    )}
                  </>
                )}
              />
            </div>
          </div>
          {getValues("customerTag") === CUSTOMER_TAG.REFERRAL && (
            <Controller
              name="referral"
              control={control}
              render={({ field: { value } }) => (
                <Select
                  onChange={(e) => {
                    setValue("referral", e, {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                  }}
                  onInputChange={handleSearchCustomer}
                  value={value}
                  name="referral"
                  label="Referral"
                  placeholder="Select Referral"
                  isLoading={loadingCustomers}
                  options={customersData}
                  errors={errors?.referral?.message}
                />
              )}
            />
          )}
        </div> */}
      </div>

      <div className="flex gap-x-4 mt-10">
        <Button disabled={patientExist} className="fill-primary" type="submit" loading={loading}>
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
