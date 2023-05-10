import { yupResolver } from "@hookform/resolvers/yup"
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form"
import * as yup from "yup"

import Button from "components/Button"
import Datepicker from "components/Datepicker"
import Icon from "components/Icon"
import Modal from "components/Modal"
import Textarea from "components/Textarea"
import PrescriptionFormItem from "./PrescriptionFormItem"
import {
  createPrescription,
  getPrescriptionById,
  updatePrescription,
} from "services/api/prescriptions"
import { useCallback, useEffect, useState } from "react"
import { toast } from "react-toastify"
import { getErrorMessage } from "utils/error"
import { formatStrapiObj } from "utils/strapi"
import dayjs from "dayjs"
import { getMedicalRecordById } from "services/api/medicalRecord"
import Loading from "components/Loading"

const DRUG_DEFAULT = {
  drug: "",
  morningAmount: 0,
  noonAmount: 0,
  afternoonAmount: 0,
  eveningAmount: 0,
  unit: "viên",
  numberOfDays: 0,
  amount: 0,
  usage: "Uống sau ăn",
}

const PrescriptionModal = ({ medicalRecordId, visibleModal, onClose }) => {
  const validationSchema = yup.object({})
  const [prescriptionData, setPrescriptionData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isPrinting, setIsPrinting] = useState(false)
  const [medicalRecord, setMedicalRecord] = useState()

  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {},
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "Drugs",
  })

  const drugs = useWatch({ control: control, name: "Drugs" })

  const handleUpdateAmount = () => {
    for (let i = 0; i < drugs?.length; i++) {
      const amount =
        parseInt(drugs[i].morningAmount) +
        parseInt(drugs[i].noonAmount) +
        parseInt(drugs[i].afternoonAmount) +
        parseInt(drugs[i].eveningAmount)
      if (drugs[i].numberOfDays) {
        setValue(`Drugs[${i}].amount`, amount * parseInt(drugs[i].numberOfDays))
      }
    }
  }

  const onSubmit = async (values) => {
    const { Drugs, ...rest } = values
    const payload = {
      ...rest,
      medicalRecord: medicalRecord?.id,
      Drugs: Drugs?.map((item) => ({ ...item, drug: item.drug.value })),
    }
    try {
      setLoading(true)
      if (prescriptionData?.id) {
        await updatePrescription(prescriptionData?.id, payload)
        await fetchPrescriptionData(prescriptionData?.id)
      } else {
        const res = await createPrescription(payload)
        await fetchPrescriptionData(formatStrapiObj(res?.data)?.id)
      }
      toast.success("Lưu đơn thuốc thành công")
      onClose()
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  const fetchPrescriptionData = useCallback(async (id) => {
    try {
      const res = await getPrescriptionById(id)
      const data = formatStrapiObj(res.data)
      setPrescriptionData({
        ...data,
        medicalRecord: formatStrapiObj(data.medicalRecord),
        Drugs: data?.Drugs?.map((item) => ({ ...item, drug: formatStrapiObj(item.drug) })),
      })
    } catch (error) {}
  }, [])

  const handlePrint = () => {
    setIsPrinting(true)
    try {
      // TODO: call api to print
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setIsPrinting(false)
    }
  }

  useEffect(() => {
    ;(async () => {
      if (medicalRecord?.prescription?.id) {
        fetchPrescriptionData(medicalRecord?.prescription?.id)
      }
    })()
  }, [fetchPrescriptionData, medicalRecord?.prescription?.id])

  useEffect(() => {
    if (prescriptionData) {
      const { message, reExaminationDate, Drugs } = prescriptionData
      reset({
        message,
        reExaminationDate: reExaminationDate
          ? dayjs(reExaminationDate).toDate()
          : reExaminationDate,
        Drugs: Drugs?.map((item) => ({
          ...item,
          drug: { value: item?.drug?.id, label: item?.drug?.label },
        })),
      })
    }  else {
      reset({
        Drugs: [DRUG_DEFAULT],
      })
    }
  }, [prescriptionData, reset])

  useEffect(() => {
    if (medicalRecordId) {
      ;(async () => {
        try {
          const res = await getMedicalRecordById(medicalRecordId)
          const data = formatStrapiObj(res.data)
          setMedicalRecord({ ...data, prescription: formatStrapiObj(data?.prescription) })
        } catch (error) {}
      })()
    }
  }, [medicalRecordId])

  return (
    <Modal
      wrapperClassName="w-[1340px]"
      contentClassName="bg-gray3"
      showCloseButton
      visibleModal={visibleModal}
      onClose={onClose}
    >
      {medicalRecord ? (
        <>
          <p className="text-24 font-bold">Đơn thuốc</p>
          <form className="flex flex-col gap-4 mt-2" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-3 gap-4">
              <Controller
                name="message"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Textarea
                    label="Lời dặn"
                    onChange={onChange}
                    value={value}
                    name="message"
                    placeholder="Nhập lời dặn"
                    errors={errors?.message?.message}
                    className="col-span-2"
                    // textareaClassName="h-20"
                  />
                )}
              />
              <Controller
                name="reExaminationDate"
                control={control}
                render={({ field: { value } }) => (
                  <Datepicker
                    value={value}
                    label="Ngày tái khám"
                    errors={errors?.reExaminationDate?.message}
                    onChange={(date) => {
                      setValue("reExaminationDate", date, {
                        shouldValidate: true,
                        shouldDirty: true,
                      })
                    }}
                    minDate={new Date()}
                  />
                )}
              />
            </div>
            {fields.map((item, index) => (
              <PrescriptionFormItem
                key={index}
                index={index}
                item={item}
                setValue={setValue}
                control={control}
                errors={errors}
                handleUpdateAmount={handleUpdateAmount}
                remove={remove}
              />
            ))}
            <Button
              className="self-start"
              type="button"
              btnType="text"
              btnSize="auto"
              icon={<Icon name="add-circle" className="fill-primary w-6 h-6" />}
              onClick={() => append({ ...DRUG_DEFAULT })}
            >
              <span className="text-16 text-primary">Thêm thuốc</span>
            </Button>
            <div className="mt-10 self-end flex gap-x-4">
              <Button className="fill-primary self-end" type="submit" loading={loading}>
                Lưu đơn thuốc
              </Button>
              <Button
                className="self-end"
                btnType="outline"
                type="button"
                loading={isPrinting}
                disabled={!prescriptionData}
                onClick={handlePrint}
              >
                In đơn thuốc
              </Button>
            </div>
          </form>
        </>
      ) : (
        <div className="flex items-center justify-center h-full">
          <Loading className="!border-primary !border-2 w-10 h-10" />
        </div>
      )}
    </Modal>
  )
}

export default PrescriptionModal
