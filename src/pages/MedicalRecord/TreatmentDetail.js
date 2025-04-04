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
import { isMobile } from "react-device-detect";
import moment from "moment";

const TreatmentDetail = ({ data, onTogglePublish }) => {
  const navigate = useNavigate()
  const [medicalServices, setMedicalServices] = useState([])
  const [bundleServices, setBundleServices] = useState([])
  const [cliniqueServices, setCliniqueServices] = useState([])
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
      let dataServices = typeof data.bundle_services == 'string' ? JSON.parse(data.bundle_services) : data.bundle_services;
      setBundleServices(dataServices);
    } else {
      setBundleServices([]);
    }
    if (data.services) {
      let services = typeof data.services == 'string' ? JSON.parse(data.services) : data.services;
      setMedicalServices(services)
    } else {
      setMedicalServices([]);
    }
    if (data.clinique_services) {
      let cliniqueServices = typeof data.clinique_services == 'string' ? JSON.parse(data.clinique_services) : data.clinique_services;
      setCliniqueServices(cliniqueServices);
    } else {
      setCliniqueServices([])
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

  const downloadShortenMedicalRecordV2 = () => {
    const toastId = toast.loading("Đang tải")
    axios
      .post(
        "/product/downloadShortenMedicalRecordV2",
        {
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

    try {
      window.flutter_inappwebview.callHandler('downloadMedicalRecord', data.id);
    } catch (e) {
      console.log('error download inapp view', e);
    }
  }

  const downloadShortenPediatricMedicalRecordV2 = () => {
    const toastId = toast.loading("Đang tải")
    axios
      .post(
        "/product/downloadShortenPediatricMedicalRecordV2",
        {
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

    try {
      window.flutter_inappwebview.callHandler('downloadMedicalRecord', data.id);
    } catch (e) {
      console.log('error download inapp view', e);
    }
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

  const updateMedicalStatus = (status) => {
    const toastId = toast.loading("Đang tải")
    axios
      .post(
        "/medical-record/updateMedicalRecordStatus/" + data.id,
        {
          // axios2.post("http://localhost:1337/api/product/generatePhieuCLS", {
          status,
        }
      )
      .then((response) => {
      })
      .finally(() => {
        toast.dismiss(toastId)
        window.location.reload();
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

    try {
      window.flutter_inappwebview.callHandler('generatePhieuChiDinh', data.id);
    } catch (e) {
      console.log('error download inapp view', e);
    }
  }

  return (
    <div className={`my-4 w-full max-h-[65vh] ${!isMobile && 'overflow-scroll'}`} id='customer-detail'>
      <div className="flex items-center gap-x-2 overflow-scroll"></div>

      <div className="grid grid-cols-3 sm:grid-cols-1 grid-flow-row">
        <DataItem icon="user" title="Tên/SĐT/Năm sinh" value={`${data?.patient?.full_name?.toUpperCase()} - ${data?.patient?.phone} - ${dayjs(data?.patient?.birthday).format("DD/MM/YYYY")}`} />
        <DataItem
          icon="calendar"
          title="Ngày khám bệnh"
          value={dayjs(data?.booking?.bookingDate).format("DD MMMM, YYYY, h:mm")}
        />
        <DataItem icon="location" title="Chi nhánh" value={getDisplayBranchLabel(data?.booking?.branch)} />
      </div>
      <div className="grid grid-cols-1 grid-flow-row">

        <DataItemJSON icon="stickynote" title="Lý do nhập viện" value={parseJson(data?.reasons_to_get_hospitalized)} />
        <DataItemJSON icon="box-tick" title="Bệnh sử" value={parseJson(data?.inquiry)} />
      </div>

      <div className="grid grid-cols-1 grid-flow-row">
        {isMobile ?
          <div className="grid grid-cols-2 sm:grid-cols-2 grid-flow-row px-2">
            <div className="border border-1">Mạch {data?.circuit} (lần/phút)</div>
            <div className="border border-1">Nhiệt độ {data?.temperature} (*C)</div>
            <div className="border border-1">Huyết áp {data?.blood_pressure}/{data?.blood_pressure2} (mmHg)</div>
            <div className="border border-1">Huyết áp lần {data?.blood_pressure_1}/{data?.blood_pressure2_1} (mmHg)</div>
            <div className="border border-1">Nhịp thở(Lần/phút)</div>
            <div className="border border-1">Chiều cao {data?.height} (Cm)</div>
            <div className="border border-1"> Cân nặng {data?.weight} (Kg) </div>
            <div className="border border-1">BMI {data?.bmi}</div>
            <div className="border border-1">SPO2 {data?.spo2}</div>
          </div> :
          <table className="table-auto sinh_hieu w-full max-w-[800px]">
            <tr>
              <th className="border border-1">Mạch(lần/phút)</th>
              <th className="border border-1">Nhiệt độ(*C)</th>
              <th className="border border-1">Huyết áp(mmHg)</th>
              <th className="border border-1">Huyết áp lần 2(mmHg)</th>
              <th className="border border-1">Nhịp thở(Lần/phút)</th>
            </tr>
            <tr>
              <th className="border border-1">{data?.circuit}</th>
              <th className="border border-1">{data?.temperature}</th>
              <th className="border border-1">{data?.blood_pressure}/{data?.blood_pressure2}</th>
              <th className="border border-1">{data?.blood_pressure_1}/{data?.blood_pressure2_1}</th>
              <th className="border border-1">{data?.respiratory_rate}</th>
            </tr>
            <tr>
              <th className="border border-1">Chiều cao(Cm)</th>
              <th className="border border-1"> Cân nặng(Kg) </th>
              <th className="border border-1">BMI</th>
              <th className="border border-1">SPO2</th>
            </tr>
            <tr>
              <th className="border border-1">{data?.height}</th>
              <th className="border border-1">{data?.weight}</th>
              <th className="border border-1">{data?.bmi}</th>
              <th className="border border-1">{data?.spo2}</th>
            </tr>
          </table>}
        <div className="w-full">
          <input type="checkbox" name="panel" id="panel-7" class="hidden" />
          <label for="panel-7" class="relative block bg-green p-1 shadow border-b border-green cursor-pointer	bg-primary text-white font-bold">Tiền căn bản thân  &#62;</label>
          <div class="accordion__content overflow-scroll bg-grey-lighter">
            <div className="w-full py-2">

              <DataItemJSON icon="box-tick" title="Nội khoa" value={parseJson(data?.noi_khoa)} />
              <DataItemJSON icon="box-tick" title="Ngoại khoa" value={parseJson(data?.ngoai_khoa)} />
              <DataItemJSON icon="box-tick" title="Sản khoa" value={parseJson(data?.san_khoa)} />
              <DataItemJSON icon="box-tick" title="Tiêm chủng" value={parseJson(data?.tiem_chung)} />
              <DataItemJSON icon="box-tick" title="Dị ứng" value={parseJson(data?.di_ung)} />
              <DataItemJSON icon="box-tick" title="Thói quen" value={parseJson(data?.thoi_quen)} />
              <DataItemJSON icon="box-tick" title="Nguy cơ khác" value={parseJson(data?.nguy_co_khac)} />
              <DataItemJSON icon="box-tick" title="Vấn đề khác" value={parseJson(data?.van_de_khac)} />
              <DataItemJSON icon="box-tick" title="Tiền căn gia đình" value={parseJson(data?.tien_can_gia_dinh)} />
            </div>
          </div>
        </div>
        <div className="w-full">
          <input type="checkbox" name="panel" id="panel-1" class="hidden" />
          <label for="panel-1" class="relative block bg-black p-1 shadow border-b border-green cursor-pointer	bg-primary text-white font-bold">Khám lâm sàng  &#62;</label>
          <div class="accordion__content overflow-scroll bg-grey-lighter">
            <div className="w-full py-2"></div>
            <DataItemJSON icon="box-tick" title="Tổng quát" value={parseJson(data?.tong_quat)} />
            <DataItemJSON icon="box-tick" title="Tim mạch" value={parseJson(data?.tim_mach)} />
            <DataItemJSON icon="box-tick" title="Hô hấp" value={parseJson(data?.ho_hap)} />
            <DataItemJSON icon="box-tick" title="Tiêu hóa tiết niệu" value={parseJson(data?.tieu_hoa_tiet_nieu)} />
            <DataItemJSON icon="box-tick" title="Cơ xương khớp" value={parseJson(data?.co_xuong_khop)} />
            <DataItemJSON icon="box-tick" title="Thần kinh" value={parseJson(data?.than_kinh)} />
            <DataItemJSON icon="box-tick" title="Sản phụ khoa" value={parseJson(data?.san_phu_khoa)} />
            <DataItemJSON icon="box-tick" title="Mắt - tai mũi họng - răng hàm mặt" value={parseJson(data?.mat_tai_mui_hong)} />
            <DataItemJSON icon="box-tick" title="Cơ quan khác" value={parseJson(data?.co_quan_khac)} />
            <DataItemJSON icon="box-tick" title="Các thang điểm cần đánh giá" value={parseJson(data?.cac_thang_diem_can_danh_gia)} />
            <DataItemJSON icon="box-tick" title="Dinh dưỡng" value={parseJson(data?.dinh_duong)} />
            <DataItemJSON icon="box-tick" title="Kết quả cận lâm sàng" value={parseJson(data?.ket_qua_cls)} />
            <DataItemJSON icon="box-tick" title="Chẩn đoán" value={parseJson(data?.chan_doan)} />
            <DataItemJSON icon="box-tick" title="Hướng điều trị" value={parseJson(data?.treatment_regimen)} />
            <DataItem icon="box-tick" title="Nội dung đặt lịch" value={data?.booking?.note} />
          </div>
        </div>
        {/* <DataItem
          icon="calendar"
          title="Tên"
          value={data?.patient?.address?.address}
        /> */}

        <div>
          <div
            className={`bg-white justify-center items-center flex fixed inset-0 z-20 outline-none focus:outline-none transition-all ${visibleModal ? "visible" : "invisible"
              }`}
          ></div>
        </div>
      </div>

      <div className="mt-5">
        {cliniqueServices && cliniqueServices.length > 0 && <p className="underline text-xl font-bold mt-5">Dịch vụ lâm sàng:</p>}
        <table className="service w-full">
          {cliniqueServices &&
            cliniqueServices.map((b) => (
              <tr>
                <th>{b.attributes.label}</th>
                <th className="price">{numberWithCommas(b.attributes.price)}</th>
              </tr>
            ))}
        </table>
        {bundleServices && bundleServices.length > 0 && <p className="underline text-xl font-bold">Gói dịch vụ:</p>}
        {bundleServices && Array.isArray(bundleServices) &&
          bundleServices.map((b) => (
            <div>
              <div className="flex flex-row justify-between	">
                <div className="w-full">
                  <input type="checkbox" name="panel" id={`panel-${b.id}`} class="hidden" />
                  <div className="flex justify-between">
                    <label for={`panel-${b.id}`} class="relative block bg-black p-1 shadow border-b border-green cursor-pointer	bg-primary text-white font-bold">{b.attributes.label} &#62;</label>
                    <label class=""> {numberWithCommas(b.attributes.price)}</label>
                  </div>
                  <div class="accordion__content overflow-scroll bg-grey-lighter">

                    <ol className="service w-full" style={{ listStyleType: "decimal", marginLeft: "20px" }}>
                      {Array.isArray((b.attributes.medical_services.data || b.attributes.medical_services)) && (b.attributes.medical_services.data || b.attributes.medical_services)?.map((s) => (
                        // <p> - {s.attributes.label}</p>
                        <li>{s?.attributes?.label || s?.label}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div></div>
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
      <div>
        {data?.total && (
          <p className="text-xl font-bold text-right">Tổng {numberWithCommas(data.total)}</p>
        )}
      </div>
      <div className="fixed bottom-0 sm:relative">
        <div className="grid grid-cols-4 xl:grid-cols-3 md:grid-cols-2 sm:grid-cols-2 gap-x-4">
          {!data.is_pediatric_mr && <Button
            btnSize="small"
            className="mt-2"
            onClick={() => {
                navigate(`/bookings/medical-records/${data.booking.id}/view`)
            }}
          >
            Xem bệnh án
          </Button>}
          
          {!data.is_pediatric_mr && (currentUser.role.type == "admin" || (currentUser.role.type != "pharmacist" && moment().isSame(moment(data.booking.bookingDate), 'day'))) && <Button
            btnSize="small"
            className="mt-2"
            onClick={() => {
              navigate(`/bookings/medical-records/${data.booking.id}/edit`)
            }}
          >
            Sửa bệnh án
          </Button>}
          {data.is_pediatric_mr && <Button
            btnSize="small"
            className="mt-2"
            onClick={() => {
                navigate(`/bookings/medical-records-pediatrics/${data.booking.id}/view`)
            }}
          >
            Xem bệnh án nhi
          </Button>}
          
          {data.is_pediatric_mr && (currentUser.role.type == "admin" || (currentUser.role.type != "pharmacist" && moment().isSame(moment(data.booking.bookingDate), 'day'))) && <Button
            btnSize="small"
            className="mt-2"
            onClick={() => {
              navigate(`/bookings/medical-records-pediatrics/${data.booking.id}/edit`)
            }}
          >
            Sửa bệnh án nhi
          </Button>}
          {data.is_mental_health_mr && <Button
            btnSize="small"
            className="mt-2"
            onClick={() => {
                navigate(`/bookings/mental-health-medical-records/${data.booking.id}/create`)
            }}
          >
            Xem/Sửa bệnh án tâm lý
          </Button>}
          {data.is_pediatric_mental_health_mr && <Button
            btnSize="small"
            className="mt-2"
            onClick={() => {
                navigate(`/bookings/pediatric-mental-health-medical-records/${data.booking.id}/create`)
            }}
          >
            Xem/Sửa bệnh án tâm lý
          </Button>}
          {currentUser.role.type != "pharmacist" && <Button
            btnSize="small"
            className="mt-2"
            onClick={(e) => {
              if (data.is_pediatric_mr) {
                downloadShortenPediatricMedicalRecordV2()
              } else {
                downloadShortenMedicalRecordV2()
              }
            }}
          >
            Tải bệnh án
          </Button>}
          {currentUser.role.type != "pharmacist" && <Button btnSize="small" className="mt-2" onClick={() => generatePhieuChiDinh(true)}>
            Tải phiếu chỉ định
          </Button>}
          {currentUser.role.type != "pharmacist" && <Button btnSize="small" className="mt-2" onClick={() => setVisibleTestResultModal(true)}>
            Kết quả xét nghiệm
          </Button>}
          <Button btnSize="small" className="mt-2" onClick={() => setVisiblePrescriptionModal(true)}>
            Đơn thuốc
          </Button>
        </div>
        <div className="flex gap-2 py-2 grid xl:grid-cols-2 grid-cols-4 sm:grid-cols-1 mb-2">
          <Button btnType={data.status == "result_received" ? "primary" : "outline"} className="fill-primary" onClick={e => updateMedicalStatus("result_received")}>
            Đã có kết quả xét nghiệm
          </Button>
          <Button btnType={data.status == "result_examined" ? "primary" : "outline"} className="fill-primary" onClick={e => updateMedicalStatus("result_examined")}>
            Đã xem kết quả xét nghiệm
          </Button>
          <Button btnType={data.status == "result_done" ? "primary" : "outline"} className="fill-primary" onClick={e => updateMedicalStatus("result_done")}>
            Hoàn thành bệnh án
          </Button>
        </div>
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
              bundleServices?.map((item) => item?.attributes?.medical_services?.data ?? item?.attributes?.medical_services)
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
