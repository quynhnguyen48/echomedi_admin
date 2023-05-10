import { useCallback, useEffect, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import classNames from "classnames"
import { toast } from "react-toastify"
import { formatPrice } from "utils/number";

import Button from "components/Button"
import Input from "components/Input"
import Select from "components/Select"
import Datepicker from "components/Datepicker"
import { CUSTOMER_TAG, GENDER } from "constants/Customer"
import { REGION_DATA } from "constants/Regions"
import { createNewUser, getListUsers, updateUser } from "services/api/users"
import { updateMedicalService } from "services/api/medicalService";
import { updatePatient } from "services/api/patient"
import { randomPassword } from "utils/string"
import { getErrorMessage } from "utils/error"

const CustomersForm = ({ data, fromCheckIn, onUpdateGuestUserCheckin, onCloseModal }) => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [districtList, setDistrictList] = useState([])
  const [wardList, setWardList] = useState([])
  const [loadingCustomers, setLoadingCustomers] = useState(false)
  const [customersData, setCustomersData] = useState([])

  const validationSchema = yup.object({
    
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
      label: data?.label || "",
      price: data?.price || "",
      code: data?.code || "",
      host: data?.host || "",
      group_service: data?.group_service || "",

      email: data?.email || "",
      full_name: data?.full_name || "",
      gender: data?.gender || "",
      phone: data?.phone || "",
      relative_phone: data?.relative_phone || "",
      birthday: !!data?.birthday ? new Date(data?.birthday) : null,
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
        // referral: formData?.referral?.value,
        // customerTag: formData.customerTag === CUSTOMER_TAG.REFERRAL ? "referral" : "new",
      }
      if (data?.id) {
        await updateMedicalService(data?.id, payload)
        toast.success("Customer updated successfully")
      } else {
        const password = randomPassword()
        const res = await createNewUser({ ...payload, password, tmpPassword: password })
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
                label="Tên"
                placeholder={"Nhập số điện thoại"}
                errors={errors?.phone?.message}
              />
            )}
          />
          <Controller
            name="price"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Input
                // onChange={onChange}
                onChange={e => {
                  const value = e.target.value.replaceAll(".", "")
                  onChange(value);
                }}
                value={formatPrice(value)}
                name="price"
                label="Price"
                placeholder={"Nhập Email"}
                errors={errors?.email?.message}
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
                errors={errors?.relative_phone?.message}
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
                placeholder={"Nhập host"}
                errors={errors?.full_name?.message}
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
                placeholder={"Nhập host"}
                errors={errors?.full_name?.message}
              />
            )}
          />
        </div>

        
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
        <Button className="fill-primary" type="submit" loading={loading}>
          Save
        </Button>
        <Button
          btnType="outline"
          type="reset"
          onClick={() => (fromCheckIn ? onCloseModal() : navigate(-1))}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}

export default CustomersForm
