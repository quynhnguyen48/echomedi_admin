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
import { 
  updateServiceBundle
} from "services/api/serviceBundle";
import { useCallback, useEffect, useState } from "react"
import { toast } from "react-toastify"
import { getErrorMessage } from "utils/error"
import { formatStrapiObj } from "utils/strapi"
import dayjs from "dayjs"
import { getMedicalRecordById } from "services/api/medicalRecord"
import { getServiceBundleById } from "services/api/serviceBundle"
import Loading from "components/Loading"
import axios2 from "axios";
import axios from "../../services/axios";
import { BRANCH } from "constants/Authentication"
import { createBookingWithPatient, updateBookingWithPatient, } from "services/api/bookings";
import { getListDrugs } from "services/api/drug"
import { formatStrapiArr } from "utils/strapi"
import { getListMedicalServices } from "services/api/medicalService"

const DRUG_DEFAULT = {
  id: 1,
  value: 1,
}

const PrescriptionModal = ({ bundleServiceId, patientId, visibleModal, onClose }) => {
  const validationSchema = yup.object({})
  const [prescriptionData, setPrescriptionData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isPrinting, setIsPrinting] = useState(false)
  const [medicalRecord, setMedicalRecord] = useState()
  const [bundleService, setBundleService] = useState();
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
    name: "medical_services",
  })

  const medicalServices = useWatch({ control: control, name: "medical_services" })

  const handleUpdateAmount = () => {
    for (let i = 0; i < medicalServices?.length; i++) {
      const amount =
        parseFloat(medicalServices[i].morningAmount) +
        parseFloat(medicalServices[i].noonAmount) +
        parseFloat(medicalServices[i].afternoonAmount) +
        parseFloat(medicalServices[i].eveningAmount)
      if (medicalServices[i].numberOfDays) {
        setValue(`medical_services[${i}].amount`, amount * parseFloat(medicalServices[i].numberOfDays))
      }
    }
  }

  const onSubmit = async (values) => {
    const { medical_services, ...rest } = values
    const payload = {
      ...rest,
      bundleService: bundleService?.id,
      medical_services: medical_services,
    }

    try {
      setLoading(true)
      if (bundleService?.id) {
        await updateServiceBundle(bundleService?.id, payload)
        await fetchPrescriptionData(prescriptionData?.id)
      } else {
        const res = await createPrescription(payload)
        await fetchPrescriptionData(formatStrapiObj(res?.data)?.id)
      }
      toast.success("Lưu gói dịch vụ thành công")
      // onClose()
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setLoading(false)
    }

    // setIsPrinting(true)
    // try {
    //   const toastId = toast.loading("Đang tải");
    //   await axios.post("/product/generatePrescription", {
    //     // axios2.post("http://localhost:1337/api/product/generatePrescription", {
    //     "id": bundleServiceId,
    //   }, {
    //     responseType: 'arraybuffer',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       'Accept': 'application/pdf'
    //     }
    //   })
    //     .then((response) => {
    //       const b = new Blob([response.data], { type: 'application/pdf' })
    //       var url = window.URL.createObjectURL(b)
    //       window.open(url)
    //       setTimeout(() => window.URL.revokeObjectURL(url), 100)
    //     })
    //     .finally(() => {
    //       toast.dismiss(toastId);
    //     });
    // } catch (error) {
    //   toast.error(getErrorMessage(error))
    // } finally {
    //   setIsPrinting(false)
    //   onClose()
    //   setLoading(false)
    // }

    // const reExDate = getValues("reExaminationDate");
    // if (reExDate && !prescriptionData?.reExaminationDate) {
    //   const payload = {
    //     // ...formData,
    //     // ...getValues("user"),
    //     patient: patientId,
    //     branch: localStorage.getItem(BRANCH),
    //     bookingDate: reExDate,
    //     dontShowOnCalendar: false,
    //     status: "scheduled",
    //     note: "Tái khám",
    //   }
    //   await createBookingWithPatient({ ...payload, createNewPatient: false })
    // }
  }

  const fetchPrescriptionData = useCallback(async (id) => {
    try {
      const res = await getPrescriptionById(id)
      const data = formatStrapiObj(res.data)
      setPrescriptionData({
        ...data,
        medicalRecord: formatStrapiObj(data.medicalRecord),
        medical_services: data?.medical_services?.map((item) => ({ ...item, drug: formatStrapiObj(item.drug) })),
      })
    } catch (error) {}
  }, [])

  const handlePrint = () => {
    setIsPrinting(true)
    try {
      const toastId = toast.loading("Đang tải");
    axios.post("/product/generatePrescription", {
    // axios2.post("http://localhost:1337/api/product/generatePrescription", {
      "id": bundleServiceId,
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
    if (bundleService) {
      const { message, reExaminationDate, medical_services } = bundleService;
      console.log('medical_services', medical_services)
      reset({
        message,
        reExaminationDate: reExaminationDate
          ? dayjs(reExaminationDate).toDate()
          : reExaminationDate,
        medical_services: medical_services?.map((item) => ({
          ...item,
          value: item.id,
          // drug: { value: item?.id, label: item.drug?.label },
        })),
      })
    } else {
      reset({
        medical_services: [DRUG_DEFAULT],
        // additional_drugs: [DRUG_DEFAULT],
      })
    }
  }, [bundleService, reset])

  useEffect(() => {
    if (bundleServiceId) {
      ;(async () => {
        try {
          const res = await getServiceBundleById(bundleServiceId)
          console.log('getServiceBundleById', res)
          const data = formatStrapiObj(res.data.data)
          // setMedicalRecord({ ...data, prescription: formatStrapiObj(data?.prescription) })
          setBundleService({ ...data, medical_services: formatStrapiArr(data?.medical_services)})
        } catch (error) {}
      })()
    }
  }, [bundleServiceId])

  console.log('bundle services', bundleService)

  const getAllDrugs = () => {
    setLoading(true)
    getListMedicalServices(
      {
        pageSize: 1000,
        page: 1,
      },
      {
        // branch: localStorage.getItem(BRANCH),
      }
    )
      .then((res) => {
        console.log('getAllMedicalServices', res.data.data);
        if (res.data) {
        console.log('getAllMedicalServices2', res.data);

          let listDrugs = formatStrapiArr(res.data)
          console.log('getAllMedicalServices2', listDrugs);

          listDrugs = listDrugs.map(l => {
            l.value = l.id;
            l.label = l.label + (l.ingredient ? ` (${l.ingredient})` : "");
            return l;
          })
          console.log('listDrugs', listDrugs)
          setAllDrugs(listDrugs);
        }
      })
      .catch((err) => { })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    console.log('123123')
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
      {bundleService ? (
        <>
          <p className="text-24 font-bold">Dịch vụ:</p>
          <form className="flex flex-col gap-4 mt-2" onSubmit={handleSubmit(onSubmit)}>
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
              <span className="text-16 text-primary">Thêm dịch vụ mới</span>
            </Button>
            <div className="mt-10 self-end flex gap-x-4">
            <Button className="fill-primary self-end" type="submit" loading={loading}>
                Lưu
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
