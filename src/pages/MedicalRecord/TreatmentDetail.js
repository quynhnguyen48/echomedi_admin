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
import { useDispatch, useSelector } from "react-redux";

const TreatmentDetail = ({ data, onTogglePublish }) => {
  const navigate = useNavigate()
  const [medicalServices, setMedicalServices] = useState([])
  const [bundleServices, setBundleServices] = useState([])
  const [blob, setBlob] = useState(null)
  const [visibleModal, setVisibleModal] = useState(false)
  const [visiblePrescriptionModal, setVisiblePrescriptionModal] = useState(false)
  const [visibleTestResultModal, setVisibleTestResultModal] = useState(false)
  const currentUser = useSelector((state) => state.user.currentUser);

  const formatInterval = (interval) => {
    const intervalSplit = interval?.split(":")
    return intervalSplit[0] * 60 + intervalSplit[1] * 1 + " minutes"
  }


  useEffect(() => {
    if (data.bundle_services) {
      setBundleServices(JSON.parse(data.bundle_services))
    }
    if (data.services) {
      setMedicalServices(JSON.parse(data.services))
    }
  }, [data])

  const downloadMedicalRecord = () => {
    const toastId = toast.loading("Đang tải")
    axios
      .post(
        "/product/downloadMedicalRecord",
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

  const downloadShortenMedicalRecord = () => {
    const toastId = toast.loading("Đang tải")
    axios
      .post(
        "/product/downloadShortenMedicalRecord",
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

  const downloadPDF = () => {
    const toastId = toast.loading("Đang tải")
    axios
      .post(
        "/product/generatePhieuCLS",
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

  const generatePhieuChiDinh = () => {
    const toastId = toast.loading("Đang tải")
    axios
      .post(
        "/product/generatePhieuChiDinh",
        {
          // axios2.post("http://localhost:1337/api/product/generatePhieuChiDinh", {
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

  console.log('data', data)


  return (
    <div className="my-4 w-full max-h-[70vh]">
      <div className="flex items-center gap-x-2"></div>
      <table className="table-auto sinh_hieu w-full">
        <tr>
          <th>Mạch(lần/phút)</th>
          <th>Nhiệt độ(*C)</th>
          <th>Huyết áp(mmHg)</th>
          <th>Nhịp thở(Lần/phút)</th>
        </tr>
        <tr>
          <th>{data?.circuit}</th>
          <th>{data?.temperature}</th>
          <th>{data?.blood_pressure}/{data?.blood_pressure2}</th>
          <th>{data?.respiratory_rate}</th>
        </tr>
        <tr>
          <th>Chiều cao(Cm)</th>
          <th> Cân nặng(Kg) </th>
          <th>BMI</th>
          <th>SPO2</th>
        </tr>
        <tr>
          <th>{data?.height}</th>
          <th>{data?.weight}</th>
          <th>{data?.bmi}</th>
          <th>{data?.spo2}</th>
        </tr>
      </table>
      <div className="grid grid-cols-1 grid-flow-row gap-y-5 mt-2">
        <DataItem
          icon="calendar"
          title="Ngày khám bệnh"
          value={dayjs(data?.booking?.bookingDate).format("DD MMMM, YYYY, h:mm")}
        />
        <DataItem icon="location" title="Chi nhánh" value={getDisplayBranchLabel(data?.booking?.branch)} />
        <DataItem icon="user" title="Tên" value={data?.patient?.full_name} />
        <DataItem icon="call" title="Số điện thoại" value={data?.patient?.phone} />
        <DataItemJSON icon="stickynote" title="Lý do nhập viện" value={parseJson(data?.reasons_to_get_hospitalized)} />
        <DataItemJSON icon="calendar" title="Chẩn đoán" value={parseJson(data?.diagnose)} />
        <DataItemJSON icon="calendar" title="Hướng điều trị" value={parseJson(data?.treatment_regimen)} />
        <DataItemJSON icon="calendar" title="Khám bệnh" value={parseJson(data?.examination)} />
        <DataItemJSON icon="calendar" title="Hỏi bệnh" value={parseJson(data?.inquiry)} />
        <DataItem icon="calendar" title="Nội dung đặt lịch" value={data?.booking?.note} />
        {/* <DataItem
          icon="calendar"
          title="Tên"
          value={data?.patient?.address?.address}
        /> */}

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
        {bundleServices && bundleServices.length > 0 && <p className="underline text-xl font-bold">Gói dịch vụ:</p>}
        {bundleServices &&
          bundleServices.map((b) => (
            <div>
              <div className="flex flex-row justify-between	">
                <p className="font-semibold"> + {b.attributes.label}</p>
                <span>{numberWithCommas(b.attributes.price)}</span>
              </div>
              <table className="service w-full">
              {b.attributes.medical_services?.data?.map((s) => (
                // <p> - {s.attributes.label}</p>
                <tr>
            <th>- {s.attributes.label}</th>
            </tr>
              ))}
              </table>
            </div>
          ))}
        {medicalServices && medicalServices.length > 0 && <p className="underline text-xl font-bold mt-5">Dịch vụ:</p>}
        <table className="service w-full">
        {medicalServices &&
          medicalServices.map((b) => (
            // <div className="flex flex-row justify-between	">
            //   <p>{b.attributes.label}</p>
            //   <span>{numberWithCommas(b.attributes.price)}</span>
            // </div>
            <tr>
            <th>{b.attributes.label}</th>
            <th className="price">{numberWithCommas(b.attributes.price)}</th>
          </tr>
          ))}
          </table>
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-1 gap-x-4 py-4">
      {currentUser.role.type != "pharmacist" && <Button
          btnSize="small"
          className="mt-2"
          onClick={() => {
            navigate(`/bookings/medical-records/${data.booking.id}/edit`)
          }}
        >
          Sửa bệnh án
        </Button>}
        {currentUser.role.type != "pharmacist" &&<Button
          btnSize="small"
          className="mt-2"
          onClick={(e) => {
            downloadMedicalRecord()
          }}
        >
          Tải bệnh án
        </Button>}
        {currentUser.role.type != "pharmacist" &&<Button
          btnSize="small"
          className="mt-2"
          onClick={(e) => {
            downloadShortenMedicalRecord()
          }}
        >
          Tải bệnh án tóm tắt
        </Button>}
        {currentUser.role.type != "pharmacist" &&<Button btnSize="small" className="mt-2" onClick={() => generatePhieuChiDinh(true)}>
          Tải phiếu chỉ định
        </Button>}
        {currentUser.role.type != "pharmacist" &&<Button btnSize="small" className="mt-2" onClick={() => setVisibleTestResultModal(true)}>
          Kết quả xét nghiệm
        </Button>}
        <Button btnSize="small" className="mt-2" onClick={() => setVisiblePrescriptionModal(true)}>
          Đơn thuốc
        </Button>
      </div>
      {visiblePrescriptionModal && (
        <PrescriptionModal
          readOnly={currentUser.role.type == "pharmacist"}
          patientId={data?.patient?.id}
          data={data}
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
            ...flatten(
              bundleServices?.map((item) => item?.attributes?.medical_services?.data)
            ),
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

export default TreatmentDetail

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
    case 'q7':
      return "Quận 7";
    case 'q2':
      return "Quận 2";
    case 'binhduong':
      return "Bình Dương";
  }
}

function parseJson(str) {
  try {
    let items = JSON.parse(str);
    return items.map(i => i.value).join("\n");
  } catch (e) {
      return str;
  }
}
