import * as yup from "yup"
import { useCallback, useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { toast } from "react-toastify"

import Button from "components/Button"
import Drawer from "components/Drawer"
import Select from "components/Select"
import { getListUsers } from "services/api/users"
import { createNewCheckin, updateAliasID, updateCheckin } from "services/api/checkin"
import { getErrorMessage } from "utils/error"
import { formatStrapiArr, formatStrapiObj } from "../../../utils/strapi"

const controlSelectStyles = {
  control: () => ({
    alignItems: "center",
    backgroundColor: "rgba(248, 248, 248, 1)",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    minHeight: "56px",
    position: "relative",
    transition: "all 100ms ease 0s",
    padding: "0 24px",
    outline: "0px !important",
  }),
}

const CheckInDrawer = ({
  openDrawer,
  isGuestUser,
  onClose,
  data,
  onCreateSuccess,
  onUpdateSuccess,
}) => {
  const [loadingCustomers, setLoadingCustomers] = useState(false)
  const [customersData, setCustomersData] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const validationSchema = yup.object({
    user: yup
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
    getValues,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      user: data?.user?.id
        ? {
            value: data?.user?.id,
            label: `${data?.user?.firstName} ${data?.user?.lastName}`,
          }
        : null,
    },
  })

  const handleSearchCustomer = useCallback((value) => {
    setLoadingCustomers(true)
    getListUsers(
      { pageSize: 1000 },
      {
        $or: [{ firstName: { $containsi: value } }, { lastName: { $containsi: value } }],
      }
    )
      .then((res) => {
        if (res.data) {
          setCustomersData(
            res.data?.map((customer) => ({
              value: customer?.id,
              label: `${customer?.firstName} ${customer?.lastName}`,
              id: customer?.id,
            }))
          )
        }
        setLoadingCustomers(false)
      })
      .catch(() => {
        setLoadingCustomers(false)
      })
  }, [])

  const onSubmit = async (formData, guestUser = false) => {
    if (data) {
      try {
        setIsLoading(true)
        if (isGuestUser) {
          const payload = {
            user: formData?.user?.id,
          }
          const res = await updateCheckin(data?.id, payload)
          if (res.data) {
            onUpdateSuccess({
              ...formatStrapiObj(res.data),
              transactions: formatStrapiArr(formatStrapiObj(res.data).transactions),
              user: formatStrapiObj(formatStrapiObj(res.data).user),
            })
          }
        } else {
          const res = await updateAliasID({
            id: data?.id,
            personID: data?.metadata?.personID,
            aliasID: formData?.user?.value,
          })
          if (res.data) {
            onUpdateSuccess(res.data)
          }
        }
        toast.success("Saved successfully")
      } catch (error) {
        toast.error("Something went wrong. Please try again later!")
      } finally {
        setIsLoading(false)
      }
    } else {
      try {
        setIsLoading(true)
        const res = await createNewCheckin(
          guestUser
            ? {}
            : {
                user: {
                  id: formData?.user?.value,
                },
              }
        )
        onCreateSuccess(res.data)
        toast.success("Created successfully")
      } catch (error) {
        // toast.error(getErrorMessage(error));
      } finally {
        setIsLoading(false)
      }
    }
  }

  useEffect(() => {
    reset({
      user: data?.user?.id
        ? {
            value: data?.user?.id,
            label: `${data?.user?.firstName} ${data?.user?.lastName}`,
          }
        : null,
    })
  }, [data?.user?.id, data?.user?.firstName, data?.user?.lastName, reset])

  useEffect(() => {
    handleSearchCustomer()
  }, [handleSearchCustomer])

  return (
    <Drawer open={openDrawer} onClose={onClose} className="h-full">
      <h4 className="font-bold text-18">{data ? "Edit Check-in" : "Create New Check-in"}</h4>
      <form className="mt-6" onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="user"
          control={control}
          render={({ field: { value } }) => (
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
              controlStyles={controlSelectStyles}
            />
          )}
        />

        <div className="flex justify-between items-center">
          <div className="flex space-x-2 mt-10 mb-10">
            <Button
              disabled={!getValues("user")}
              className="rounded-lg"
              loading={isLoading}
              onClick={handleSubmit((data) => onSubmit(data))}
            >
              Save
            </Button>
            <Button
              className="bg-white text-primary"
              btnType="outline"
              type="button"
              onClick={onClose}
            >
              Cancel
            </Button>
          </div>
          {!data && (
            <Button className="rounded-lg" onClick={handleSubmit((data) => onSubmit(data, true))}>
              Guest user
            </Button>
          )}
        </div>
      </form>
    </Drawer>
  )
}

export default CheckInDrawer
