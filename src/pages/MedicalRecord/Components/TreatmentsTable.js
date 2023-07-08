import { useMemo, useCallback } from "react"
import classNames from "classnames"
import dayjs from "dayjs";

import Table from "components/Table"
import Tag from "components/Tag"
import { CATEGORY_STATUS } from "constants/Category"
import Price from "components/Price"
import { formatDate } from "utils/dateTime"

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
        Header: "ID",
        accessor: (originalRow) => (
          <span
            className={`font-bold ${
              originalRow?.id === activeRow?.id ? "text-white" : "text-primary"
            }`}
          >
            {originalRow?.uid}
          </span>
        ),
        collapse: true,
        width: 100,
      },
      {
        Header: "Tên",
        accessor: (originalRow) => <span>{originalRow?.patient?.full_name}</span>,
        collapse: true,
        width: 200,
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
        Header: "Năm sinh",
        collapse: true,
        width: 50,
        accessor: (originalRow) => <span>{dayjs(originalRow.patient?.birthday).year()} ({2023-dayjs(originalRow.patient?.birthday).year()})</span>,
      },
      {
        Header: "Số điện thoại",
        collapse: true,
        width: 50,
        accessor: (originalRow) => <span>{originalRow.patient?.phone}</span>,
      },
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
        width: 50,
      },
      {
        Header: "Ngày tái khám",
        accessor: (originalRow) => {
          return (
            <div className="flex">
              <span className="">{originalRow.prescription?.reExaminationDate && formatDate(originalRow.prescription?.reExaminationDate, "DD MMMM, YYYY")}</span>
            </div>
          )
        },
        collapse: true,
        width: 50,
      },
      // {
      //   Header: "Status",
      //   accessor: (originalRow) => (
      //     <Tag
      //       className={classNames({
      //         "bg-red": !originalRow.publishedAt,
      //         "bg-green": originalRow.publishedAt,
      //       })}
      //       name={originalRow.publishedAt ? CATEGORY_STATUS.PUBLISHED : CATEGORY_STATUS.UNPUBLISHED}
      //     />
      //   ),
      //   align: "right",
      //   collapse: true,
      //   width: 100,
      // },
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

export default TreatmentsTable
