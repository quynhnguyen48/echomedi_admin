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
import { updatePatient, getPatientByPhone } from "services/api/patient"
import { randomPassword } from "utils/string"
import { getErrorMessage } from "utils/error"
import Icon from "components/Icon"
import { getStrapiMedia } from "utils/media"
import { uploadMedia } from "services/api/mediaLibrary"

const CustomersForm = ({ data, fromCheckIn, onUpdateGuestUserCheckin, onCloseModal, readOnly }) => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [districtList, setDistrictList] = useState([])
  const [wardList, setWardList] = useState([])
  const [loadingCustomers, setLoadingCustomers] = useState(false)
  const [customersData, setCustomersData] = useState([])
  const [patientExist, setPatientExist] = useState(false);

  const validationSchema = yup.object({
    // phone: yup
    //   .string()
    //   .trim(),
    // address: yup.object({
    // province: yup.object().required("City is required").nullable(),
    // district: yup.object().required("District is required").nullable(),
    // ward: yup.object().required("Ward is required").nullable(),
    // address: yup.string().required("Address is required"),
    // }),
    // gender: yup.string().required("Gender is required"),
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
      full_name: data?.full_name || "",
      gender: data?.gender || "",
      phone: data?.phone || "",
      relative_phone: data?.relative_phone || "",
      birthday: !!data?.birthday ? new Date(data?.birthday) : null,
      start_date_membership: !!data?.start_date_membership ? new Date(data?.start_date_membership) : null,
      membership: data?.membership || "",
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

  const onSubmit = async (formData) => {
    try {
      setLoading(true)
      const payload = {
        ...formData,
        username: formData.email,
        // referral: formData?.referral?.value,
        // customerTag: formData.customerTag === CUSTOMER_TAG.REFERRAL ? "referral" : "new",
      }
      if (data?.id) {
        await updatePatient(data?.id, { data: payload })
        toast.success("Customer updated successfully")
        navigate(-1)
      } else {
        const password = randomPassword()
        const res = await createNewUser({ ...payload, password, tmpPassword: password })
        if (res.data) {
          if (fromCheckIn) {
            onUpdateGuestUserCheckin(res.data.user)
          } else {
            toast.success("Customer updated successfully")
            navigate(-1)

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
    if (e.target.value == data.phone) return;
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

  const uploadFile = (file) =>
    new Promise(async (resolve, reject) => {
      const toastId = toast.loading("Đang tải lên")
      try {
        const uploadedFiles = [file]
        const promises = uploadedFiles?.map((file) => {
          const formData = new FormData()
          formData.append("files", file)
          formData.append("ref", "api::patient.patient")
          formData.append("refId", data.id)
          formData.append("field", "membership_profile_file")
          return uploadMedia(formData)
        })
      } catch (error) {
        // toast.error(getErrorMessage(error));
      } finally {
        toast.dismiss(toastId)
      }
    })

  console.log('dataaa', data)

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <Controller
            name="email"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Input
                readOnly={readOnly}
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
                  readOnly={readOnly}
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
            name="relative_phone"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Input
                readOnly={readOnly}
                onChange={onChange}
                value={value}
                name="relative_phone"
                label="SĐT người thân"
                placeholder={"Nhập SĐT người thân"}
                errors={errors?.relative_phone?.message}
              />
            )}
          />
          <Controller
            name="full_name"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Input
                readOnly={readOnly}
                onChange={onChange}
                value={value}
                name="full_name"
                label="Họ và tên"
                placeholder={"Nhập họ"}
                errors={errors?.full_name?.message}
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
                        onClick={() => { if (!readOnly) setValue("gender", gender); }}
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
          <Controller
            name="birthday"
            control={control}
            render={({ field: { value, ref } }) => (
              <Datepicker
                disabled={readOnly}
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
                  isDisabled={readOnly}
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
                  isDisabled={readOnly || !getValues("address.province")}
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
                  isDisabled={readOnly || !getValues("address.district")}
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
              readOnly={readOnly}
              name="address.address"
              label="Địa chỉ"
              placeholder={"Nhập địa chỉ"}
              value={value}
              onChange={onChange}
              errors={errors?.address?.address?.message}
            />
          )}
        />
        <div className="space-y-2">
          <label className="font-16 font-bold">Thành viên</label>
          <div className="grid grid-cols-4 gap-6">
            <Controller
              name="membership"
              control={control}
              render={({ field: { onChange, value } }) => (
                <>
                  {["gold", "platinum", "family", "business", "non-resident", "foreigner"]?.map((gender) => (
                    <Button
                      key={gender}
                      onChange={onchange}
                      type="button"
                      className={classNames("w-full h-14 pl-6 !justify-start capitalize", {
                        "bg-primary text-white font-bold": value === gender,
                        "bg-primary/10 text-primary font-normal": value !== gender,
                      })}
                      onClick={() => { if (!readOnly) setValue("membership", gender); }}
                    >
                      {gender}
                    </Button>
                  ))}
                  {errors?.gender?.message && (
                    <p className="text-12 text-error mt-1">{errors?.gender?.message}</p>
                  )}
                </>
              )}
            />
          </div>
          <Controller
            name="start_date_membership"
            control={control}
            render={({ field: { value, ref } }) => (
              <Datepicker
                disabled={readOnly}
                label="Ngày bắt đầu thành viên"
                value={value}
                onChange={(date) => {
                  setValue("start_date_membership", date)
                }}
                errors={errors?.start_date_membership?.message}
              />
            )}
          />
          <label className="font-bold">Kế hoạch sức khoẻ</label>
          {data.membership_profile_file.data && <div className="relative">
            <a href={getStrapiMedia(data.membership_profile_file?.data?.attributes)} target="_blank" rel="noreferrer">
              {data?.mime?.startsWith("image") ? (
                <img className="rounded-xl w-14 h-14" src={getStrapiMedia(data.membership_profile_file)} alt="name" />
              ) : (
                <div className="inline-flex items-center justify-center rounded-xl bg-primary text-white font-bold h-14 w-14 relative border-primary border-1">
                  {data.membership_profile_file?.data?.attributes?.ext}
                </div>
              )}
            </a>
          </div>}
          <div className="flex items-center justify-center rounded-xl bg-background h-14 w-14 relative border-primary border-1">
            <input
              // ref={ref}
              type="file"
              className="h-full w-full opacity-0 cursor-pointer absolute z-20"
              onChange={(e) => uploadFile(e.target.files[0])}
              multiple
            />
            <p>Tải lên</p>
          </div>
        </div>
      </div>


      {!readOnly && <div className="flex gap-x-4 mt-10">
        <Button disabled={patientExist} className="fill-primary" type="submit" loading={loading}>
          Save
        </Button>
        <Button
          btnType="outline"
          type="reset"
          onClick={() => (fromCheckIn ? onCloseModal() : navigate(-1))}
        >
          Cancel
        </Button>
      </div>}
    </form>
  )
}

export default CustomersForm
