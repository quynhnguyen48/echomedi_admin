import { useCallback, useEffect, useState, useRef } from "react"
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
import { createNewPatient, getListPatients, getPatientByPhone } from "services/api/patient";
import { createBookingWithPatient, updateBookingWithPatient, } from "services/api/bookings";
import { randomPassword } from "utils/string"
import { getErrorMessage } from "utils/error"
import moment from 'moment';
import { BRANCH } from "constants/Authentication"
import dayjs from 'dayjs';
import Tagify from '@yaireo/tagify'
import '@yaireo/tagify/dist/tagify.css' // imports tagify SCSS file from within

const bookingStatus = ["scheduled", "confirmed", "waiting", "postpone", "finished", "cancelled"];
const getColorBookingStatus = (t) => {
  switch (t) {
    case "scheduled":
      return "red"
      break;
    case "confirmed":
      return "blue"
      break;
    case "finished":
      return "grey"
      break;
    case "cancelled":
      return "Huỷ"
      break;
    case "postpone": 
      return "Hoãn lịch"
      break;
    case "waiting":
      return "Đã đến"
      break;
  }
  return "";
}

const translate = (t) => {
  switch (t) {
    case "scheduled":
      return "Đặt lịch"
      break;
    case "confirmed":
      return "Đã xác nhận"
      break;
    case "finished":
      return "Hoàn thành"
      break;
    case "cancelled":
      return "Huỷ"
      break;
    case "postpone": 
      return "Hoãn lịch"
      break;
    case "waiting":
      return "Đã đến"
      break;
  }
}


