import classNames from "classnames"
import dayjs from "dayjs"
import { useCallback, useEffect, useState } from "react"

import DataItem from "components/DataItem"
import Drawer from "components/Drawer"
import Price from "components/Price"
import SearchInput from "components/SearchInput"
import Tag from "components/Tag"
import { TRANSACTION_TYPE_TITLE } from "constants/Transaction"
import { TRANSACTION_TYPE } from "constants/TransactionType"
import { getListTransactions } from "services/api/transactions"
import { formatPrice } from "utils/number"
import { formatStrapiArr } from "utils/strapi"

const CustomerAccountBalance = ({ userId, cardIds, openDrawer, onClose, accountBalance }) => {
  const [transactions, setTransactions] = useState([])
  const [searchKey, setSearchKey] = useState()

  const fetchData = useCallback(async () => {
    try {
      let filter = {
        user: userId,
        card: {
          id: {
            $in: cardIds,
          },
        },
      }

      if (searchKey?.length >= 3) {
        filter = {
          ...filter,
          code: { $containsi: searchKey },
        }
      }

      const res = await getListTransactions({ pageSize: 1000 }, filter)
      if (res?.data) {
        setTransactions(formatStrapiArr(res.data))
      }
    } catch (error) {}
  }, [cardIds, searchKey, userId])

  useEffect(() => {
    ;(async () => {
      if (userId && cardIds?.length && openDrawer) {
        fetchData()
      }
    })()
  }, [cardIds?.length, fetchData, openDrawer, userId])

  return (
    <Drawer open={openDrawer} onClose={onClose}>
      <DataItem icon="box-tick" title="Account Balance" value={`${formatPrice(accountBalance)}đ`} />
      <SearchInput
        placeholder="Search by Transaction ID"
        className="mt-6"
        onSearch={(value) => {
          setSearchKey(value)
        }}
      />
      <div className="mt-8 space-y-4">
        {Array.isArray(transactions) &&
          transactions?.map((transaction) => (
            <div key={transaction?.id} className="bg-primary/10 p-4 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="font-bold text-primary">{transaction.code}</span>
                <Tag
                  name={TRANSACTION_TYPE_TITLE[transaction?.type]}
                  className={classNames("!rounded-lg", {
                    "bg-green": transaction?.type === TRANSACTION_TYPE.INCOME,
                    "bg-red": transaction?.type === TRANSACTION_TYPE.EXPENSE,
                  })}
                />
              </div>
              <p className="text-14 text-secondary/[56]">
                {dayjs(transaction?.createdAt).format("DD MMMM, YYYY [|] HH:mm")}
              </p>
              <div className="flex justify-between mt-4">
                <Price price={transaction?.purchase} />
              </div>
            </div>
          ))}
      </div>
    </Drawer>
  )
}

export default CustomerAccountBalance
