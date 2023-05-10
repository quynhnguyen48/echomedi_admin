import { yupResolver } from "@hookform/resolvers/yup"
import { useCallback, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import * as yup from "yup"

import Button from "components/Button"
import Input from "components/Input"
import Select from "components/Select"
import { CARD_STATUS, CARD_TYPE } from "constants/Card"
import { BILLING_TYPE } from "constants/Transaction"
import { TRANSACTION_TYPE } from "constants/TransactionType"
import { createNewCard, updateCard } from "services/api/card"
import { createNewTransaction } from "services/api/transactions"
import { getListUsers } from "services/api/users"
import { getErrorMessage } from "utils/error"
import { formatStrapiObj } from "utils/strapi"

const MembershipCardForm = ({ data }) => {
  const navigate = useNavigate()

  const [loadingCustomers, setLoadingCustomers] = useState(false)
  const [customersData, setCustomersData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const currentUser = useSelector((state) => state.user.currentUser)

  const validationSchema = yup.object({
    user: yup.object().required("Customer is required").nullable(),
    code: yup.string().nullable(),
    remainValue: yup
      .string()
      .trim()
      .matches(/^[0-9]*$/, "Initial value is not in correct format")
      .required("Initial value is required"),
    additionalValue: yup.string(),
  })

  const {
    handleSubmit,
    control,
    setValue,
    clearErrors,
    formState: { errors, dirtyFields },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      user: data?.user?.code
        ? {
            value: data?.user?.id,
            label: `${data?.user?.firstName} ${data?.user?.lastName} (${data?.user?.code})`,
          }
        : null,
      code: data?.code || "",
      remainValue: data?.remainValue || "",
      additionalValue: "",
    },
  })

  const onSubmit = async (values) => {
    const { user, additionalValue, ...rest } = values
    const payload = {
      ...rest,
      user: {
        id: parseInt(user.value),
      },
    }

    if (data?.id) {
      // handle update
      try {
        setIsLoading(true)
        const res = await updateCard(data?.id, payload)
        if (res) {
          toast.success("Saved successfully")
          if (!dirtyFields.additionalValue) {
            navigate("/membership-card")
          }
        }
      } catch (error) {
        toast.error(getErrorMessage(error))
      } finally {
        setIsLoading(false)
      }

      if (dirtyFields.additionalValue) {
        try {
          setIsLoading(true)
          await createNewTransaction({
            card: { id: data?.id },
            user: payload.user,
            billingType: BILLING_TYPE.MEMBER_CARD,
            type: TRANSACTION_TYPE.INCOME,
            amount: additionalValue,
            subTotal: additionalValue,
            vat: 0,
            total: additionalValue,
            purchase: additionalValue,
            debtBalance: 0,
            change: 0,
          })
          navigate("/membership-card")
        } catch (error) {
          toast.error(getErrorMessage(error))
        } finally {
          setIsLoading(false)
        }
      }
    } else {
      // handle create new
      try {
        setIsLoading(true)
        const cardRes = await createNewCard({
          ...payload,
          remainValue: payload.remainValue,
          type: CARD_TYPE.MEMBERSHIP_CARD,
          status: CARD_STATUS.ACTIVE,
          staff: {
            id: currentUser?.id,
          },
        })
        if (cardRes) {
          const newCardData = formatStrapiObj(cardRes.data)
          await createNewTransaction({
            card: { id: newCardData?.id },
            user: payload.user,
            billingType: BILLING_TYPE.MEMBER_CARD,
            type: TRANSACTION_TYPE.INCOME,
            amount: payload.remainValue,
            subTotal: payload.remainValue,
            vat: 0,
            total: payload.remainValue,
          })
          toast.success("Created successfully")
          navigate("/membership-card")
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
                />
              )}
            />
          )}

          <Controller
            name="user"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Select
                onChange={(e) => {
                  setValue("user", e)
                  clearErrors("user")
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
            name="remainValue"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Input
                onChange={onChange}
                value={value}
                name="remainValue"
                label={data ? "Remain Value" : "Initial Value"}
                placeholder={data ? "Input Remain Value" : "Input Initial Value"}
                errors={errors?.remainValue?.message}
              />
            )}
          />
          {data && (
            <Controller
              name="additionalValue"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Input
                  onChange={onChange}
                  value={value}
                  name="additionalValue"
                  prefix="+"
                  label="Additional Value"
                  placeholder="Input Additional Value"
                  errors={errors?.additionalValue?.message}
                  showError={errors?.additionalValue}
                />
              )}
            />
          )}
        </div>
      </div>

      <div className="flex gap-x-4 mt-10">
        <Button className="fill-primary" type="submit" loading={isLoading}>
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

export default MembershipCardForm
