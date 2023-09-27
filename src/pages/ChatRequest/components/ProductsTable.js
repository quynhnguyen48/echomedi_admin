import { useMemo, useCallback } from "react"
import classNames from "classnames"
import sumBy from "lodash/sumBy"

import Table from "components/Table"
import Tag from "components/Tag"
import { getStrapiMedia } from "utils/media"
import Price from "components/Price"
import { formatDate } from "utils/dateTime"
import Button from "components/Button"
import { getDisplayBranchLabel } from "utils/string";

import { BRAND_STATUS } from "constants/Brand"

const ProductsTable = ({ data, activeRow, loading, pageCount, onClickRow, fetchData, createConversation }) => {
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
          <div className="flex items-center gap-x-4">
            <span>{originalRow?.id}</span>
          </div>
        ),
        collapse: true,
        width: 30,
      },
      {
        Header: "Tên",
        accessor: (originalRow) => (
          <div className="flex items-center gap-x-4">
            <span>{originalRow?.user?.data?.attributes?.patient?.data?.attributes?.full_name}</span>
          </div>
        ),
        collapse: true,
        width: 150,
      },
      {
        Header: "Supporter",
        accessor: (originalRow) => (
          <div className="flex items-center gap-x-4">
            <span>{originalRow?.supporter == "doctor" ? "Bác sĩ" : "care concierge"}</span>
          </div>
        ),
        collapse: true,
        width: 50,
      },
      {
        Header: "Chi nhánh",
        accessor: (originalRow) => (
          <div className="flex items-center gap-x-4">
            <span>{getDisplayBranchLabel(originalRow?.branch)}</span>
          </div>
        ),
        collapse: true,
        width: 50,
      },
      {
        Header: "Lưu ý",
        accessor: (originalRow) => (
          <div className="flex items-center gap-x-4">
            <span>{getDisplayBranchLabel(originalRow?.note)}</span>
          </div>
        ),
        collapse: true,
        width: 50,
      },
      {
        Header: "Thời gian",
        accessor: (originalRow) => (
          <div className="flex items-center gap-x-4">
            <span>{formatDate(originalRow?.createdAt, "HH:MM DD/MM/YYYY")}</span>
          </div>
        ),
        collapse: true,
        width: 70,
      },
      {
        Header: "Hành động",
        accessor: (originalRow) => (
          <div className="flex items-center gap-x-4">
            <Button
              onClick={async e => {
                await createConversation(originalRow);
              }}
            >Bắt đầu hội thoại</Button>
          </div>
        ),
        collapse: true,
        width: 70,
      },
    ]
    if (activeRow) return defaultColumns

    return [
      ...defaultColumns,
    ]
  }, [activeRow])

  return (
    <Table
      columns={columns}
      data={data}
      fetchData={fetchData}
      loading={loading}
      hidePagination={activeRow}
      pageCount={pageCount}
      activeRow={activeRow}
      // onClickRow={handleClickRow}
    />
  )
}

export default ProductsTable
