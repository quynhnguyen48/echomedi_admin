import { useCallback, useEffect, useState } from "react"
import classNames from "classnames"
import dayjs from "dayjs"

import DataItem from "components/DataItem"
import Drawer from "components/Drawer"
import Price from "components/Price"
import SearchInput from "components/SearchInput"
import Tag from "components/Tag"
import Button from "components/Button"
import { formatPrice } from "utils/number"
import { BILLING_TYPE } from "constants/Transaction"
import { getListTransactions } from "services/api/transactions"
import { formatStrapiArr } from "utils/strapi"
import CreateDebtReminderModal from "./CreateDebtReminderModal"

const CustomerDebt = ({ userId, openDrawer, onClose, totalDebt }) => {
  const [transactions, setTransactions] = useState([])
  const [openCustomerDebtModal, setOpenCustomerDebtModal] = useState(false)
  const [searchKey, setSearchKey] = useState()

  const fetchData = useCallback(async () => {
    try {
      let filter = {
        user: {
          id: {
            $eq: userId,
          },
        },
        debtBalance: {
          $ne: 0,
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
  }, [searchKey, userId])

  useEffect(() => {
    ;(async () => {
      if (userId && openDrawer) {
        fetchData()
      }
    })()
  }, [fetchData, openDrawer, userId])

  return (
    <>
      <Drawer open={openDrawer} onClose={onClose}>
        <DataItem icon="box-tick" title="Debt Balance" value={`${formatPrice(totalDebt)}đ`} />
        <SearchInput
          placeholder="Search by Transaction ID"
          className="mt-6"
          onSearch={(value) => {
            setSearchKey(value)
          }}
        />
        <Button className="mt-8 self-start" onClick={() => setOpenCustomerDebtModal(true)}>
          Create Reminder
        </Button>
        <div className="mt-8 space-y-4">
          {Array.isArray(transactions) &&
            transactions?.map((transaction) => (
              <div key={transaction?.id} className="bg-primary/10 p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-primary">{transaction.code}</span>
                  <Tag
                    name={
                      transaction?.billingType === BILLING_TYPE.DEBT_COLLECTION
                        ? "Debt Collection"
                        : "New Debt"
                    }
                    className={classNames("!rounded-lg", {
                      "bg-green": transaction?.billingType === BILLING_TYPE.DEBT_COLLECTION,
                      "bg-red": transaction?.billingType !== BILLING_TYPE.DEBT_COLLECTION,
                    })}
                  />
                </div>
                <p className="text-14 text-secondary/[56]">
                  {dayjs(transaction?.createdAt).format("DD MMMM, YYYY [|] HH:mm")}
                </p>
                <div className="flex justify-between mt-4">
                  <Price price={transaction?.debtBalance} />
                </div>
              </div>
            ))}
        </div>
      </Drawer>
      <CreateDebtReminderModal
        userId={userId}
        show={openCustomerDebtModal}
        onClose={() => setOpenCustomerDebtModal(false)}
      />
    </>
  )
}

export default CustomerDebt
