import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import { Bar } from "react-chartjs-2"
import dayjs from "dayjs"
import sumBy from "lodash/sumBy"
import groupBy from "lodash/groupBy"
import countBy from "lodash/countBy"
import orderBy from "lodash/orderBy"

import Page from "components/Page"
import Datepicker from "components/Datepicker"
import Icon from "components/Icon"
import Avatar from "components/Avatar"
import Price from "components/Price"
import PieChart from "components/PieChart"
import { formatDate } from "utils/dateTime"
import { abbreviateNumber, formatPrice, getPercentageNumber } from "utils/number"
import GraphTooltip from "./Components/GraphTooltip"
import {
  getDebtDistribution,
  getListTransactions,
  getTopDebt,
  getTotalDebt,
} from "services/api/transactions"
import { formatStrapiArr, formatStrapiObj } from "utils/strapi"
import { getStrapiMedia } from "utils/media"
import { BILLING_TYPE_TITLE } from "constants/Transaction"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const TOTAL_DATA = [
  {
    key: "debtBalance",
    title: "Số dư nợ",
    icon: "coin",
    textColor: "text-red",
  },
  {
    key: "newDebt",
    title: "Nợ mới",
    icon: "coin",
    textColor: "text-pink",
  },
  {
    key: "debtCollection",
    title: "Sự Thu Nợ",
    icon: "coin",
    textColor: "text-blue3",
  },
  {
    key: "totalCustomers",
    title: "Lượng khách hàng nợ",
    icon: "user",
    textColor: "text-secondary",
  },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="text-left px-4 py-3.5 z-10 rounded-lg shadow-lg bg-white overflow-hidden transition-all duration-300 hover:!visible w-[300px]">
        <h5 className="font-bold text-primary mb-4">Debt Balance Distribution</h5>
        <div className="flex items-center justify-between">
          <p>{payload[0].name}</p>
          <Price price={(payload[0].value * 1000000000) / 100} />
        </div>
      </div>
    )
  }

  return null
}

