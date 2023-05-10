import { useCallback, useMemo } from "react"
import dayjs from "dayjs"

import Table from "components/Table"
import Tag from "components/Tag"
import { BILLING_TYPE_TITLE, PAYMENT_METHOD_TITLE } from "constants/Transaction"
import Price from "components/Price"
import { renderTransactionCheckinStatusColor, toCapitalize } from "utils/string"

const TransactionTable = ({
  data,
  activeRow,
  loading,
  pageCount,
  onClickRow,
  fetchData,
  onOpenCustomerModal,
}) => {
  const handleClickRow = useCallback(
    (row, elementId) => {
      if (elementId.includes("quickAccess")) {
        onOpenCustomerModal(elementId.replace("quickAccess_", ""))
      } else {
        if (row?.id === activeRow?.id) {
          onClickRow(null)
        } else {
          onClickRow(row)
        }
      }
    },
    [activeRow?.id, onClickRow, onOpenCustomerModal]
  )

  const columns = useMemo(() => {
    const defaultColumns = [
      {
        Header: "Transaction ID",
        accessor: (originalRow) => (
          <span
            className={`font-bold ${
              originalRow?.id === activeRow?.id ? "text-white" : "text-primary"
            }`}
          >
            {originalRow?.code}
          </span>
        ),
        collapse: true,
        width: 150,
      },
      {
        Header: "Customer ID",
        accessor: (originalRow) => (
          <b id={`quickAccess_${originalRow?.user?.id}`}>{originalRow?.user?.code}</b>
        ),
        collapse: true,
        width: 150,
      },
    ]
    if (activeRow) return defaultColumns

    return [
      ...defaultColumns,
      {
        Header: "Billing Type",
        accessor: (originalRow) => <span>{BILLING_TYPE_TITLE[originalRow?.billingType]}</span>,
        collapse: true,
        width: 150,
      },
      {
        Header: "Total Value",
        accessor: (originalRow) => <Price price={originalRow?.total} />,
        collapse: true,
        width: 150,
      },
      {
        Header: "Payment Method",
        accessor: (originalRow) => <span>{PAYMENT_METHOD_TITLE[originalRow?.paymentMethod]}</span>,
        collapse: true,
        width: 150,
      },
      {
        Header: "Purchased Date",
        accessor: (originalRow) => (
          <span>{`${dayjs(originalRow?.createdAt).format("DD MMMM, YYYY [|] HH:mm")}`}</span>
        ),
        collapse: true,
        width: 200,
      },
      {
        Header: "Status",
        align: "right",
        accessor: (originalRow) =>
          originalRow?.status && (
            <Tag
              name={toCapitalize(originalRow.status)}
              className={renderTransactionCheckinStatusColor(originalRow.status)}
            />
          ),
        collapse: true,
        width: 100,
      },
    ]
  }, [activeRow])

  return (
    <Table
      className="mt-6"
      columns={columns}
      data={data}
      fetchData={fetchData}
      loading={loading}
      pageCount={pageCount}
      hidePagination={activeRow}
      activeRow={activeRow}
      onClickRow={handleClickRow}
    />
  )
}

export default TransactionTable
