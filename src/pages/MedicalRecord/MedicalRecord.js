import { useCallback, useRef, useState, useEffect } from "react"
import classNames from "classnames"
import { useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { toast } from "react-toastify"
import axios from "../../services/axios"

import Button from "components/Button"
import Icon from "components/Icon"
import Page from "components/Page"
import SearchInput from "components/SearchInput"
import { getTreatments, updateTreatment } from "services/api/treatment"
import { getMedicalRecords } from "services/api/medicalRecord"
import { formatStrapiArr, formatStrapiObj } from "utils/strapi"
import { resetPageIndex } from "slice/tableSlice"
import TreatmentsTable from "./Components/TreatmentsTable"
import TreatmentDetail from "./TreatmentDetail"
import TreatmentAnalytics from "./Components/TreatmentAnalytics"
import { getErrorMessage } from "../../utils/error"
import { Calendar, globalizeLocalizer, dateFnsLocalizer } from "react-big-calendar"
import globalize from "globalize"
import "react-big-calendar/lib/css/react-big-calendar.css"
import viVN from "date-fns/locale/vi"
import format from "date-fns/format"
import parse from "date-fns/parse"
import startOfWeek from "date-fns/startOfWeek"
import getDay from "date-fns/getDay"
import Datepicker from "components/Datepicker"
import moment from "moment"

const locales = {
  vi: viVN,
}


function removeVietnameseTones(str) {
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a")
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e")
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i")
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o")
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u")
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y")
  str = str.replace(/đ/g, "d")
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A")
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E")
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I")
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O")
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U")
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y")
  str = str.replace(/Đ/g, "D")
  // Some system encode vietnamese combining accent as individual utf-8 characters
  // Một vài bộ encode coi các dấu mũ, dấu chữ như một kí tự riêng biệt nên thêm hai dòng này
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, "") // ̀ ́ ̃ ̉ ̣  huyền, sắc, ngã, hỏi, nặng
  str = str.replace(/\u02C6|\u0306|\u031B/g, "") // ˆ ̆ ̛  Â, Ê, Ă, Ơ, Ư
  // Remove extra spaces
  // Bỏ các khoảng trắng liền nhau
  str = str.replace(/ + /g, " ")
  str = str.trim()
  // Remove punctuations
  // Bỏ dấu câu, kí tự đặc biệt
  str = str.replace(
    /!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g,
    " "
  )
  return str
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

const Treatments = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const today = moment()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [pageCount, setPageCount] = useState(0)
  const [detailData, setDetailData] = useState()
  const [searchKey, setSearchKey] = useState()
  const [startDate, setStartDate] = useState()
  const [endDate, setEndDate] = useState()
  const fetchIdRef = useRef(0)
  const [dateType, setDateType] = useState("month")

  const fetchData = useCallback(
    async ({ pageSize, pageIndex }) => {
      const fetchId = ++fetchIdRef.current

      if (fetchId === fetchIdRef.current) {
        try {
          setLoading(true)
          let filters = {}
          if (searchKey?.length) {
            setDetailData(null)
            filters = {
              $or: [
                {
                  code: { $containsi: searchKey },
                },
                {
                  name: { $containsi: searchKey },
                },
              ],
              publicationState: "live"
            }
            search();
          } else {
            const res = await getMedicalRecords(
              {
                pageSize: 10,
                page: pageIndex + 1,
              },
              filters
            )
            if (res.data) {
              const listTreatments = formatStrapiArr(res.data)
              
              setData(
                listTreatments?.map((treatment) => {
                  const booking = formatStrapiObj(treatment?.booking)
                  let patient = formatStrapiObj(treatment?.patient);
                  patient.patient_source = formatStrapiObj(patient?.patient_source);
                  if (patient.patient_source)
                  patient.patient_source.image = formatStrapiObj(patient?.patient_source.image);
                  return {
                    ...treatment,
                    areaImage: formatStrapiObj(treatment?.areaImage),
                    patient: patient,
                    background: formatStrapiObj(treatment?.background),
                    thumbnail: formatStrapiObj(treatment?.thumbnail),
                    categories: formatStrapiArr(treatment?.categories),
                    bookings: formatStrapiArr(treatment?.bookings),
                    transactions: formatStrapiArr(treatment?.transactions),
                    prescription: formatStrapiObj(treatment?.prescription),
                    doctor_in_charge: formatStrapiObj(treatment?.doctor_in_charge),
                    booking,
                    treatmentHistories: formatStrapiArr(treatment?.treatmentHistories),
                  }
                })
              )
              setPageCount(res?.data?.meta?.pagination?.pageCount)
            }
          }
        } catch (error) {
        } finally {
          setLoading(false)
        }
      }
    },
    [searchKey]
  )

  const togglePublish = useCallback(async () => {
    try {
      const res = await updateTreatment(detailData?.id, {
        publishedAt: !!detailData?.publishedAt ? null : new Date().toISOString(),
      })
      let updatedData = formatStrapiObj(res.data)
      setDetailData((oldDetailData) => ({
        ...oldDetailData,
        publishedAt: updatedData?.publishedAt,
      }))
      setData((oldData) => {
        const pos = oldData.findIndex((t) => t.id === detailData?.id)
        if (pos > -1) {
          oldData[pos].publishedAt = updatedData?.publishedAt
        }
        return oldData
      })
      toast.success(
        `Treatment ${!!detailData?.publishedAt ? "unpublished" : "published"} successfully!`
      )
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }, [detailData?.id, detailData?.publishedAt])

  const search = () => {
    const toastId = toast.loading("Đang tải")
    axios
      .post(
        "/medical-record/search",
        {
          data: {
            startDate,
            endDate,
            searchKey,
          }
        },
      )
      .then((response) => {
        setData(response.data)
        setPageCount(1);
      })
      .finally(() => {
        toast.dismiss(toastId)
      })
  }

  const downloadReport = () => {
    const toastId = toast.loading("Đang tải")
    axios
      .post(
        "/medical-record/download-report",
        {
          data: {
            startDate,
            endDate,
          }
        },
      )
      .then((response) => {
        let csvContent = "data:text/csv;charset=utf-8," + response.data;
        var encodedUri = encodeURI(csvContent);
        var link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "my_data.csv");
        document.body.appendChild(link); // Required for FF

        link.click(); // This will download the data file named "my_data.csv".
      })
      .finally(() => {
        toast.dismiss(toastId)
      })
  }

  useEffect(() => {
    document.getElementById('customer-detail')?.scrollIntoView()
  }, [detailData])

  return (
    <Page
      title="Quản lý hồ sơ bệnh án"
    >
      <div className="grid grid-cols-4 sm:grid-cols-2 gap-y-2 gap-x-2 items-end	">
      <SearchInput
          placeholder="Tìm khách hàng theo tên"
          className="flex-1 col-span-1 sm:col-span-2"
          onSearch={(value) => {
            dispatch(resetPageIndex())
            setSearchKey(removeVietnameseTones(value))
          }}
        />
        <div className="">
          <p>Ngày bắt đầu</p>
          <Datepicker
            className="bg-primary text-white"
            iconClassName="fill-white"
            value={startDate}
            dateFormat={"dd MMMM, yyyy"}
            showMonthYearPicker={dateType === "date"}
            onChange={(date) => {
              date.setHours(0);
              setStartDate(date);
            }}
          />
        </div><div
          className="">
            <p>Ngày kết thúc</p>
          <Datepicker
            className="bg-primary text-white"
            iconClassName="fill-white"
            value={endDate}
            dateFormat={"dd MMMM, yyyy"}
            showMonthYearPicker={dateType === "date"}
            onChange={(date) => {
              date.setHours(23);
              date.setMinutes(59);
              setEndDate(date);
            }}
          />
        </div>
        <div className="ml-2 flex">
          <Button
            onClick={() => {
              search();
            }}
          >
            Tìm kiếm
          </Button>
          <Button
            className={"ml-4"}
            onClick={() => {
              downloadReport();
            }}
          >
            Xuất file
          </Button>
        </div>
      </div>
      <div
        className={classNames({
          "w-full": !detailData,
          "sm:block flex gap-x-6": detailData,
        })}
      >
        <TreatmentsTable
          data={data}
          loading={loading}
          pageCount={pageCount}
          activeRow={detailData}
          fetchData={fetchData}
          onClickRow={setDetailData}
        />
        {detailData && <TreatmentDetail data={detailData} onTogglePublish={togglePublish} />}
      </div>
    </Page>
  )
}

export default Treatments
