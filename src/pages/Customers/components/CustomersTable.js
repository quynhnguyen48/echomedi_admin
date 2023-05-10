import { useMemo, useCallback } from "react"
import classNames from "classnames"

import Table from "components/Table"
import Tag from "components/Tag"
import Avatar from "components/Avatar"
import { getStrapiMedia } from "utils/media"

const CustomersTable = ({
  data,
  activeRow,
  loading,
  pageCount,
  onClickRow,
  fetchData,
  isModal = false,
}) => {
  const handleClickRow = useCallback(
    (row) => {
      if (!isModal) {
        if (row?.id === activeRow?.id) {
          onClickRow(null)
        } else {
          onClickRow(row)
        }
      }
    },
    [activeRow?.id, onClickRow]
  )

  const columns = useMemo(() => {
    const defaultColumns = [
      // {
      //   Header: "Customer ID",
      //   accessor: (originalRow) => (
      //     <span
      //       className={`font-bold ${
      //         originalRow?.id === activeRow?.id ? "text-white" : "text-primary"
      //       }`}
      //     >
      //       {originalRow?.id}
      //     </span>
      //   ),
      //   collapse: true,
      //   width: 150,
      // },
      {
        Header: "Full Name",
        accessor: (originalRow) => (
          <div className="flex items-center gap-x-4">
            {!isModal && (
              <Avatar
                src={getStrapiMedia({ url: originalRow.avatar })}
                name={`${originalRow?.firstName} ${originalRow?.lastName}`}
                className={originalRow?.id === activeRow?.id && "!bg-white !text-primary"}
              />
            )}
            <span>{`${originalRow?.firstName} ${originalRow?.lastName}`}</span>
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
        width: 300,
      },
      {
        Header: "Phone Number",
        collapse: true,
        width: 150,
        accessor: (originalRow) => <span>{originalRow.phone}</span>,
      },
      {
        Header: "Gender",
        hidden: isModal,
        accessor: (originalRow) => <span className="capitalize">{originalRow.gender}</span>,
        collapse: true,
        width: 100,
      },
      {
        Header: "Status",
        align: "right",
        hidden: isModal,
        accessor: (originalRow) => (
          <Tag
            className={classNames({
              "bg-red": originalRow.blocked,
              "bg-green": !originalRow.blocked,
            })}
            name={originalRow.blocked ? "Blocked" : "Active"}
          />
        ),
        collapse: true,
        width: 100,
      },
    ]
  }, [activeRow, isModal])

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

export default CustomersTable