const DebtsReport = () => {
  const chartRef = useRef(null)
  const [tooltipVisible, setTooltipVisible] = useState(false)
  const [daySelected, setDaySelected] = useState(null)
  const [tooltipPos, setTooltipPos] = useState(null)
  const [chartData, setChartData] = useState(null)
  const [totalDebt, setTotalDebt] = useState(0)
  const [topDebt, setTopDebt] = useState([])
  const [debtDistribution, setDebtDistribution] = useState({ distributions: [], total: 0 })

  const [data, setData] = useState([])
  const [currentMonth, setCurrentMonth] = useState(new Date())

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

  const renderChart = useCallback(async (date = dayjs()) => {
    const month = dayjs(date).month()
    const year = dayjs(date).year()

    const labels = getDaysInMonth(month, year).map((day) => formatDate(day, "DD/MM"))
    const res = await getListTransactions(
      {
        pageSize: 10000,
        page: 1,
      },
      {
        $and: [
          {
            debtBalance: {
              $ne: 0,
            },
          },
          {
            createdAt: {
              $gte: dayjs(date).startOf("month").toISOString(),
            },
          },
          {
            createdAt: {
              $lte: dayjs(date).endOf("month").toISOString(),
            },
          },
        ],
      },
      "user"
    )
    if (res.data) {
      const listTransactions = formatStrapiArr(res.data)?.map((transaction) => ({
        ...transaction,
        user: formatStrapiObj(transaction.user),
      }))
      const listTransactionsByDay = groupBy(listTransactions, (transaction) =>
        dayjs(transaction?.createdAt).format("DD/MM")
      )
      const data = getDaysInMonth(month, year).map((day) => {
        const debt = orderBy(
          listTransactionsByDay?.[dayjs(day).format("DD/MM")],
          "createdAt",
          "desc"
        )?.map((transaction) => ({
          ...transaction,
          debtBalance: parseInt(transaction?.debtBalance),
        }))

        return {
          day,
          newDebt: sumBy(debt, (transaction) => transaction?.debtBalance) || 0,
          debtCollection: Math.abs(
            sumBy(debt, (transaction) =>
              transaction?.debtBalance < 0 ? transaction?.debtBalance : 0
            )
          ),
          totalCustomers: Object.keys(
            countBy(
              debt?.filter((transaction) => transaction?.debtBalance > 0),
              (transaction) => transaction.user?.id
            )
          )?.length,
        }
      })
      setData(data)
      setChartData({
        labels,
        datasets: [
          {
            data: data.map((item) => item.newDebt),
            backgroundColor: "#2A7871",
          },
        ],
      })
    }
  }, [])

  useEffect(() => {
    // current month
    renderChart()
  }, [renderChart])

  useEffect(() => {
    ;(async () => {
      try {
        const totalDebtRes = await getTotalDebt()
        if (totalDebtRes.data) {
          setTotalDebt(totalDebtRes.data?.[0]?.totalDebt || 0)
        }
        const topDebtRes = await getTopDebt()
        if (topDebtRes.data) {
          setTopDebt(topDebtRes.data)
        }
        const debtDistributionRes = await getDebtDistribution()
        if (debtDistributionRes.data) {
          setDebtDistribution({
            distributions: debtDistributionRes.data,
            total: sumBy(debtDistributionRes.data, (debt) => parseInt(debt.totalTransactions)),
          })
        }
      } catch (error) {}
    })()
  }, [])

  return (
    <Page title="Nợ" parentUrl="/reports">
      <div className="mb-8">
        <div className="w-[340px]">
          <Datepicker
            className="bg-primary text-white"
            iconClassName="fill-white"
            value={currentMonth}
            dateFormat={"MMMM, yyyy"}
            showMonthYearPicker
            onChange={(date) => {
              setCurrentMonth(date)
              renderChart(date)
            }}
          />
        </div>
        <div className="grid grid-cols-4 gap-x-6 mt-8">
          {TOTAL_DATA.map((item, index) => {
            return (
              <div key={index} className="rounded-xl shadow-sm p-6 flex items-center space-x-4">
                <div className="w-17 h-17 flex items-center justify-center rounded-full bg-primary/10">
                  <Icon name={item.icon} className="fill-primary w-8 h-8" />
                </div>
                <div>
                  <p className="whitespace-nowrap">{item.title}</p>
                  <h2 className={`text-36 font-bold ${item.textColor}`}>
                    {index === 0
                      ? abbreviateNumber(totalDebt)
                      : index === 3
                      ? sumBy(data, "totalCustomers")
                      : abbreviateNumber(sumBy(data, item.key) || 0)}
                  </h2>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <div className="grid grid-cols-[1fr_460px] gap-x-6 pb-6">
        <div className="relative p-6 shadow-sm rounded-lg self-start">
          {chartData && <Bar type="" ref={chartRef} options={options} data={chartData} />}
          {tooltipPos && (
            <GraphTooltip position={tooltipPos} visibility={tooltipVisible}>
              <>
                <h5 className="text-14 text-primary font-bold mb-4">
                  {formatDate(daySelected?.day, "DD/MM/YYYY")}
                </h5>
                <ul className="space-y-2">
                  <li className="flex items-center justify-between">
                    <p>New Debt</p>
                    <p>
                      <b className="text-pink">{formatPrice(daySelected?.newDebt)}</b>đ
                    </p>
                  </li>
                  <li className="flex items-center justify-between">
                    <p>Debt Collection</p>
                    <p>
                      <b className="text-pink">{formatPrice(daySelected?.debtCollection)}</b>đ
                    </p>
                  </li>
                </ul>
              </>
            </GraphTooltip>
          )}
        </div>
        <div className="space-y-6">
          <div className="shadow-sm rounded-lg p-6">
            <h5 className="font-bold text-primary mb-6">Khách hàng nợ tiêu biểu</h5>
            <div className="space-y-4">
              {Array.isArray(topDebt) &&
                topDebt?.map((user) => (
                  <div
                    key={user?.code}
                    className="flex items-center space-x-4 bg-primary/10 p-6 rounded-xl"
                  >
                    <Avatar
                      name={`${user?.firstName} ${user?.lastName}`}
                      src={getStrapiMedia({
                        url: user?.avatar,
                      })}
                      size={56}
                    />
                    <div className="space-y-1">
                      <p>
                        <b>{user?.code}</b> | {user?.firstName} {user?.lastName}
                      </p>
                      <Price
                        priceClassName="font-bold text-24"
                        suffixClassName="text-24"
                        price={user?.debtBalance}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>
          <div className="shadow-sm rounded-lg p-6">
            <h5 className="font-bold text-primary mb-2">Phân phối nợ</h5>
            <div className="space-y-4">
              <PieChart
                width={148}
                height={148}
                data={
                  Array.isArray(debtDistribution?.distributions)
                    ? debtDistribution?.distributions?.map((item) => ({
                        name: BILLING_TYPE_TITLE[item.billingType],
                        value: getPercentageNumber(
                          parseInt(item.totalTransactions),
                          debtDistribution?.total
                        ),
                      }))
                    : []
                }
                colors={[
                  "#27AE60",
                  "#F2C94C",
                  "#EB5757",
                  "#2F80ED",
                  "#5CA79F",
                  "#F05D82",
                  "#2A7871",
                ]}
                hideInfo={false}
                vertical
                showTooltip
                CustomTooltip={CustomTooltip}
              />
            </div>
          </div>
        </div>
      </div>
    </Page>
  )
}

export default DebtsReport
