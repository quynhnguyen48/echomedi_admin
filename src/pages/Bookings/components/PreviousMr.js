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
  
  const copyText = (text) => {
    toast.success("Đã copy: " + text)
    navigator.clipboard.writeText(text);
  }

  return (
    <Modal
      wrapperClassName="w-[1340px]"
      contentClassName="bg-gray3"
      showCloseButton
      visibleModal={visibleModal}
      onClose={onClose}
    >
      <p>Nội khoa: {data.noi_khoa} <span className="hover:underline text-blue" onClick={e => copyText(data.noi_khoa)}>copy</span></p>
      <p>Ngoại khoa: {data.ngoai_khoa} <span className="hover:underline text-blue" onClick={e => copyText(data.noi_khoa)}>copy</span></p>
      <p>Sản khoa: {data.san_khoa} <span className="hover:underline text-blue" onClick={e => copyText(data.noi_khoa)}>copy</span></p>
      <p>Tiêm chủng: {data.tiem_chung} <span className="hover:underline text-blue" onClick={e => copyText(data.noi_khoa)}>copy</span></p>
      <p>Dị ứng: {data.di_ung} <span className="hover:underline text-blue" onClick={e => copyText(data.noi_khoa)}>copy</span></p>
      <p>Thói quen: {data.thoi_quen} <span className="hover:underline text-blue" onClick={e => copyText(data.noi_khoa)}>copy</span></p>
      <p>Nguy cơ khác: {data.nguy_co_khac} <span className="hover:underline text-blue" onClick={e => copyText(data.noi_khoa)}>copy</span></p>
      <p>Vấn đề khác: {data.van_de_khac} <span className="hover:underline text-blue" onClick={e => copyText(data.noi_khoa)}>copy</span></p>
      <p>Tiền căn gia đình: {data.tien_can_gia_dinh} <span className="hover:underline text-blue" onClick={e => copyText(data.noi_khoa)}>copy</span></p>
    </Modal>
  )
}

export default PrescriptionModal
