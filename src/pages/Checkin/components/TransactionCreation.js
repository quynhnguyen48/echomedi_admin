import { useCallback, useState } from "react"
import { toast } from "react-toastify"

import Icon from "components/Icon"
import Tag from "components/Tag"
import { createNewTransaction, updateTransaction } from "services/api/transactions"
import { deleteCard } from "services/api/card"
import { getErrorMessage } from "utils/error"
import { BILLING_TYPE, TRANSACTION_TYPE } from "constants/Transaction"
import { renderTransactionCheckinStatusColor } from "utils/string"
import TransactionForm from "../../Transactions/components/TransactionForm"

const TransactionCreation = ({ checkin, transaction, onClose, onConfirm }) => {
  const [loading, setLoading] = useState(false)

  const handleCloseModal = () => {
    onClose()
  }

  const handleEdit = useCallback(
    async (payload) => {
      try {
        setLoading(true)
        const res = await updateTransaction(transaction?.id, {
          ...payload,
          type: transaction?.type,
        })
        if (res) {
          toast.success("Saved successfully")
          onConfirm(res.data)
        }
      } catch (error) {
        toast.error(getErrorMessage(error))
      } finally {
        setLoading(false)
      }
    },
    [onConfirm, transaction?.id, transaction?.type]
  )

  const handleCreate = useCallback(async (payload) => {
    try {
      setLoading(true)
      const res = await createNewTransaction({
        ...payload,
        check_in: checkin?.id,
        type: TRANSACTION_TYPE.EXPENSE,
      })
      if (payload.billingType === BILLING_TYPE.CARD_CANCELED) {
        await deleteCard(payload?.card?.id)
      }
      if (res) {
        toast.success("Created successfully")
        onConfirm(res.data)
      }
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }, [checkin?.id, onConfirm])

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="font-bold text-24">Transaction</h2>
          <Tag secondary name={transaction?.status || 'new'} className={renderTransactionCheckinStatusColor(transaction?.status)}/>
        </div>
        <button onClick={handleCloseModal}>
          <Icon name="close-circle" className="fill-orange w-7 h-7"/>
        </button>
      </div>

      <div className="mt-6">
        <TransactionForm
          fromCheckin
          data={transaction}
          customerSelected={checkin?.user}
          handleSave={(data) => transaction?.id ? handleEdit(data) : handleCreate(data)}
          isSubmittingForm={loading}
          onCloseModal={onClose}
        />
      </div>
    </>
  )
}

export default TransactionCreation
