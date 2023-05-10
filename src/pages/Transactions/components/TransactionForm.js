import { useCallback, useEffect, useMemo, useState } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import * as yup from "yup"
import { yupResolver } from "@hookform/resolvers/yup/dist/yup"
import sumBy from "lodash/sumBy"
import { useSelector } from "react-redux"
import dayjs from "dayjs"

import Button from "components/Button"
import Input from "components/Input"
import Select from "components/Select"
import Timer from "components/Timer"
import {
  BILLING_TYPE,
  BILLING_TYPE_TITLE,
  PAYMENT_METHOD,
  PAYMENT_METHOD_TITLE,
  TRANSACTION_CHECKIN_STATUS,
} from "constants/Transaction"
import { getErrorMessage } from "utils/error"
import { formatStrapiArr, formatStrapiObj } from "utils/strapi"
import { getTreatments } from "services/api/treatment"
import { getListOrders } from "services/api/orders"
import { getListCards } from "services/api/card"
import { getListStaffs } from "services/api/staff"
import { CARD_STATUS } from "constants/Card"
import { getListCheckinToday } from "services/api/checkin"
import TransactionBilling from "./TransactionBilling"
import { getUserDebt } from "services/api/transactions"
import SelectProductsModal from "components/SelectProductsModal"
import { isMobile } from "react-device-detect"

