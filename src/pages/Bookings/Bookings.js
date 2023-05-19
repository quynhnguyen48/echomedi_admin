import classNames from "classnames"
import { useCallback, useEffect, useRef, useState } from "react"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import {
  Calendar,
  momentLocalizer,
  globalizeLocalizer,
  dateFnsLocalizer,
  Views,
} from "react-big-calendar"

import Button from "components/Button"
import Icon from "components/Icon"
import Page from "components/Page"
import SearchInput from "components/SearchInput"
import { deleteBooking, getListBookings, updateBooking } from "services/api/bookings"
import { resetPageIndex } from "slice/tableSlice"
import { getErrorMessage } from "utils/error"
import { formatStrapiArr, formatStrapiObj } from "utils/strapi"
import BookingDetail from "./BookingDetail"
import BookingTable from "./components/BookingTable"
import globalize from "globalize"
import "react-big-calendar/lib/css/react-big-calendar.css"
import viVN from "date-fns/locale/vi"
import format from "date-fns/format"
import parse from "date-fns/parse"
import startOfWeek from "date-fns/startOfWeek"
import getDay from "date-fns/getDay"
import Modal from "components/Modal2"
import TreatmentForm from "./components/CustomersForm"
import axios from "../../services/axios"
import { setBookings } from "slice/userSlice"
import moment from "moment"
import { BRANCH } from "constants/Authentication"
require("moment/locale/vi.js")
const localizer2 = momentLocalizer(moment)
let allViews = Object.keys(Views).map((k) => Views[k])
const locales = {
  vi: viVN,
}

function Event({ event }) {
  return (
    <span>
      <strong>{event.title}</strong>
      {event.desc && ":  " + event.desc}
    </span>
  )
}

