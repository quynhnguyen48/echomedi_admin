import { useCallback, useEffect, useState } from "react"
import dayjs from "dayjs"
import isEmpty from "lodash/isEmpty"
import { toast } from "react-toastify"

import Button from "components/Button"
import Drawer from "components/Drawer"
import Tag from "components/Tag"
import Avatar from "components/Avatar"
import Icon from "components/Icon"
import { getStrapiMedia } from "utils/media"
import { formatStrapiArr, formatStrapiObj } from "utils/strapi"
import { getErrorMessage } from "utils/error"
import { getListTransactions } from "services/api/transactions"
import { updateCheckin } from "services/api/checkin"
import { TRANSACTION_CHECKIN_STATUS } from "constants/Transaction"
import { renderTransactionCheckinStatusColor, toCapitalize } from "utils/string"
import CheckOutTransactionItem from "./CheckOutTransactionItem"
import SuggestTransactions from "./SuggestTransactions"

const CheckOutDrawer = ({
  data,
  openDrawer,
  onClose,
  onCheckoutSuccess,
  onOpenTransactionCreationModal,
  onSelectTransaction,
  onConfirmTransactions,
  onCreateTransactionSuccess,
}) => {
  const [transactionList, setTransactionList] = useState(data?.transactions || [])
  const [isLoading, setIsLoading] = useState(false)

  const handleCheckout = useCallback(async () => {
    try {
      setIsLoading(true)
      const payload = {
        user: {
          id: data?.user?.id,
        },
        checkedoutAt: new Date().toISOString(),
        transactions: transactionList?.length
          ? transactionList?.map((transaction) => transaction.id)
          : null,
      }
      const res = await updateCheckin(data?.id, payload)
      if (res.data) {
        onCheckoutSuccess({
          ...data,
          checkedoutAt: payload.checkedoutAt,
          transactions: transactionList,
        })
        toast.success("Checked out successfully")
      }
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }, [data, onCheckoutSuccess, transactionList])

  const fetchTransactions = useCallback(async () => {
    if (!data?.checkedoutAt && openDrawer) {
      try {
        const res = await getListTransactions(
          { pageSize: 1000 },
          {
            user: {
              id: data?.user?.id,
            },
            createdAt: {
              $gte: dayjs().startOf("day").toISOString(),
            },
          }
        )
        const listTransactions = formatStrapiArr(res.data).map((transaction) => ({
          ...transaction,
          staff: formatStrapiObj(transaction.staff),
          extraStaff: formatStrapiObj(transaction.extraStaff),
          user: formatStrapiObj(transaction.user),
          order: formatStrapiObj(transaction.order),
          treatment: formatStrapiObj(transaction.treatment),
          card: formatStrapiObj(transaction.card),
          check_in: formatStrapiObj(transaction.check_in),
        }))

        setTransactionList(
          listTransactions?.filter((transaction) => !transaction?.check_in?.checkedoutAt)
        )
      } catch (error) {}
    }
  }, [data?.checkedoutAt, data?.user?.id, openDrawer])

  useEffect(() => {
    setTransactionList(data?.transactions || [])
  }, [data?.transactions])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  return (
    <Drawer open={openDrawer} onClose={onClose} className="h-full">
      <h4 className="font-bold text-18">Check out a customer</h4>
      <span className="font-bold mt-6">Customer</span>
      <div className="flex justify-between gap-x-6 mt-4">
        <Avatar
          size={80}
          alt="avatar"
          src={getStrapiMedia({ url: data?.user?.avatar })}
          name={`${data?.user?.firstName} ${data?.user?.lastName}`}
        />
        <div className="flex flex-col flex-1">
          <span className="font-bold text-18">{`${data?.user?.firstName} ${data?.user?.lastName}`}</span>
          <span className="text-12 mt-2">{data?.user?.email}</span>
          <span className="text-14 font-bold mt-2">{data?.user?.phone}</span>
        </div>
        <div className="flex flex-col justify-between items-end">
          {data?.checkedoutAt ? (
            <Tag secondary name="Checked out" className="text-center p-2 bg-gray4" />
          ) : (
            data?.status && (
              <Tag
                secondary
                name={toCapitalize(data?.status)}
                className={renderTransactionCheckinStatusColor(data?.status)}
              />
            )
          )}
          <span className="text-14 font-bold">{dayjs(data?.createdAt).format("HH:mm")}</span>
        </div>
      </div>

      {!data?.checkedoutAt && (
        <SuggestTransactions
          checkin={data}
          userId={data?.user?.id}
          fetchTransactions={fetchTransactions}
          onCreateTransactionSuccess={onCreateTransactionSuccess}
        />
      )}

      <div className="mt-6">
        <h4 className="font-bold mb-4">Transactions</h4>
        {!data?.checkedoutAt && data?.status !== TRANSACTION_CHECKIN_STATUS.CONFIRMED && (
          <button
            className="mb-4 flex items-center space-x-4 bg-gray2 px-6 py-4 rounded-lg w-full text-left md:hidden"
            onClick={onOpenTransactionCreationModal}
          >
            <Icon name="plus" className="fill-primary" />
            <span>Add Transactions</span>
          </button>
        )}
        {Array.isArray(transactionList) && !isEmpty(transactionList) && (
          <div className="flex flex-col gap-y-4">
            {transactionList?.map((transaction, index) => {
              return (
                <CheckOutTransactionItem
                  key={index}
                  transaction={transaction}
                  showRemoveButton={!data?.checkedoutAt}
                  handleRemove={() =>
                    setTransactionList((transactions) =>
                      transactions?.filter((item) => item.id !== transaction.id)
                    )
                  }
                  onClick={() => !data?.checkedoutAt && onSelectTransaction(transaction)}
                />
              )
            })}
          </div>
        )}
      </div>
      {!data?.checkedoutAt && (
        <div className="flex justify-between mt-10">
          <Button
            disabled={data?.status !== TRANSACTION_CHECKIN_STATUS.PAID}
            className={data?.status === TRANSACTION_CHECKIN_STATUS.CONFIRMED ? "!bg-blue" : ""}
            onClick={onConfirmTransactions}
          >
            Confirm
          </Button>
          <div className="flex flex-row space-x-2">
            <Button
              onClick={handleCheckout}
              loading={isLoading}
              disabled={
                isLoading ||
                (data?.transactions?.length > 0 &&
                  data?.status !== TRANSACTION_CHECKIN_STATUS.CONFIRMED)
              }
            >
              Checkout
            </Button>
            <Button className="bg-white text-primary" btnType="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </Drawer>
  )
}

export default CheckOutDrawer
