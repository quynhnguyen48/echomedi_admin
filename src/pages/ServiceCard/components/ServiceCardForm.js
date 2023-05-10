import { yupResolver } from "@hookform/resolvers/yup"
import { useCallback, useEffect, useState } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import * as yup from "yup"
import dayjs from "dayjs"

import Button from "components/Button"
import Input from "components/Input"
import Select from "components/Select"
import { CARD_STATUS, CARD_TYPE } from "constants/Card"
import { toast } from "react-toastify"
import { createNewCard, updateCard } from "services/api/card"
import { getTreatments } from "services/api/treatment"
import { getListUsers } from "services/api/users"
import { getErrorMessage } from "utils/error"
import { formatStrapiArr, formatStrapiObj } from "utils/strapi"
import { createNewTransaction } from "services/api/transactions"
import { BILLING_TYPE, PAYMENT_METHOD, TRANSACTION_TYPE } from "constants/Transaction"
import Datepicker from "components/Datepicker"
import Icon from "components/Icon"
import { createBooking } from "services/api/bookings"
import classNames from "classnames"
import { getListStaffs } from "services/api/staff"
import { BOOKING_STATUS } from "constants/Booking"

const ServiceCardForm = ({ data }) => {
  const navigate = useNavigate()

  const [loadingCustomers, setLoadingCustomers] = useState(false)
  const [customersData, setCustomersData] = useState([])
  const [treatments, setTreatments] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [staffsData, setStaffsData] = useState([])
  const [loadingStaffs, setLoadingStaffs] = useState(false)

  const currentUser = useSelector((state) => state.user.currentUser)

  const validationSchema = yup.object({
    user: yup.object().required().typeError("Customer is required"),
    service: yup.object().required().typeError("Treatment is required"),
    expiredDate: yup.date().nullable(),
    usageLimit: yup
      .string()
      .trim()
      .matches(/^[0-9]*$/, "Usage limit value is not in correct format")
      .required("Usage limit value is required"),
    isAutoBooking: yup.bool(),
    timeRange: yup.number(),
    timeSession: yup.string(),
    note: yup.string(),
    staff: yup.object().nullable(),
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
      user: data?.user?.id
        ? {
            value: data?.user?.id,
            label: `${data?.user?.firstName} ${data?.user?.lastName} (${data?.user?.code})`,
          }
        : null,
      code: data?.code || "",
      service: data?.service?.id
        ? {
            value: data?.service?.id,
            label: data?.service?.name,
          }
        : null,
      usageLimit: data?.usageLimit || "",
      expiredDate: data?.expiredDate ? dayjs(data?.expiredDate, "YYYY-MM-DD").toDate() : null,
      isAutoBooking: false,
      timeSession: data?.timeSession || "",
      note: data?.note || "",
      staff: data?.staff || null,
    },
  })

  const isAutoBooking = useWatch({ control: control, name: "isAutoBooking" })

  const onSubmit = async (values) => {
    const {
      user,
      service,
      expiredDate,
      isAutoBooking,
      timeRange,
      timeSession,
      note,
      staff,
      ...rest
    } = values
    const payload = {
      ...rest,
      user: {
        id: parseInt(user.value),
      },
      service: {
        id: parseInt(service.value),
      },
      expiredDate: expiredDate ? dayjs(expiredDate).startOf("day").format("YYYY-MM-DD") : null,
    }

    if (data?.id) {
      try {
        setIsLoading(true)
        const res = await updateCard(data?.id, payload)
        if (res) {
          toast.success("Saved successfully")
          navigate("/service-card")
        }
      } catch (error) {
        toast.error(getErrorMessage(error))
      } finally {
        setIsLoading(false)
      }
    } else {
      try {
        setIsLoading(true)
        const cardRes = await createNewCard({
          ...payload,
          remainValue: payload.usageLimit,
          usageLimit: payload.usageLimit,
          type: CARD_TYPE.SERVICE_CARD,
          status: CARD_STATUS.ACTIVE,
          staff: {
            id: currentUser?.id,
          },
        })
        if (cardRes) {
          const newCardData = formatStrapiObj(cardRes.data)
          const treatment = treatments.find((item) => item.id === payload.service.id)
          if (treatment) {
            // create booking if isAutoBooking = true
            if (isAutoBooking && timeRange) {
              for (let i = 0; i < payload.usageLimit; i++) {
                await createBooking({
                  user: {
                    id: parseInt(user.value),
                  },
                  treatment: {
                    id: parseInt(service.value),
                  },
                  timeSession,
                  note,
                  staff,
                  treatmentTime: i + 1,
                  scheduleTreatmentTimes: payload.usageLimit,
                  bookingDate: dayjs()
                    .add(i * timeRange, "days")
                    .format(),
                  status: BOOKING_STATUS.ON_SCHEDULED,
                  createdByAdmin: true,
                })
              }
            }
            // create transaction
            const subTotal = parseInt(treatment.price) * parseInt(payload.usageLimit)
            await createNewTransaction({
              card: { id: newCardData?.id },
              user: payload.user,
              treatment: {
                id: parseInt(service.value),
              },
              paymentMethod: PAYMENT_METHOD.BANK_TRANSFER,
              billingType: BILLING_TYPE.SERVICE_CARD,
              type: TRANSACTION_TYPE.EXPENSE,
              amount: payload.usageLimit,
              subTotal: subTotal,
              vat: 0,
              total: subTotal,
              purchase: subTotal,
              debtBalance: 0,
              change: 0,
            })
            toast.success("Created successfully")
            navigate("/service-card")
          }
        }
      } catch (error) {
        toast.error(getErrorMessage(error))
      } finally {
        setIsLoading(false)
      }
    }
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

  useEffect(() => {
    ;(async () => {
      try {
        const res = await getTreatments({ pageSize: 1000 })
        if (res.data) {
          setTreatments(formatStrapiArr(res.data))
        }
      } catch (error) {
      } finally {
      }
    })()
  }, [])

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

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          {data && (
            <Controller
              name="code"
              control={control}
              rules={{ required: true }}
              render={({ field: { onChange, value } }) => (
                <Input
                  onChange={onChange}
                  value={value}
                  disabled
                  name="code"
                  label="Card ID"
                  placeholder="Card Id"
                  errors={errors?.code?.message}
                  showError={errors?.code}
                />
              )}
            />
          )}

          <Controller
            name="user"
            control={control}
            rules={{ required: true }}
            render={({ field: { onChange, value } }) => (
              <Select
                onChange={(e) => {
                  setValue("user", e, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }}
                onInputChange={handleSearchCustomer}
                value={value}
                name="user"
                label="Customer"
                placeholder="Select Customer"
                isLoading={loadingCustomers}
                options={customersData}
                errors={errors?.user?.message}
              />
            )}
          />

          <Controller
            name="service"
            control={control}
            rules={{ required: true }}
            render={({ field: { onChange, value } }) => (
              <Select
                placeholder="Select Treatment"
                label="Treatment"
                name="service"
                onChange={(e) => {
                  setValue("service", e, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }}
                value={value}
                options={treatments?.map((treatment) => ({
                  value: treatment.id,
                  label: treatment.name,
                }))}
                errors={errors?.service?.message}
              />
            )}
          />
          <Controller
            name="usageLimit"
            control={control}
            rules={{ required: true }}
            render={({ field: { onChange, value } }) => (
              <Input
                onChange={onChange}
                value={value}
                name="usageLimit"
                label="Usage Limit"
                placeholder="Input Usage Limit"
                errors={errors?.usageLimit?.message}
              />
            )}
          />
          <Controller
            name="expiredDate"
            control={control}
            render={({ field: { value } }) => (
              <Datepicker
                value={value}
                label="Expired Date"
                placeholder="Select Date"
                errors={errors?.expiredDate?.message}
                onChange={(date) => {
                  setValue("expiredDate", date, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }}
                minDate={new Date()}
              />
            )}
          />
          <div>
            <label className="inline-block text-16 font-bold mb-2" htmlFor="isAutoBooking">
              Auto Create Booking
            </label>
            <Controller
              name="isAutoBooking"
              control={control}
              render={({ field: { onChange, value } }) => (
                <button
                  type="button"
                  className="bg-white flex px-6 py-4 w-full rounded-lg"
                  onClick={() => setValue("isAutoBooking", !value)}
                >
                  <Icon
                    name={value ? "check" : "uncheck"}
                    className={value ? "fill-primary" : "fill-uncheck"}
                  />
                  <span className="ml-4 font-16">Auto Booking</span>
                </button>
              )}
            />
          </div>

          <Controller
            name="timeRange"
            control={control}
            rules={{ required: true }}
            render={({ field: { onChange, value } }) => (
              <Input
                disabled={!isAutoBooking}
                onChange={onChange}
                value={value}
                name="timeRange"
                label="Time Range"
                placeholder="Enter time range"
                errors={errors?.timeRange?.message}
              />
            )}
          />
          {isAutoBooking && (
            <>
              {getValues("service")?.value && (
                <div className="space-y-2 col-span-2">
                  <label className="font-16 font-bold">Time Session</label>
                  <div>
                    <Controller
                      name="timeSession"
                      control={control}
                      render={({ field: { value } }) => (
                        <>
                          <div className="flex flex-wrap gap-2">
                            {treatments
                              .find((t) => t.id === getValues("service")?.value)
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
            </>
          )}
        </div>
      </div>

      <div className="flex gap-x-4 mt-10">
        <Button className="fill-primary" type="submit" loading={isLoading}>
          Save
        </Button>
        <Button btnType="outline" type="reset" onClick={() => navigate("/service-card")}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

export default ServiceCardForm
