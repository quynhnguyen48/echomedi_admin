import { useCallback, useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { toast } from "react-toastify"

import Page from "components/Page"
import { BILLING_TYPE, TRANSACTION_TYPE } from "constants/Transaction"
import { deleteCard } from "services/api/card"
import {
  createNewTransaction,
  getTransactionById,
  updateTransaction,
} from "services/api/transactions"
import { getErrorMessage } from "utils/error"
import { formatStrapiObj } from "utils/strapi"
import TransactionForm from "./components/TransactionForm"

const EditTransaction = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const editMode = useMemo(() => !!id, [id])
  const [transactionData, setTransactionData] = useState()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    ;(async () => {
      if (id) {
        try {
          const res = await getTransactionById(id)
          if (res.data) {
            const transaction = formatStrapiObj(res.data)
            if (transaction) {
              setTransactionData({
                ...transaction,
                user: formatStrapiObj(transaction.user),
                card: formatStrapiObj(transaction.card),
                treatment: formatStrapiObj(transaction.treatment),
                order: formatStrapiObj(transaction.order),
                staff: formatStrapiObj(transaction.staff),
                extraStaff: formatStrapiObj(transaction.extraStaff),
              })
            }
          }
        } catch (error) {
        } finally {
        }
      }
    })()
  }, [id])

  const handleEdit = useCallback(
    async (payload) => {
      try {
        setIsLoading(true)
        const res = await updateTransaction(id, {
          ...payload,
          type: transactionData?.type,
        })
        if (res) {
          toast.success("Saved successfully")
          navigate("/transactions")
        }
      } catch (error) {
        toast.error(getErrorMessage(error))
      } finally {
        setIsLoading(false)
      }
    },
    [id, navigate, transactionData?.type]
  )

  const handleCreate = useCallback(
    async (payload) => {
      try {
        setIsLoading(true)
        const res = await createNewTransaction({
          ...payload,
          type: TRANSACTION_TYPE.EXPENSE,
        })
        if (payload.billingType === BILLING_TYPE.CARD_CANCELED) {
          await deleteCard(payload?.card?.id)
        }
        if (res) {
          toast.success("Created successfully")
          navigate("/transactions")
        }
      } catch (error) {
        toast.error(getErrorMessage(error))
      } finally {
        setIsLoading(false)
      }
    },
    [navigate]
  )

  return (
    <Page title="Transaction Management" parentUrl="/transactions">
      <p className="text-16 font-bold">{`${editMode ? "Edit" : "Create New"} Transaction`}</p>
      <div className="mt-4">
        <TransactionForm
          data={transactionData}
          handleSave={(data) => (editMode ? handleEdit(data) : handleCreate(data))}
          isSubmittingForm={isLoading}
        />
      </div>
    </Page>
  )
}

export default EditTransaction
