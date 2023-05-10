import { useCallback, useEffect, useRef, useState } from "react"
import dayjs from "dayjs"
import sumBy from "lodash/sumBy"
import orderBy from "lodash/orderBy"
import groupBy from "lodash/groupBy"
import reduce from "lodash/reduce"
import countBy from "lodash/countBy"
import classNames from "classnames"

import Page from "components/Page"
import Datepicker from "components/Datepicker"
import Icon from "components/Icon"
import { abbreviateNumber, getPercentage } from "utils/number"
import EmployeesReportTable from "./Components/EmployeesReportTable"
import { getListTransactions, getStaffAnalytics } from "services/api/transactions"
import { formatStrapiArr, formatStrapiObj } from "utils/strapi"
import { BILLING_TYPE, BILLING_TYPE_TITLE, TRANSACTION_CHECKIN_STATUS } from "constants/Transaction"
import Button from "components/Button"
import { toCapitalize } from "utils/string"

const TOTAL_DATA = [
  {
    key: "totalEmployees",
    title: "Số lượng nhân viên",
    icon: "users",
    textColor: "text-secondary",
  },
  // {
  //   key: "totalTransactions",
  //   title: "",
  //   icon: "grammerly",
  //   textColor: "text-secondary",
  // },
  // {
  //   key: "totalIncome",
  //   title: "Total Income",
  //   icon: "money",
  //   textColor: "text-red",
  // },
  // {
  //   key: "totalInterest",
  //   title: "Total Interest",
  //   icon: "money",
  //   textColor: "text-red",
  // },
]

const EmployeesReport = () => {
  const [monthSelected, setMonthSelected] = useState(new Date())
  const [data, setData] = useState([])
  const [staffAnalytics, setStaffAnalytics] = useState(null)
  const [distributionData, setDistributionData] = useState([])
  const [loading, setLoading] = useState(false)
  const [dateType, setDateType] = useState("month")
  const fetchIdRef = useRef(0)

  const fetchData = useCallback(
    async (date = dayjs()) => {
      const fetchId = ++fetchIdRef.current
      if (fetchId === fetchIdRef.current) {
        try {
          setLoading(true)
          const res = await getListTransactions(
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
                {
                  status: TRANSACTION_CHECKIN_STATUS.PAID,
                },
              ],
            },
            "staff"
          )
          if (res.data) {
            const listTransactions = formatStrapiArr(res.data)
              .map((transaction) => ({
                ...transaction,
                staff: formatStrapiObj(transaction?.staff),
              }))
              ?.filter((transaction) => transaction?.staff?.id)

            const listStaff = groupBy(listTransactions, (transaction) => transaction?.staff?.code)
            const listBillingType = countBy(listTransactions, "billingType")
            setDistributionData(
              orderBy(
                reduce(
                  listBillingType,
                  function (res, total, name) {
                    return [
                      ...res,
                      {
                        name,
                        total,
                      },
                    ]
                  },
                  []
                ),
                "total",
                "desc"
              )
            )

            setData(
              orderBy(
                reduce(
                  listStaff,
                  function (res, transactions) {
                    const staff = transactions?.[0]?.staff
                    return [
                      ...res,
                      {
                        id: staff?.id,
                        code: staff?.code,
                        firstName: staff?.firstName,
                        lastName: staff?.lastName,
                        transactions: transactions?.length || 0,
                        income: sumBy(transactions, (transaction) =>
                          ![BILLING_TYPE.MEMBER_CARD, BILLING_TYPE.SERVICE_CARD]?.includes(
                            transaction.billingType
                          )
                            ? parseInt(transaction.total)
                            : 0
                        ),
                        interest: sumBy(
                          transactions,
                          (transaction) => parseInt(transaction.interestMoney) || 0
                        ),
                      },
                    ]
                  },
                  []
                ),
                "interest",
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

  useEffect(() => {
    fetchData()
    ;(async () => {
      try {
        const res = await getStaffAnalytics()
        if (res?.data) {
          setStaffAnalytics(res.data)
        }
      } catch (error) {}
    })()
  }, [fetchData])

  return (
    <Page title="Employees" parentUrl="/reports">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="w-[340px]">
            <Datepicker
              className="bg-primary text-white"
              iconClassName="fill-white"
              value={monthSelected}
              dateFormat={dateType === "month" ? "MMMM, yyyy" : "dd MMMM, yyyy"}
              showMonthYearPicker={dateType === "month"}
              onChange={(date) => {
                setMonthSelected(date)
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
                  setMonthSelected(dayjs().toDate())
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
                  return staffAnalytics?.totalStaff || 0
                case 1:
                  return sumBy(data, "transactions")
                case 2:
                  return abbreviateNumber(staffAnalytics?.totalIncome || 0)
                case 3:
                  return abbreviateNumber(staffAnalytics?.totalInterest || 0)
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
          <EmployeesReportTable data={data} loading={loading} fetchData={fetchData} />
        </div>
        <div className="relative p-6 shadow-sm rounded-lg">
          <h4 className="font-bold text-primary mb-6">Transaction Distribution</h4>
          <div className="space-y-4">
            {distributionData?.map((item, index) => {
              return (
                <div className="rounded-xl p-4 bg-primary" key={index}>
                  <b className="text-white">{BILLING_TYPE_TITLE[item?.name]}</b>
                  <h4 className="font-bold text-24 mt-2 text-white">
                    {getPercentage(item?.total, sumBy(data, "transactions"))}
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

export default EmployeesReport
