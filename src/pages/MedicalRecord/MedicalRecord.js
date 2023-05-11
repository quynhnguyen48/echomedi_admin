import { useCallback, useRef, useState } from "react"
import classNames from "classnames"
import { useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { toast } from "react-toastify"

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
            }
          }
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
                return {
                  ...treatment,
                  areaImage: formatStrapiObj(treatment?.areaImage),
                  background: formatStrapiObj(treatment?.background),
                  thumbnail: formatStrapiObj(treatment?.thumbnail),
                  categories: formatStrapiArr(treatment?.categories),
                  bookings: formatStrapiArr(treatment?.bookings),
                  transactions: formatStrapiArr(treatment?.transactions),
                  patient: formatStrapiObj(booking?.patient),
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

  return (
    <Page
      title="Quản lý hồ sơ bệnh án"
    // rightContent={detailData && <TreatmentAnalytics data={detailData} />}
    >
      {/* <div className="w-full flex items-center gap-x-9">
        <SearchInput
          placeholder="Search by Treatment ID / Treatment Name"
          className="flex-1"
          onSearch={(value) => {
            dispatch(resetPageIndex())
            setSearchKey(value)
          }}
        />
      </div> */}
      {/* <div className="pt-4">
      <Calendar
      onSelectEvent={(e) => {
        console.log(e);
      }}
      onSelecting={() => alert(312321)}
      localizer={localizer}
      events={bookings}
      startAccessor="start"
      endAccessor="end"
      style={{ height: 500 }}
    />
    </div> */}
      <div className="flex items-center">
        <div className="w-[340px]  mr-4">
          <Datepicker
            className="bg-primary text-white"
            iconClassName="fill-white"
            value={startDate}
            dateFormat={"dd MMMM, yyyy"}
            showMonthYearPicker={dateType === "date"}
            onChange={(date) => {
              setStartDate(date);
            }}
          />
        </div><div
          className="w-[340px]">
          <Datepicker
            className="bg-primary text-white"
            iconClassName="fill-white"
            value={endDate}
            dateFormat={"dd MMMM, yyyy"}
            showMonthYearPicker={dateType === "date"}
            onChange={(date) => {
              setEndDate(date);
            }}
          />
        </div>
        <div className="ml-6">
          <Button
            onClick={() => {
              const input = document.getElementById('input')
              input.click();
            }}
          >
            Tìm kiếm
          </Button>
        </div>
        <div className="ml-6">
          <Button
            onClick={() => {
              const input = document.getElementById('input')
              input.click();
            }}
          >
            Xuất file
          </Button>
        </div>
      </div>
      <div
        className={classNames({
          "w-full": !detailData,
          "flex gap-x-6": detailData,
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
