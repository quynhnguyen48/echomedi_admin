import { useMemo, useCallback } from "react"
import classNames from "classnames"

import Table from "components/Table"
import Tag from "components/Tag"
import { CATEGORY_STATUS } from "constants/Category"
import Price from "components/Price"

const TreatmentsTable = ({ data, activeRow, loading, pageCount, onClickRow, fetchData }) => {
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
        Header: "Treatment ID",
        accessor: (originalRow) => (
          <span
            className={`font-bold ${
              originalRow?.code === activeRow?.code ? "text-white" : "text-primary"
            }`}
          >
            {originalRow?.code}
          </span>
        ),
        collapse: true,
        width: 140,
      },
      {
        Header: "Name",
        accessor: (originalRow) => <span>{originalRow?.name}</span>,
        collapse: true,
        width: 200,
      },
    ]
    if (activeRow) return defaultColumns
    return [
      ...defaultColumns,
      {
        Header: "Category",
        accessor: (originalRow) =>
          originalRow.categories.map((c, index) => (
            <span key={index} className="block">
              {c.title.en}
            </span>
          )),
        collapse: true,
        width: 150,
      },
      {
        Header: "Price/Unit",
        accessor: (originalRow) => {
          return (
            <div className="flex">
              <Price price={originalRow.price} />
              <span className="mt-1">/1 {originalRow.unit}</span>
            </div>
          )
        },
        collapse: true,
        width: 250,
      },
      {
        Header: "Status",
        accessor: (originalRow) => (
          <Tag
            className={classNames({
              "bg-red": !originalRow.publishedAt,
              "bg-green": originalRow.publishedAt,
            })}
            name={originalRow.publishedAt ? CATEGORY_STATUS.PUBLISHED : CATEGORY_STATUS.UNPUBLISHED}
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

export default TreatmentsTable
