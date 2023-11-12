import { useMemo, useCallback } from "react"
import classNames from "classnames"
import sumBy from "lodash/sumBy"
import dayjs from "dayjs"

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

  console.log('data', data)

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
        Header: "Khách hàng",
        accessor: (originalRow) => (
          <div className="flex items-center gap-x-4 hover:underline">
            <a href={"/patient/" + originalRow?.patient?.data?.attributes?.uid}>{originalRow?.patient?.data?.attributes?.full_name}</a>
          </div>
        ),
        collapse: true,
        width: 150,
      },
      {
        Header: "Thời gian",
        accessor: (originalRow) => (
          <div className="flex items-center gap-x-4">
            <span>{dayjs(originalRow.bookingDate).format("HH:mm DD/MM/YYYY")}</span>
          </div>
        ),
        collapse: true,
        width: 100,
      },
      {
        Header: "Note",
        accessor: (originalRow) => (
          <div className={`flex items-center gap-x-4`}>
            <span>{originalRow?.note}</span>
          </div>
        ),
        collapse: true,
        width: 150,
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
        Header: "Trạng thái",
        accessor: (originalRow) => (
          <div className="flex items-center gap-x-4">
            {translate(originalRow.status)}
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
                // await createConversation(originalRow);
                window.location.href = `/bookings/${originalRow.id}`;
              }}
            >Xem</Button>
          </div>
        ),
        collapse: true,
        width: 70,
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

const translate = (t) => {
  switch (t) {
    case "scheduled":
      return "Đặt lịch"
      break;
    case "confirmed":
      return "Đã xác nhận"
      break;
    case "finished":
      return "Hoàn thành"
      break;
    case "cancelled":
      return "Huỷ"
      break;
    case "postpone":
      return "Hoãn lịch"
      break;
    case "waiting":
      return "Đã đến"
      break;
  }
}
