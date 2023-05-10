import { useMemo, useCallback } from "react"
import classNames from "classnames"
import sumBy from "lodash/sumBy"

import Table from "components/Table"
import Tag from "components/Tag"
import { getStrapiMedia } from "utils/media"
import Price from "components/Price"

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
      // {
      //   Header: "Product ID",
      //   accessor: (originalRow) => (
      //     <span
      //       className={`font-bold ${
      //         originalRow?.id === activeRow?.id ? "text-white" : "text-primary"
      //       }`}
      //     >
      //       {originalRow?.code}
      //     </span>
      //   ),
      //   collapse: true,
      //   width: 150,
      // },
      {
        Header: "Product Title",
        accessor: (originalRow) => (
          <div className="flex items-center gap-x-4">
            {!activeRow && (
              <div className="w-12 h-12">
                <img src={getStrapiMedia(originalRow?.image.data.attributes.formats.thumbnail)} alt="Product" />
              </div>
            )}
            <span>{originalRow?.label}</span>
          </div>
        ),
        collapse: true,
        width: 200,
      },
    ]
    if (activeRow) return defaultColumns

    return [
      ...defaultColumns,
      // {
      //   Header: "Inventory",
      //   accessor: (originalRow) => (
      //     <span>{sumBy(originalRow?.variants, (variant) => parseInt(variant.inventory))}</span>
      //   ),
      //   collapse: true,
      //   width: 100,
      // },
      {
        Header: "Price",
        accessor: (originalRow) => (
          <Price
            suffixClassName="font-normal"
            price={originalRow.price}
          />
        ),

        collapse: true,
        width: 150,
      },
      // {
      //   Header: "Size",
      //   accessor: (originalRow) => (
      //     <span className="capitalize">{`${originalRow?.variants?.length} Sizes`}</span>
      //   ),
      //   collapse: true,
      //   width: 100,
      // },
      {
        Header: "Status",
        accessor: (originalRow) => (
          <Tag
            className={classNames({
              "bg-red": !originalRow.publishedAt,
              "bg-green": originalRow.publishedAt,
            })}
            name={originalRow.publishedAt ? BRAND_STATUS.PUBLISHED : BRAND_STATUS.UNPUBLISHED}
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
      hidePagination={activeRow}
      pageCount={pageCount}
      activeRow={activeRow}
      onClickRow={handleClickRow}
    />
  )
}

export default ProductsTable
