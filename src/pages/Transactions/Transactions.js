import classNames from "classnames"
import { useCallback, useRef, useState } from "react"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"

import Button from "components/Button"
import Icon from "components/Icon"
import Page from "components/Page"
import SearchInput from "components/SearchInput"
import { deleteTransaction, getListTransactions } from "services/api/transactions"
import { resetPageIndex } from "slice/tableSlice"
import { formatStrapiArr, formatStrapiObj } from "utils/strapi"
import TransactionAnalytics from "./components/TransactionAnalytics"
import TransactionTable from "./components/TransactionTable"
import TransactionDetail from "./TransactionDetail"
import { getErrorMessage } from "utils/error"
import CustomerModal from "components/CustomerModal"

const Transactions = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [pageCount, setPageCount] = useState(0)
  const [detailData, setDetailData] = useState()
  const [searchKey, setSearchKey] = useState()
  const [customerIdSelected, setCustomerIdSelected] = useState(null)
  const [visibleCustomerModal, setVisibleCustomerModal] = useState(false)
  const fetchIdRef = useRef(0)

  const fetchData = useCallback(
    async ({ pageSize, pageIndex }) => {
      const fetchId = ++fetchIdRef.current

      if (fetchId === fetchIdRef.current) {
        try {
          setLoading(true)
          let filters = {}
          if (searchKey?.length) {
            filters = {
              $or: [
                { user: { code: { $containsi: searchKey } } },
                { code: { $containsi: searchKey } },
              ],
            }
          }
          const res = await getListTransactions(
            {
              pageSize: 10,
              page: pageIndex + 1,
            },
            filters
          )
          if (res.data) {
            const listTransactions = formatStrapiArr(res.data)
            setData(
              listTransactions?.map((transaction) => ({
                ...transaction,
                user: formatStrapiObj(transaction.user),
                card: formatStrapiObj(transaction.card),
                treatment: formatStrapiObj(transaction.treatment),
                order: formatStrapiObj(transaction.order),
                check_in: formatStrapiObj(transaction.check_in),
                staff: formatStrapiObj(transaction.staff),
                extraStaff: formatStrapiObj(transaction.extraStaff),
              }))
            )
            setPageCount(res?.data?.meta?.pagination?.pageCount)
          }
        } catch (error) {
        } finally {
          setLoading(false)
        }
      }
    },
    [searchKey]
  )

  const handleDelete = useCallback(async (id) => {
    try {
      const res = await deleteTransaction(id)
      if (res) {
        toast.success("Deleted successfully")
        setDetailData(null)
        setData((transactions) => transactions?.filter((transaction) => transaction.id !== id))
      }
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }, [])

  return (
    <Page
      title="Transaction Management"
      rightContent={detailData && <TransactionAnalytics data={detailData} />}
      rightContentClassName="pt-30"
    >
      <div className="w-full flex items-center gap-x-9">
        <SearchInput
          placeholder="Search by Transaction ID / User ID"
          className="flex-1"
          onSearch={(value) => {
            dispatch(resetPageIndex())
            setSearchKey(value)
          }}
        />
        <Button
          icon={<Icon name="add-circle" className="fill-white" />}
          onClick={() => navigate("/transactions/create")}
        >
          Create New Transaction
        </Button>
      </div>
      <div
        className={classNames({
          "w-full": !detailData,
          "flex gap-x-6": detailData,
        })}
      >
        <TransactionTable
          data={data}
          loading={loading}
          pageCount={pageCount}
          activeRow={detailData}
          fetchData={fetchData}
          onClickRow={setDetailData}
          onOpenCustomerModal={(customerId) => {
            setVisibleCustomerModal(true)
            setCustomerIdSelected(customerId)
          }}
        />
        {detailData && <TransactionDetail data={detailData} handleDelete={handleDelete} />}
      </div>
      <CustomerModal
        customerId={customerIdSelected}
        visibleModal={visibleCustomerModal}
        onClose={() => setVisibleCustomerModal(false)}
      />
    </Page>
  )
}

export default Transactions
