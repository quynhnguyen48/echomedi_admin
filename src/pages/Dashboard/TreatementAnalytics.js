import { useEffect, useState } from "react"
import countBy from "lodash/countBy"
import reduce from "lodash/reduce"
import orderBy from "lodash/orderBy"
import slice from "lodash/slice"
import sumBy from "lodash/sumBy"

import { getInProgressTreatmentHistory } from "services/api/treatementHistory"
import AnalysItem from "./AnalysItem"
import { getPercentage } from "utils/number"

const TreatementAnalytics = ({ className }) => {
  const [data, setData] = useState()

  useEffect(() => {
    ;(async () => {
      try {
        const res = await getInProgressTreatmentHistory()
        const listTreatments = res.data
        const total = listTreatments?.length
        let treatments = reduce(
          countBy(listTreatments, "treatment"),
          function (result, value, key) {
            result.push({ name: key, total: value })
            return result
          },
          []
        )
        treatments = orderBy(treatments, "total", "desc")

        setData({
          total,
          items: [
            ...slice(treatments, 0, 3),
            { name: "Others", total: sumBy(slice(treatments, 3), "total") },
          ],
        })
      } catch (error) {}
    })()
  }, [])

  return (
    <div className={`rounded-t-xl p-4 bg-white ${className}`}>
      <AnalysItem iconName="grammerly" title="Số bệnh nhân đang khám" value={data?.total || 0} />
      <div className="mt-6 grid grid-cols-2 gap-4">
        {Array.isArray(data?.items) &&
          data?.items?.map((item, i) => (
            <div
              key={i}
              className="bg-primary last:bg-primary/10 p-4 rounded-xl text-white last:text-primary"
            >
              <p className="text-14 font-bold truncate">{item?.name}</p>
              <p className="text-24 font-bold mt-2">{getPercentage(item?.total, data?.total)}</p>
            </div>
          ))}
      </div>
    </div>
  )
}

export default TreatementAnalytics
