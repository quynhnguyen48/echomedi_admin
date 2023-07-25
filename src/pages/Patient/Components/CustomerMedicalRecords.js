import classNames from "classnames"
import dayjs from "dayjs"
import { useCallback, useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"

import DataItem from "components/DataItem"
import Drawer from "components/Drawer"
import Price from "components/Price"
import SearchInput from "components/SearchInput"
import Tag from "components/Tag"
import { TRANSACTION_TYPE_TITLE } from "constants/Transaction"
import { TRANSACTION_TYPE } from "constants/TransactionType"
import { getMedicalRecords } from "services/api/medicalRecord"
import { formatPrice } from "utils/number"
import { formatStrapiArr } from "utils/strapi"
import { Navigate } from "react-router-dom"
import Loading from "components/Loading"
import Icon from "components/Icon"

const CustomerAccountBalance = ({ userId, cardIds, openDrawer, onClose, accountBalance }) => {
  let navigate = useNavigate()
  const [transactions, setTransactions] = useState([])
  const [searchKey, setSearchKey] = useState()
  const [loading, setLoading] = useState(false);
  const fetchData = useCallback(async () => {
    try {
      let filter = {
        patient: userId,
      }
      setLoading(true);
      const res = await getMedicalRecords({ pageSize: 1000 }, filter)
      if (res?.data) {
        setTransactions(formatStrapiArr(res.data))
        setLoading(false);
      }
    } catch (error) { }
  }, [cardIds, searchKey, userId])

  useEffect(() => {
    ; (async () => {
      if (userId && openDrawer) {
        fetchData()
      }
    })()
  }, [cardIds?.length, fetchData, openDrawer, userId])

  console.log('transactions', transactions)

  function parseJson(str) {
    try {
      let items = JSON.parse(str);
      return items.map(i => i.value).join("\n");
    } catch (e) {
        return str;
    }
  }
  

  return (
    <div className="mt-8 space-y-4">
      <p>Lịch sử bệnh án</p>
      {loading ? <Loading className="!border-primary !border-2 w-10 h-10" /> :
        Array.isArray(transactions) &&
        transactions
          .filter(t => t.booking.data != null)        
          .map((transaction) => (
          <div key={transaction?.id} className="bg-primary/10 p-4 rounded-xl">
            <p className="text-14 text-secondary/[56]">
              {dayjs(transaction?.booking?.data?.attributes?.bookingDate).format("DD MMMM, YYYY [|] HH:mm")}
            </p>
            <p>
              {"Lý do khám: " + parseJson(transaction.reasons_to_get_hospitalized)}
            </p>
            {/* <p className="text-14 text-secondary/[56]">
              {transaction?.booking?.data?.attributes?.bookingDate}
            </p> */}
            <div className="flex justify-between mt-4 w-25">
              <button
                className="flex w-22 justify-between"
                onClick={() => navigate(`/bookings/medical-records/${transaction?.booking?.data?.id}/view`)}>
                Chi tiết
                <Icon
                  name="arrows/right-square"
                  className="fill-red bg-white rounded-full"
                />
              </button>
            </div>
          </div>
        ))}
    </div>
  )
}

export default CustomerAccountBalance
