import { yupResolver } from "@hookform/resolvers/yup"
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form"
import * as yup from "yup"

import Button from "components/Button"
import Datepicker from "components/Datepicker"
import Icon from "components/Icon"
import Modal from "components/Modal"
import Textarea from "components/Textarea"
import PrescriptionFormItem from "./AdditionalPrescriptionFormItem"
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
import axios2 from "axios";
import axios from "../../../services/axios";
import { BRANCH } from "constants/Authentication"
import { createBookingWithPatient, updateBookingWithPatient, } from "services/api/bookings";
import { getListDrugs } from "services/api/drug"
import { formatStrapiArr } from "utils/strapi"

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

const PrescriptionModal = ({ medicalRecordId, patientId, visibleModal, onClose }) => {
  const validationSchema = yup.object({})
  const [prescriptionData, setPrescriptionData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isPrinting, setIsPrinting] = useState(false)
  const [medicalRecord, setMedicalRecord] = useState()
  const [allDrugs, setAllDrugs] = useState([]);

  const {
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "additional_drugs",
  })

  const drugs = useWatch({ control: control, name: "additional_drugs" })

  const handleUpdateAmount = () => {
    for (let i = 0; i < drugs?.length; i++) {
      const amount =
        parseFloat(drugs[i].morningAmount) +
        parseFloat(drugs[i].noonAmount) +
        parseFloat(drugs[i].afternoonAmount) +
        parseFloat(drugs[i].eveningAmount)
      if (drugs[i].numberOfDays) {
        setValue(`additional_drugs[${i}].amount`, amount * parseFloat(drugs[i].numberOfDays))
      }
    }
  }

  const onSubmit = async (values) => {
    const { additional_drugs, ...rest } = values
    const payload = {
      ...rest,
      medicalRecord: medicalRecord?.id,
      additional_drugs: additional_drugs?.filter((item) => !!item.drug)
        .map((item) => ({ ...item, drug: item.drug.value, unit: item.drug.unit })),
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
      // onClose()
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setLoading(false)
    }

    setIsPrinting(true)
    try {
      const toastId = toast.loading("Đang tải");
      await axios.post("/product/generateAdditionalPrescription", {
        // axios2.post("http://localhost:1337/api/product/generatePrescription", {
        "id": medicalRecordId,
      }, {
        responseType: 'arraybuffer',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/pdf'
        }
      })
        .then((response) => {
          const b = new Blob([response.data], { type: 'application/pdf' })
          var url = window.URL.createObjectURL(b)
          window.open(url)
          setTimeout(() => window.URL.revokeObjectURL(url), 100)
        })
        .finally(() => {
          toast.dismiss(toastId);
        });
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setIsPrinting(false)
      onClose()
      setLoading(false)
    }

    const reExDate = getValues("reExaminationDate");
    if (reExDate && !prescriptionData?.reExaminationDate) {
      const payload = {
        // ...formData,
        // ...getValues("user"),
        patient: patientId,
        branch: localStorage.getItem(BRANCH),
        bookingDate: reExDate,
        dontShowOnCalendar: false,
        status: "scheduled",
        note: "Tái khám",
      }
      await createBookingWithPatient({ ...payload, createNewPatient: false })
    }
  }

  const fetchPrescriptionData = useCallback(async (id) => {
    try {
      const res = await getPrescriptionById(id)
      const data = formatStrapiObj(res.data)
      setPrescriptionData({
        ...data,
        medicalRecord: formatStrapiObj(data.medicalRecord),
        additional_drugs: data?.additional_drugs?.map((item) => ({ ...item, drug: formatStrapiObj(item.drug) })),
      })
    } catch (error) {}
  }, [])

  const handlePrint = () => {
    setIsPrinting(true)
    try {
      const toastId = toast.loading("Đang tải");
    axios.post("/product/generatePrescription", {
    // axios2.post("http://localhost:1337/api/product/generatePrescription", {
      "id": medicalRecordId,
    }, {
      responseType: 'arraybuffer',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/pdf'
      }
    })
      .then((response) => {
        const b = new Blob([response.data], { type: 'application/pdf' })
        var url = window.URL.createObjectURL(b)
        window.open(url)
        setTimeout(() => window.URL.revokeObjectURL(url), 100)
      })
      .finally(() => {
        toast.dismiss(toastId);
      });
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
      const { additional_message, reExaminationDate, additional_drugs } = prescriptionData
      reset({
        additional_message,
        reExaminationDate: reExaminationDate
          ? dayjs(reExaminationDate).toDate()
          : reExaminationDate,
        additional_drugs: additional_drugs?.map((item) => ({
          ...item,
          drug: { value: item.drug?.id, label: item.drug?.label },
        })),
      })
    } else {
      reset({
        additional_drugs: [DRUG_DEFAULT],
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

  const getAllDrugs = () => {
    setLoading(true)
    getListDrugs(
      {
        pageSize: 1000,
        page: 1,
      },
      {
        branch: localStorage.getItem(BRANCH),
      }
    )
      .then((res) => {
        if (res.data) {
          let listDrugs = formatStrapiArr(res.data)
          listDrugs = listDrugs.map(l => {
            l.value = l.id;
            return l;
          })
          setAllDrugs(listDrugs);
        }
      })
      .catch((err) => { })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    getAllDrugs();
  }, [])

  return (
    <Modal
      wrapperClassName="w-[1340px]"
      contentClassName="bg-gray3 min-h-[90vh]"
      showCloseButton
      visibleModal={visibleModal}
      onClose={onClose}
    >
      {medicalRecord ? (
        <>
          <p className="text-24 font-bold">TƯ VẤN SẢN PHẨM HỖ TRỢ ĐIỀU TRỊ</p>
          <form className="flex flex-col gap-4 mt-2" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-3 gap-4">
              <Controller
                name="additional_message"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Textarea
                    label="Lời dặn"
                    onChange={onChange}
                    value={value}
                    name="additional_message"
                    placeholder="Nhập lời dặn"
                    errors={errors?.additional_message?.message}
                    className="col-span-2"
                    // textareaClassName="h-20"
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
                getValues={getValues}
                control={control}
                errors={errors}
                handleUpdateAmount={handleUpdateAmount}
                remove={remove}
                allDrugs={allDrugs}
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
                Lưu và in
              </Button>
              {/* <Button
                className="self-end"
                btnType="outline"
                type="button"
                loading={isPrinting}
                disabled={!prescriptionData}
                onClick={handlePrint}
              >
                In đơn thuốc
              </Button> */}
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