function EventAgenda({ event }) {
  return (
    <span>
      <em style={{ color: "magenta" }}>{event.title}</em>
      <p>{event.desc}</p>
    </span>
  )
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

const bookingStatus = ["scheduled", "confirmed", "waiting", "postpone", "finished", "cancelled"];


const Bookings = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const today = moment()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [pageCount, setPageCount] = useState(0)
  const [detailData, setDetailData] = useState()
  const [searchKey, setSearchKey] = useState()
  const fetchIdRef = useRef(0)
  const [modalVisible, setModalVisible] = useState(false)
  const [slotInfo, setSlotInfo] = useState({})
  const [startDate, setStartDate] = useState(today.startOf("week").toDate())
  const [endDate, setEndDate] = useState(today.endOf("week").toDate())
  const [events, setEvents] = useState([])
  const [createNewPatient, setCreateNewPatient] = useState(false)
  const [upBooking, setUpBooking] = useState(false)
  const [statusFilter, setStatusFilter] = useState(bookingStatus);

  useEffect(() => {
    loadBookings();
  }, [statusFilter]);

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
                  user: {
                    $or: [
                      { lastName: { $containsi: searchKey } },
                      { firstName: { $containsi: searchKey } },
                    ],
                  },
                },
                {
                  code: { $containsi: searchKey },
                },
                {
                  treatment: {
                    name: { $containsi: searchKey },
                  },
                },
              ],
            }
          }
          const res = await getListBookings(
            {
              pageSize: 10,
              page: pageIndex + 1,
            },
            filters
          )
          if (res.data) {
            const listBookings = formatStrapiArr(res.data)
            setData(
              listBookings?.map((booking) => ({
                ...booking,
                staff: formatStrapiObj(booking.staff),
                user: formatStrapiObj(booking.user),
                medicalRecord: formatStrapiObj(booking.medical_record),
              }))
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

  const loadBookings = () => {
    const id = toast.loading("Đang tải dữ liệu")
    axios
      .post("/bookings/getBookingWithRange", {
        data: {
          startDate,
          endDate,
          branch: localStorage.getItem(BRANCH),
          dontShowOnCalendar: false,
          status: statusFilter,
        },
      })
      .then((response) => {
        let bks = response.data.bookings
        bks = bks.map((b) => {
          return {
            start: new Date(b.bookingDate),
            end: moment(b.bookingDate).add(29, "minutes").toDate(),
            status: b.status,
            ...b,
            id: b.id,
            title: (b.type ?? "") + " " + b.patient?.uid + " | " + b.patient?.full_name,
          }
        })
        setEvents(bks)
      })
      .finally(() => {
        toast.dismiss(id)
      })
  }

  useEffect(() => {
    loadBookings()
  }, [startDate, endDate])

  const handleDeleteBooking = useCallback(async () => {
    try {
      await deleteBooking(detailData?.id)
      setDetailData(null)
      setData(data.filter((booking) => booking.id !== detailData?.id))
      toast.success("Booking deleted successfully!")
    } catch (error) {
      // toast.error(getErrorMessage(error));
    }
  }, [data, detailData?.id])

  const toggleFilter = (s) => {
    if (statusFilter.indexOf(s) == -1) {
      const newStatusFilter = [...statusFilter, s];
      setStatusFilter(newStatusFilter);
    } else {
      const newStatusFilter = statusFilter.filter(ss => ss != s);
      setStatusFilter(newStatusFilter);
    }
  }

  const updateStatus = useCallback(
    async (status) => {
      try {
        await updateBooking(detailData?.id, {
          status,
        })
        setDetailData((oldDetailData) => ({
          ...oldDetailData,
          status,
        }))
        setData((oldData) => {
          const pos = oldData.findIndex((t) => t.id === detailData?.id)
          if (pos > -1) {
            oldData[pos].status = status
          }
          return oldData
        })
        toast.success(`Booking status updated successfully!`)
      } catch (error) {
        // toast.error(getErrorMessage(error));
      }
    },
    [detailData?.id]
  )

  const eventStyleGetter = (event, start, end, isSelected) => {
    
    let backgroundColor
    switch (event.status) {
        case bookingStatus[0]:
          backgroundColor = "orange"
          break
        case bookingStatus[1]:
          backgroundColor = "green"
          break
        case bookingStatus[2]:
          backgroundColor = "blue"
          break
        case bookingStatus[3]:
          backgroundColor = "grey"
          break
        case bookingStatus[4]:
          backgroundColor = "purple"
          break
        case bookingStatus[5]:
          backgroundColor = "red"
          break
      }
    var style = {
      backgroundColor: backgroundColor,
      borderRadius: "0px",
      opacity: 0.8,
      color: "white",
      border: "0px",
      display: "block",
    }
    return {
      style: style,
    }
  }

  return (
    <Page title="Quản lý lịch hẹn">
      <div className="w-full flex items-center gap-x-9 mb-4">
        {/* <SearchInput
          placeholder="Search by Booking ID / Customer Name / Treatment Name"
          className="flex-1"
          onSearch={(value) => {
            dispatch(resetPageIndex());
            setSearchKey(value);
          }}
        /> */}
        <Button
          icon={<Icon name="add-circle" className="fill-white" />}
          onClick={() => {
            setUpBooking(false)
            setCreateNewPatient(true)
            setSlotInfo({})
            setModalVisible(true)
          }}
        >
          Tạo lịch hẹn
        </Button>
      </div>
      <div
        className={classNames({
          "w-full": !detailData,
          "flex gap-x-6": detailData,
        })}
      >
        {/* <BookingTable
          data={data}
          loading={loading}
          pageCount={pageCount}
          activeRow={detailData}
          fetchData={fetchData}
          onClickRow={setDetailData}
        />
        {detailData && (
          <BookingDetail
            data={detailData}
            onDelete={handleDeleteBooking}
            onUpdateStatus={updateStatus}
          />
        )} */}
        <Calendar
          components={
            {
              // agenda: {
              //   event: EventAgenda,
              // },
              // // event: Event,
              // day: {
              //   event: EventAgenda,
              // },
              // week: {
              //   event: EventAgenda,
              // },
              // work_week: {
              //   event: EventAgenda,
              // }
            }
          }
          min={moment().set({ hour: 7, minute: 0 })}
          max={moment().set({ hour: 21, minute: 0 })}
          formats={{ eventTimeRangeFormat: () => "" }}
          timeslots={2}
          views={allViews}
          showMultiDayTimes={true}
          step={15}
          dayLayoutAlgorithm="no-overlap"
          defaultView="work_week"
          onRangeChange={(range) => {
            if (Array.isArray(range)) {
              setStartDate(new Date(range[0]))
              setEndDate(addDays(new Date(range[range.length - 1]), 1))
            } else {
              setStartDate(new Date(range.start))
              setEndDate(addDays(new Date(range.end), 1))
            }
          }}
          onView={(view) => { }}
          selectable={true}
          onSelectEvent={(e) => {
            setUpBooking(true)
            setCreateNewPatient(false)
            setSlotInfo(e)
            setModalVisible(true)
          }}
          localizer={localizer2}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 500 }}
          onSelectSlot={(slotInfo) => {
            setUpBooking(false)
            setCreateNewPatient(true)
            setSlotInfo(slotInfo)
            setModalVisible(true)
          }}
          eventPropGetter={eventStyleGetter}
          messages={{
            next: "Trước",
            previous: "Sau",
            today: "Hôm nay",
            month: "Tháng",
            week: "Tuần",
            day: "Ngày",
            agenda: "Nhật ký",
            work_week: "Tuần làm việc",
          }}
        />
        {modalVisible && (
          <Modal
            contentClassName="bg-modal"
            visibleModal={modalVisible}
            showCloseButton={true}
            onClose={() => setModalVisible(false)}
          >
            <TreatmentForm
              data={slotInfo}
              updateBooking={upBooking}
              createNewPatient={createNewPatient}
              onCloseModal={() => setModalVisible(false)}
            />
            <div className="mt-2 grid grid-cols-3 gap-x-6">
              {/* <Button
            onClick={() => {
              navigate("/customers/create");
            }}
          >
            Nhập phiếu
          </Button> */}
              {slotInfo.id && (
                <Button
                  onClick={() => {
                    if (slotInfo.medical_record?.id) {
                      navigate(`/bookings/medical-records/${slotInfo.id}/view`)
                    } else {
                      navigate(`/bookings/medical-records/${slotInfo.id}/create/`)
                    }
                  }}
                >
                  {slotInfo.medical_record?.id ? "Xem hồ sơ bệnh án" : "Tạo hồ sơ bệnh án"}
                </Button>
              )}
              {slotInfo.id &&
                slotInfo.medical_record?.id &&
                (slotInfo.status == "scheduled" || slotInfo.status == "confirmed") && (
                  <Button
                    onClick={() => {
                      navigate(`/bookings/medical-records/${slotInfo.id}/edit`)
                    }}
                  >
                    {"Sửa hồ sơ bệnh án"}
                  </Button>
                )}
            </div>
          </Modal>
        )}
      </div>
      <div className="space-y-2 flex flex-row">
        <div className="flex justify-between items-center mr-5">
          <div className="space-x-1.5 mr-5 flex items-center">
            <input
              type="checkbox" class="accent-orange w-5 h-5"
              checked={statusFilter.indexOf(bookingStatus[0]) != -1}
              onClick={(e) => toggleFilter(bookingStatus[0])}
            />
            <span className="inline-block w-2 h-2 rounded" style={{ backgroundColor: "orange" }} />
            <span className="text-16">Đặt lịch</span>
          </div>
        </div>
        <div className="flex justify-between items-center mr-5">
          <div className="space-x-1.5 mr-5 flex items-center">
            <input type="checkbox" class="accent-green w-5 h-5"
              checked={statusFilter.indexOf(bookingStatus[1]) != -1}
              onClick={(e) => toggleFilter(bookingStatus[1])}
            />
            <span className="inline-block w-2 h-2 rounded" style={{ backgroundColor: "green" }} />
            <span className="text-16">Đã xác nhận</span>
          </div>
        </div>
        <div className="flex justify-between items-center mr-5">
          <div className="space-x-1.5 mr-5 flex items-center">
            <input type="checkbox" class="accent-blue w-5 h-5"
              checked={statusFilter.indexOf(bookingStatus[2]) != -1}
              onClick={(e) => toggleFilter(bookingStatus[2])}
            />
            <span className="inline-block w-2 h-2 rounded" style={{ backgroundColor: "blue" }} />
            <span className="text-16">Đã đến</span>
          </div>
        </div>
        <div className="flex justify-between items-center mr-5">
          <div className="space-x-1.5 mr-5 flex items-center">
            <input type="checkbox" class="accent-gray w-5 h-5"
              checked={statusFilter.indexOf(bookingStatus[3]) != -1}
              onClick={(e) => toggleFilter(bookingStatus[3])}
            />
            <span className="inline-block w-2 h-2 rounded" style={{ backgroundColor: "grey" }} />
            <span className="text-16">Hoãn lịch</span>
          </div>
        </div>
        <div className="flex justify-between items-center mr-5">
          <div className="space-x-1.5 mr-5 flex items-center">
            <input type="checkbox" class="accent-purple w-5 h-5"
              checked={statusFilter.indexOf(bookingStatus[4]) != -1}
              onClick={(e) => toggleFilter(bookingStatus[4])}
            />
            <span className="inline-block w-2 h-2 rounded" style={{ backgroundColor: "purple" }} />
            <span className="text-16">Hoàn thành</span>
          </div>
        </div>
        <div className="flex justify-between items-center mr-5">
          <div className="space-x-1.5 mr-5 flex items-center">
            <input type="checkbox" class="accent-red w-5 h-5"
              checked={statusFilter.indexOf(bookingStatus[5]) != -1}
              onClick={(e) => toggleFilter(bookingStatus[5])}
            />
            <span className="inline-block w-2 h-2 rounded" style={{ backgroundColor: "red" }} />
            <span className="text-16">Huỷ</span>
          </div>
        </div>
      </div>
      <Button btnType="outline" onClick={e => setStatusFilter(bookingStatus) }>Chọn tất cả</Button>
    </Page>
  )
}

export default Bookings

function addDays(date, days) {
  var result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}
