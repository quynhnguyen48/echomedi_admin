import classNames from "classnames"
import { useCallback, useMemo } from "react"

import Table from "components/Table"
import Tag from "components/Tag"
import { CATEGORY_STATUS } from "constants/Category"
import { formatDate } from "utils/dateTime"

const InvoiceTable = ({ data, activeRow, loading, pageCount, onClickRow, fetchData }) => {
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
        Header: "ID",
        accessor: (originalRow) => (
          <p
            className={`font-bold my-2 ${
              originalRow?.id === activeRow?.id ? "text-white" : "text-primary"
            }`}
          >
            {originalRow?.idu}
          </p>
        ),
        collapse: true,
        width: 80,
      },
      {
        Header: "Tên",
        accessor: (originalRow) => <a className="hover:underline" href={`/patient/${originalRow?.patient?.uid}`}>{originalRow?.patient?.full_name?.toUpperCase()}</a>,
        collapse: true,
        width: 160,
      },
    ]
    if (activeRow) return defaultColumns
    return [
      ...defaultColumns,
      // {
      //   Header: "Category",
      //   accessor: (originalRow) =>
      //     originalRow.categories.map((c, index) => (
      //       <span key={index} className="block">
      //         {c.title.en}
      //       </span>
      //     )),
      //   collapse: true,
      //   width: 150,
      // },
      {
        Header: "Ngày khám bệnh",
        accessor: (originalRow) => {
          return (
            <div className="flex">
              <span className="">{formatDate(originalRow.createdAt, "DD MMMM, YYYY")}</span>
            </div>
          )
        },
        collapse: true,
        width: 250,
      },
      {
        Header: "Trạng thái",
        accessor: (originalRow) => (
          <Tag
            className={classNames({
              "bg-red": !originalRow.publishedAt,
              "bg-green": originalRow.publishedAt,
            })}
            name={originalRow.publishedAt ? "Đã thanh toán" : "Nháp"}
          />
        ),
        align: "right",
        collapse: true,
        width: 100,
      },
    ]
  }, [activeRow])

  return (
    <Table
      className="mt-2"
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

export default InvoiceTable
