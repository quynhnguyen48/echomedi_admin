import { useMemo, useCallback } from "react"
import classNames from "classnames"
import sumBy from "lodash/sumBy"

import Table from "components/Table"
import Tag from "components/Tag"
import { getStrapiMedia } from "utils/media"
import Price from "components/Price"
import { formatDate } from "utils/dateTime"

import { BRAND_STATUS } from "constants/Brand"
import { numberWithCommas } from "pages/Invoice/Components/InvoiceTable"

const ProductsTable = ({ data, activeRow, loading, pageCount, onClickRow, fetchData }) => {
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
            {originalRow?.id}
          </span>
        ),
        collapse: true,
        width: 50,
      },
      {
        Header: "Tên dịch vụ",
        accessor: (originalRow) => (
          <div className="flex items-center gap-x-4">
            <span>{originalRow?.label}</span>
          </div>
        ),
        collapse: true,
        width: 200,
      },
      {
        Header: "Số dịch vụ con",
        accessor: (originalRow) => (
            <span>{originalRow?.Services.length}</span>
        ),
        collapse: true,
        width: 80,
      },
      {
        Header: "Ngày cập nhật",
        accessor: (originalRow) => (
          <div className="flex items-center gap-x-4">
            <span>{formatDate(originalRow?.updatedAt, "HH:mm DD/MM/YYYY") }</span>
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
        Header: "Giá",
        accessor: (originalRow) => (
          <div className="flex items-center gap-x-4">
            <span>{numberWithCommas(originalRow.price)}</span>
          </div>
        ),
        collapse: true,
        width: 100,
      },
      // {
      //   Header: "Tồn",
      //   accessor: (originalRow) => (
      //     <div className="flex items-center gap-x-4">
      //       <span>{originalRow?.stock + " " + originalRow?.unit}</span>
      //     </div>
      //   ),
      //   collapse: true,
      //   width: 50,
      // },
      // {
      //   Header: "Inventory",
      //   accessor: (originalRow) => (
      //     <span>{sumBy(originalRow?.variants, (variant) => parseInt(variant.inventory))}</span>
      //   ),
      //   collapse: true,
      //   width: 100,
      // },
      // {
      //   Header: "Price",
      //   accessor: (originalRow) => (
      //     <Price
      //       suffixClassName="font-normal"
      //       price={originalRow.price}
      //     />
      //   ),

      //   collapse: true,
      //   width: 150,
      // },
      // {
      //   Header: "Size",
      //   accessor: (originalRow) => (
      //     <span className="capitalize">{`${originalRow?.variants?.length} Sizes`}</span>
      //   ),
      //   collapse: true,
      //   width: 100,
      // },
      // {
      //   Header: "Status",
      //   accessor: (originalRow) => (
      //     <Tag
      //       className={classNames({
      //         "bg-red": !originalRow.publishedAt,
      //         "bg-green": originalRow.publishedAt,
      //       })}
      //       name={originalRow.publishedAt ? BRAND_STATUS.PUBLISHED : BRAND_STATUS.UNPUBLISHED}
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
      className="mt-6"
      columns={columns}
      data={data}
      fetchData={fetchData}
      loading={loading}
      hidePagination={activeRow}
      pageCount={pageCount}
      activeRow={activeRow}
      onClickRow={handleClickRow}
    />
  )
}

export default ProductsTable
