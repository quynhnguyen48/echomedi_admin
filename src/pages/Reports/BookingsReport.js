import { useCallback, useEffect, useRef, useState } from "react"
import sumBy from "lodash/sumBy"
import groupBy from "lodash/groupBy"
import orderBy from "lodash/orderBy"
import reduce from "lodash/reduce"
import countBy from "lodash/countBy"
import slice from "lodash/slice"
import dayjs from "dayjs"
import classNames from "classnames"

import Page from "components/Page"
import Datepicker from "components/Datepicker"
import Icon from "components/Icon"
import { formatStrapiArr, formatStrapiObj } from "utils/strapi"
import BookingsReportTable from "./Components/BookingsReportTable"
import { getListBookings } from "services/api/bookings"
import { useMemo } from "react"
import { getPercentage } from "utils/number"
import { BOOKING_STATUS } from "constants/Booking"
import Button from "components/Button"
import { toCapitalize } from "utils/string"

const TOTAL_DATA = [
  {
    key: "totalBookings",
    title: "Tổng số lượng đặt hẹn",
    icon: "calendar-tick",
    textColor: "text-secondary",
  },
  {
    key: "totalConfirmed",
    title: "Khách xác nhận hẹn",
    icon: "tick-circle",
    textColor: "text-blue",
  },
  {
    key: "totalCanceled",
    title: "Khách huỷ hẹn",
    icon: "trash",
    textColor: "text-red",
  },
]

const BookingsReport = () => {
  const [daySelected, setDaySelected] = useState(new Date())
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [bookingsAnalytics, setBookingsAnalytics] = useState({
    total: 0,
    totalConfirm: 0,
    totalCanceled: 0,
  })
  const [dateType, setDateType] = useState("month")
  const fetchIdRef = useRef(0)

  const fetchData = useCallback(
    async (date) => {
      const fetchId = ++fetchIdRef.current

      if (fetchId === fetchIdRef.current) {
        try {
          setLoading(true)
          const res = await getListBookings(
            {
              pageSize: 10000,
              page: 1,
            },
            {
              $and: [
                {
                  createdAt: {
                    $gte: dayjs(date).startOf(dateType).toISOString(),
                  },
                },
                {
                  createdAt: {
                    $lte: dayjs(date).endOf(dateType).toISOString(),
                  },
                },
              ],
            }
          )
          if (res.data) {
            const listBookings = formatStrapiArr(res.data)?.map((booking) => ({
              ...booking,
              treatment: formatStrapiObj(booking.treatment),
            }))
            const countBookings = countBy(listBookings, "status")
            setBookingsAnalytics({
              total: listBookings?.length,
              totalConfirm: countBookings?.[BOOKING_STATUS.CONFIRMED] || 0,
              totalCanceled: countBookings?.[BOOKING_STATUS.CANCELED] || 0,
            })
            const listTreatments = groupBy(
              listBookings,
              (transaction) => transaction.treatment?.name
            )
            setData(
              orderBy(
                reduce(
                  listTreatments,
                  function (res, bookings) {
                    const treatment = bookings?.[0]?.treatment
                    const adminBooked =
                      countBy(bookings, (booking) => (booking.createdByAdmin ? "admin" : "self"))[
                        "admin"
                      ] || 0
                    return [
                      ...res,
                      {
                        id: treatment?.id,
                        code: treatment?.code,
                        name: treatment?.name,
                        quantity: bookings?.length,
                        selfBooked: bookings?.length - adminBooked,
                        adminBooked,
                      },
                    ]
                  },
                  []
                ),
                "quantity",
                "desc"
              )
            )
          }
        } catch (error) {
        } finally {
          setLoading(false)
        }
      }
    },
    [dateType]
  )

  const treatmentDistribution = useMemo(() => {
    const res = [...slice(data, 0, 5)]
    if (data?.length >= 6) {
      res.push({ name: "Others", quantity: sumBy(slice(data, 3), "quantity") })
    }
    return res
  }, [data])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <Page title="Bookings" parentUrl="/reports">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="w-[340px]">
            <Datepicker
              className="bg-primary text-white"
              iconClassName="fill-white"
              value={daySelected}
              dateFormat={dateType === "month" ? "MMMM, yyyy" : "dd MMMM, yyyy"}
              showMonthYearPicker={dateType === "month"}
              onChange={(date) => {
                setDaySelected(date)
                fetchData(date)
              }}
            />
          </div>
          <div className="flex space-x-2">
            {["date", "month"].map((item) => (
              <Button
                key={item}
                className={classNames("font-normal", {
                  "bg-primary text-white": item === dateType,
                  "bg-primary/10 text-secondary": item !== dateType,
                })}
                btnSize="medium"
                onClick={() => {
                  setDaySelected(dayjs().toDate())
                  setDateType(item)
                }}
              >
                {toCapitalize(item)}
              </Button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-4 gap-x-6 mt-8">
          {TOTAL_DATA.map((item, index) => {
            let renderValue = () => {
              switch (index) {
                case 0:
                  return bookingsAnalytics?.total
                case 1:
                  return bookingsAnalytics?.totalConfirm
                case 2:
                  return bookingsAnalytics?.totalCanceled
                default:
                  break
              }
            }

            return (
              <div key={index} className="rounded-xl shadow-sm p-6 flex items-center space-x-4">
                <div className="w-17 h-17 flex items-center justify-center rounded-full bg-primary/10">
                  <Icon name={item.icon} className="fill-primary w-8 h-8" />
                </div>
                <div>
                  <p className="whitespace-nowrap">{item.title}</p>
                  <h2 className={`text-36 font-bold ${item.textColor}`}>{renderValue()}</h2>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <div className="grid grid-cols-[1fr_340px] gap-x-6 pb-6">
        <div className="relative p-6 shadow-sm rounded-lg">
          <BookingsReportTable data={data} loading={loading} fetchData={fetchData} />
        </div>
        <div className="relative p-6 shadow-sm rounded-lg">
          <h4 className="font-bold text-primary mb-6">Treatment Distribution</h4>
          <div className="space-y-4">
            {treatmentDistribution?.map((item, index) => {
              const isOther = item?.name === "Others"
              return (
                <div className={`rounded-xl p-4 ${isOther ? "bg-primary/10" : "bg-primary"}`}>
                  <b className={isOther ? "text-primary" : "text-white"}>{item?.name}</b>
                  <h4
                    className={`font-bold text-24 mt-2 ${isOther ? "text-primary" : "text-white"}`}
                  >
                    {getPercentage(item?.quantity, sumBy(data, "quantity"))}
                  </h4>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </Page>
  )
}

export default BookingsReport