const TransactionForm = ({
  data,
  customerSelected,
  handleSave,
  isSubmittingForm = false,
  fromCheckin = false,
  onCloseModal, // for modal
}) => {
  const navigate = useNavigate()
  const [customersData, setCustomersData] = useState([])
  const [staffsData, setStaffsData] = useState([])
  const [loadingStaffs, setLoadingStaffs] = useState(false)

  const [treatmentsData, setTreatmentsData] = useState([])

  const [ordersData, setOrdersData] = useState([])

  const [loadingCards, setLoadingCards] = useState(false)
  const [cardsData, setCardsData] = useState([])
  const [moneyDiscountType, setMoneyDiscountType] = useState(true)
  const [showSelectProductsModal, setShowSelectProductsModal] = useState(false)

  const currentUser = useSelector((state) => state.user.currentUser)

  const validationSchema = yup.object({
    user: yup
      .object()
      .shape({
        value: yup.string(),
        label: yup.string(),
      })
      .nullable()
      .required("Customer ID is required"),
    billingType: yup
      .object()
      .shape({
        value: yup.string(),
        label: yup.string(),
      })
      .nullable()
      .required("Billing Type is required"),
    paymentMethod: yup
      .object()
      .shape({
        value: yup.string(),
        label: yup.string(),
      })
      .nullable(),
    note: yup.string(),
    treatment: yup
      .object()
      .shape({
        value: yup.string(),
        label: yup.string(),
      })
      .when("billingType", {
        is: BILLING_TYPE.TREATMENT,
        then: yup.object().required("Treatment is required"),
        otherwise: yup.object().nullable(),
      }),
    order: yup
      .object()
      .shape({
        value: yup.string(),
        label: yup.string(),
      })
      .nullable()
      .when("billingType", {
        is: BILLING_TYPE.ORDER,
        then: yup.object().required("Order is required"),
        otherwise: yup.object().nullable(),
      }),
    products: yup
      .array()
      .of(
        yup.object().shape({
          value: yup.string(),
          label: yup.string(),
        })
      )
      .nullable()
      .when("billingType", {
        is: BILLING_TYPE.TREATMENT,
        then: yup.array().required("Products is required"),
        otherwise: yup.array().nullable(),
      }),
    card: yup
      .object()
      .shape({
        value: yup.string(),
        label: yup.string(),
      })
      .nullable(),
    vat: yup.number(),
    subTotal: yup.number(),
    discount: yup.number(),
    purchase: yup.number(),
    staff: yup
      .object()
      .shape({
        value: yup.string(),
        label: yup.string(),
      })
      .nullable()
      .required("Staff is required"),
    extraStaff: yup
      .object()
      .shape({
        value: yup.string(),
        label: yup.string(),
      })
      .nullable(),
  })

  const {
    handleSubmit,
    control,
    setValue,
    clearErrors,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {},
  })

  const billingType = useWatch({ control, name: "billingType" })
  const paymentMethod = useWatch({ control, name: "paymentMethod" })
  const treatment = useWatch({ control, name: "treatment" })
  const user = useWatch({ control, name: "user" })
  const staff = useWatch({ control, name: "staff" })
  const discount = useWatch({ control, name: "discount" })
  const vat = useWatch({ control, name: "vat" })
  const subTotal = useWatch({ control, name: "subTotal" })
  const total = useWatch({ control, name: "total" })
  const purchase = useWatch({ control, name: "purchase" })
  const products = useWatch({ control, name: "products" })

  const paidBtnDisabled = () => {
    return !paymentMethod
  }

  useEffect(() => {
    reset({
      code: data?.code || "",
      user: data?.user?.id
        ? {
            value: data?.user?.id,
            label: `${data?.user?.firstName} ${data?.user?.lastName} (${data?.user?.code})`,
          }
        : null,
      billingType: data?.billingType
        ? {
            value: data?.billingType,
            label: BILLING_TYPE_TITLE[data?.billingType],
          }
        : "",
      paymentMethod: data?.paymentMethod
        ? {
            value: data?.paymentMethod,
            label: PAYMENT_METHOD_TITLE[data?.paymentMethod],
          }
        : "",
      treatment: data?.treatment?.id
        ? {
            value: data?.treatment?.id,
            label: data?.treatment?.name,
          }
        : null,
      order: data?.order?.id
        ? {
            value: data?.order?.id,
            label: data?.order?.code,
          }
        : null,
      card: data?.card?.id
        ? {
            value: data?.card?.id,
            label: data?.card?.code,
          }
        : null,
      products: data?.products || [],
      note: data?.note || "",
      total: data?.total || 0,
      subTotal: data?.subTotal || 0,
      discount: data?.discount || 0,
      vat: data?.vat || 0,
      purchase: data?.purchase || 0,
      debtBalance: data?.debtBalance || 0,
      change: data?.change || 0,
      staff: data?.staff?.id
        ? {
            value: data?.staff?.id,
            label: `${data?.staff?.firstName} ${data?.staff?.lastName} (${data?.staff?.code})`,
          }
        : null,
      extraStaff: data?.extraStaff?.id
        ? {
            value: data?.extraStaff?.id,
            label: `${data?.extraStaff?.firstName} ${data?.extraStaff?.lastName} (${data?.extraStaff?.code})`,
          }
        : null,
    })
  }, [reset, data])

  const getDuration = useMemo(() => {
    const treatmentInterval = data?.treatment?.interval?.split(":")
    const treatmentIntervalSeconds =
      parseInt(treatmentInterval?.[0]) * 3600 + parseInt(treatmentInterval?.[1]) * 60
    let durationTmp
    if (data?.status === TRANSACTION_CHECKIN_STATUS.PROGRESS) {
      durationTmp = dayjs(data?.startedTreatmentAt).diff(dayjs(new Date()), "second")
    } else {
      durationTmp = dayjs(data?.startedTreatmentAt).diff(dayjs(data?.endedTreatmentAt), "second")
    }
    return durationTmp + treatmentIntervalSeconds
  }, [data?.endedTreatmentAt, data?.startedTreatmentAt, data?.status, data?.treatment?.interval])

  const onSubmit = (formData, hasStatusAction = false, status) => {
    // handle form submission
    const {
      billingType,
      card,
      order,
      user,
      treatment,
      paymentMethod,
      subTotal = 0,
      discount = 0,
      vat = 0,
      purchase = 0,
      staff,
      extraStaff,
      ...rest
    } = formData
    const total = (subTotal - discount) * (1 + vat / 100)

    let payload = {
      ...rest,
      billingType: billingType.value,
      paymentMethod: paymentMethod?.value,
      card: card?.value
        ? {
            id: parseInt(card.value),
          }
        : null,
      order: order?.value ? parseInt(order.value) : null,
      treatment: treatment?.value
        ? {
            id: parseInt(treatment.value),
          }
        : null,
      user: {
        id: parseInt(user.value),
      },
      staff: staff
        ? {
            id: parseInt(staff.value),
          }
        : null,
      extraStaff: extraStaff
        ? {
            id: parseInt(extraStaff.value),
          }
        : null,
      subTotal,
      discount,
      vat,
      total,
      purchase,
      change:
        billingType.value === BILLING_TYPE.CARD_CANCELED
          ? 0
          : purchase >= total
          ? purchase - total
          : 0,
      debtBalance:
        billingType.value === BILLING_TYPE.DEBT_COLLECTION
          ? Math.min(purchase, total) * -1
          : billingType.value === BILLING_TYPE.CARD_CANCELED
          ? total
          : purchase < total
          ? total - purchase
          : 0,
    }
    if (hasStatusAction) {
      payload.status = status
      if (status === TRANSACTION_CHECKIN_STATUS.PROGRESS) {
        payload.startedTreatmentAt = new Date()
      }

      if (status === TRANSACTION_CHECKIN_STATUS.DONE) {
        payload.endedTreatmentAt = new Date()
      }
    }

    if (payload) {
      handleSave(payload)
    }
  }

  const billingTypeOptions = useMemo(() => {
    let billingTypes = Object.entries(BILLING_TYPE_TITLE)
    if (!data) {
      billingTypes = Object.entries(BILLING_TYPE_TITLE).filter(
        ([value, label]) => ![BILLING_TYPE.MEMBER_CARD, BILLING_TYPE.SERVICE_CARD].includes(value)
      )
    }

    return billingTypes.map(([value, label]) => ({
      value,
      label,
    }))
  }, [data])

  const paymentMethodOptions = useMemo(() => {
    let paymentMethods = Object.entries(PAYMENT_METHOD_TITLE)

    if (billingType?.value === BILLING_TYPE.CARD_CANCELED) {
      paymentMethods = paymentMethods.filter(([value, label]) =>
        [PAYMENT_METHOD.MEMBER_CARD, PAYMENT_METHOD.SERVICE_CARD].includes(value)
      )
    } else if (billingType?.value !== BILLING_TYPE.TREATMENT) {
      paymentMethods = paymentMethods.filter(
        ([value, label]) => value !== PAYMENT_METHOD.SERVICE_CARD
      )
    }

    return paymentMethods.map(([value, label]) => ({
      value,
      label,
    }))
  }, [billingType?.value])

  const fetchCheckInToday = useCallback(async () => {
    try {
      const res = await getListCheckinToday()
      const listCheckin = formatStrapiArr(res.data)
      setCustomersData(
        listCheckin
          ?.filter((checkin) => formatStrapiObj(checkin.user))
          .map((checkin) => formatStrapiObj(checkin.user))
          ?.map((user) => ({
            value: user?.id,
            label: `${user?.firstName} ${user?.lastName} (${user?.code})`,
          }))
      )
    } catch (error) {}
  }, [])

  useEffect(() => {
    ;(async () => {
      try {
        setLoadingStaffs(true)
        const res = await getListStaffs()
        if (res?.data) {
          setStaffsData(
            res.data?.map((staff) => ({
              value: staff?.id,
              label: `${staff?.firstName} ${staff?.lastName} (${staff?.code})`,
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

  useEffect(() => {
    ;(async () => {
      if (billingType?.value === BILLING_TYPE.TREATMENT) {
        try {
          const res = await getTreatments({ pageSize: 1000 })
          if (res.data) {
            setTreatmentsData(formatStrapiArr(res.data))
          }
        } catch (error) {
        } finally {
        }
      }
    })()
  }, [billingType?.value])

  useEffect(() => {
    ;(async () => {
      if (billingType?.value === BILLING_TYPE.ORDER && user?.value) {
        try {
          const res = await getListOrders(
            { pageSize: 1000 },
            {
              user: {
                id: {
                  $eq: user?.value,
                },
              },
            }
          )
          if (res.data) {
            setOrdersData(formatStrapiArr(res.data))
          }
        } catch (error) {
        } finally {
        }
      }
    })()
  }, [billingType?.value, user?.value])

  useEffect(() => {
    ;(async () => {
      if (
        (paymentMethod?.value &&
          [PAYMENT_METHOD.MEMBER_CARD, PAYMENT_METHOD.SERVICE_CARD].includes(
            paymentMethod?.value
          )) ||
        (billingType?.value &&
          [BILLING_TYPE.MEMBER_CARD, BILLING_TYPE.SERVICE_CARD].includes(billingType?.value))
      ) {
        setLoadingCards(true)
        let cardType = paymentMethod?.value
        if (
          billingType?.value &&
          [BILLING_TYPE.MEMBER_CARD, BILLING_TYPE.SERVICE_CARD].includes(billingType?.value)
        ) {
          cardType = billingType?.value
        }

        let filters = {
          type: {
            $eq: cardType,
          },
          status: {
            $eq: CARD_STATUS.ACTIVE,
          },
          $or: [
            {
              user: {
                id: {
                  $eq: user?.value,
                },
              },
            },
            {
              extraMembers: {
                member: { id: { $contains: user?.value } },
              },
            },
          ],
        }
        if (paymentMethod?.value === PAYMENT_METHOD.SERVICE_CARD && treatment?.value) {
          filters = {
            ...filters,
            service: {
              id: {
                $eq: treatment?.value,
              },
            },
          }
        }

        getListCards({ pageSize: 1000 }, filters)
          .then((res) => {
            if (res.data) {
              setCardsData(formatStrapiArr(res.data))
            }
            setLoadingCards(false)
          })
          .catch(() => {
            setLoadingCards(false)
          })
      }
    })()
  }, [billingType?.value, paymentMethod?.value, treatment?.value, user?.value])

  useEffect(() => {
    fetchCheckInToday()
  }, [fetchCheckInToday])

  useEffect(() => {
    if (fromCheckin) {
      setValue("user", {
        value: customerSelected?.id,
        label: `${customerSelected?.firstName} ${customerSelected?.lastName}`,
      })
    }
  }, [
    customerSelected?.firstName,
    customerSelected?.id,
    customerSelected?.lastName,
    fromCheckin,
    setValue,
  ])

  useEffect(() => {
    ;(async () => {
      if (billingType?.value === BILLING_TYPE.DEBT_COLLECTION && user?.value && !data?.status) {
        try {
          const res = await getUserDebt({ userId: user?.value })
          const totalDebt = res?.data?.[0]?.totalDebt || 0
          if (totalDebt >= 0) {
            setValue("subTotal", totalDebt)
          }
        } catch (error) {}
      } else if (
        billingType?.value === BILLING_TYPE.PRODUCT &&
        products &&
        data?.status !== TRANSACTION_CHECKIN_STATUS.PAID
      ) {
        setValue(
          "subTotal",
          sumBy(
            products,
            (product) =>
              product?.amount *
              (parseInt(product?.variant?.discountPrice) || parseInt(product?.variant?.price))
          )
        )
      }
    })()
  }, [billingType?.value, data?.status, products, setValue, user?.value])

  useEffect(() => {
    if (
      [PAYMENT_METHOD?.MEMBER_CARD, PAYMENT_METHOD?.SERVICE_CARD]?.includes(paymentMethod?.value)
    ) {
      setValue("purchase", total)
    }
  }, [paymentMethod?.value, setValue, total])

  return (
    <>
      <form
        onSubmit={handleSubmit((data) => onSubmit(data))}
        className="grid grid-cols-[auto_340px] gap-x-6 md:grid-cols-1"
      >
        <div className="bg-form rounded-t-2xl p-6 md:p-0 md:bg-transparent">
          <div className="grid grid-cols-2 gap-x-6 md:grid-cols-1 md:space-y-2">
            <div className="space-y-6 md:space-y-2">
              {data && (
                <Controller
                  name="code"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <Input
                      onChange={onChange}
                      value={value}
                      name="code"
                      label="Transaction ID"
                      placeholder="Transaction ID"
                      errors={errors?.id?.message}
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
                    isDisabled={fromCheckin}
                    onChange={(e) => {
                      setValue("user", e)
                      clearErrors("user")
                    }}
                    value={value}
                    name="user"
                    label="Customer"
                    placeholder="Select Customer"
                    options={customersData}
                    errors={errors?.user?.message}
                  />
                )}
              />
              <Controller
                name="billingType"
                control={control}
                render={({ field: { value } }) => (
                  <Select
                    isDisabled={!!data?.status && data?.status !== TRANSACTION_CHECKIN_STATUS.NEW}
                    placeholder="Select Billing Type"
                    label="Billing Type"
                    name="billingType"
                    onChange={(e) => {
                      setValue("billingType", e)
                      clearErrors("billingType")
                    }}
                    value={value}
                    options={billingTypeOptions}
                    errors={errors?.billingType?.message}
                  />
                )}
              />
              {billingType?.value === BILLING_TYPE.TREATMENT && (
                <Controller
                  name="treatment"
                  control={control}
                  render={({ field: { value } }) => (
                    <Select
                      isDisabled={!!data?.status && data?.status !== TRANSACTION_CHECKIN_STATUS.NEW}
                      placeholder="Select Treatment"
                      label="Treatment"
                      name="treatment"
                      onChange={(e) => {
                        setValue("treatment", e)
                        clearErrors("treatment")
                        const treatment = treatmentsData.find((item) => item.id === e.value)
                        if (treatment) {
                          setValue("subTotal", parseInt(treatment.price))
                        }
                      }}
                      value={value}
                      options={treatmentsData?.map((treatment) => ({
                        value: treatment.id,
                        label: treatment.name,
                      }))}
                      errors={errors?.treatment?.message}
                    />
                  )}
                />
              )}
              {billingType?.value === BILLING_TYPE.ORDER && (
                <Controller
                  name="order"
                  control={control}
                  render={({ field: { value } }) => (
                    <Select
                      isDisabled={data?.status === TRANSACTION_CHECKIN_STATUS.PAID}
                      placeholder="Select Order"
                      label="Order"
                      name="order"
                      onChange={(e) => {
                        setValue("order", e)
                        clearErrors("order")
                        const order = ordersData.find((item) => item.id === e.value)
                        if (order) {
                          setValue("subTotal", parseInt(order.total))
                        }
                      }}
                      value={value}
                      options={ordersData?.map((order) => ({
                        value: order?.id,
                        label: order?.code,
                      }))}
                      errors={errors?.order?.message}
                    />
                  )}
                />
              )}
              {billingType?.value === BILLING_TYPE.PRODUCT && (
                <Controller
                  name="products"
                  control={control}
                  render={({ field: { value } }) => (
                    <div
                      onClick={() => {
                        if (data?.status !== TRANSACTION_CHECKIN_STATUS.PAID) {
                          setShowSelectProductsModal(true)
                        }
                      }}
                    >
                      <Input
                        name="products"
                        className="cursor-pointer"
                        disabled
                        value={
                          value?.length > 0
                            ? `${sumBy(value, (product) => product?.amount)} products`
                            : null
                        }
                        placeholder="Select Products"
                      />
                    </div>
                  )}
                />
              )}
              <Controller
                name="staff"
                control={control}
                render={({ field: { value } }) => (
                  <Select
                    isDisabled={data?.status === TRANSACTION_CHECKIN_STATUS.PAID}
                    onChange={(e) => {
                      setValue("staff", e, {
                        shouldValidate: true,
                        shouldDirty: true,
                      })
                    }}
                    value={value}
                    name="staff"
                    label="Staff"
                    placeholder="Select Staff"
                    isLoading={loadingStaffs}
                    options={staffsData}
                    errors={errors?.staff?.message}
                  />
                )}
              />
              <Controller
                name="extraStaff"
                control={control}
                render={({ field: { value } }) => (
                  <Select
                    isDisabled={data?.status === TRANSACTION_CHECKIN_STATUS.PAID}
                    onChange={(e) => {
                      setValue("extraStaff", e, {
                        shouldValidate: true,
                        shouldDirty: true,
                      })
                    }}
                    value={value}
                    name="extraStaff"
                    label="Extra Staff"
                    placeholder="Select Staff"
                    isLoading={loadingStaffs}
                    options={staffsData}
                    errors={errors?.extraStaff?.message}
                  />
                )}
              />
            </div>
            {(!fromCheckin || !isMobile) && (
              <div className="space-y-6 md:space-y-2">
                <Controller
                  name="paymentMethod"
                  control={control}
                  render={({ field: { value } }) => (
                    <Select
                      isDisabled={data?.status === TRANSACTION_CHECKIN_STATUS.PAID}
                      placeholder="Select Payment Method"
                      label="Payment Method"
                      name="paymentMethod"
                      onChange={(e) => {
                        setValue("paymentMethod", e)
                        setCardsData([])
                        clearErrors("paymentMethod")
                      }}
                      value={value}
                      options={paymentMethodOptions}
                      errors={errors?.paymentMethod?.message}
                    />
                  )}
                />
                {(paymentMethod?.value === PAYMENT_METHOD.MEMBER_CARD ||
                  billingType?.value === BILLING_TYPE.MEMBER_CARD) && (
                  <Controller
                    name="card"
                    control={control}
                    render={({ field: { value } }) => (
                      <Select
                        isDisabled={data?.status === TRANSACTION_CHECKIN_STATUS.PAID}
                        placeholder="Select Member Card"
                        label="Member Card"
                        name="card"
                        onChange={(e) => {
                          setValue("card", e)
                          clearErrors("card")
                          if (billingType?.value === BILLING_TYPE.CARD_CANCELED) {
                            const card = cardsData.find((item) => item.id === e.value)
                            setValue("subTotal", parseInt(card.remainValue) * -1)
                          }
                        }}
                        value={value}
                        isLoading={loadingCards}
                        options={cardsData?.map((card) => ({
                          value: card?.id,
                          label: card?.code,
                        }))}
                        errors={errors?.card?.message}
                      />
                    )}
                  />
                )}
                {(paymentMethod?.value === PAYMENT_METHOD.SERVICE_CARD ||
                  billingType?.value === BILLING_TYPE.SERVICE_CARD) && (
                  <Controller
                    name="card"
                    control={control}
                    render={({ field: { value } }) => (
                      <Select
                        isDisabled={data?.status === TRANSACTION_CHECKIN_STATUS.PAID}
                        placeholder="Select Service Card"
                        label="Service Card"
                        name="card"
                        onChange={(e) => {
                          setValue("card", e)
                          clearErrors("card")
                          if (billingType?.value === BILLING_TYPE.CARD_CANCELED) {
                            const card = cardsData.find((item) => {
                              return item.id === e.value
                            })
                            setValue(
                              "subTotal",
                              parseInt(card?.remainValue) *
                                parseInt(formatStrapiObj(card?.service)?.price) *
                                -1
                            )
                          }
                        }}
                        value={value}
                        isLoading={loadingCards}
                        options={cardsData?.map((card) => ({
                          value: card?.id,
                          label: card?.code,
                        }))}
                        errors={errors?.card?.message}
                      />
                    )}
                  />
                )}
                <Controller
                  name="discount"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <div className="flex items-end space-x-4">
                      <Input
                        disabled={data?.status === TRANSACTION_CHECKIN_STATUS.PAID}
                        className="flex-1"
                        name="discount"
                        label={`Discount ${moneyDiscountType ? "(vnđ)" : "(%)"}`}
                        type="number"
                        placeholder="Input Discount Value"
                        value={value}
                        min={0}
                        max={!moneyDiscountType ? 100 : null}
                        onChange={onChange}
                        errors={errors?.discount?.message}
                      />
                      {/*<Button*/}
                      {/*  type="button"*/}
                      {/*  className={`w-14 h-14 p-0 bg-primary/10 ${*/}
                      {/*    moneyDiscountType ? "!bg-primary" : ""*/}
                      {/*  }`}*/}
                      {/*  onClick={() => setMoneyDiscountType(true)}*/}
                      {/*>*/}
                      {/*  <Icon*/}
                      {/*    name="dollar-circle"*/}
                      {/*    className={`fill-primary w-6 ${moneyDiscountType && "!fill-white"}`}*/}
                      {/*  />*/}
                      {/*</Button>*/}
                      {/*<Button*/}
                      {/*  type="button"*/}
                      {/*  className={`w-14 h-14 p-0 bg-primary/10 ${!moneyDiscountType && "!bg-primary"}`}*/}
                      {/*  onClick={() => setMoneyDiscountType(false)}*/}
                      {/*>*/}
                      {/*  <Icon*/}
                      {/*    name="discount"*/}
                      {/*    className={`fill-primary w-6 ${!moneyDiscountType && "!fill-white"}`}*/}
                      {/*  />*/}
                      {/*</Button>*/}
                    </div>
                  )}
                />
                <Controller
                  name="purchase"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <Input
                      name="purchase"
                      disabled={data?.status === TRANSACTION_CHECKIN_STATUS.PAID}
                      label="Purchase Money"
                      type="number"
                      placeholder="Input Purchase Money from Customer"
                      value={value}
                      onChange={onChange}
                      errors={errors?.purchase?.message}
                    />
                  )}
                />
                <Controller
                  name="vat"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <Input
                      name="vat"
                      disabled={data?.status === TRANSACTION_CHECKIN_STATUS.PAID}
                      label="VAT (%)"
                      placeholder="Input VAT value in %"
                      value={value}
                      onChange={onChange}
                      errors={errors?.vat?.message}
                    />
                  )}
                />
                <Controller
                  name="note"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <Input
                      name="note"
                      disabled={data?.status === TRANSACTION_CHECKIN_STATUS.PAID}
                      label="Note"
                      placeholder="Note"
                      value={value}
                      onChange={onChange}
                      errors={errors?.note?.message}
                    />
                  )}
                />
              </div>
            )}
          </div>
          {!fromCheckin && (
            <div className="flex gap-x-4 mt-10">
              <Button className="fill-primary" type="submit" loading={isSubmittingForm}>
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
          )}
        </div>
        <div className="flex flex-col justify-between p-6 rounded-lg bg-rightContent md:bg-white md:mt-2">
          {(!fromCheckin || !isMobile) && (
            <TransactionBilling
              subTotal={subTotal}
              discount={discount}
              vat={vat}
              total={(subTotal - (discount || 0)) * (1 + (vat || 0) / 100)}
              purchase={purchase}
              billingType={billingType?.value}
            />
          )}
          {fromCheckin && (
            <div className="space-y-4">
              {data?.status &&
                billingType?.value === BILLING_TYPE.TREATMENT &&
                staff?.value === currentUser?.id && (
                  <div className="space-x-4 flex items-center justify-end">
                    {data?.status === TRANSACTION_CHECKIN_STATUS.NEW ? (
                      <Button
                        type="button"
                        btnSize="medium"
                        className="w-full h-12 bg-darkPrimary"
                        onClick={handleSubmit((data) =>
                          onSubmit(data, true, TRANSACTION_CHECKIN_STATUS.PROGRESS)
                        )}
                      >
                        START
                      </Button>
                    ) : (
                      <>
                        <Timer
                          duration={getDuration}
                          isStartTimer={data?.status === TRANSACTION_CHECKIN_STATUS.PROGRESS}
                        />
                        {data?.status === TRANSACTION_CHECKIN_STATUS.PROGRESS && (
                          <Button
                            type="button"
                            btnSize="medium"
                            className="w-full h-12 bg-darkPrimary"
                            onClick={handleSubmit((data) =>
                              onSubmit(data, true, TRANSACTION_CHECKIN_STATUS.DONE)
                            )}
                          >
                            STOP
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                )}
              {data?.status === TRANSACTION_CHECKIN_STATUS.DONE && (
                <Button
                  type="button"
                  btnSize="medium"
                  disabled={paidBtnDisabled()}
                  className="w-full h-12 bg-darkPrimary"
                  onClick={handleSubmit((data) =>
                    onSubmit(data, true, TRANSACTION_CHECKIN_STATUS.PAID)
                  )}
                >
                  PAY
                </Button>
              )}
              <div className="flex gap-x-4 mt-10 justify-end">
                <Button
                  className="fill-primary"
                  type="submit"
                  disabled={isSubmittingForm || data?.status === TRANSACTION_CHECKIN_STATUS.PAID}
                >
                  Save
                </Button>
                <Button btnType="outline" type="reset" onClick={onCloseModal}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </form>
      {showSelectProductsModal && (
        <SelectProductsModal
          show={showSelectProductsModal}
          cartData={products}
          onClose={() => setShowSelectProductsModal(false)}
          onUpdateCart={(cart) => setValue("products", cart)}
        />
      )}
    </>
  )
}

export default TransactionForm
