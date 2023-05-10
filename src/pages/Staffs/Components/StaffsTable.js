import { useMemo, useCallback } from "react"
import classNames from "classnames"

import Table from "components/Table"
import Tag from "components/Tag"
import Avatar from "components/Avatar"
import { getStrapiMedia } from "utils/media"
import { formatDate } from "utils/dateTime"

const StaffsTable = ({ data, activeRow, loading, pageCount, onClickRow, fetchData }) => {
  const handleClickRow = useCallback(
    (row) => {
      if (row?.id === activeRow?.id) {
        onClickRow(null)
      } else {
        onClickRow(row)
      }
    },
    [activeRow?.id, onClickRow]
  )

  const columns = useMemo(() => {
    const defaultColumns = [
      {
        Header: "Staff ID",
        accessor: (originalRow) => (
          <span
            className={`font-bold ${
              originalRow?.id === activeRow?.id ? "text-white" : "text-primary"
            }`}
          >
            {originalRow?.id}
          </span>
        ),
        collapse: true,
        width: 150,
      },
      {
        Header: "Name",
        accessor: (originalRow) => (
          <div className="flex items-center gap-x-4">
            <Avatar
              src={getStrapiMedia({ url: originalRow.avatar })}
              name={`${originalRow?.firstName} ${originalRow?.lastName}`}
              className={originalRow?.id === activeRow?.id && "!bg-white !text-primary"}
            />
            <span>{`${originalRow?.firstName || ""} ${originalRow?.lastName || ""}`}</span>
          </div>
        ),
        collapse: true,
        width: 200,
      },
    ]
    if (activeRow) return defaultColumns
    return [
      ...defaultColumns,
      {
        Header: "Email",
        accessor: "email",
        collapse: true,
        width: 250,
      },
      {
        Header: "Role",
        accessor: (originalRow) => <span className="capitalize">{originalRow?.role?.name}</span>,
        collapse: true,
        width: 150,
      },
      {
        Header: "Created Date",
        accessor: (originalRow) => (
          <span className="capitalize">{formatDate(originalRow.createdAt)}</span>
        ),
        collapse: true,
        width: 120,
      },
      {
        Header: "Status",
        align: "right",
        accessor: (originalRow) => (
          <Tag
            className={classNames({
              "bg-red": originalRow.blocked,
              "bg-green": !originalRow.blocked,
            })}
            name={originalRow.blocked ? "Inactive" : "Active"}
          />
        ),
        collapse: true,
        width: 120,
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

export default StaffsTable
