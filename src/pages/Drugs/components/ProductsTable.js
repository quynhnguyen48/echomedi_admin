import { useMemo, useCallback } from "react"
import classNames from "classnames"
import sumBy from "lodash/sumBy"

import Table from "components/Table"
import Tag from "components/Tag"
import { getStrapiMedia } from "utils/media"
import Price from "components/Price"
import { formatDate } from "utils/dateTime"

import { BRAND_STATUS } from "constants/Brand"

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
            {originalRow?.code}
          </span>
        ),
        collapse: true,
        width: 90,
      },
      {
        Header: "Tên thuốc",
        accessor: (originalRow) => (
          <div className="flex items-center gap-x-4">
            <span>{originalRow?.label}</span>
          </div>
        ),
        collapse: true,
        width: 300,
      },
    ]
    if (activeRow) return defaultColumns

    return [
      ...defaultColumns,
      // {
      //   Header: "Hoạt chất",
      //   accessor: (originalRow) => (
      //     <div className="flex items-center gap-x-4">
      //       <span>{originalRow?.ingredient}</span>
      //     </div>
      //   ),
      //   collapse: true,
      //   width: 300,
      // },
      {
        Header: "Tồn",
        accessor: (originalRow) => (
          <div className="flex items-center gap-x-4">
            <span>{originalRow?.stock + " " + originalRow?.unit}</span>
          </div>
        ),
        collapse: true,
        width: 50,
      },
      {
        Header: "Cập nhật lúc",
        accessor: (originalRow) => (
          <div className="flex items-center gap-x-4">
            <span>{formatDate(originalRow?.updatedAt, "HH:MM DD/MM/YYYY")}</span>
          </div>
        ),
        collapse: true,
        width: 70,
      },
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
