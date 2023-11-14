import Button from "components/Button"
import DataItem from "components/DataItem"
import DataItemJSON from "components/DataItem/DataItemJSON"
import dayjs from "dayjs"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import axios from "../../services/axios"
import PrescriptionModal from "./Components/PrescriptionModal"
import TestResultsModal from "./Components/TestResultsModal"
import { flatten } from "lodash"
import InvoiceForm from "./Components/InvoiceForm"
import { isMobile } from "react-device-detect";

const InvoiceDetail = ({ data, onTogglePublish, onUpdate }) => {
  const [medicalServices, setMedicalServices] = useState([])
  const [bundleServices, setBundleServices] = useState([])
  const [cliniqueServices, setCliniqueServices] = useState([])
  const [visibleModal, setVisibleModal] = useState(false)
  const [visiblePrescriptionModal, setVisiblePrescriptionModal] = useState(false)
  const [visibleTestResultModal, setVisibleTestResultModal] = useState(false)
  const [membership, setMembership] = useState();

  useEffect(() => {
    if (data && data.medicalRecord) {
      if (data?.medicalRecord.bundle_services) {
        setBundleServices(typeof data.medicalRecord.bundle_services == "string" ? JSON.parse(data.medicalRecord.bundle_services) : data.medicalRecord.bundle_services)
      }
      if (data?.medicalRecord.services) {
        setMedicalServices(typeof data.medicalRecord.services == "string" ? JSON.parse(data.medicalRecord.services): data.medicalRecord.services)
      }
      if (data?.medicalRecord.membership) {
        setMembership(JSON.parse(data.medicalRecord.membership));
      }
      if (data?.medicalRecord.clinique_services) {
        setCliniqueServices(data.medicalRecord.clinique_services);
      }
    }
  }, [data])

  const downloadPDF = () => {
    const toastId = toast.loading("Đang tải")
    axios
      .post(
        "/invoice/downloadInvoicePDF",
        {
          // axios2.post("http://localhost:1337/api/product/generatePhieuCLS", {
          id: data.id,
        },
        {
          responseType: "arraybuffer",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/pdf",
          },
        }
      )
      .then((response) => {
        const b = new Blob([response.data], { type: "application/pdf" })
        var url = window.URL.createObjectURL(b)
        window.open(url)
        setTimeout(() => window.URL.revokeObjectURL(url), 100)
      })
      .finally(() => {
        toast.dismiss(toastId)
      })
  }

  return (
    <div className={`my-10 w-full max-h-[78vh] ${!isMobile && 'overflow-scroll'}`}>
      <div className="flex items-center gap-x-2"></div>
      <div className="grid grid-cols-3 grid-flow-row gap-y-5">
        <DataItem
          icon="calendar"
          title="Ngày khám bệnh"
          value={dayjs(data?.booking?.bookingDate).format("DD MMMM, YYYY, h:mm")}
        />
        <DataItem
          icon="location"
          title="Chi nhánh"
          value={getDisplayBranchLabel(data?.booking?.branch)}
        />
        <DataItem icon="user" title="Tên" value={data?.patient?.full_name?.toUpperCase()} />
        <DataItem icon="call" title="Số điện thoại" value={data?.patient?.phone} />
        <DataItem icon="calendar" title="Nội dung đặt lịch" value={data?.booking?.note} />
        <div>
          <div
            className={`bg-white justify-center items-center flex fixed inset-0 z-20 outline-none focus:outline-none transition-all ${
              visibleModal ? "visible" : "invisible"
            }`}
          ></div>
        </div>
      </div>
      <div>
        {data?.total && (
          <p className="text-xl font-bold text-right">Tổng {numberWithCommas(data.total)}</p>
        )}
      </div>
      <div className="mt-5">
        <InvoiceForm
          id={data?.id}
          invoiceData={data?.data}
          cashier_in_charge={data?.cashier_in_charge}
          published={!!data?.publishedAt}
          bundleServices={bundleServices}
          medicalServices={medicalServices}
          cliniqueServices={cliniqueServices}
          membership={membership}
          downloadPDF={downloadPDF}
          onUpdate={onUpdate}
          togglePublish={onTogglePublish}
        />
      </div>
      <div className="flex justify-around mt-4">
      </div>
      {visiblePrescriptionModal && (
        <PrescriptionModal
          medicalRecordId={data?.id}
          visibleModal={visiblePrescriptionModal}
          onClose={() => setVisiblePrescriptionModal(false)}
        />
      )}
      {visibleTestResultModal && (
        <TestResultsModal
          medicalRecordId={data?.id}
          services={[
            ...(medicalServices || []),
            ...flatten(bundleServices?.map((item) => item?.attributes?.medical_services?.data)),
          ]}
          visibleModal={visibleTestResultModal}
          onClose={() => setVisibleTestResultModal(false)}
        />
      )}
    </div>
  )
}

function numberWithCommas(x) {
  return x?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

export default InvoiceDetail

function _arrayBufferToBase64(buffer) {
  var binary = ""
  var bytes = new Uint8Array(buffer)
  var len = bytes.byteLength
  for (var i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return window.btoa(binary)
}

function getDisplayBranchLabel(value) {
  switch (value) {
    case "q7":
      return "Quận 7"
    case "q2":
      return "Quận 2"
    case "binhduong":
      return "Bình Dương"
  }
}
