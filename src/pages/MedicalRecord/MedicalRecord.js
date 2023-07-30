import { useCallback, useRef, useState } from "react"
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
          }
          const res = await getMedicalRecords(
            {
              pageSize: 15,
              page: pageIndex + 1,
            },
            filters
          )
          if (res.data) {
            const listTreatments = formatStrapiArr(res.data)
            console.log('lsitTreatments', listTreatments)
            setData(
              listTreatments?.map((treatment) => {
                const booking = formatStrapiObj(treatment?.booking)
                return {
                  ...treatment,
                  areaImage: formatStrapiObj(treatment?.areaImage),
                  patient: formatStrapiObj(treatment?.patient),
                  background: formatStrapiObj(treatment?.background),
                  thumbnail: formatStrapiObj(treatment?.thumbnail),
                  categories: formatStrapiArr(treatment?.categories),
                  bookings: formatStrapiArr(treatment?.bookings),
                  transactions: formatStrapiArr(treatment?.transactions),
                  patient: formatStrapiObj(treatment?.patient),
                  prescription: formatStrapiObj(treatment?.prescription),
                  booking,
                  treatmentHistories: formatStrapiArr(treatment?.treatmentHistories),
                }
              })
            )

            setPageCount(res?.data?.meta?.pagination?.pageCount)
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

  return (
    <Page
      title="Quản lý hồ sơ bệnh án"
    >
      <div className="grid grid-cols-4 sm:grid-cols-1 gap-y-2 items-center gap-x-2">
        <div className="">
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
        <div className="ml-6">
          <Button
            onClick={() => {
              search();
            }}
          >
            Tìm kiếm
          </Button>
        </div>
        <div className="ml-6">
          <Button
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
