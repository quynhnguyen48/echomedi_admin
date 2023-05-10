import { yupResolver } from "@hookform/resolvers/yup"
import classNames from "classnames"
import { useCallback, useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import * as yup from "yup"

import Button from "components/Button"
import Datepicker from "components/Datepicker"
import Input from "components/Input"
import Select from "components/Select"
import dayjs from "dayjs"
import { toast } from "react-toastify"
import { getTreatments } from "services/api/treatment"
import { getListUsers } from "services/api/users"
import { formatStrapiArr } from "utils/strapi"
import { BOOKING_STATUS } from "constants/Booking"
import { WEEKS } from "constants/Dates"
import { createBooking, updateBooking } from "services/api/bookings"
import { getListStaffs } from "services/api/staff"
import { getErrorMessage } from "utils/error"

const BookingForm = ({ data }) => {
  const navigate = useNavigate()
  const [loadingCustomers, setLoadingCustomers] = useState(false)
  const [loadingStaffs, setLoadingStaffs] = useState(false)
  const [loading, setLoading] = useState(false)
  const [customersData, setCustomersData] = useState([])
  const [staffsData, setStaffsData] = useState([])
  const [treatments, setTreatments] = useState([])

  const validationSchema = yup.object({
    user: yup.object().required("Customer ID is required").nullable(),
    // treatment: yup.object().nullable().required("Treatment is required").nullable(),
    bookingDate: yup
      .date()
      .required("Booking Date is required")
      .typeError("Booking wrong format")
      .nullable(),
    // timeSession: yup.string().required("Time Session is required"),
    scheduleTreatmentTimes: yup.number(),
    timeRange: yup.number(),
    note: yup.string(),
    staff: yup.object().required("Staff is required").nullable(),
  })

  const {
    handleSubmit,
    control,
    setValue,
    getValues,
    clearErrors,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      code: data?.code || "",
      user: data?.user || null,
      treatment: data?.treatment || null,
      bookingDate: data?.bookingDate ? new Date(data?.bookingDate) : null,
      timeSession: data?.timeSession || "",
      note: data?.note || "",
      staff: data?.staff || null,
    },
  })

  useEffect(() => {
    ;(async () => {
      try {
        setLoadingStaffs(true)
        const res = await getListStaffs()
        if (res?.data) {
          setStaffsData(
            res.data?.map((customer) => ({
              value: customer?.id,
              label: `${customer?.firstName} ${customer?.lastName} (${customer?.code})`,
            }))
          )
        }
      } catch (error) {
        toast.error(getErrorMessage(error))
      } finally {
        setLoadingStaffs(false)
      }
    })()
  }, [])

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

  useEffect(() => {
    ;(async () => {
      try {
        const res = await getTreatments({ pageSize: 1000 })
        if (res.data) {
          setTreatments(formatStrapiArr(res.data))
        }
      } catch (error) {
        toast.error(getErrorMessage(error))
      }
    })()
  }, [])

  useEffect(() => {
    if (!!data) {
      handleSearchCustomer(data?.user?.code)
    }
  }, [data, handleSearchCustomer])

  const filterBookingDate = (date) => {
    const treatmentSelected = treatments.find(
      (treatment) => treatment.id === getValues("treatment")?.id
    )
    const treatmentDateNumber = treatmentSelected?.timeSession?.date.map(
      (item) => WEEKS.find((w) => w.name === item).number
    )
    const day = dayjs(date).day()
    return treatmentDateNumber?.includes(day)
  }

  const onSubmit = async (formData) => {
    try {
      setLoading(true)
      if (data?.id) {
        await updateBooking(data.id, formData)
      } else {
        const payload = {
          ...formData,
          status: BOOKING_STATUS.ON_SCHEDULED,
          createdByAdmin: true,
        }
        delete payload.timeRange
        if (formData.scheduleTreatmentTimes && formData.timeRange) {
          for (let i = 0; i < formData.scheduleTreatmentTimes; i++) {
            await createBooking({
              ...payload,
              treatmentTime: i + 1,
              bookingDate: dayjs(new Date(formData.bookingDate))
                .add(i * formData.timeRange, "days")
                .format(),
            })
          }
        } else {
          await createBooking(payload)
        }
      }
      toast.success(`Booking ${data?.id ? "updated" : "created"} successfully!`)
      navigate(-1)
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
          {data && (
            <Controller
              name="code"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Input
                  onChange={onChange}
                  value={value}
                  name="code"
                  label="Booking ID"
                  placeholder="Booking ID"
                  disabled
                />
              )}
            />
          )}
          <Controller
            name="user"
            control={control}
            render={({ field: { value } }) => (
              <Select
                onChange={(e) => {
                  setValue(
                    "user",
                    { id: e.value },
                    {
                      shouldValidate: true,
                      shouldDirty: true,
                    }
                  )
                }}
                onInputChange={handleSearchCustomer}
                value={value && customersData.find((customer) => customer.value === value.id)}
                name="user"
                label="Customer"
                placeholder="Select Customer"
                isLoading={loadingCustomers}
                options={customersData}
                errors={errors?.user?.message}
              />
            )}
          />
          {/* <Controller
            name="treatment"
            control={control}
            render={({ field: { value } }) => {
              const treatmentMapped = treatments?.map((treatment) => ({
                value: treatment.id,
                label: treatment.name,
              }))
              return (
                <Select
                  placeholder="Select Treatment"
                  label="Treatment"
                  name="treatment"
                  onChange={(e) => {
                    setValue(
                      "treatment",
                      { id: e.value },
                      {
                        shouldValidate: true,
                        shouldDirty: true,
                      }
                    )
                  }}
                  value={value && treatmentMapped.find((treatment) => treatment.value === value.id)}
                  options={treatmentMapped}
                  errors={errors?.treatment?.message}
                />
              )
            }}
          /> */}
          <Controller
            name="bookingDate"
            control={control}
            render={({ field: { value } }) => (
              <Datepicker
                value={value}
                label="Date"
                placeholder="Select Date"
                errors={errors?.bookingDate?.message}
                onChange={(date) => {
                  setValue("bookingDate", date, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }}
                // filterDate={filterBookingDate}
                minDate={new Date()}
              />
            )}
          />
        </div>

        {getValues("treatment")?.id && (
          <div className="space-y-2">
            <label className="font-16 font-bold">Time Session</label>
            <div>
              <Controller
                name="timeSession"
                control={control}
                render={({ field: { value } }) => (
                  <>
                    <div className="flex flex-wrap gap-2">
                      {treatments
                        .find((t) => t.id === getValues("treatment")?.id)
                        ?.timeSession?.time?.map((session) => {
                          const isActive =
                            value?.replaceAll(" ", "") === session?.replaceAll(" ", "")
                          return (
                            <Button
                              key={session}
                              type="button"
                              className={classNames("w-38.5 h-14 px-6 capitalize", {
                                "bg-primary text-white font-bold": isActive,
                                "bg-white text-secondary/30 font-normal": !isActive,
                              })}
                              onClick={() => {
                                setValue("timeSession", session)
                                clearErrors("timeSession")
                              }}
                            >
                              {session}
                            </Button>
                          )
                        })}
                    </div>
                    {errors?.timeSession?.message && (
                      <span className="text-12 text-error mt-1">
                        {errors?.timeSession?.message}
                      </span>
                    )}
                  </>
                )}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-6">
          <Controller
            name="scheduleTreatmentTimes"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Input
                name="scheduleTreatmentTimes"
                label="Schedule in Progress"
                placeholder="Input Treatment Times"
                value={value}
                onChange={onChange}
              />
            )}
          />
          <Controller
            name="timeRange"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Input
                name="timeRange"
                label="Time Range"
                placeholder="Input Time Range"
                value={value}
                onChange={onChange}
              />
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <Controller
            name="note"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Input
                name="note"
                label="Note"
                placeholder="Note"
                value={value}
                onChange={onChange}
                errors={errors?.note?.message}
              />
            )}
          />
          <Controller
            name="staff"
            control={control}
            render={({ field: { value } }) => (
              <Select
                onChange={(e) => {
                  setValue(
                    "staff",
                    { id: e?.value },
                    {
                      shouldValidate: true,
                      shouldDirty: true,
                    }
                  )
                }}
                value={value && staffsData.find((staff) => staff.value === value.id)}
                name="staff"
                label="Staff"
                placeholder="Staff"
                isLoading={loadingStaffs}
                options={staffsData}
                errors={errors?.staff?.message}
              />
            )}
          />
        </div>
      </div>

      <div className="flex gap-x-4 mt-10">
        <Button className="fill-primary" type="submit" loading={loading}>
          Save
        </Button>
        <Button
          btnType="outline"
          type="reset"
          onClick={(e) => {
            navigate(-1)
          }}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}

export default BookingForm
