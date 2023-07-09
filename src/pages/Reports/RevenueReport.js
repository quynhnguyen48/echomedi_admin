import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Bar } from "react-chartjs-2"
import "chart.js/auto"
import dayjs from "dayjs"
import sumBy from "lodash/sumBy"
import classNames from "classnames"
import { toast } from "react-toastify"

import Page from "components/Page"
import Datepicker from "components/Datepicker"
import Icon from "components/Icon"
import { formatDate } from "utils/dateTime"
import { abbreviateNumber, formatPrice } from "utils/number"
import GraphTooltip from "./Components/GraphTooltip"
import CalendarRevenue from "./Components/CalendarRevenue"
import { getMonthlyRevenue } from "services/api/transactions"
import Button from "components/Button"
import { toCapitalize } from "utils/string"
import axios from "../../services/axios"
import moment from "moment"

const TOTAL_DATA = [
  {
    key: "totalRevenue",
    title: "Tổng doanh thu",
    icon: "coin",
  },
  // {
  //   key: "totalIncome",
  //   title: "Tổng thu nhập",
  //   icon: "coin",
  // },
  // {
  //   key: "totalCustomers",
  //   title: "Lượng khách hàng",
  //   icon: "user",
  // },
]

const RevenueReport = () => {
  const today = moment()
  const chartRef = useRef(null)
  const [tooltipVisible, setTooltipVisible] = useState(false)
  const [daySelected, setDaySelected] = useState(null)
  const [tooltipPos, setTooltipPos] = useState(null)
  const [chartData, setChartData] = useState(null)
  const [dateType, setDateType] = useState("month")
  const [startDate, setStartDate] = useState(today.startOf("week").toDate())
  const [endDate, setEndDate] = useState(today.endOf("week").toDate())
  const [data, setData] = useState([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [showChart, setShowChart] = useState(true)
  const [revenue, setRevenue] = useState(0);

  useEffect(() => {
    axios.post("/invoice/getRevenue", {
      data: {
        startDate,
        endDate,
      }
    })
      .then(response => {
        let total = 0;
        let bks = response.data.forEach(b => {
          total += b.data?.total ?? 0;
        });

        setData(bks);
        setRevenue(total)
      }).finally(() => {
        // toast.dismiss(id);
      });
  }, [startDate, endDate]);

  const customTooltip = useCallback(
    (context) => {
      if (context.tooltip.opacity === 0) {
        // hide tooltip visibility
        setTooltipVisible(false)
        return
      }

      const chart = chartRef.current
      const canvas = chart.canvas
      if (canvas) {
        // enable tooltip visibility
        setTooltipVisible(true)

        // set position of tooltip
        const left = context.tooltip.x
        const top = context.tooltip.y - 110

        // handle tooltip multiple rerender
        if (tooltipPos?.top !== top) {
          setTooltipPos({ top, left })
          setDaySelected(data[context.tooltip.dataPoints[0].dataIndex])
        }
      }
    },
    [data, tooltipPos?.top]
  )

  const options = useMemo(() => {
    return {
      responsive: true,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: false,
          position: "nearest",
          external: customTooltip,
        },
        subtitle: {
          display: false,
        },
        decimation: {
          enabled: false,
        },
        filler: {},
      },
    }
  }, [customTooltip])

  const getDaysInMonth = (month, year) => {
    const date = new Date(year, month, 1)
    let days = []
    while (date.getMonth() === month) {
      days.push(new Date(date))
      date.setDate(date.getDate() + 1)
    }
    return days
  }

  const renderChart = useCallback(async () => {
    const day = dayjs(currentMonth).date()
    const month = dayjs(currentMonth).month()
    const year = dayjs(currentMonth).year()

    try {
      let monthlyRevenue = {}
      const res = await getMonthlyRevenue({
        day: dateType === "month" ? null : day,
        month: month + 1,
        year,
      })
      monthlyRevenue = res.data
      const labels = getDaysInMonth(month, year).map((day) => formatDate(day, "DD/MM"))
      const data = getDaysInMonth(month, year).map((day) => {
        const dayRevenue = monthlyRevenue[dayjs(day).format("YYYY-MM-DD")]

        return {
          day,
          totalRevenue: dayRevenue?.totalRevenue || 0,
          totalIncome: dayRevenue?.totalIncome || 0,
          totalCustomers: dayRevenue?.totalCustomers ? parseInt(dayRevenue?.totalCustomers) : 0,
        }
      })
      setData(data)
      setChartData({
        labels,
        datasets: [
          {
            data: data.map((item) => item.totalRevenue || 0),
            backgroundColor: "#2A7871",
          },
        ],
      })
    } catch (error) { }
  }, [currentMonth, dateType])

  const downloadRevenueReport = () => {
    const toastId = toast.loading("Đang tải")
    axios
      .post(
        "/invoice/downloadRevenueReport",
        { 
          data: {
            startDate, 
            endDate,
          }
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

  useEffect(() => {
    // current month
    renderChart()
  }, [renderChart])

  return (
    <Page title="Báo cáo doanh thu" parentUrl="/reports">
      <div className="mb-8">
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
          {/* <div className="flex space-x-2">
            {["date", "month"].map((item) => (
              <Button
                key={item}
                className={classNames("font-normal", {
                  "bg-primary text-white": item === dateType,
                  "bg-primary/10 text-secondary": item !== dateType,
                })}
                btnSize="medium"
                onClick={() => {
                  setCurrentMonth(dayjs().toDate())
                  setDateType(item)
                }}
              >
                {toCapitalize(item)}
              </Button>
            ))}
          </div> */}
        </div>
        <div className="grid grid-cols-4 gap-x-6 mt-8">
          {TOTAL_DATA.map((item, index) => {
            const valueColor = index === 0 ? "text-red" : index === 1 ? "text-pink" : ""
            return (
              <div key={index} className="rounded-xl shadow-sm p-6 flex items-center space-x-4">
                <div className="w-17 h-17 flex items-center justify-center rounded-full bg-primary/10">
                  <Icon name={item.icon} className="fill-primary w-8 h-8" />
                </div>
                <div>
                  <p className="whitespace-nowrap">{item.title}</p>
                  <h2 className={`text-36 font-bold ${valueColor}`}>
                    {index === 2
                      ? sumBy(data, "totalCustomers")
                      : abbreviateNumber(revenue)}
                  </h2>
                </div>
              </div>
            )
          })}
          <button onClick={() => downloadRevenueReport()} className=" top-2 right-2">
        <Icon name={"export-circle"} className="fill-primary w-7 h-7" />
      </button>
        </div>
      </div>
      {/* <div className="relative p-6 shadow-sm rounded-lg">
        {showChart ? (
          chartData && (
            <div className="relative">
              <Bar type="" ref={chartRef} options={options} data={chartData} />
            </div>
          )
        ) : (
          <div className="flex justify-center">
            <CalendarRevenue
              calendarData={data}
              onShowTooltip={(pos, day) => {
                setTooltipVisible(true)
                setTooltipPos(pos)
                setDaySelected(data.find((item) => dayjs(item.day).isSame(dayjs(day))))
              }}
            />
          </div>
        )}
        {tooltipPos && (
          <GraphTooltip position={tooltipPos} visibility={tooltipVisible} isChart={showChart}>
            <>
              <h5 className="text-14 text-primary font-bold mb-4">
                {formatDate(daySelected?.day, "DD/MM/YYYY")}
              </h5>
              <ul className="space-y-2">
                <li className="flex items-center justify-between">
                  <p>Tổng doanh thu</p>
                  <p>
                    <b className="text-red">{formatPrice(revenue)}</b>đ
                  </p>
                </li>
                <li className="flex items-center justify-between">
                  <p>Tổng thu nhập</p>
                  <p>
                    <b className="text-pink">{formatPrice(daySelected?.totalIncome)}</b>đ
                  </p>
                </li>
                <li className="flex items-center justify-between">
                  <p>Total Customers</p>
                  <b>{daySelected?.totalCustomers}</b>
                </li>
              </ul>
            </>
          </GraphTooltip>
        )}
        <button onClick={() => setShowChart(!showChart)} className="absolute top-2 right-2">
          <Icon name={showChart ? "grid" : "chart-square"} className="fill-primary w-7 h-7" />
        </button>
      </div> */}
      
    </Page>
  )
}

export default RevenueReport
