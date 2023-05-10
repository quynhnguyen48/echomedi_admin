import dayjs from "dayjs"
import { useEffect, useState } from "react"
import orderBy from "lodash/orderBy"

import Datepicker from "components/Datepicker"
import Icon from "components/Icon"
import Page from "components/Page"
import Price from "components/Price"
import { getCustomerAnalytics } from "services/api/transactions"
import { abbreviateNumber } from "utils/number"

const TOTAL_DATA = [
  {
    key: "totalCustomers",
    title: "Lượng khách hạng",
    icon: "users",
    textColor: "text-secondary",
  },
  {
    key: "totalNewCustomer",
    title: "Lượng khách hàng mới",
    icon: "tick-circle",
    textColor: "text-blue",
  },
  {
    key: "totalExpense",
    title: "Tổng chi tiêu",
    icon: "coin",
    textColor: "text-red",
  },
]

const CustomersReport = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [customerAnalytics, setCustomerAnalytics] = useState(null)

  useEffect(() => {
    ;(async () => {
      try {
        const customerAnalyticsRes = await getCustomerAnalytics({
          month: dayjs(currentMonth).month() + 1,
          year: dayjs(currentMonth).year(),
        })
        setCustomerAnalytics(customerAnalyticsRes?.data)
      } catch (error) {}
    })()
  }, [currentMonth])

  return (
    <Page title="Khách hàng" parentUrl="/reports">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="w-[340px]">
            <Datepicker
              className="bg-primary text-white"
              iconClassName="fill-white"
              value={currentMonth}
              dateFormat={"MMMM, yyyy"}
              showMonthYearPicker
              onChange={(date) => {
                setCurrentMonth(date)
              }}
            />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-x-6 mt-8">
          {TOTAL_DATA.map((item, index) => {
            let renderValue = () => {
              switch (index) {
                case 0:
                  return customerAnalytics?.totalCustomers || 0
                case 1:
                  return customerAnalytics?.newCustomers || 0
                case 2:
                  return abbreviateNumber(customerAnalytics?.totalExpense || 0)
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
      <div className="grid grid-cols-3 gap-x-6 pb-6">
        <div className="relative p-6 shadow-sm rounded-lg">
          <h4 className="text-primary font-bold mb-6 pl-10">Top 10 khách hàng chi tiêu</h4>
          <div className="space-y-2">
            {customerAnalytics?.topExpenses?.map((customer) => (
              <div
                key={customer?.id}
                className="bg-primary/10 py-5 px-9 rounded-lg flex items-center justify-between h-14"
              >
                <p>
                  {customer?.firstName} {customer?.lastName}
                </p>
                <Price price={customer?.totalExpense} />
              </div>
            ))}
          </div>
        </div>
        <div className="relative p-6 shadow-sm rounded-lg">
          <h4 className="text-primary font-bold mb-6 pl-10">Top 10 Check-in</h4>
          <div className="space-y-2">
            {customerAnalytics?.topCheckins?.map((customer) => (
              <div
                key={customer.id}
                className="bg-primary/10 py-5 px-9 rounded-lg flex items-center justify-between h-14"
              >
                <p>
                  {customer?.firstName} {customer?.lastName}
                </p>
                <b>{customer?.totalCheckIns}</b>
              </div>
            ))}
          </div>
        </div>
        <div className="relative p-6 shadow-sm rounded-lg">
          <h4 className="text-primary font-bold mb-6 pl-10">Top 10 khách hàng nợ</h4>
          <div className="space-y-2">
            {customerAnalytics?.topDebt?.map((customer) => (
              <div
                key={customer.id}
                className="bg-primary/10 py-5 px-9 rounded-lg flex items-center justify-between h-14"
              >
                <p>
                  {customer?.firstName} {customer?.lastName}
                </p>
                <Price price={customer?.totalDebt} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Page>
  )
}

export default CustomersReport