const CustomersForm = ({ data, createNewPatient, updateBooking, fromCheckIn, onUpdateGuestUserCheckin, onCloseModal, onClose }) => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [districtList, setDistrictList] = useState([])
  const [wardList, setWardList] = useState([])
  const [loadingCustomers, setLoadingCustomers] = useState(false)
  const [customersData, setCustomersData] = useState([])
  const [bookingHour, setBookingHour] = useState("");
  const [bookingDate, setBookingDate] = useState(null);
  const [readonly, setReadonly] = useState(false);
  const inputElement = useRef();

  useEffect(() => {
  }, [inputElement]);

  useEffect(() => {
    if (data.start) {
      let bd = new Date(data.start);
      if (bd.getMinutes() == 15) {
        bd.setMinutes(0);
      }
      if (bd.getMinutes() == 45) {
        bd.setMinutes(30);
      }
      setBookingDate(bd);
      setBookingHour({ label: moment(bd).format('H:mm'), value: moment(bd).format('H:mm') })
    }

    const newReadonly = !!data.medical_record?.id;
    setReadonly(newReadonly);
  }, [data])

  const validationSchema = yup.object({
    // email: yup
    //   .string()
    //   .trim()
      // .when([], {
      //   is: () => !getValues("user"),
      //   then: yup.string().trim().required('email is required').matches(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/g, "Email is not in correct format"),
      //   otherwise: yup.string().notRequired(),
      // }),
    // .required("Email is required")
    // .matches(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/g, "Email is not in correct format"),
    full_name: yup.string()
      .when([], {
        is: () => !getValues("user"),
        then: yup.string().trim().required('Fullname is required'),
        otherwise: yup.string().notRequired(),
      }),
    // .required("Fullname is required"),
    phone: yup
      .string()
      .trim()
      .when([], {
        is: () => !getValues("user"),
        then: yup.string().trim(),
        otherwise: yup.string().notRequired(),
      }),
    // address: yup.object({
    //   province: yup.object().required("City is required").nullable(),
    //   district: yup.object().required("District is required").nullable(),
    //   ward: yup.object().required("Ward is required").nullable(),
    //   address: yup.string().required("Address is required"),
    // }).when([], {
    //   is: () => !getValues("user"),
    //   then: yup.object().required('Fullname is required'),
    //   otherwise: yup.object().notRequired(),
    // }),
    // birthday: yup.date().typeError("Date of birth is required").when([], {
    //   is: () => !getValues("user"),
    //   then: yup.date().required(),
    //   otherwise: yup.date().notRequired(),
    // }),
    // birthday: yup.date().notRequired(),
    gender: yup.string().when([], {
      is: () => !getValues("user"),
      then: yup.string().required(),
      otherwise: yup.string().notRequired(),
    }),
    status: yup.string().when([], {
      is: () => !getValues("user"),
      then: yup.string().required(),
      otherwise: yup.string().notRequired(),
    }),
  })

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

  const {
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      email: data?.patient?.email || "",
      full_name: data?.patient?.full_name || "",
      gender: data?.patient?.gender || "",
      phone: data?.patient?.phone || "",
      status: data?.status || "",
      note: data?.note || "",
      birthday: !!data?.patient?.birthday ? new Date(data?.patient?.birthday) : null,
      address: {
        province: data?.patient?.address?.province || null,
        district: data?.patient?.address?.district || null,
        ward: data?.patient?.address?.ward || null,
        address: data?.patient?.address?.address || "",
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

  const provinceFormatted = () => {
    return provincesList.map((province) => ({
      value: province.id,
      label: province.name,
    }))
  }

  const handleSearchCustomerByPhone = (e) => {
    const toastId = toast.loading("Tìm khách hàng")
    getPatientByPhone(e.target.value)
      .then((res) => {
        if (res.data) {
          setValue("patient", 0);
          setValue(
            "user", res.data,
            { shouldDirty: true, shouldValidate: true }
          )
          setCustomersData([{
            value: res.data.id,
            label: `${res.data?.uid} | ${res.data?.full_name} | ${res.data?.phone}`,
            }])
        }
        setLoadingCustomers(false)
      })
      .catch(() => {
        setLoadingCustomers(false)
      })
      .then(() => {
        toast.dismiss(toastId);
      });
  }

  const handleSearchCustomer = useCallback((value) => {
    if (!value) return
    setLoadingCustomers(true)
    getListPatients(
      {
        pageSize: 100,
        page: 0,
      },
      {
        $or: [
          { uid: { $containsi: value } },
          { phone: { $containsi: value } },
          { full_name_i: { $containsi: removeVietnameseTones(value) } },
        ],
      }
    )
      .then((res) => {
        if (res.data) {
          setCustomersData(
            res.data.data?.map((customer) => ({
              value: customer,
              label: `${customer?.attributes?.uid} | ${customer?.attributes?.full_name} | ${customer?.attributes?.phone}`,
            }))
          )
        }
        setLoadingCustomers(false)
      })
      .catch(() => {
        setLoadingCustomers(false)
      })
  }, [])

  const mergeDateAndHour = (date, hour) => {
    const [h, m] = hour.split(":");
    date.setHours(parseInt(h));
    date.setMinutes(parseInt(m));
    return date;
  }

  const onSubmit = async (formData) => {
    try {
      setLoading(true);
      const payload = {
        ...formData,
        branch: localStorage.getItem(BRANCH),
        bookingDate: mergeDateAndHour(bookingDate, bookingHour.value),
        dontShowOnCalendar: false,
      }

      if (!!getValues("user")) {
        const payload = {
          ...formData,
          ...getValues("user"),
          branch: localStorage.getItem(BRANCH),
          bookingDate: mergeDateAndHour(bookingDate, bookingHour.value),
          dontShowOnCalendar: false,
          status: "scheduled",
          notify: true,
        }
        await createBookingWithPatient({ ...payload, type: "at_clinic", createNewPatient: false })
      } else if (updateBooking) {
        await updateBookingWithPatient({ ...payload, id: data.id, patient: data?.patient.id, createNewPatient })
      } else {
        await createBookingWithPatient({ ...payload, type: "at_clinic", createNewPatient })
      }

      onCloseModal()
      window.location.reload();
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  const loadBooking = () => {

  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-6">
        {!updateBooking && <Controller
          name="user"
          control={control}
          render={({ field: { value } }) => (
            <Select
              onChange={(e) => {
                setValue("patient", e.value.id);
                setValue(
                  "user", e.value.attributes,
                  { shouldDirty: true, shouldValidate: true }
                )
              }}
              onInputChange={handleSearchCustomer}
              value={value && customersData.find((customer) => customer.value === value.id)}
              name="user"
              label="Bệnh nhân"
              placeholder="Chọn bệnh nhân"
              isLoading={loadingCustomers}
              options={customersData}
              errors={errors?.user?.message}
            />
          )}
        />}
        {!updateBooking && <button type="button" onClick={() => setValue("user", null, { shouldDirty: true, shouldValidate: true })}>Bỏ chọn bệnh nhân có sẵn</button>}
        <div className="grid grid-cols-2 gap-6 my-4">
          <Controller
            name="bookingDate"
            control={control}
            render={({ field: { value, ref } }) => (
              <Datepicker
                disabled={readonly}
                label="Ngày đặt lịch"
                value={bookingDate}
                onChange={(date) => {
                  setBookingDate(date);
                }}
              // errors={errors?.birthday?.message}
              />
            )}
          />
          <Controller
            name="booking-hour"
            control={control}
            render={({ field: { value, ref } }) => (
              <Select
                isDisabled={readonly}
                placeholder="Khung giờ"
                label="Khung giờ"
                name="booking-hour"
                onChange={(e) => {
                  setBookingHour(e);
                }}
                value={bookingHour}
                options={bookingHours()}
              // errors={errors?.address?.province?.message}
              />
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-6">
          {/* {data && (
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
          )} */}
          <Controller
            name="email"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Input
                disabled={readonly || updateBooking || !!getValues("user")}
                onChange={onChange}
                value={getValues("user")?.email || value}
                name="email"
                label="Email"
                placeholder={"Nhập Email"}
                errors={errors?.email?.message}
                ref={inputElement}
              />
            )}
          />
          <Controller
            name="phone"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Input
                disabled={readonly || updateBooking || !!getValues("user")}
                onChange={onChange}
                
                value={getValues("user")?.phone || value}
                name="phone"
                label="Số điện thoại"
                onBlur={handleSearchCustomerByPhone}
                placeholder={"Nhập số điện thoại"}
                errors={errors?.phone?.message}
              />
            )}
          />
          <Controller
            name="full_name"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Input
                disabled={readonly || updateBooking || !!getValues("user")}
                onChange={onChange}
                value={getValues("user")?.full_name || value}
                name="full_name"
                label="Họ và tên"
                placeholder={"Nhập họ và tên"}
                errors={errors?.full_name?.message}
              />
            )}
          />
          {/* <Controller
            name="lastName"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Input
                onChange={onChange}
                value={value}
                name="lastName"
                label="Tên "
                placeholder="Nhập tên"
                errors={errors?.lastName?.message}
              />
            )}
          /> */}
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
                        disabled={readonly || updateBooking || !!getValues("user")}
                        key={gender}
                        onChange={onchange}
                        type="button"
                        className={classNames("w-full h-14 pl-6 !justify-start capitalize", {
                          "bg-primary text-white font-bold": (getValues("user")?.gender || value) === gender,
                          "bg-primary/10 text-primary font-normal": (getValues("user")?.gender || value) !== gender,
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
          <div className="space-y-2">
            <Controller
              name="birthday"
              control={control}
              render={({ field: { value, ref } }) => (
                <Datepicker
                  disabled={readonly || updateBooking || !!getValues("user")}
                  label="Ngày sinh"
                  value={getValues("user")?.birthday ? new Date(getValues("user")?.birthday) : value}
                  onChange={(date) => {
                    const newDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));
                    setValue("birthday", newDate)
                  }}
                  errors={errors?.birthday?.message}
                />
              )}
            />
          </div>
        </div>
        <div>
          <div className="w-full">
            <label className="font-16 font-bold">Trạng thái</label>
            <div className="grid grid-cols-4 gap-x-6 gap-y-2">
              <Controller
                name="status"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <>
                    {bookingStatus.map((status) => (
                      <Button
                        disabled={readonly}
                        key={status}
                        onChange={onchange}
                        type="button"
                        className={classNames("w-full h-14 pl-6 !justify-start capitalize", {
                          "bg-primary text-white font-bold": value === status,
                          "bg-primary/10 text-primary font-normal": value !== status,
                          "bg-[orange]": value === status && status === bookingStatus[0],
                          "bg-[green]": value === status && status === bookingStatus[1],
                          "bg-[blue]": value === status && status === bookingStatus[2],
                          "bg-[grey]": value === status && status === bookingStatus[3],
                          "bg-[purple]": value === status && status === bookingStatus[4],
                          "bg-[red]": value === status && status === bookingStatus[5],
                        })}
                        onClick={() => setValue("status", status)}
                      >
                        {translate(status)}
                      </Button>
                    ))}
                    {errors?.status?.message && (
                      <p className="text-12 text-error mt-1">{errors?.status?.message}</p>
                    )}
                  </>
                )}
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-x-6">
          <div className="w-full">
            <Controller
              name="address.province"
              control={control}
              render={({ field: { value, ref } }) => (
                <Select
                  isDisabled={readonly || updateBooking || !!getValues("user")}
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
                  value={(getValues("user")?.address?.province &&
                    { value: getValues("user")?.address.province.id, label: getValues("user")?.address.province.name }
                  )
                    || (value && { value: value?.id, label: value?.name })}
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
                  isDisabled={readonly || updateBooking || !getValues("address.province") || !!getValues("user")}
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
                  value={(getValues("user")?.address?.district &&
                    { value: getValues("user")?.address?.district.id, label: getValues("user")?.address.district.name }
                  )
                    || (value && { value: value?.id, label: value?.name })}
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
                  isDisabled={readonly || updateBooking || !getValues("address.district") || !!getValues("user")}
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
                  value={(getValues("user")?.address?.ward &&
                    { value: getValues("user")?.address?.ward.id, label: getValues("user")?.address.ward.name }
                  )
                    || (value && { value: value?.id, label: value?.name })}
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
              disabled={readonly || updateBooking || !!getValues("user")}
              name="address.address"
              label="Địa chỉ"
              placeholder={"Nhập địa chỉ"}
              value={getValues("user")?.address?.address || value}
              onChange={onChange}
              errors={errors?.address?.address?.message}
            />
          )}
        />

        <Controller
          name="note"
          control={control}
          render={({ field: { onChange, value } }) => (
            <Input
              disabled={false}
              name="note"
              label="Nội dung đặt lịch"
              placeholder={"Nhập nội dung đặt lịch"}
              value={getValues("user")?.note || value}
              onChange={onChange}
              // errors={errors?.address?.address?.message}
            />
          )}
        />

        {/* <a target="_blank" href={`https://maps.google.com/?q=${data.latitude},${data.longitude}`}>Vị trí</a> */}
        {data.latitude && data.longitude && <Button
                        type={"button"}
                        onClick={() => {
                          window.open(`https://maps.google.com/?q=${data.latitude},${data.longitude}`);
                        }}
                      >
                        Mở google maps vị trí
                      </Button>}

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
        {!data.medical_record && <Button className="fill-primary" type="submit" loading={loading}>
          Lưu
        </Button>}
        <Button
          btnType="outline"
          type="reset"
          onClick={() => (onCloseModal())}
        >
          Đóng
        </Button>
      </div>
    </form>
  )
}

export default CustomersForm


function removeVietnameseTones(str) {
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g,"a"); 
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g,"e"); 
  str = str.replace(/ì|í|ị|ỉ|ĩ/g,"i"); 
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g,"o"); 
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g,"u"); 
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g,"y"); 
  str = str.replace(/đ/g,"d");
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
  str = str.replace(/Đ/g, "D");
  // Some system encode vietnamese combining accent as individual utf-8 characters
  // Một vài bộ encode coi các dấu mũ, dấu chữ như một kí tự riêng biệt nên thêm hai dòng này
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // ̀ ́ ̃ ̉ ̣  huyền, sắc, ngã, hỏi, nặng
  str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // ˆ ̆ ̛  Â, Ê, Ă, Ơ, Ư
  // Remove extra spaces
  // Bỏ các khoảng trắng liền nhau
  str = str.replace(/ + /g," ");
  str = str.trim();
  // Remove punctuations
  // Bỏ dấu câu, kí tự đặc biệt
  str = str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g," ");
  return str;
}