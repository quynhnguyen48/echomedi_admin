import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import sumBy from "lodash/sumBy"
import groupBy from "lodash/groupBy"
import reduce from "lodash/reduce"
import slice from "lodash/slice"
import countBy from "lodash/countBy"
import orderBy from "lodash/orderBy"
import dayjs from "dayjs"
import classNames from "classnames"

import Page from "components/Page"
import Datepicker from "components/Datepicker"
import Icon from "components/Icon"
import { abbreviateNumber, getPercentage } from "utils/number"
import { formatStrapiArr, formatStrapiObj } from "utils/strapi"
import TreatmentsReportTable from "./Components/TreatmentsReportTable"
import { getListTransactions } from "services/api/transactions"
import { BILLING_TYPE, PAYMENT_METHOD, TRANSACTION_CHECKIN_STATUS } from "constants/Transaction"
import Button from "components/Button"
import { toCapitalize } from "utils/string"

const TOTAL_DATA = [
  {
    key: "totalTreatment",
    title: "Total Treatment",
    icon: "coin",
    textColor: "text-secondary",
  },
  {
    key: "totalRevenue",
    title: "Total Revenue",
    icon: "coin",
    textColor: "text-red",
  },
  {
    key: "serviceCards",
    title: "Service Cards",
    icon: "money",
    textColor: "text-secondary",
  },
]

const TreatmentsReport = () => {
  const [daySelected, setDaySelected] = useState(new Date())
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [serviceCardPercentage, setServiceCardPercentage] = useState(0)
  const [dateType, setDateType] = useState("month")
  const fetchIdRef = useRef(0)

  const fetchData = useCallback(
    async (date) => {
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
                  billingType: {
                    $eq: BILLING_TYPE.TREATMENT,
                  },
                },
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
            }
          )
          if (res.data) {
            const listTransactions = formatStrapiArr(res.data)?.map((transaction) => ({
              ...transaction,
              treatment: formatStrapiObj(transaction.treatment),
            }))
            setServiceCardPercentage(
              getPercentage(
                countBy(listTransactions, "paymentMethod")?.[PAYMENT_METHOD.SERVICE_CARD],
                listTransactions?.length
              )
            )
            const listTreatments = groupBy(
              listTransactions,
              (transaction) => transaction.treatment?.name
            )

            setData(
              orderBy(
                reduce(
                  listTreatments,
                  function (res, transactions) {
                    const treatment = transactions?.[0]?.treatment
                    return [
                      ...res,
                      {
                        id: treatment?.id,
                        code: treatment?.code,
                        name: treatment?.name,
                        quantity: transactions?.length,
                        revenue: sumBy(transactions, (transaction) => parseInt(transaction.total)),
                        employeeInterest: sumBy(transactions, (transaction) =>
                          parseInt(transaction.interestMoney)
                        ),
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
    const res = [...slice(data, 0, 3)]
    if (data?.length >= 4) {
      res.push({ name: "Others", quantity: sumBy(slice(data, 3), "quantity") })
    }
    return res
  }, [data])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <Page title="Treatment / Services" parentUrl="/reports">
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
                  return data.length
                case 1:
                  return abbreviateNumber(sumBy(data, "revenue") || 0)
                case 2:
                  return serviceCardPercentage
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
          <TreatmentsReportTable data={data} loading={loading} fetchData={fetchData} />
        </div>
        <div className="relative p-6 shadow-sm rounded-lg">
          <h4 className="font-bold text-primary mb-6">Treatment Distribution</h4>
          <div className="space-y-4">
            {treatmentDistribution?.map((item) => {
              const isOther = item?.name === "Others"
              return (
                <div
                  key={item.name}
                  className={`rounded-xl p-4 ${isOther ? "bg-primary/10" : "bg-primary"}`}
                >
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

export default TreatmentsReport
