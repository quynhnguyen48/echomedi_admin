import { Controller, useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { useCallback, useState } from "react"
import * as yup from "yup"

import Datepicker from "components/Datepicker"
import Input from "components/Input"
import Modal from "components/Modal"
import Button from "components/Button"
import { createDebtColectionReminder } from "services/api/users"
import { toast } from "react-toastify"
import { getErrorMessage } from "utils/error"

const CreateDebtReminderModal = ({ userId, show, onClose }) => {
  const [loading, setLoading] = useState(false)

  const validationSchema = yup.object({
    debtCollectionDate: yup
      .date()
      .required("Please Select Collection Date")
      .typeError("Please Select Collection Date"),
    amount: yup
      .number()
      .required("Please Enter Debt Collection Amount")
      .typeError("Please Enter Debt Collection Amount"),
  })

  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
  })

  const onSubmit = useCallback(
    async (data) => {
      try {
        setLoading(true)
        await createDebtColectionReminder({
          amount: data?.amount,
          debtCollectionDate: data?.debtCollectionDate,
          user: {
            id: userId,
          },
        })
        toast.success("Created successfully")
        onClose()
      } catch (error) {
        toast.error(getErrorMessage(error))
      } finally {
        setLoading(false)
      }
    },
    [onClose, userId]
  )

  return (
    <Modal
      showCloseButton
      visibleModal={show}
      onClose={onClose}
      wrapperClassName="w-[588px]"
      contentClassName="!min-h-[0] overflow-y-visible"
    >
      <p className="text-24 font-bold">Create Debt Collection Reminder</p>
      <form
        onSubmit={handleSubmit((data) => onSubmit(data))}
        className="flex flex-col gap-y-6 mt-8"
      >
        <Controller
          name="amount"
          control={control}
          render={({ field: { onChange, value } }) => (
            <Input
              onChange={onChange}
              inputClassName="bg-gray2"
              value={value}
              name="amount"
              type="number"
              label="Debt Collection Amount"
              placeholder={"Enter amount"}
              errors={errors?.amount?.message}
            />
          )}
        />
        <Controller
          name="debtCollectionDate"
          control={control}
          render={({ field: { value, ref } }) => (
            <Datepicker
              className="bg-gray2"
              label="Collection Date"
              value={value}
              onChange={(date) => {
                setValue("debtCollectionDate", date, { shouldDirty: true, shouldValidate: true })
              }}
              errors={errors?.debtCollectionDate?.message}
            />
          )}
        />
        <Button type="submit" className="mt-4 h-12" loading={loading}>
          CREATE REMINDER
        </Button>
      </form>
    </Modal>
  )
}

export default CreateDebtReminderModal
