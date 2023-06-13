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
import {
  getRelationshipById, updatePatient, updatePatientRelationship
} from "services/api/patient";

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

const PrescriptionModal = ({ bundleServiceId, patient, patientId, visibleModal, onClose, setRelationships }) => {
  const validationSchema = yup.object({})
  const [prescriptionData, setPrescriptionData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isPrinting, setIsPrinting] = useState(false)
  const [medicalRecord, setMedicalRecord] = useState()
  const [bundleService, setBundleService] = useState();
  const [relationship, setRelationship] = useState([]);
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
    name: "relationship",
  })

  const relationships = useWatch({ control: control, name: "relationship" })

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
    const { relationship } = values
    const payload = {
      relationship
    }



    try {
      setLoading(true)
      if (patientId) {
        await updatePatient(patientId, {
          data: {
            ...patient,
            relationships: relationship.map(r => {
              return {
                "label": r.ten,
                "patient": r.value
              }
            })
          }
        })

        let rs = relationship.map(r => {
          let res = { ...r };
          res.patient = { full_name: res.label };
          res.label = res.ten;
          return res;
        })

        setRelationships(rs);
        // await fetchPrescriptionData(prescriptionData?.id)
      }
      toast.success("Cập nhật mối quan hệ thành công")
      // onClose()
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  const fetchPrescriptionData = useCallback(async (id) => {
    try {
      const res = await getRelationshipById(id)
      // const data = formatStrapiObj(res.data)
      const relationships = formatStrapiArr(res.data.relationships)
      // setPrescriptionData({
      //   ...data,
      //   medicalRecord: formatStrapiObj(data.medicalRecord),
      //   medical_services: data?.medical_services?.map((item) => ({ ...item, drug: formatStrapiObj(item.drug) })),
      // })
    } catch (error) { }
  }, [])

  const handlePrint = () => {
    setIsPrinting(true)
    try {
      const toastId = toast.loading("Đang tải");
      axios.post("/product/generatePrescription", {
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
    ; (async () => {
      if (patientId) {
        fetchPrescriptionData(patientId)
      }
    })()
  }, [fetchPrescriptionData, patientId])

  useEffect(() => {
    if (relationship) {
      // const { message, reExaminationDate, medical_services } = bundleService;
      console.log('relat', relationship)
      let rs = relationship.map(r => {
        r.ten = r.label;
        r.label = r.patient?.full_name;
        r.value = r.patient?.id;
        return r;
      })
      reset({
        relationship: rs
      })
    } else {
      reset({
        relationship: [DRUG_DEFAULT],
        // additional_drugs: [DRUG_DEFAULT],
      })
    }
  }, [relationship, reset])

  useEffect(() => {
    if (patientId) {
      ; (async () => {
        try {
          const res = await getRelationshipById(patientId)
          setRelationship(res.data.relationships);
        } catch (error) { }
      })()
    }
  }, [patient])

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
        if (res.data) {

          let listDrugs = formatStrapiArr(res.data)

          listDrugs = listDrugs.map(l => {
            l.value = l.id;
            l.label = l.label + (l.ingredient ? ` (${l.ingredient})` : "");
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
      {patient.relationships ? (
        <>
          <p className="text-24 font-bold">Mối quan hệ:</p>
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
              <span className="text-16 text-primary">Thêm quan hệ mới</span>
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
