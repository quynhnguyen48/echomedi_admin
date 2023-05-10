import { useEffect, useMemo, useState } from "react"
import classNames from "classnames"
import { Controller, useForm } from "react-hook-form"
import * as yup from "yup"
import { yupResolver } from "@hookform/resolvers/yup"
import { useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { toast } from "react-toastify"

import Button from "components/Button"
import Datepicker from "components/Datepicker"
import Input from "components/Input"
import Select from "components/Select"
import { GENDER } from "constants/Customer"
import { REGION_DATA } from "constants/Regions"
import { createStaff, updateStaff } from "services/api/staff"
import { randomPassword } from "utils/string"
import { getErrorMessage } from "utils/error"

const StaffForm = ({ data }) => {
  const navigate = useNavigate()

  const roles = useSelector((state) => state.user.staffRoles)
  const [districtList, setDistrictList] = useState([])
  const [wardList, setWardList] = useState([])
  const [loading, setLoading] = useState(false)

  const validationSchema = yup.object({
    code: yup.string(),
    email: yup
      .string()
      .trim()
      .matches(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/g, "Email is not in correct format")
      .required("Email is required"),
    firstName: yup.string().required("First name is required"),
    lastName: yup.string().required("Last name is required"),
    gender: yup.string().required("Gender is required"),
    // birthday: yup.date().typeError("Date of birth is required"),
    // phone: yup
    //   .string()
    //   .trim()
    //   .matches(/^[0-9]*$/, "Phone number is not in correct format")
    //   .required("Phone number is required"),
    role: yup.object().required("Role is required").nullable(),
    identityNumber: yup
      .string()
      .trim()
      .matches(/^[0-9]*$/, "Identity number is not in correct format"),
    // address: yup.object({
    //   province: yup.object().required("Province is required").nullable(),
    //   district: yup.object().required("District is required").nullable(),
    //   ward: yup.object().required("Ward is required").nullable(),
    //   address: yup.string().required("Address is required"),
    // }),
  })

  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      code: data?.code || "",
      email: data?.email || "",
      firstName: data?.firstName || "",
      lastName: data?.lastName || "",
      gender: data?.gender || "",
      birthday: data?.birthday ? new Date(data?.birthday) : null,
      phone: data?.phone || "",
      role: data?.role ? { value: data?.role?.id, label: data?.role?.name } : null,
      identityNumber: data?.identityNumber || "",
      address: {
        province: data?.address?.province || null,
        district: data?.address?.district || null,
        ward: data?.address?.ward || null,
        address: data?.address?.address || "",
      },
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

  const roleList = useMemo(() => {
    return roles?.map((role) => ({
      value: role.id,
      label: role.name,
    }))
  }, [roles])

  const onSubmit = async (formData) => {
    try {
      setLoading(true)
      const payload = {
        ...formData,
        role: formData?.role?.value,
      }
      if (data?.id) {
        await updateStaff(data?.id, payload)
      } else {
        const password = randomPassword()
        const newStaff = await createStaff({
          ...payload,
          username: payload?.email,
          password,
          tmpPassword: password,
        })
        if (newStaff?.data) {
          await updateStaff(newStaff?.data?.user?.id, {
            role: formData?.role?.value,
          })
        }
      }
      toast.success(`Staff ${data?.id ? "updated" : "created"} successfully!`)
      navigate(-1)
    } catch (error) {
      if (error?.response?.data?.error?.message === "Email or Username are already taken") {
        toast.error("Email are already taken")
      } else {
        toast.error(getErrorMessage(error))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-row">
      <div className="bg-form rounded-2xl p-6 space-y-6 flex-1">
        <div className="grid grid-cols-2 gap-6">
          {data && (
            <Controller
              name="code"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Staff ID"
                  onChange={onChange}
                  value={value}
                  name="code"
                  placeholder="Staff ID"
                  disabled
                />
              )}
            />
          )}

          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type="email"
                label="Email"
                name="email"
                placeholder="Nhập Email"
                errors={errors?.email?.message}
              />
            )}
          />
          <Controller
            name="firstName"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                label="First Name"
                name="firstName"
                placeholder="Input First Name"
                errors={errors?.firstName?.message}
              />
            )}
          />

          <Controller
            name="lastName"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                label="Last Name"
                name="lastName"
                placeholder="Input Last Name"
                errors={errors?.lastName?.message}
              />
            )}
          />
          <div className="space-y-2">
            <label className="font-16 font-bold">Gender</label>
            <div className="grid grid-cols-2 gap-x-6">
              <Controller
                name="gender"
                control={control}
                rules={{ required: true }}
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
                        onClick={() =>
                          setValue("gender", gender, {
                            shouldValidate: true,
                            shouldDirty: true,
                          })
                        }
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
          </div>
          <Controller
            name="birthday"
            control={control}
            render={({ field: { value } }) => (
              <Datepicker
                label="Date of Birth"
                value={value}
                maxDate={new Date()}
                onChange={(date) => {
                  setValue("birthday", date, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }}
                errors={errors?.birthday?.message}
              />
            )}
          />
          <Controller
            name="phone"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Input
                onChange={onChange}
                value={value}
                name="phone"
                label="Phone Number"
                placeholder={"Input Phone Number"}
                errors={errors?.phone?.message}
              />
            )}
          />
          <Controller
            name="role"
            control={control}
            render={({ field: { value } }) => (
              <Select
                placeholder="Select Role"
                label="Role"
                name="role"
                onChange={(e) => {
                  setValue("role", e, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }}
                value={value}
                options={roleList}
                errors={errors?.role?.message}
              />
            )}
          />
          <Controller
            name="identityNumber"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Input
                name="identityNumber"
                label="Identity Number"
                placeholder="Input Identity Number"
                onChange={onChange}
                value={value}
                errors={errors?.identityNumber?.message}
              />
            )}
          />
        </div>

        <div className="grid grid-cols-3 gap-x-6">
          <Controller
            name="address.province"
            control={control}
            render={({ field: { value, ref } }) => (
              <Select
                placeholder="Select City"
                label="City"
                name="province"
                onChange={(e) => {
                  setValue(
                    "address.province",
                    { id: e.value, name: e.label },
                    {
                      shouldValidate: true,
                      shouldDirty: true,
                    }
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

                  setValue("address.district", "")
                  setValue("address.ward", "")
                }}
                value={value && { value: value?.id, label: value?.name }}
                options={provincesList?.map((province) => ({
                  value: province.id,
                  label: province.name,
                }))}
                errors={errors?.address?.province?.message}
              />
            )}
          />
          <Controller
            name="address.district"
            control={control}
            render={({ field: { value, ref } }) => (
              <Select
                placeholder="Select District"
                label="District"
                name="district"
                onChange={(e) => {
                  setValue(
                    "address.district",
                    { id: e.value, name: e.label },
                    {
                      shouldValidate: true,
                      shouldDirty: true,
                    }
                  )
                  let chosenDistrict = districtList.filter(
                    (districtItem) => districtItem.id === e.value
                  )

                  setWardList(
                    chosenDistrict[0]?.level3s?.map((ward) => {
                      return { value: ward.id, label: ward.name }
                    })
                  )

                  setValue("address.ward", "")
                }}
                value={value && { value: value?.id, label: value?.name }}
                options={districtList?.map((district) => ({
                  value: district.id,
                  label: district.name,
                }))}
                errors={errors?.address?.district?.message}
              />
            )}
          />
          <Controller
            name="address.ward"
            control={control}
            render={({ field: { value, ref } }) => (
              <Select
                placeholder="Select Ward"
                label="Ward"
                name="ward"
                onChange={(e) => {
                  setValue(
                    "address.ward",
                    { id: e.value, name: e.label },
                    {
                      shouldValidate: true,
                      shouldDirty: true,
                    }
                  )
                }}
                value={value && { value: value?.id, label: value?.name }}
                options={wardList}
                errors={errors?.address?.ward?.message}
              />
            )}
          />
        </div>

        <Controller
          name="address.address"
          control={control}
          render={({ field: { onChange, value } }) => (
            <Input
              name="address"
              label="Address"
              placeholder="Address"
              value={value}
              onChange={onChange}
              errors={errors?.address?.address?.message}
            />
          )}
        />

        <div className="flex gap-x-4 mt-10">
          <Button
            className="fill-primary"
            onClick={handleSubmit((data) => onSubmit(data))}
            loading={loading}
          >
            Save
          </Button>
          <Button btnType="outline" type="reset" onClick={() => navigate("/staffs")}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}

export default StaffForm
