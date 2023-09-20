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
import Tagify from '@yaireo/tagify'
import '@yaireo/tagify/dist/tagify.css' // imports tagify SCSS file from within
import Textarea from "components/Textarea"
import TagifyInput from "components/TagifyInput"

const CustomersForm = ({ data, fromCheckIn, onUpdateGuestUserCheckin, onCloseModal }) => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [districtList, setDistrictList] = useState([])
  const [wardList, setWardList] = useState([])
  const [loadingCustomers, setLoadingCustomers] = useState(false)
  const [customersData, setCustomersData] = useState([])

  const validationSchema = yup.object({

  })

  useEffect(() => {
    const templates = {
      tag: function (tagData) {
        try {
          return `<tag title='${tagData.value}' contenteditable='false' spellcheck="false" class='tagify__tag ${tagData.class ? tagData.class : ""}' ${this.getAttributes(tagData)}>
                      <x title='remove tag' class='tagify__tag__removeBtn'></x>
                      <div>
                          <span class='tagify__tag-text'>${tagData.value}</span>
                      </div>
                  </tag>`
        }
        catch (err) { }
      },

      dropdownItem: function (tagData) {
        try {
          return `<div ${this.getAttributes(tagData)} class='tagify__dropdown__item ${tagData.class ? tagData.class : ""}' >
                          <span>${tagData.searchBy.toLowerCase()}</span> |
                          <span>${tagData.value}</span>
                      </div>`
        }
        catch (err) { console.error(err) }
      }
    };

    const el10 = document.getElementById('premise');
    var tagify = new Tagify(el10, {
      whitelist: [{ value: "a", searchBy: "b" }],
      dropdown: {
        classname: "color-blue",
        enabled: 1,              // show the dropdown immediately on focus
        maxItems: 5,
        position: "text",         // place the dropdown near the typed text
        closeOnSelect: false,          // keep the dropdown open after selecting a suggestion
        highlightFirst: true
      },
      templates,
      backspace: 'edit',
      delimiters: null,
      transformTag: (tag) => {
        const str = tag.value;
        const str2 = str.charAt(0).toUpperCase() + str.slice(1);
        tag.value = str2;
        return tag;
      }
    })
  }, []);

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
      tags: JSON.stringify(data?.tags ?? []),


      // email: data?.email || "",
      // full_name: data?.full_name || "",
      // gender: data?.gender || "",
      // phone: data?.phone || "",
      // relative_phone: data?.relative_phone || "",
      // birthday: !!data?.birthday ? new Date(data?.birthday) : null,
      // membership: data?.membership || "",
      // address: {
      //   province: data?.address?.province || null,
      //   district: data?.address?.district || null,
      //   ward: data?.address?.ward || null,
      //   address: data?.address?.address || "",
      // },
      // customerTag:
      //   data?.customerTag === "referral"
      //     ? CUSTOMER_TAG.REFERRAL
      //     : data?.customerTag === "new"
      //       ? CUSTOMER_TAG.NEW_CUSTOMER
      //       : null,
      // referral: data?.referral
      //   ? {
      //     value: data?.referral?.id,
      //     label: `${data?.referral?.firstName} ${data?.referral?.lastName} (${data?.referral?.code})`,
      //   }
      //   : null,
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
        tags: formData.tags ? JSON.parse(formData.tags) : null,
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
          <Controller
            name={`tags`}
            control={control}
            render={({ field: { onChange, value } }) => (
              <TagifyInput
                whiteList={tags}
                className="flex-1"
                inputClassName="test"
                name={`tags`}
                onChange={onChange}
                value={value}
                placeholder="Nhập ghi chú"
                errors={errors?.[name]?.[index]?.note?.message}
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

const tags = [
  { value: "Nam | 18-39 | Gói khám | Không có bệnh", searchBy: "nam_18_39_khong_co_benh", group: "Gói khám" },
  { value: "Nam | 18-39 | Gói dược | Không có bệnh", searchBy: "nam_18_39_khong_co_benh", group: "Gói dược" },
  { value: "Nam | 18-39 | Gói gene | Không có bệnh", searchBy: "nam_18_39_khong_co_benh", group: "Gói gene" },
  { value: "Nam | 18-39 | Gói dinh dưỡng | Không có bệnh", searchBy: "nam_18_39_khong_co_benh", group: "Gói dinh dưỡng" },
  { value: "Nam | 18-39 | Gói Vaccine | Không có bệnh", searchBy: "nam_18_39_khong_co_benh", group: "Gói vaccine" },
  { value: "Nam | 18-39 | Tầm soát | Không có bệnh", searchBy: "nam_18_39_khong_co_benh", group: "Tầm soát" },

  { value: "Nữ | 18-39 | Gói khám | Không có bệnh", searchBy: "nu_18_39_khong_co_benh", group: "Gói khám" },
  { value: "Nữ | 18-39 | Gói dược | Không có bệnh", searchBy: "nu_18_39_khong_co_benh", group: "Gói dược" },
  { value: "Nữ | 18-39 | Gói gene | Không có bệnh", searchBy: "nu_18_39_khong_co_benh", group: "Gói gene" },
  { value: "Nữ | 18-39 | Gói dinh dưỡng | Không có bệnh", searchBy: "nu_18_39_khong_co_benh", group: "Gói dinh dưỡng" },
  { value: "Nữ | 18-39 | Gói Vaccine | Không có bệnh", searchBy: "nu_18_39_khong_co_benh", group: "Gói vaccine" },
  { value: "Nữ | 18-39 | Tầm soát | Không có bệnh", searchBy: "nu_18_39_khong_co_benh", group: "Tầm soát" },

  { value: "Nam | 18-39 | Gói khám | Thần kinh", searchBy: "nam_18_39_than_kinh", group: "Gói khám" },
  { value: "Nam | 18-39 | Gói dược | Thần kinh", searchBy: "nam_18_39_than_kinh", group: "Gói dược" },
  { value: "Nam | 18-39 | Gói gene | Thần kinh", searchBy: "nam_18_39_than_kinh", group: "Gói gene" },
  { value: "Nam | 18-39 | Gói dinh dưỡng | Thần kinh", searchBy: "nam_18_39_than_kinh", group: "Gói dinh dưỡng" },
  { value: "Nam | 18-39 | Gói Vaccine | Thần kinh", searchBy: "nam_18_39_than_kinh", group: "Gói vaccine" },
  { value: "Nam | 18-39 | Tầm soát | Thần kinh", searchBy: "nam_18_39_than_kinh", group: "Tầm soát" },

  { value: "Nữ | 18-39 | Gói khám | Thần kinh", searchBy: "nu_18_39_than_kinh", group: "Gói khám" },
  { value: "Nữ | 18-39 | Gói dược | Thần kinh", searchBy: "nu_18_39_than_kinh", group: "Gói dược" },
  { value: "Nữ | 18-39 | Gói gene | Thần kinh", searchBy: "nu_18_39_than_kinh", group: "Gói gene" },
  { value: "Nữ | 18-39 | Gói dinh dưỡng | Thần kinh", searchBy: "nu_18_39_than_kinh", group: "Gói dinh dưỡng" },
  { value: "Nữ | 18-39 | Gói Vaccine | Thần kinh", searchBy: "nu_18_39_than_kinh", group: "Gói vaccine" },
  { value: "Nữ | 18-39 | Tầm soát | Thần kinh", searchBy: "nu_18_39_than_kinh", group: "Tầm soát" },

  { value: "Nam | 18-39 | Gói khám | Hô hấp", searchBy: "nam_18_39_ho_hap", group: "Gói khám" },
  { value: "Nam | 18-39 | Gói dược | Hô hấp", searchBy: "nam_18_39_ho_hap", group: "Gói dược" },
  { value: "Nam | 18-39 | Gói gene | Hô hấp", searchBy: "nam_18_39_ho_hap", group: "Gói gene" },
  { value: "Nam | 18-39 | Gói dinh dưỡng | Hô hấp", searchBy: "nam_18_39_ho_hap", group: "Gói dinh dưỡng" },
  { value: "Nam | 18-39 | Gói Vaccine | Hô hấp", searchBy: "nam_18_39_ho_hap", group: "Gói vaccine" },
  { value: "Nam | 18-39 | Tầm soát | Hô hấp", searchBy: "nam_18_39_ho_hap", group: "Tầm soát" },

  { value: "Nữ | 18-39 | Gói khám | Hô hấp", searchBy: "nu_18_39_ho_hap", group: "Gói khám" },
  { value: "Nữ | 18-39 | Gói dược | Hô hấp", searchBy: "nu_18_39_ho_hap", group: "Gói dược" },
  { value: "Nữ | 18-39 | Gói gene | Hô hấp", searchBy: "nu_18_39_ho_hap", group: "Gói gene" },
  { value: "Nữ | 18-39 | Gói dinh dưỡng | Hô hấp", searchBy: "nu_18_39_ho_hap", group: "Gói dinh dưỡng" },
  { value: "Nữ | 18-39 | Gói Vaccine | Hô hấp", searchBy: "nu_18_39_ho_hap", group: "Gói vaccine" },
  { value: "Nữ | 18-39 | Tầm soát | Hô hấp", searchBy: "nu_18_39_ho_hap", group: "Tầm soát" },

  { value: "Nam | 18-39 | Gói khám | Tim mạch", searchBy: "nam_18_39_tim_mach", group: "Gói khám" },
  { value: "Nam | 18-39 | Gói dược | Tim mạch", searchBy: "nam_18_39_tim_mach", group: "Gói dược" },
  { value: "Nam | 18-39 | Gói gene | Tim mạch", searchBy: "nam_18_39_tim_mach", group: "Gói gene" },
  { value: "Nam | 18-39 | Gói dinh dưỡng | Tim mạch", searchBy: "nam_18_39_tim_mach", group: "Gói dinh dưỡng" },
  { value: "Nam | 18-39 | Gói Vaccine | Tim mạch", searchBy: "nam_18_39_tim_mach", group: "Gói vaccine" },
  { value: "Nam | 18-39 | Tầm soát | Tim mạch", searchBy: "nam_18_39_tim_mach", group: "Tầm soát" },

  { value: "Nữ | 18-39 | Gói khám | Tim mạch", searchBy: "nu_18_39_tim_mach", group: "Gói khám" },
  { value: "Nữ | 18-39 | Gói dược | Tim mạch", searchBy: "nu_18_39_tim_mach", group: "Gói dược" },
  { value: "Nữ | 18-39 | Gói gene | Tim mạch", searchBy: "nu_18_39_tim_mach", group: "Gói gene" },
  { value: "Nữ | 18-39 | Gói dinh dưỡng | Tim mạch", searchBy: "nu_18_39_tim_mach", group: "Gói dinh dưỡng" },
  { value: "Nữ | 18-39 | Gói Vaccine | Tim mạch", searchBy: "nu_18_39_tim_mach", group: "Gói vaccine" },
  { value: "Nữ | 18-39 | Tầm soát | Tim mạch", searchBy: "nu_18_39_tim_mach", group: "Tầm soát" },

  { value: "Nam | 18-39 | Gói khám | Thận - tiết niệu", searchBy: "nam_18_39_than_tiet_nieu", group: "Gói khám" },
  { value: "Nam | 18-39 | Gói dược | Thận - tiết niệu", searchBy: "nam_18_39_than_tiet_nieu", group: "Gói dược" },
  { value: "Nam | 18-39 | Gói gene | Thận - tiết niệu", searchBy: "nam_18_39_than_tiet_nieu", group: "Gói gene" },
  { value: "Nam | 18-39 | Gói dinh dưỡng | Thận - tiết niệu", searchBy: "nam_18_39_than_tiet_nieu", group: "Gói dinh dưỡng" },
  { value: "Nam | 18-39 | Gói Vaccine | Thận - tiết niệu", searchBy: "nam_18_39_than_tiet_nieu", group: "Gói vaccine" },
  { value: "Nam | 18-39 | Tầm soát | Thận - tiết niệu", searchBy: "nam_18_39_than_tiet_nieu", group: "Tầm soát" },

  { value: "Nữ | 18-39 | Gói khám | Thận - tiết niệu", searchBy: "nu_18_39_than_tiet_nieu", group: "Gói khám" },
  { value: "Nữ | 18-39 | Gói dược | Thận - tiết niệu", searchBy: "nu_18_39_than_tiet_nieu", group: "Gói dược" },
  { value: "Nữ | 18-39 | Gói gene | Thận - tiết niệu", searchBy: "nu_18_39_than_tiet_nieu", group: "Gói gene" },
  { value: "Nữ | 18-39 | Gói dinh dưỡng | Thận - tiết niệu", searchBy: "nu_18_39_than_tiet_nieu", group: "Gói dinh dưỡng" },
  { value: "Nữ | 18-39 | Gói Vaccine | Thận - tiết niệu", searchBy: "nu_18_39_than_tiet_nieu", group: "Gói vaccine" },
  { value: "Nữ | 18-39 | Tầm soát | Thận - tiết niệu", searchBy: "nu_18_39_than_tiet_nieu", group: "Tầm soát" },

  { value: "Nam | 18-39 | Gói khám | Cơ xương khớp", searchBy: "nam_18_39_co_xuong_khop", group: "Gói khám" },
  { value: "Nam | 18-39 | Gói dược | Cơ xương khớp", searchBy: "nam_18_39_co_xuong_khop", group: "Gói dược" },
  { value: "Nam | 18-39 | Gói gene | Cơ xương khớp", searchBy: "nam_18_39_co_xuong_khop", group: "Gói gene" },
  { value: "Nam | 18-39 | Gói dinh dưỡng | Cơ xương khớp", searchBy: "nam_18_39_co_xuong_khop", group: "Gói dinh dưỡng" },
  { value: "Nam | 18-39 | Gói Vaccine | Cơ xương khớp", searchBy: "nam_18_39_co_xuong_khop", group: "Gói vaccine" },
  { value: "Nam | 18-39 | Tầm soát | Cơ xương khớp", searchBy: "nam_18_39_co_xuong_khop", group: "Tầm soát" },

  { value: "Nữ | 18-39 | Gói khám | Cơ xương khớp", searchBy: "nu_18_39_co_xuong_khop", group: "Gói khám" },
  { value: "Nữ | 18-39 | Gói dược | Cơ xương khớp", searchBy: "nu_18_39_co_xuong_khop", group: "Gói dược" },
  { value: "Nữ | 18-39 | Gói gene | Cơ xương khớp", searchBy: "nu_18_39_co_xuong_khop", group: "Gói gene" },
  { value: "Nữ | 18-39 | Gói dinh dưỡng | Cơ xương khớp", searchBy: "nu_18_39_co_xuong_khop", group: "Gói dinh dưỡng" },
  { value: "Nữ | 18-39 | Gói Vaccine | Cơ xương khớp", searchBy: "nu_18_39_co_xuong_khop", group: "Gói vaccine" },
  { value: "Nữ | 18-39 | Tầm soát | Cơ xương khớp", searchBy: "nu_18_39_co_xuong_khop", group: "Tầm soát" },

  { value: "Nam | 18-39 | Gói khám | Nội tiết/ chuyển hoá", searchBy: "nam_18_39_tiet_chuyen_hoa", group: "Gói khám" },
  { value: "Nam | 18-39 | Gói dược | Nội tiết/ chuyển hoá", searchBy: "nam_18_39_tiet_chuyen_hoa", group: "Gói dược" },
  { value: "Nam | 18-39 | Gói gene | Nội tiết/ chuyển hoá", searchBy: "nam_18_39_tiet_chuyen_hoa", group: "Gói gene" },
  { value: "Nam | 18-39 | Gói dinh dưỡng | Nội tiết/ chuyển hoá", searchBy: "nam_18_39_tiet_chuyen_hoa", group: "Gói dinh dưỡng" },
  { value: "Nam | 18-39 | Gói Vaccine | Nội tiết/ chuyển hoá", searchBy: "nam_18_39_tiet_chuyen_hoa", group: "Gói vaccine" },
  { value: "Nam | 18-39 | Tầm soát | Nội tiết/ chuyển hoá", searchBy: "nam_18_39_tiet_chuyen_hoa", group: "Tầm soát" },

  { value: "Nữ | 18-39 | Gói khám | Nội tiết/ chuyển hoá", searchBy: "nu_18_39_tiet_chuyen_hoa", group: "Gói khám" },
  { value: "Nữ | 18-39 | Gói dược | Nội tiết/ chuyển hoá", searchBy: "nu_18_39_tiet_chuyen_hoa", group: "Gói dược" },
  { value: "Nữ | 18-39 | Gói gene | Nội tiết/ chuyển hoá", searchBy: "nu_18_39_tiet_chuyen_hoa", group: "Gói gene" },
  { value: "Nữ | 18-39 | Gói dinh dưỡng | Nội tiết/ chuyển hoá", searchBy: "nu_18_39_tiet_chuyen_hoa", group: "Gói dinh dưỡng" },
  { value: "Nữ | 18-39 | Gói Vaccine | Nội tiết/ chuyển hoá", searchBy: "nu_18_39_tiet_chuyen_hoa", group: "Gói vaccine" },
  { value: "Nữ | 18-39 | Tầm soát | Nội tiết/ chuyển hoá", searchBy: "nu_18_39_tiet_chuyen_hoa", group: "Tầm soát" },

  { value: "Nam | 18-39 | Gói khám | Tiêu hóa", searchBy: "nam_18_39_tieu_hoa", group: "Gói khám" },
  { value: "Nam | 18-39 | Gói dược | Tiêu hóa", searchBy: "nam_18_39_tieu_hoa", group: "Gói dược" },
  { value: "Nam | 18-39 | Gói gene | Tiêu hóa", searchBy: "nam_18_39_tieu_hoa", group: "Gói gene" },
  { value: "Nam | 18-39 | Gói dinh dưỡng | Tiêu hóa", searchBy: "nam_18_39_tieu_hoa", group: "Gói dinh dưỡng" },
  { value: "Nam | 18-39 | Gói Vaccine | Tiêu hóa", searchBy: "nam_18_39_tieu_hoa", group: "Gói vaccine" },
  { value: "Nam | 18-39 | Tầm soát | Tiêu hóa", searchBy: "nam_18_39_tieu_hoa", group: "Tầm soát" },

  { value: "Nữ | 18-39 | Gói khám | Tiêu hóa", searchBy: "nu_18_39_tieu_hoa", group: "Gói khám" },
  { value: "Nữ | 18-39 | Gói dược | Tiêu hóa", searchBy: "nu_18_39_tieu_hoa", group: "Gói dược" },
  { value: "Nữ | 18-39 | Gói gene | Tiêu hóa", searchBy: "nu_18_39_tieu_hoa", group: "Gói gene" },
  { value: "Nữ | 18-39 | Gói dinh dưỡng | Tiêu hóa", searchBy: "nu_18_39_tieu_hoa", group: "Gói dinh dưỡng" },
  { value: "Nữ | 18-39 | Gói Vaccine | Tiêu hóa", searchBy: "nu_18_39_tieu_hoa", group: "Gói vaccine" },
  { value: "Nữ | 18-39 | Tầm soát | Tiêu hóa", searchBy: "nu_18_39_tieu_hoa", group: "Tầm soát" },


  // 40-49
  { value: "Nam | 40-49 | Gói khám | Không có bệnh", searchBy: "nam_40_49_khong_co_benh", group: "Gói khám" },
  { value: "Nam | 40-49 | Gói dược | Không có bệnh", searchBy: "nam_40_49_khong_co_benh", group: "Gói dược" },
  { value: "Nam | 40-49 | Gói gene | Không có bệnh", searchBy: "nam_40_49_khong_co_benh", group: "Gói gene" },
  { value: "Nam | 40-49 | Gói dinh dưỡng | Không có bệnh", searchBy: "nam_40_49_khong_co_benh", group: "Gói dinh dưỡng" },
  { value: "Nam | 40-49 | Gói Vaccine | Không có bệnh", searchBy: "nam_40_49_khong_co_benh", group: "Gói vaccine" },
  { value: "Nam | 40-49 | Tầm soát | Không có bệnh", searchBy: "nam_40_49_khong_co_benh", group: "Tầm soát" },

  { value: "Nữ | 40-49 | Gói khám | Không có bệnh", searchBy: "nu_40_49_khong_co_benh", group: "Gói khám" },
  { value: "Nữ | 40-49 | Gói dược | Không có bệnh", searchBy: "nu_40_49_khong_co_benh", group: "Gói dược" },
  { value: "Nữ | 40-49 | Gói gene | Không có bệnh", searchBy: "nu_40_49_khong_co_benh", group: "Gói gene" },
  { value: "Nữ | 40-49 | Gói dinh dưỡng | Không có bệnh", searchBy: "nu_40_49_khong_co_benh", group: "Gói dinh dưỡng" },
  { value: "Nữ | 40-49 | Gói Vaccine | Không có bệnh", searchBy: "nu_40_49_khong_co_benh", group: "Gói vaccine" },
  { value: "Nữ | 40-49 | Tầm soát | Không có bệnh", searchBy: "nu_40_49_khong_co_benh", group: "Tầm soát" },

  { value: "Nam | 40-49 | Gói khám | Thần kinh", searchBy: "nam_40_49_than_kinh", group: "Gói khám" },
  { value: "Nam | 40-49 | Gói dược | Thần kinh", searchBy: "nam_40_49_than_kinh", group: "Gói dược" },
  { value: "Nam | 40-49 | Gói gene | Thần kinh", searchBy: "nam_40_49_than_kinh", group: "Gói gene" },
  { value: "Nam | 40-49 | Gói dinh dưỡng | Thần kinh", searchBy: "nam_40_49_than_kinh", group: "Gói dinh dưỡng" },
  { value: "Nam | 40-49 | Gói Vaccine | Thần kinh", searchBy: "nam_40_49_than_kinh", group: "Gói vaccine" },
  { value: "Nam | 40-49 | Tầm soát | Thần kinh", searchBy: "nam_40_49_than_kinh", group: "Tầm soát" },

  { value: "Nữ | 40-49 | Gói khám | Thần kinh", searchBy: "nu_40_49_than_kinh", group: "Gói khám" },
  { value: "Nữ | 40-49 | Gói dược | Thần kinh", searchBy: "nu_40_49_than_kinh", group: "Gói dược" },
  { value: "Nữ | 40-49 | Gói gene | Thần kinh", searchBy: "nu_40_49_than_kinh", group: "Gói gene" },
  { value: "Nữ | 40-49 | Gói dinh dưỡng | Thần kinh", searchBy: "nu_40_49_than_kinh", group: "Gói dinh dưỡng" },
  { value: "Nữ | 40-49 | Gói Vaccine | Thần kinh", searchBy: "nu_40_49_than_kinh", group: "Gói vaccine" },
  { value: "Nữ | 40-49 | Tầm soát | Thần kinh", searchBy: "nu_40_49_than_kinh", group: "Tầm soát" },

  { value: "Nam | 40-49 | Gói khám | Hô hấp", searchBy: "nam_40_49_ho_hap", group: "Gói khám" },
  { value: "Nam | 40-49 | Gói dược | Hô hấp", searchBy: "nam_40_49_ho_hap", group: "Gói dược" },
  { value: "Nam | 40-49 | Gói gene | Hô hấp", searchBy: "nam_40_49_ho_hap", group: "Gói gene" },
  { value: "Nam | 40-49 | Gói dinh dưỡng | Hô hấp", searchBy: "nam_40_49_ho_hap", group: "Gói dinh dưỡng" },
  { value: "Nam | 40-49 | Gói Vaccine | Hô hấp", searchBy: "nam_40_49_ho_hap", group: "Gói vaccine" },
  { value: "Nam | 40-49 | Tầm soát | Hô hấp", searchBy: "nam_40_49_ho_hap", group: "Tầm soát" },

  { value: "Nữ | 40-49 | Gói khám | Hô hấp", searchBy: "nu_40_49_ho_hap", group: "Gói khám" },
  { value: "Nữ | 40-49 | Gói dược | Hô hấp", searchBy: "nu_40_49_ho_hap", group: "Gói dược" },
  { value: "Nữ | 40-49 | Gói gene | Hô hấp", searchBy: "nu_40_49_ho_hap", group: "Gói gene" },
  { value: "Nữ | 40-49 | Gói dinh dưỡng | Hô hấp", searchBy: "nu_40_49_ho_hap", group: "Gói dinh dưỡng" },
  { value: "Nữ | 40-49 | Gói Vaccine | Hô hấp", searchBy: "nu_40_49_ho_hap", group: "Gói vaccine" },
  { value: "Nữ | 40-49 | Tầm soát | Hô hấp", searchBy: "nu_40_49_ho_hap", group: "Tầm soát" },

  { value: "Nam | 40-49 | Gói khám | Tim mạch", searchBy: "nam_40_49_tim_mach", group: "Gói khám" },
  { value: "Nam | 40-49 | Gói dược | Tim mạch", searchBy: "nam_40_49_tim_mach", group: "Gói dược" },
  { value: "Nam | 40-49 | Gói gene | Tim mạch", searchBy: "nam_40_49_tim_mach", group: "Gói gene" },
  { value: "Nam | 40-49 | Gói dinh dưỡng | Tim mạch", searchBy: "nam_40_49_tim_mach", group: "Gói dinh dưỡng" },
  { value: "Nam | 40-49 | Gói Vaccine | Tim mạch", searchBy: "nam_40_49_tim_mach", group: "Gói vaccine" },
  { value: "Nam | 40-49 | Tầm soát | Tim mạch", searchBy: "nam_40_49_tim_mach", group: "Tầm soát" },

  { value: "Nữ | 40-49 | Gói khám | Tim mạch", searchBy: "nam_40_49_tim_mach", group: "Gói khám" },
  { value: "Nữ | 40-49 | Gói dược | Tim mạch", searchBy: "nam_40_49_tim_mach", group: "Gói dược" },
  { value: "Nữ | 40-49 | Gói gene | Tim mạch", searchBy: "nam_40_49_tim_mach", group: "Gói gene" },
  { value: "Nữ | 40-49 | Gói dinh dưỡng | Tim mạch", searchBy: "nam_40_49_tim_mach", group: "Gói dinh dưỡng" },
  { value: "Nữ | 40-49 | Gói Vaccine | Tim mạch", searchBy: "nam_40_49_tim_mach", group: "Gói vaccine" },
  { value: "Nữ | 40-49 | Tầm soát | Tim mạch", searchBy: "nam_40_49_tim_mach", group: "Tầm soát" },

  { value: "Nam | 40-49 | Gói khám | Thận - tiết niệu", searchBy: "nam_40_49_than_tiet_nieu", group: "Gói khám" },
  { value: "Nam | 40-49 | Gói dược | Thận - tiết niệu", searchBy: "nam_40_49_than_tiet_nieu", group: "Gói dược" },
  { value: "Nam | 40-49 | Gói gene | Thận - tiết niệu", searchBy: "nam_40_49_than_tiet_nieu", group: "Gói gene" },
  { value: "Nam | 40-49 | Gói dinh dưỡng | Thận - tiết niệu", searchBy: "nam_40_49_than_tiet_nieu", group: "Gói dinh dưỡng" },
  { value: "Nam | 40-49 | Gói Vaccine | Thận - tiết niệu", searchBy: "nam_40_49_than_tiet_nieu", group: "Gói vaccine" },
  { value: "Nam | 40-49 | Tầm soát | Thận - tiết niệu", searchBy: "nam_40_49_than_tiet_nieu", group: "Tầm soát" },

  { value: "Nữ | 40-49 | Gói khám | Thận - tiết niệu", searchBy: "nu_40_49_than_tiet_nieu", group: "Gói khám" },
  { value: "Nữ | 40-49 | Gói dược | Thận - tiết niệu", searchBy: "nu_40_49_than_tiet_nieu", group: "Gói dược" },
  { value: "Nữ | 40-49 | Gói gene | Thận - tiết niệu", searchBy: "nu_40_49_than_tiet_nieu", group: "Gói gene" },
  { value: "Nữ | 40-49 | Gói dinh dưỡng | Thận - tiết niệu", searchBy: "nu_40_49_than_tiet_nieu", group: "Gói dinh dưỡng" },
  { value: "Nữ | 40-49 | Gói Vaccine | Thận - tiết niệu", searchBy: "nu_40_49_than_tiet_nieu", group: "Gói vaccine" },
  { value: "Nữ | 40-49 | Tầm soát | Thận - tiết niệu", searchBy: "nu_40_49_than_tiet_nieu", group: "Tầm soát" },

  { value: "Nam | 40-49 | Gói khám | Cơ xương khớp", searchBy: "nam_40_49_co_xuong_khop", group: "Gói khám" },
  { value: "Nam | 40-49 | Gói dược | Cơ xương khớp", searchBy: "nam_40_49_co_xuong_khop", group: "Gói dược" },
  { value: "Nam | 40-49 | Gói gene | Cơ xương khớp", searchBy: "nam_40_49_co_xuong_khop", group: "Gói gene" },
  { value: "Nam | 40-49 | Gói dinh dưỡng | Cơ xương khớp", searchBy: "nam_40_49_co_xuong_khop", group: "Gói dinh dưỡng" },
  { value: "Nam | 40-49 | Gói Vaccine | Cơ xương khớp", searchBy: "nam_40_49_co_xuong_khop", group: "Gói vaccine" },
  { value: "Nam | 40-49 | Tầm soát | Cơ xương khớp", searchBy: "nam_40_49_co_xuong_khop", group: "Tầm soát" },

  { value: "Nữ | 40-49 | Gói khám | Cơ xương khớp", searchBy: "nu_40_49_co_xuong_khop", group: "Gói khám" },
  { value: "Nữ | 40-49 | Gói dược | Cơ xương khớp", searchBy: "nu_40_49_co_xuong_khop", group: "Gói dược" },
  { value: "Nữ | 40-49 | Gói gene | Cơ xương khớp", searchBy: "nu_40_49_co_xuong_khop", group: "Gói gene" },
  { value: "Nữ | 40-49 | Gói dinh dưỡng | Cơ xương khớp", searchBy: "nu_40_49_co_xuong_khop", group: "Gói dinh dưỡng" },
  { value: "Nữ | 40-49 | Gói Vaccine | Cơ xương khớp", searchBy: "nu_40_49_co_xuong_khop", group: "Gói vaccine" },
  { value: "Nữ | 40-49 | Tầm soát | Cơ xương khớp", searchBy: "nu_40_49_co_xuong_khop", group: "Tầm soát" },

  { value: "Nam | 40-49 | Gói khám | Nội tiết/ chuyển hoá", searchBy: "nam_40_49_tiet_chuyen_hoa", group: "Gói khám" },
  { value: "Nam | 40-49 | Gói dược | Nội tiết/ chuyển hoá", searchBy: "nam_40_49_tiet_chuyen_hoa", group: "Gói dược" },
  { value: "Nam | 40-49 | Gói gene | Nội tiết/ chuyển hoá", searchBy: "nam_40_49_tiet_chuyen_hoa", group: "Gói gene" },
  { value: "Nam | 40-49 | Gói dinh dưỡng | Nội tiết/ chuyển hoá", searchBy: "nam_40_49_tiet_chuyen_hoa", group: "Gói dinh dưỡng" },
  { value: "Nam | 40-49 | Gói Vaccine | Nội tiết/ chuyển hoá", searchBy: "nam_40_49_tiet_chuyen_hoa", group: "Gói vaccine" },
  { value: "Nam | 40-49 | Tầm soát | Nội tiết/ chuyển hoá", searchBy: "nam_40_49_tiet_chuyen_hoa", group: "Tầm soát" },

  { value: "Nữ | 40-49 | Gói khám | Nội tiết/ chuyển hoá", searchBy: "nu_40_49_tiet_chuyen_hoa", group: "Gói khám" },
  { value: "Nữ | 40-49 | Gói dược | Nội tiết/ chuyển hoá", searchBy: "nu_40_49_tiet_chuyen_hoa", group: "Gói dược" },
  { value: "Nữ | 40-49 | Gói gene | Nội tiết/ chuyển hoá", searchBy: "nu_40_49_tiet_chuyen_hoa", group: "Gói gene" },
  { value: "Nữ | 40-49 | Gói dinh dưỡng | Nội tiết/ chuyển hoá", searchBy: "nu_40_49_tiet_chuyen_hoa", group: "Gói dinh dưỡng" },
  { value: "Nữ | 40-49 | Gói Vaccine | Nội tiết/ chuyển hoá", searchBy: "nu_40_49_tiet_chuyen_hoa", group: "Gói vaccine" },
  { value: "Nữ | 40-49 | Tầm soát | Nội tiết/ chuyển hoá", searchBy: "nu_40_49_tiet_chuyen_hoa", group: "Tầm soát" },

  { value: "Nam | 40-49 | Gói khám | Tiêu hóa", searchBy: "nam_40_49_tieu_hoa", group: "Gói khám" },
  { value: "Nam | 40-49 | Gói dược | Tiêu hóa", searchBy: "nam_40_49_tieu_hoa", group: "Gói dược" },
  { value: "Nam | 40-49 | Gói gene | Tiêu hóa", searchBy: "nam_40_49_tieu_hoa", group: "Gói gene" },
  { value: "Nam | 40-49 | Gói dinh dưỡng | Tiêu hóa", searchBy: "nam_40_49_tieu_hoa", group: "Gói dinh dưỡng" },
  { value: "Nam | 40-49 | Gói Vaccine | Tiêu hóa", searchBy: "nam_40_49_tieu_hoa", group: "Gói vaccine" },
  { value: "Nam | 40-49 | Tầm soát | Tiêu hóa", searchBy: "nam_40_49_tieu_hoa", group: "Tầm soát" },

  { value: "Nữ | 40-49 | Gói khám | Tiêu hóa", searchBy: "nu_40_49_tieu_hoa", group: "Gói khám" },
  { value: "Nữ | 40-49 | Gói dược | Tiêu hóa", searchBy: "nu_40_49_tieu_hoa", group: "Gói dược" },
  { value: "Nữ | 40-49 | Gói gene | Tiêu hóa", searchBy: "nu_40_49_tieu_hoa", group: "Gói gene" },
  { value: "Nữ | 40-49 | Gói dinh dưỡng | Tiêu hóa", searchBy: "nu_40_49_tieu_hoa", group: "Gói dinh dưỡng" },
  { value: "Nữ | 40-49 | Gói Vaccine | Tiêu hóa", searchBy: "nu_40_49_tieu_hoa", group: "Gói vaccine" },
  { value: "Nữ | 40-49 | Tầm soát | Tiêu hóa", searchBy: "nu_40_49_tieu_hoa", group: "Tầm soát" },

  // 50 - 64
  { value: "Nam | 50-64 | Gói khám | Không có bệnh", searchBy: "nam_50_64_khong_co_benh", group: "Gói khám" },
  { value: "Nam | 50-64 | Gói dược | Không có bệnh", searchBy: "nam_50_64_khong_co_benh", group: "Gói dược" },
  { value: "Nam | 50-64 | Gói gene | Không có bệnh", searchBy: "nam_50_64_khong_co_benh", group: "Gói gene" },
  { value: "Nam | 50-64 | Gói dinh dưỡng | Không có bệnh", searchBy: "nam_50_64_khong_co_benh", group: "Gói dinh dưỡng" },
  { value: "Nam | 50-64 | Gói Vaccine | Không có bệnh", searchBy: "nam_50_64_khong_co_benh", group: "Gói vaccine" },
  { value: "Nam | 50-64 | Tầm soát | Không có bệnh", searchBy: "nam_50_64_khong_co_benh", group: "Tầm soát" },

  { value: "Nữ | 50-64 | Gói khám | Không có bệnh", searchBy: "nu_50_64_khong_co_benh", group: "Gói khám" },
  { value: "Nữ | 50-64 | Gói dược | Không có bệnh", searchBy: "nu_50_64_khong_co_benh", group: "Gói dược" },
  { value: "Nữ | 50-64 | Gói gene | Không có bệnh", searchBy: "nu_50_64_khong_co_benh", group: "Gói gene" },
  { value: "Nữ | 50-64 | Gói dinh dưỡng | Không có bệnh", searchBy: "nu_50_64_khong_co_benh", group: "Gói dinh dưỡng" },
  { value: "Nữ | 50-64 | Gói Vaccine | Không có bệnh", searchBy: "nu_50_64_khong_co_benh", group: "Gói vaccine" },
  { value: "Nữ | 50-64 | Tầm soát | Không có bệnh", searchBy: "nu_50_64_khong_co_benh", group: "Tầm soát" },

  { value: "Nam | 50-64 | Gói khám | Thần kinh", searchBy: "nam_50_64_than_kinh", group: "Gói khám" },
  { value: "Nam | 50-64 | Gói dược | Thần kinh", searchBy: "nam_50_64_than_kinh", group: "Gói dược" },
  { value: "Nam | 50-64 | Gói gene | Thần kinh", searchBy: "nam_50_64_than_kinh", group: "Gói gene" },
  { value: "Nam | 50-64 | Gói dinh dưỡng | Thần kinh", searchBy: "nam_50_64_than_kinh", group: "Gói dinh dưỡng" },
  { value: "Nam | 50-64 | Gói Vaccine | Thần kinh", searchBy: "nam_50_64_than_kinh", group: "Gói vaccine" },
  { value: "Nam | 50-64 | Tầm soát | Thần kinh", searchBy: "nam_50_64_than_kinh", group: "Tầm soát" },

  { value: "Nữ | 50-64 | Gói khám | Thần kinh", searchBy: "nu_50_64_than_kinh", group: "Gói khám" },
  { value: "Nữ | 50-64 | Gói dược | Thần kinh", searchBy: "nu_50_64_than_kinh", group: "Gói dược" },
  { value: "Nữ | 50-64 | Gói gene | Thần kinh", searchBy: "nu_50_64_than_kinh", group: "Gói gene" },
  { value: "Nữ | 50-64 | Gói dinh dưỡng | Thần kinh", searchBy: "nu_50_64_than_kinh", group: "Gói dinh dưỡng" },
  { value: "Nữ | 50-64 | Gói Vaccine | Thần kinh", searchBy: "nu_50_64_than_kinh", group: "Gói vaccine" },
  { value: "Nữ | 50-64 | Tầm soát | Thần kinh", searchBy: "nu_50_64_than_kinh", group: "Tầm soát" },

  { value: "Nam | 50-64 | Gói khám | Hô hấp", searchBy: "nam_50_64_ho_hap", group: "Gói khám" },
  { value: "Nam | 50-64 | Gói dược | Hô hấp", searchBy: "nam_50_64_ho_hap", group: "Gói dược" },
  { value: "Nam | 50-64 | Gói gene | Hô hấp", searchBy: "nam_50_64_ho_hap", group: "Gói gene" },
  { value: "Nam | 50-64 | Gói dinh dưỡng | Hô hấp", searchBy: "nam_50_64_ho_hap", group: "Gói dinh dưỡng" },
  { value: "Nam | 50-64 | Gói Vaccine | Hô hấp", searchBy: "nam_50_64_ho_hap", group: "Gói vaccine" },
  { value: "Nam | 50-64 | Tầm soát | Hô hấp", searchBy: "nam_50_64_ho_hap", group: "Tầm soát" },

  { value: "Nữ | 50-64 | Gói khám | Hô hấp", searchBy: "nu_50_64_ho_hap", group: "Gói khám" },
  { value: "Nữ | 50-64 | Gói dược | Hô hấp", searchBy: "nu_50_64_ho_hap", group: "Gói dược" },
  { value: "Nữ | 50-64 | Gói gene | Hô hấp", searchBy: "nu_50_64_ho_hap", group: "Gói gene" },
  { value: "Nữ | 50-64 | Gói dinh dưỡng | Hô hấp", searchBy: "nu_50_64_ho_hap", group: "Gói dinh dưỡng" },
  { value: "Nữ | 50-64 | Gói Vaccine | Hô hấp", searchBy: "nu_50_64_ho_hap", group: "Gói vaccine" },
  { value: "Nữ | 50-64 | Tầm soát | Hô hấp", searchBy: "nu_50_64_ho_hap", group: "Tầm soát" },

  { value: "Nam | 50-64 | Gói khám | Tim mạch", searchBy: "nam_50_64_tim_mach", group: "Gói khám" },
  { value: "Nam | 50-64 | Gói dược | Tim mạch", searchBy: "nam_50_64_tim_mach", group: "Gói dược" },
  { value: "Nam | 50-64 | Gói gene | Tim mạch", searchBy: "nam_50_64_tim_mach", group: "Gói gene" },
  { value: "Nam | 50-64 | Gói dinh dưỡng | Tim mạch", searchBy: "nam_50_64_tim_mach", group: "Gói dinh dưỡng" },
  { value: "Nam | 50-64 | Gói Vaccine | Tim mạch", searchBy: "nam_50_64_tim_mach", group: "Gói vaccine" },
  { value: "Nam | 50-64 | Tầm soát | Tim mạch", searchBy: "nam_50_64_tim_mach", group: "Tầm soát" },

  { value: "Nữ | 50-64 | Gói khám | Tim mạch", searchBy: "nam_50_64_tim_mach", group: "Gói khám" },
  { value: "Nữ | 50-64 | Gói dược | Tim mạch", searchBy: "nam_50_64_tim_mach", group: "Gói dược" },
  { value: "Nữ | 50-64 | Gói gene | Tim mạch", searchBy: "nam_50_64_tim_mach", group: "Gói gene" },
  { value: "Nữ | 50-64 | Gói dinh dưỡng | Tim mạch", searchBy: "nam_50_64_tim_mach", group: "Gói dinh dưỡng" },
  { value: "Nữ | 50-64 | Gói Vaccine | Tim mạch", searchBy: "nam_50_64_tim_mach", group: "Gói vaccine" },
  { value: "Nữ | 50-64 | Tầm soát | Tim mạch", searchBy: "nam_50_64_tim_mach", group: "Tầm soát" },

  { value: "Nam | 50-64 | Gói khám | Thận - tiết niệu", searchBy: "nam_50_64_than_tiet_nieu", group: "Gói khám" },
  { value: "Nam | 50-64 | Gói dược | Thận - tiết niệu", searchBy: "nam_50_64_than_tiet_nieu", group: "Gói dược" },
  { value: "Nam | 50-64 | Gói gene | Thận - tiết niệu", searchBy: "nam_50_64_than_tiet_nieu", group: "Gói gene" },
  { value: "Nam | 50-64 | Gói dinh dưỡng | Thận - tiết niệu", searchBy: "nam_50_64_than_tiet_nieu", group: "Gói dinh dưỡng" },
  { value: "Nam | 50-64 | Gói Vaccine | Thận - tiết niệu", searchBy: "nam_50_64_than_tiet_nieu", group: "Gói vaccine" },
  { value: "Nam | 50-64 | Tầm soát | Thận - tiết niệu", searchBy: "nam_50_64_than_tiet_nieu", group: "Tầm soát" },

  { value: "Nữ | 50-64 | Gói khám | Thận - tiết niệu", searchBy: "nu_50_64_than_tiet_nieu", group: "Gói khám" },
  { value: "Nữ | 50-64 | Gói dược | Thận - tiết niệu", searchBy: "nu_50_64_than_tiet_nieu", group: "Gói dược" },
  { value: "Nữ | 50-64 | Gói gene | Thận - tiết niệu", searchBy: "nu_50_64_than_tiet_nieu", group: "Gói gene" },
  { value: "Nữ | 50-64 | Gói dinh dưỡng | Thận - tiết niệu", searchBy: "nu_50_64_than_tiet_nieu", group: "Gói dinh dưỡng" },
  { value: "Nữ | 50-64 | Gói Vaccine | Thận - tiết niệu", searchBy: "nu_50_64_than_tiet_nieu", group: "Gói vaccine" },
  { value: "Nữ | 50-64 | Tầm soát | Thận - tiết niệu", searchBy: "nu_50_64_than_tiet_nieu", group: "Tầm soát" },

  { value: "Nam | 50-64 | Gói khám | Cơ xương khớp", searchBy: "nam_50_64_co_xuong_khop", group: "Gói khám" },
  { value: "Nam | 50-64 | Gói dược | Cơ xương khớp", searchBy: "nam_50_64_co_xuong_khop", group: "Gói dược" },
  { value: "Nam | 50-64 | Gói gene | Cơ xương khớp", searchBy: "nam_50_64_co_xuong_khop", group: "Gói gene" },
  { value: "Nam | 50-64 | Gói dinh dưỡng | Cơ xương khớp", searchBy: "nam_50_64_co_xuong_khop", group: "Gói dinh dưỡng" },
  { value: "Nam | 50-64 | Gói Vaccine | Cơ xương khớp", searchBy: "nam_50_64_co_xuong_khop", group: "Gói vaccine" },
  { value: "Nam | 50-64 | Tầm soát | Cơ xương khớp", searchBy: "nam_50_64_co_xuong_khop", group: "Tầm soát" },

  { value: "Nữ | 50-64 | Gói khám | Cơ xương khớp", searchBy: "nu_50_64_co_xuong_khop", group: "Gói khám" },
  { value: "Nữ | 50-64 | Gói dược | Cơ xương khớp", searchBy: "nu_50_64_co_xuong_khop", group: "Gói dược" },
  { value: "Nữ | 50-64 | Gói gene | Cơ xương khớp", searchBy: "nu_50_64_co_xuong_khop", group: "Gói gene" },
  { value: "Nữ | 50-64 | Gói dinh dưỡng | Cơ xương khớp", searchBy: "nu_50_64_co_xuong_khop", group: "Gói dinh dưỡng" },
  { value: "Nữ | 50-64 | Gói Vaccine | Cơ xương khớp", searchBy: "nu_50_64_co_xuong_khop", group: "Gói vaccine" },
  { value: "Nữ | 50-64 | Tầm soát | Cơ xương khớp", searchBy: "nu_50_64_co_xuong_khop", group: "Tầm soát" },

  { value: "Nam | 50-64 | Gói khám | Nội tiết/ chuyển hoá", searchBy: "nam_50_64_tiet_chuyen_hoa", group: "Gói khám" },
  { value: "Nam | 50-64 | Gói dược | Nội tiết/ chuyển hoá", searchBy: "nam_50_64_tiet_chuyen_hoa", group: "Gói dược" },
  { value: "Nam | 50-64 | Gói gene | Nội tiết/ chuyển hoá", searchBy: "nam_50_64_tiet_chuyen_hoa", group: "Gói gene" },
  { value: "Nam | 50-64 | Gói dinh dưỡng | Nội tiết/ chuyển hoá", searchBy: "nam_50_64_tiet_chuyen_hoa", group: "Gói dinh dưỡng" },
  { value: "Nam | 50-64 | Gói Vaccine | Nội tiết/ chuyển hoá", searchBy: "nam_50_64_tiet_chuyen_hoa", group: "Gói vaccine" },
  { value: "Nam | 50-64 | Tầm soát | Nội tiết/ chuyển hoá", searchBy: "nam_50_64_tiet_chuyen_hoa", group: "Tầm soát" },

  { value: "Nữ | 50-64 | Gói khám | Nội tiết/ chuyển hoá", searchBy: "nu_50_64_tiet_chuyen_hoa", group: "Gói khám" },
  { value: "Nữ | 50-64 | Gói dược | Nội tiết/ chuyển hoá", searchBy: "nu_50_64_tiet_chuyen_hoa", group: "Gói dược" },
  { value: "Nữ | 50-64 | Gói gene | Nội tiết/ chuyển hoá", searchBy: "nu_50_64_tiet_chuyen_hoa", group: "Gói gene" },
  { value: "Nữ | 50-64 | Gói dinh dưỡng | Nội tiết/ chuyển hoá", searchBy: "nu_50_64_tiet_chuyen_hoa", group: "Gói dinh dưỡng" },
  { value: "Nữ | 50-64 | Gói Vaccine | Nội tiết/ chuyển hoá", searchBy: "nu_50_64_tiet_chuyen_hoa", group: "Gói vaccine" },
  { value: "Nữ | 50-64 | Tầm soát | Nội tiết/ chuyển hoá", searchBy: "nu_50_64_tiet_chuyen_hoa", group: "Tầm soát" },

  { value: "Nam | 50-64 | Gói khám | Tiêu hóa", searchBy: "nam_50_64_tieu_hoa", group: "Gói khám" },
  { value: "Nam | 50-64 | Gói dược | Tiêu hóa", searchBy: "nam_50_64_tieu_hoa", group: "Gói dược" },
  { value: "Nam | 50-64 | Gói gene | Tiêu hóa", searchBy: "nam_50_64_tieu_hoa", group: "Gói gene" },
  { value: "Nam | 50-64 | Gói dinh dưỡng | Tiêu hóa", searchBy: "nam_50_64_tieu_hoa", group: "Gói dinh dưỡng" },
  { value: "Nam | 50-64 | Gói Vaccine | Tiêu hóa", searchBy: "nam_50_64_tieu_hoa", group: "Gói vaccine" },
  { value: "Nam | 50-64 | Tầm soát | Tiêu hóa", searchBy: "nam_50_64_tieu_hoa", group: "Tầm soát" },

  { value: "Nữ | 50-64 | Gói khám | Tiêu hóa", searchBy: "nu_50_64_tieu_hoa", group: "Gói khám" },
  { value: "Nữ | 50-64 | Gói dược | Tiêu hóa", searchBy: "nu_50_64_tieu_hoa", group: "Gói dược" },
  { value: "Nữ | 50-64 | Gói gene | Tiêu hóa", searchBy: "nu_50_64_tieu_hoa", group: "Gói gene" },
  { value: "Nữ | 50-64 | Gói dinh dưỡng | Tiêu hóa", searchBy: "nu_50_64_tieu_hoa", group: "Gói dinh dưỡng" },
  { value: "Nữ | 50-64 | Gói Vaccine | Tiêu hóa", searchBy: "nu_50_64_tieu_hoa", group: "Gói vaccine" },
  { value: "Nữ | 50-64 | Tầm soát | Tiêu hóa", searchBy: "nu_50_64_tieu_hoa", group: "Tầm soát" },

  // 65
  { value: "Nam | 65 | Gói khám | Không có bệnh", searchBy: "nam_65_khong_co_benh", group: "Gói khám" },
  { value: "Nam | 65 | Gói dược | Không có bệnh", searchBy: "nam_65_khong_co_benh", group: "Gói dược" },
  { value: "Nam | 65 | Gói gene | Không có bệnh", searchBy: "nam_65_khong_co_benh", group: "Gói gene" },
  { value: "Nam | 65 | Gói dinh dưỡng | Không có bệnh", searchBy: "nam_65_khong_co_benh", group: "Gói dinh dưỡng" },
  { value: "Nam | 65 | Gói Vaccine | Không có bệnh", searchBy: "nam_65_khong_co_benh", group: "Gói vaccine" },
  { value: "Nam | 65 | Tầm soát | Không có bệnh", searchBy: "nam_65_khong_co_benh", group: "Tầm soát" },

  { value: "Nữ | 65 | Gói khám | Không có bệnh", searchBy: "nu_65_khong_co_benh", group: "Gói khám" },
  { value: "Nữ | 65 | Gói dược | Không có bệnh", searchBy: "nu_65_khong_co_benh", group: "Gói dược" },
  { value: "Nữ | 65 | Gói gene | Không có bệnh", searchBy: "nu_65_khong_co_benh", group: "Gói gene" },
  { value: "Nữ | 65 | Gói dinh dưỡng | Không có bệnh", searchBy: "nu_65_khong_co_benh", group: "Gói dinh dưỡng" },
  { value: "Nữ | 65 | Gói Vaccine | Không có bệnh", searchBy: "nu_65_khong_co_benh", group: "Gói vaccine" },
  { value: "Nữ | 65 | Tầm soát | Không có bệnh", searchBy: "nu_65_khong_co_benh", group: "Tầm soát" },

  { value: "Nam | 65 | Gói khám | Thần kinh", searchBy: "nam_65_than_kinh", group: "Gói khám" },
  { value: "Nam | 65 | Gói dược | Thần kinh", searchBy: "nam_65_than_kinh", group: "Gói dược" },
  { value: "Nam | 65 | Gói gene | Thần kinh", searchBy: "nam_65_than_kinh", group: "Gói gene" },
  { value: "Nam | 65 | Gói dinh dưỡng | Thần kinh", searchBy: "nam_65_than_kinh", group: "Gói dinh dưỡng" },
  { value: "Nam | 65 | Gói Vaccine | Thần kinh", searchBy: "nam_65_than_kinh", group: "Gói vaccine" },
  { value: "Nam | 65 | Tầm soát | Thần kinh", searchBy: "nam_65_than_kinh", group: "Tầm soát" },

  { value: "Nữ | 65 | Gói khám | Thần kinh", searchBy: "nu_65_than_kinh", group: "Gói khám" },
  { value: "Nữ | 65 | Gói dược | Thần kinh", searchBy: "nu_65_than_kinh", group: "Gói dược" },
  { value: "Nữ | 65 | Gói gene | Thần kinh", searchBy: "nu_65_than_kinh", group: "Gói gene" },
  { value: "Nữ | 65 | Gói dinh dưỡng | Thần kinh", searchBy: "nu_65_than_kinh", group: "Gói dinh dưỡng" },
  { value: "Nữ | 65 | Gói Vaccine | Thần kinh", searchBy: "nu_65_than_kinh", group: "Gói vaccine" },
  { value: "Nữ | 65 | Tầm soát | Thần kinh", searchBy: "nu_65_than_kinh", group: "Tầm soát" },

  { value: "Nam | 65 | Gói khám | Hô hấp", searchBy: "nam_65_ho_hap", group: "Gói khám" },
  { value: "Nam | 65 | Gói dược | Hô hấp", searchBy: "nam_65_ho_hap", group: "Gói dược" },
  { value: "Nam | 65 | Gói gene | Hô hấp", searchBy: "nam_65_ho_hap", group: "Gói gene" },
  { value: "Nam | 65 | Gói dinh dưỡng | Hô hấp", searchBy: "nam_65_ho_hap", group: "Gói dinh dưỡng" },
  { value: "Nam | 65 | Gói Vaccine | Hô hấp", searchBy: "nam_65_ho_hap", group: "Gói vaccine" },
  { value: "Nam | 65 | Tầm soát | Hô hấp", searchBy: "nam_65_ho_hap", group: "Tầm soát" },

  { value: "Nữ | 65 | Gói khám | Hô hấp", searchBy: "nu_65_ho_hap", group: "Gói khám" },
  { value: "Nữ | 65 | Gói dược | Hô hấp", searchBy: "nu_65_ho_hap", group: "Gói dược" },
  { value: "Nữ | 65 | Gói gene | Hô hấp", searchBy: "nu_65_ho_hap", group: "Gói gene" },
  { value: "Nữ | 65 | Gói dinh dưỡng | Hô hấp", searchBy: "nu_65_ho_hap", group: "Gói dinh dưỡng" },
  { value: "Nữ | 65 | Gói Vaccine | Hô hấp", searchBy: "nu_65_ho_hap", group: "Gói vaccine" },
  { value: "Nữ | 65 | Tầm soát | Hô hấp", searchBy: "nu_65_ho_hap", group: "Tầm soát" },

  { value: "Nam | 65 | Gói khám | Tim mạch", searchBy: "nam_65_tim_mach", group: "Gói khám" },
  { value: "Nam | 65 | Gói dược | Tim mạch", searchBy: "nam_65_tim_mach", group: "Gói dược" },
  { value: "Nam | 65 | Gói gene | Tim mạch", searchBy: "nam_65_tim_mach", group: "Gói gene" },
  { value: "Nam | 65 | Gói dinh dưỡng | Tim mạch", searchBy: "nam_65_tim_mach", group: "Gói dinh dưỡng" },
  { value: "Nam | 65 | Gói Vaccine | Tim mạch", searchBy: "nam_65_tim_mach", group: "Gói vaccine" },
  { value: "Nam | 65 | Tầm soát | Tim mạch", searchBy: "nam_65_tim_mach", group: "Tầm soát" },

  { value: "Nữ | 65 | Gói khám | Tim mạch", searchBy: "nam_65_tim_mach", group: "Gói khám" },
  { value: "Nữ | 65 | Gói dược | Tim mạch", searchBy: "nam_65_tim_mach", group: "Gói dược" },
  { value: "Nữ | 65 | Gói gene | Tim mạch", searchBy: "nam_65_tim_mach", group: "Gói gene" },
  { value: "Nữ | 65 | Gói dinh dưỡng | Tim mạch", searchBy: "nam_65_tim_mach", group: "Gói dinh dưỡng" },
  { value: "Nữ | 65 | Gói Vaccine | Tim mạch", searchBy: "nam_65_tim_mach", group: "Gói vaccine" },
  { value: "Nữ | 65 | Tầm soát | Tim mạch", searchBy: "nam_65_tim_mach", group: "Tầm soát" },

  { value: "Nam | 65 | Gói khám | Thận - tiết niệu", searchBy: "nam_65_than_tiet_nieu", group: "Gói khám" },
  { value: "Nam | 65 | Gói dược | Thận - tiết niệu", searchBy: "nam_65_than_tiet_nieu", group: "Gói dược" },
  { value: "Nam | 65 | Gói gene | Thận - tiết niệu", searchBy: "nam_65_than_tiet_nieu", group: "Gói gene" },
  { value: "Nam | 65 | Gói dinh dưỡng | Thận - tiết niệu", searchBy: "nam_65_than_tiet_nieu", group: "Gói dinh dưỡng" },
  { value: "Nam | 65 | Gói Vaccine | Thận - tiết niệu", searchBy: "nam_65_than_tiet_nieu", group: "Gói vaccine" },
  { value: "Nam | 65 | Tầm soát | Thận - tiết niệu", searchBy: "nam_65_than_tiet_nieu", group: "Tầm soát" },

  { value: "Nữ | 65 | Gói khám | Thận - tiết niệu", searchBy: "nu_65_than_tiet_nieu", group: "Gói khám" },
  { value: "Nữ | 65 | Gói dược | Thận - tiết niệu", searchBy: "nu_65_than_tiet_nieu", group: "Gói dược" },
  { value: "Nữ | 65 | Gói gene | Thận - tiết niệu", searchBy: "nu_65_than_tiet_nieu", group: "Gói gene" },
  { value: "Nữ | 65 | Gói dinh dưỡng | Thận - tiết niệu", searchBy: "nu_65_than_tiet_nieu", group: "Gói dinh dưỡng" },
  { value: "Nữ | 65 | Gói Vaccine | Thận - tiết niệu", searchBy: "nu_65_than_tiet_nieu", group: "Gói vaccine" },
  { value: "Nữ | 65 | Tầm soát | Thận - tiết niệu", searchBy: "nu_65_than_tiet_nieu", group: "Tầm soát" },

  { value: "Nam | 65 | Gói khám | Cơ xương khớp", searchBy: "nam_65_co_xuong_khop", group: "Gói khám" },
  { value: "Nam | 65 | Gói dược | Cơ xương khớp", searchBy: "nam_65_co_xuong_khop", group: "Gói dược" },
  { value: "Nam | 65 | Gói gene | Cơ xương khớp", searchBy: "nam_65_co_xuong_khop", group: "Gói gene" },
  { value: "Nam | 65 | Gói dinh dưỡng | Cơ xương khớp", searchBy: "nam_65_co_xuong_khop", group: "Gói dinh dưỡng" },
  { value: "Nam | 65 | Gói Vaccine | Cơ xương khớp", searchBy: "nam_65_co_xuong_khop", group: "Gói vaccine" },
  { value: "Nam | 65 | Tầm soát | Cơ xương khớp", searchBy: "nam_65_co_xuong_khop", group: "Tầm soát" },

  { value: "Nữ | 65 | Gói khám | Cơ xương khớp", searchBy: "nu_65_co_xuong_khop", group: "Gói khám" },
  { value: "Nữ | 65 | Gói dược | Cơ xương khớp", searchBy: "nu_65_co_xuong_khop", group: "Gói dược" },
  { value: "Nữ | 65 | Gói gene | Cơ xương khớp", searchBy: "nu_65_co_xuong_khop", group: "Gói gene" },
  { value: "Nữ | 65 | Gói dinh dưỡng | Cơ xương khớp", searchBy: "nu_65_co_xuong_khop", group: "Gói dinh dưỡng" },
  { value: "Nữ | 65 | Gói Vaccine | Cơ xương khớp", searchBy: "nu_65_co_xuong_khop", group: "Gói vaccine" },
  { value: "Nữ | 65 | Tầm soát | Cơ xương khớp", searchBy: "nu_65_co_xuong_khop", group: "Tầm soát" },

  { value: "Nam | 65 | Gói khám | Nội tiết/ chuyển hoá", searchBy: "nam_65_tiet_chuyen_hoa", group: "Gói khám" },
  { value: "Nam | 65 | Gói dược | Nội tiết/ chuyển hoá", searchBy: "nam_65_tiet_chuyen_hoa", group: "Gói dược" },
  { value: "Nam | 65 | Gói gene | Nội tiết/ chuyển hoá", searchBy: "nam_65_tiet_chuyen_hoa", group: "Gói gene" },
  { value: "Nam | 65 | Gói dinh dưỡng | Nội tiết/ chuyển hoá", searchBy: "nam_65_tiet_chuyen_hoa", group: "Gói dinh dưỡng" },
  { value: "Nam | 65 | Gói Vaccine | Nội tiết/ chuyển hoá", searchBy: "nam_65_tiet_chuyen_hoa", group: "Gói vaccine" },
  { value: "Nam | 65 | Tầm soát | Nội tiết/ chuyển hoá", searchBy: "nam_65_tiet_chuyen_hoa", group: "Tầm soát" },

  { value: "Nữ | 65 | Gói khám | Nội tiết/ chuyển hoá", searchBy: "nu_65_tiet_chuyen_hoa", group: "Gói khám" },
  { value: "Nữ | 65 | Gói dược | Nội tiết/ chuyển hoá", searchBy: "nu_65_tiet_chuyen_hoa", group: "Gói dược" },
  { value: "Nữ | 65 | Gói gene | Nội tiết/ chuyển hoá", searchBy: "nu_65_tiet_chuyen_hoa", group: "Gói gene" },
  { value: "Nữ | 65 | Gói dinh dưỡng | Nội tiết/ chuyển hoá", searchBy: "nu_65_tiet_chuyen_hoa", group: "Gói dinh dưỡng" },
  { value: "Nữ | 65 | Gói Vaccine | Nội tiết/ chuyển hoá", searchBy: "nu_65_tiet_chuyen_hoa", group: "Gói vaccine" },
  { value: "Nữ | 65 | Tầm soát | Nội tiết/ chuyển hoá", searchBy: "nu_65_tiet_chuyen_hoa", group: "Tầm soát" },

  { value: "Nam | 65 | Gói khám | Tiêu hóa", searchBy: "nam_65_tieu_hoa", group: "Gói khám" },
  { value: "Nam | 65 | Gói dược | Tiêu hóa", searchBy: "nam_65_tieu_hoa", group: "Gói dược" },
  { value: "Nam | 65 | Gói gene | Tiêu hóa", searchBy: "nam_65_tieu_hoa", group: "Gói gene" },
  { value: "Nam | 65 | Gói dinh dưỡng | Tiêu hóa", searchBy: "nam_65_tieu_hoa", group: "Gói dinh dưỡng" },
  { value: "Nam | 65 | Gói Vaccine | Tiêu hóa", searchBy: "nam_65_tieu_hoa", group: "Gói vaccine" },
  { value: "Nam | 65 | Tầm soát | Tiêu hóa", searchBy: "nam_65_tieu_hoa", group: "Tầm soát" },

  { value: "Nữ | 65 | Gói khám | Tiêu hóa", searchBy: "nu_65_tieu_hoa", group: "Gói khám" },
  { value: "Nữ | 65 | Gói dược | Tiêu hóa", searchBy: "nu_65_tieu_hoa", group: "Gói dược" },
  { value: "Nữ | 65 | Gói gene | Tiêu hóa", searchBy: "nu_65_tieu_hoa", group: "Gói gene" },
  { value: "Nữ | 65 | Gói dinh dưỡng | Tiêu hóa", searchBy: "nu_65_tieu_hoa", group: "Gói dinh dưỡng" },
  { value: "Nữ | 65 | Gói Vaccine | Tiêu hóa", searchBy: "nu_65_tieu_hoa", group: "Gói vaccine" },
  { value: "Nữ | 65 | Tầm soát | Tiêu hóa", searchBy: "nu_65_tieu_hoa", group: "Tầm soát" },
];

export default CustomersForm
