import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import dayjs from "dayjs"
import sumBy from "lodash/sumBy"
import groupBy from "lodash/groupBy"
import reduce from "lodash/reduce"
import orderBy from "lodash/orderBy"
import uniqBy from "lodash/uniqBy"
import slice from "lodash/slice"
import classNames from "classnames"

import Page from "components/Page"
import Datepicker from "components/Datepicker"
import Icon from "components/Icon"
import { abbreviateNumber, getPercentage } from "utils/number"
import { formatStrapiArr, formatStrapiObj } from "utils/strapi"
import ServiceCardsReportTable from "./Components/ServiceCardsReportTable"
import { BILLING_TYPE, PAYMENT_METHOD, TRANSACTION_CHECKIN_STATUS } from "constants/Transaction"
import { getListTransactions } from "services/api/transactions"
import { getServiceCardAnalytics } from "services/api/card"
import Button from "components/Button"
import { toCapitalize } from "utils/string"

const TOTAL_DATA = [
  {
    key: "totalCards",
    title: "Total Cards",
    icon: "money",
    textColor: "text-secondary",
  },
  {
    key: "totalNewCards",
    title: "Total New Cards",
    icon: "money",
    textColor: "text-secondary",
  },
  {
    key: "totalRemainingValue",
    title: "Total Remaining Value",
    icon: "coin",
    textColor: "text-red",
  },
  {
    key: "totalNewRevenue",
    title: "Total New Revenue",
    icon: "coin",
    textColor: "text-red",
  },
]

const ServiceCardsReport = () => {
  const [daySelected, setDaySelected] = useState(new Date())
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [analyticsData, setAnalyticsData] = useState(null)
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
                  billingType: {
                    $eq: BILLING_TYPE.TREATMENT,
                  },
                },
                {
                  paymentMethod: {
                    $eq: PAYMENT_METHOD.SERVICE_CARD,
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
              card: formatStrapiObj(transaction.card),
            }))

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
                    const cards = uniqBy(
                      transactions?.map((transaction) => transaction?.card),
                      (card) => card?.id
                    )
                    const revenue = sumBy(
                      cards,
                      (card) => card.usageLimit * parseInt(treatment?.price) || 0
                    )

                    return [
                      ...res,
                      {
                        id: treatment?.id,
                        code: treatment?.code,
                        name: treatment?.name,
                        quantity: cards?.length || 0,
                        usage: transactions?.length || 0,
                        income: (transactions?.length || 0) * parseInt(treatment?.price),
                        revenue,
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
    ;(async () => {
      try {
        const res = await getServiceCardAnalytics()
        setAnalyticsData(res.data)
      } catch (error) {}
    })()
  }, [fetchData])

  return (
    <Page title="Service Cards" parentUrl="/reports">
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
                  return analyticsData?.totalCards || 0
                case 1:
                  return sumBy(data, "quantity")
                case 2:
                  return abbreviateNumber(analyticsData?.totalRemain || 0)
                case 3:
                  return abbreviateNumber(sumBy(data, "revenue"))
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
          <ServiceCardsReportTable data={data} loading={loading} />
        </div>
        <div className="relative p-6 shadow-sm rounded-lg">
          <h4 className="font-bold text-primary mb-6">Treatment Distribution</h4>
          <div className="space-y-4">
            {Array.isArray(treatmentDistribution) &&
              treatmentDistribution?.map((item, index) => {
                const isOther = item?.name === "Others"

                return (
                  <div
                    key={treatmentDistribution?.name}
                    className={`rounded-xl p-4 ${isOther ? "bg-primary/10" : "bg-primary"}`}
                  >
                    <b className={isOther ? "text-primary" : "text-white"}>{item?.name}</b>
                    <h4
                      className={`font-bold text-24 mt-2 ${
                        isOther ? "text-primary" : "text-white"
                      }`}
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

export default ServiceCardsReport
