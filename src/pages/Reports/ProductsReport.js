import groupBy from "lodash/groupBy"
import orderBy from "lodash/orderBy"
import reduce from "lodash/reduce"
import slice from "lodash/slice"
import sumBy from "lodash/sumBy"
import uniq from "lodash/uniq"
import { useEffect, useMemo, useState } from "react"
import classNames from "classnames"

import Datepicker from "components/Datepicker"
import Icon from "components/Icon"
import Page from "components/Page"
import { BILLING_TYPE, TRANSACTION_CHECKIN_STATUS } from "constants/Transaction"
import dayjs from "dayjs"
import { getListOrders } from "services/api/orders"
import { getListTransactions, getProductAnalytics } from "services/api/transactions"
import { abbreviateNumber, getPercentage } from "utils/number"
import { formatStrapiArr } from "utils/strapi"
import { getListProducts } from "../../services/api/products"
import ProductsReportTable from "./Components/ProductsReportTable"
import Button from "components/Button"
import { toCapitalize } from "utils/string"

const TOTAL_DATA = [
  {
    key: "totalProduct",
    title: "Total Product",
    icon: "coin",
    textColor: "text-secondary",
  },
  {
    key: "totalRevenue",
    title: "Total Revenue",
    icon: "coin",
    textColor: "text-red",
  },
]

const ProductsReport = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [productAnalytics, setProductAnalytics] = useState(null)
  const [dateType, setDateType] = useState("month")

  useEffect(() => {
    ;(async () => {
      try {
        const res = await getProductAnalytics()
        if (res.data) {
          setProductAnalytics(res.data)
        }
      } catch (error) {}
    })()
  }, [])

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const transactionsRes = await getListTransactions(
          {
            pageSize: 10000,
            page: 1,
          },
          {
            $and: [
              {
                billingType: {
                  $eq: BILLING_TYPE.PRODUCT,
                },
              },
              {
                createdAt: {
                  $gte: dayjs(currentMonth).startOf(dateType).toISOString(),
                },
              },
              {
                createdAt: {
                  $lte: dayjs(currentMonth).endOf(dateType).toISOString(),
                },
              },
              {
                status: TRANSACTION_CHECKIN_STATUS.PAID,
              },
            ],
          }
        )

        const orderRes = await getListOrders(
          {
            pageSize: 10000,
            page: 1,
          },
          {
            $and: [
              {
                createdAt: {
                  $gte: dayjs(currentMonth).startOf(dateType).toISOString(),
                },
              },
              {
                createdAt: {
                  $lte: dayjs(currentMonth).endOf(dateType).toISOString(),
                },
              },
            ],
          }
        )
        const listTransactionsProducts = reduce(
          formatStrapiArr(transactionsRes.data),
          (res, transaction) => {
            return [
              ...res,
              ...transaction?.products?.map((product) => ({ ...product, id: product?.productId })),
            ]
          },
          []
        )
        const listOrderProducts = reduce(
          formatStrapiArr(orderRes.data),
          (res, order) => {
            return [...res, ...order?.products]
          },
          []
        )
        const products = [...listTransactionsProducts, ...listOrderProducts]
        const productsRes = await getListProducts(
          {
            pageSize: 10000,
            page: 1,
          },
          {
            id: {
              $in: uniq(products?.map((product) => product.id)),
            },
          }
        )
        const listProducts = reduce(
          formatStrapiArr(productsRes?.data),
          (res, product) => {
            return { ...res, [product.id]: product }
          },
          {}
        )

        setData(
          orderBy(
            reduce(
              groupBy(products, "id"),
              (res, products) => {
                const product = listProducts?.[products?.[0].id]
                return [
                  ...res,
                  {
                    id: product?.id,
                    code: product?.code,
                    title: product?.title,
                    quantity: sumBy(products, (product) => parseInt(product.amount) || 0),
                    revenue: sumBy(
                      products,
                      (productItem) =>
                        parseInt(productItem.amount) *
                          (parseInt(productItem.variant.discountPrice) ||
                            parseInt(productItem.variant.price)) || 0
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
      } catch (error) {
      } finally {
        setLoading(false)
      }
    })()
  }, [currentMonth, dateType])

  const productDistribution = useMemo(() => {
    const res = [...slice(data, 0, 3)]
    if (data?.length >= 4) {
      res.push({ name: "Others", quantity: sumBy(slice(data, 3), "quantity") })
    }
    return res
  }, [data])

  return (
    <Page title="Products" parentUrl="/reports">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="w-[340px]">
            <Datepicker
              className="bg-primary text-white"
              iconClassName="fill-white"
              value={currentMonth}
              dateFormat={dateType === "month" ? "MMMM, yyyy" : "dd MMMM, yyyy"}
              showMonthYearPicker={dateType === "month"}
              onChange={(date) => {
                setCurrentMonth(date)
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
                  setCurrentMonth(dayjs().toDate())
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
                  return productAnalytics?.totalProducts || 0
                case 1:
                  return abbreviateNumber(sumBy(data, "revenue") || 0)
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
          <ProductsReportTable data={data} loading={loading} />
        </div>
        <div className="relative p-6 shadow-sm rounded-lg">
          <h4 className="font-bold text-primary mb-6">Product Distribution</h4>
          <div className="space-y-4">
            {Array.isArray(productDistribution) &&
              productDistribution.map((item, index) => {
                const isOther = item?.name === "Others"
                return (
                  <div className={`rounded-xl p-4 ${isOther ? "bg-primary/10" : "bg-primary"}`}>
                    <b className={isOther ? "text-primary" : "text-white"}>{item?.title}</b>
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

export default ProductsReport
