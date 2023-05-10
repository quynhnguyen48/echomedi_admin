import { useMemo } from "react"

import Table from "components/Table"
import Price from "components/Price"

const EmployeesReportTable = ({ data, loading }) => {
  const columns = useMemo(() => {
    return [
      {
        Header: "Staff ID",
        accessor: (originalRow) => (
          <span className="font-bold text-primary">{originalRow?.code}</span>
        ),
        collapse: true,
        width: 120,
      },
      {
        Header: "Staff Name",
        accessor: (originalRow) => (
          <span>
            {originalRow?.firstName} {originalRow?.lastName}
          </span>
        ),
        collapse: true,
        width: 180,
      },
      {
        Header: "Transactions",
        accessor: (originalRow) => <span>{originalRow?.transactions}</span>,
        collapse: true,
        width: 100,
      },
      {
        Header: "Income",
        accessor: (originalRow) => {
          return originalRow?.income ? <Price price={originalRow?.income} /> : <b>0đ</b>
        },
        collapse: true,
        width: 120,
      },
      {
        Header: "Interest",
        accessor: (originalRow) => {
          return originalRow?.interest ? <Price price={originalRow?.interest} /> : <b>0đ</b>
        },
        collapse: true,
        width: 120,
      },
    ]
  }, [])

  return <Table columns={columns} data={data} loading={loading} fullHeight hidePagination />
}

export default EmployeesReportTable
