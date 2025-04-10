import { useEffect, useState } from "react"
import { useNavigate, useParams, useLocation } from "react-router-dom"

import Page from "components/Page"
import { getMedicalRecordById } from "services/api/medicalRecord"
import { formatStrapiArr, formatStrapiObj } from "utils/strapi"
import PediatricMentalTreatmentForm from "./components/PediatricMentalTreatmentForm"
import { getUserById } from "services/api/users"
import { getPatientById } from "services/api/patient"
import DataItem from "components/DataItem"
import { getBookingById } from "services/api/bookings"
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form"
import Input from "components/Input"
import { toast } from "react-toastify"

const UpsertTreatment = () => {
  const { id, user_id } = useParams()
  const navigate = useNavigate()
  const [medicalRecordData, setMedicalRecordData] = useState(null)
  const [user, setUser] = useState({})
  const location = useLocation()
  const [viewMode, setViewMode] = useState(location.pathname.endsWith("view"))
  const [editMode, setEditMode] = useState(!!id && !location.pathname.endsWith("view"))
  const [loading, setLoading] = useState(false)

  const readonly = false

  useEffect(() => {
    ;(async () => {
      const toastId = toast.loading("Đang tải");
      try {
        if (id) {
          const res = await getBookingById(id)
          if (res.data) {
            const data = formatStrapiObj(res.data)
            const medicalRecord = formatStrapiObj(data?.medical_record)
            if (data) {
              setMedicalRecordData({
                ...medicalRecord,
                ...data,
                patient: formatStrapiObj(data?.patient),
              })
            } else {
            }
          }
        }
      } catch (error) {
      } finally {
        toast.dismiss(toastId);
      }
    })()
  }, [id, navigate])

  return (
    <Page title="Hồ sơ bệnh án">
      <div className="my-4">
      </div>
      <div className="mt-4 rounded-t-2xl">
        {viewMode
          ? medicalRecordData && (
              <PediatricMentalTreatmentForm data={medicalRecordData} user={user} readonly={true} />
            )
          : medicalRecordData && <PediatricMentalTreatmentForm user={user} data={medicalRecordData} />}
      </div>
    </Page>
  )
}

export default UpsertTreatment
