import qs from "qs"
import axios from "../axios"

const populate = [
  // "title",
  // "background",
  // "thumbnail",
  // "areaImage",
  // "bookings",
  // "categories.title",
  // "transactions",
  // "treatmentHistories",
  // "timeSession",
  // "highlight",
  // "highlight.icon",
  // "procedure",
  // "procedure.image",
  // "results.title",
  // "results.images",
  "patient",
  "patient.patient_source",
  "patient.patient_source.image",
  // "booking",
  "doctor_in_charge.patient",
  "booking.patient",
  "prescription",
  "prescriptions",
]

export const getMedicalRecords = (pagination, filters = {}) => {
  const query = qs.stringify({
    filters,
    populate,
    publicationState: "live",
    pagination,
    sort: ["createdAt:DESC"],
  })
  return axios.get(`/medical-records?${query}`)
}

export const getMedicalRecordById = (id) => {
  const query = qs.stringify({
    populate,
  })

  return axios.get(`/medical-records/${id}?${query}`)
}

export const createNewTreatment = (payload) => {
  // const query = qs.stringify({
  //   populate: "*",
  // })
  return axios.post(`/medical-records`, {
    data: payload,
  })
}

export const createOrUpdateTreatment = (payload) => {
  // const query = qs.stringify({
  //   populate: "*",
  // })
  return axios.post(`/medical-record/createOrUpdateTreatment`, {
    data: payload,
  })
}


export const updateMedicalRecord = (id, payload) => {
  return axios.put(`/medical-records/${id}`, {
    data: payload,
  })
}
