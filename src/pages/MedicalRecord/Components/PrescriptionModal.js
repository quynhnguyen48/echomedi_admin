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
import { formatStrapiArr, formatStrapiObj } from "utils/strapi"
import dayjs from "dayjs"
import { getMedicalRecordById, updateMedicalRecord } from "services/api/medicalRecord"
import Loading from "components/Loading"
import axios from "../../../services/axios";
import { createBookingWithPatient, updateBookingWithPatient, } from "services/api/bookings";
import { BRANCH } from "constants/Authentication"
import { data } from "autoprefixer"
import { getListDrugs } from "services/api/drug"

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

const PrescriptionModal = ({ data, medicalRecordId, visibleModal, onClose, patientId }) => {
  const validationSchema = yup.object({})
  const [prescriptionData, setPrescriptionData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isPrinting, setIsPrinting] = useState(false)
  const [medicalRecord, setMedicalRecord] = useState()
  const [prescriptions, setPrescriptions] = useState([]);
  const [activePreId, setActivePreId] = useState(0);
  const [preIds, setPreIds] = useState([]);
  const [pres, setPres] = useState([]);
  const [allDrugs, setAllDrugs] = useState([]);

  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
    reset,
    getValues,
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

  const createNewPrescription = async () => {
    let ids = data.prescriptions?.data.map(d => d.id) ?? [];
    let uids = data.prescriptions?.data.map(d => d.uid) ?? [];
    const payload2 = {
      Drugs: [],
    }
    const res = await createPrescription(payload2);
    const pre = await getPrescriptionById(res.data.data.id);
    const payload = {
      ...data,
      prescriptions: [...ids, res.data.data.id]
    };
    console.log('pre', pre)
    await updateMedicalRecord(data.id, payload)
    setActivePreId(res.data.data.id);
    setPreIds([...uids, pre.data.data.attributes.uid]);
    console.log('preIds', [...uids, pre.data.data.attributes.uid])

    let pres2 = [...pres, formatStrapiObj(pre.data)];
    setPres(pres2);
  }

  const onSubmit = async (values) => {
    const { Drugs, ...rest } = values;
    const payload2 = {
      ...rest,
      Drugs: Drugs?.filter((item) => !!item.drug)
        .map((item) => ({ ...item, drug: item.drug.value })),
      additional_drugs: [],
    }
    try {
      setLoading(true)
      if (activePreId) {
        // if (false) {
        await updatePrescription(activePreId, payload2)
        await fetchPrescriptionData(activePreId)
      } else {
        const res = await createPrescription(payload2);
        const payload = {
          ...data,
          prescriptions: [res.data.data.id]
        };
        // await updateMedicalRecord(data.id, payload)
        await fetchPrescriptionData(formatStrapiObj(res?.data)?.id)
      }
      toast.success("Lưu đơn thuốc thành công")
      // onClose()
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      // setLoading(false)
    }

    setIsPrinting(true)
    try {
      const toastId = toast.loading("Đang tải");
      await axios.post("/product/generatePrescription", {
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
        notify: true,
      }
      await createBookingWithPatient({ ...payload, createNewPatient: false })
    }
  }

  const fetchPrescriptionData = useCallback(async (id) => {
    try {
      console.log('idddd', id)
      const res = await getPrescriptionById(id)
      const data = formatStrapiObj(res.data)
      setPrescriptionData({
        ...data,
        medicalRecord: formatStrapiObj(data.medicalRecord),
        Drugs: data?.Drugs?.map((item) => ({ ...item, drug: formatStrapiObj(item.drug) })),
      })
    } catch (error) { }
  }, [])

  useEffect(() => {
    ; (async () => {
      if (medicalRecord?.prescriptions) {
        console.log('medicalRecord', medicalRecord)
        setActivePreId(medicalRecord?.prescriptions.data[0].id);
        setPres(medicalRecord?.prescriptions.data.map(p => formatStrapiObj(p)) ?? []);
      }
    })()
  }, [fetchPrescriptionData, medicalRecord?.prescriptions]);

  useEffect(() => {
    fetchPrescriptionData(activePreId)
  }, [activePreId])

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
    } else {
      reset({
        Drugs: [DRUG_DEFAULT],
      })
    }
  }, [prescriptionData, reset])

  useEffect(() => {
    if (medicalRecordId) {
      ; (async () => {
        try {
          const res = await getMedicalRecordById(medicalRecordId)
          const data = formatStrapiObj(res.data)
          setMedicalRecord({ ...data, prescription: formatStrapiObj(data?.prescription) })
        } catch (error) { }
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
            l.label = l.label + (l.ingredient ? ` (${l.ingredient})` : "") + (l.stock ? ` (${l.stock})` : "");
            return l;
          });
          listDrugs = listDrugs.filter(l => l.stock > 0);
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
      contentClassName="bg-gray3"
      showCloseButton
      visibleModal={visibleModal}
      onClose={onClose}
    >
      {medicalRecord ? (
        <>
          <p className="text-24 font-bold inline mr-4">Đơn thuốc</p>
          {pres && pres.map(p => 
            <button 
              onClick={e => setActivePreId(p.id)}
              className={`mr-2 ${activePreId == p.id && 'font-bold underline'}`}>{p.uid}</button>)}
          {/* <button className="mr-2">1</button> */}
          <Button
            className={"!inline"}
              variant="contained"
              color="primary"
              onClick={e => createNewPrescription()}
            >
              Thêm đơn thuốc
            </Button>
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
                    disabled={!!prescriptionData?.reExaminationDate}
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
                Lưu và in đơn thuốc
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
