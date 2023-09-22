import { useEffect, useMemo, useState } from "react"
import dayjs from "dayjs"
import countBy from "lodash/countBy"

import PieChart from "components/PieChart"
import AnalysItem from "./AnalysItem"
import CustomerAnalyticsItem from "./CustomerAnalyticsItem"
import { getPercentage, getPercentageNumber } from "utils/number"
import { getListUsers } from "services/api/users"
import { NEW_RANGES } from "constants/Dashboard"
import { GENDER } from "constants/Customer"
import parseInt from "lodash/parseInt"

const CustomerAnalytics = ({ className }) => {
  const [data, setData] = useState(null)

  const newCustomers = useMemo(
    () => data?.customer?.newCustomer || 0,
    [data?.customer?.newCustomer]
  )

  const oldCustomers = useMemo(
    () => data?.customer?.oldCustomer || 0,
    [data?.customer?.oldCustomer]
  )

  const total = useMemo(() => data?.customer?.total || 0, [data?.customer?.total])

  const countByAge = (data, min, max) => {
    let count = 0
    Object.entries(data)?.forEach(([key, value]) => {
      if (parseInt(key) >= min && parseInt(key) <= max) {
        count += value
      }
    })
    return count
  }

  useEffect(() => {
    ;(async () => {
      try {
        const users = await getListUsers()
        const listUsers = users?.data
        const listNewCustomer = listUsers?.filter(
          (user) => dayjs().diff(dayjs(user?.createdAt), "days") > NEW_RANGES
        )
        const total = listUsers?.length || 0
        const genders = countBy(listUsers, "gender")
        const ages = countBy(listUsers, (user) => dayjs().diff(dayjs(user.birthday), "years"))
        const agesTotal = countByAge(ages, 18, 100)

        setData({
          customer: {
            total: total,
            newCustomer: listNewCustomer?.length,
            oldCustomer: total - listNewCustomer?.length,
          },
          gender: [
            {
              name: "Male",
              value: getPercentageNumber(genders?.[GENDER.MALE], total),
            },
            {
              name: "Female",
              value: getPercentageNumber(genders?.[GENDER.FEMALE], total),
            },
            {
              name: "Unknown",
              value: getPercentageNumber(
                total - genders?.[GENDER.MALE] - genders?.[GENDER.FEMALE],
                total
              ),
            },
          ],
          age: [
            {
              name: "18 - 24",
              value: getPercentageNumber(countByAge(ages, 18, 24), agesTotal),
            },
            {
              name: "25 - 35",
              value: getPercentageNumber(countByAge(ages, 25, 35), agesTotal),
            },
            {
              name: "36 - 40",
              value: getPercentageNumber(countByAge(ages, 36, 40), agesTotal),
            },
            {
              name: "40+",
              value: getPercentageNumber(countByAge(ages, 41, 100), agesTotal),
            },
          ],
        })
      } catch (error) {}
    })()
  }, [])

  return (
    <div className={`rounded-t-xl p-4 bg-white mt-4 flex flex-col sm:block items-start justify-between ${className}`}>
      <div>
        <AnalysItem iconName="user" title="Lượng khách hàng" value={total} />
        <CustomerAnalyticsItem
          className="mt-6"
          name="Khách hàng mới"
          percentage={getPercentage(newCustomers, total)}
          value={newCustomers}
          color="bg-yellow"
        />
        <CustomerAnalyticsItem
          className="mt-8"
          name="Khách hàng cũ"
          percentage={getPercentage(oldCustomers, total)}
          value={oldCustomers}
          color="bg-red"
        />
      </div>
      {data?.gender && (
        <PieChart
          className="-mt-5"
          width={188}
          height={188}
          title="Khách hàng theo giới tính"
          data={data?.gender}
          colors={["#27AE60", "#F2C94C", "#EB5757"]}
        />
      )}
      {data?.age && (
        <PieChart
          className="-mt-5"
          width={188}
          height={188}
          title="Khách hàng theo độ tuổi"
          data={data?.age}
          colors={["#27AE60", "#F2C94C", "#EB5757", "#2F80ED"]}
        />
      )}
    </div>
  )
}

export default CustomerAnalytics
