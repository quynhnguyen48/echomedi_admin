import { useCallback, useMemo } from "react"
import classNames from "classnames"
import dayjs from "dayjs"
import sumBy from "lodash/sumBy"

import Table from "components/Table"
import Tag from "components/Tag"
import Price from "components/Price"
import { ORDER_STATUS, ORDER_STATUS_TITLE } from "constants/Order"
import { numberWithCommas } from "pages/Invoice/Components/InvoiceTable"

const OrdersTable = ({ data, activeRow, loading, pageCount, onClickRow, fetchData }) => {
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
      //   Header: "Code",
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
      // {
      //   Header: "Order Date",
      //   accessor: (originalRow) => (
      //     <span>
      //       {originalRow?.orderedDate &&
      //         dayjs(originalRow?.orderedDate).format("DD MMMM, YYYY | HH:mm")}
      //     </span>
      //   ),
      //   collapse: true,
      //   width: 200,
      // },
      {
        Header: "Khách hàng",
        accessor: (originalRow) => (
          <span>
            {originalRow?.users_permissions_user?.data?.attributes?.patient?.data?.attributes.full_name || 
             originalRow?.users_permissions_user?.data?.attributes.fullname || 
             originalRow?.users_permissions_user?.data?.attributes.email || 
             "Update"}
          </span>
        ),
        collapse: true,
        width: 150,
      },
    ]

    if (activeRow) return defaultColumns

    return [
      ...defaultColumns,
      {
        Header: "Tổng cộng",
        accessor: (originalRow) => <>{numberWithCommas(originalRow.total)}</>,
        collapse: true,
        width: 150,
      },
      {
        Header: "Sản phẩm",
        accessor: (originalRow) => (
          <span className="capitalize">{`${
            originalRow.num_of_prod ? originalRow.num_of_prod : 0
          } products`}</span>
        ),
        collapse: true,
        width: 100,
      },
      {
        Header: "Phương thức",
        accessor: (originalRow) => (
          <div>
            {originalRow.paymentMethod === "momo" ? (
              <img
                src="https://d3e4m6b6rxmux9.cloudfront.net/momo_cd67e6e6d8.png"
                className="object-cover h-14"
                alt="Momo"
              />
            ) : (
              <img
                src="https://d3e4m6b6rxmux9.cloudfront.net/vnpay_10b151a67e.png"
                className="object-cover h-14"
                alt="VNPay"
              />
            )}
          </div>
        ),
        collapse: true,
        width: 100,
      },
      {
        Header: "Ngày mua",
        accessor: (originalRow) => (
          <span className="capitalize">{dayjs(originalRow?.createdAt).format("DD MMMM, YYYY | HH:mm")}</span>
        ),
        collapse: true,
        width: 100,
      },
      {
        Header: "Trạng thái",
        align: "right",
        accessor: (originalRow) => (
          <Tag
            className={classNames({
              "bg-orange": originalRow.status === ORDER_STATUS.DRAFT,
              "bg-yellow": originalRow.status === ORDER_STATUS.ORDERED,
              "bg-blue": originalRow.status === ORDER_STATUS.COMPLETED,
              "bg-red": originalRow.status === ORDER_STATUS.CANCELED,
            })}
            name={ORDER_STATUS_TITLE[originalRow?.status]}
          />
        ),
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

export default OrdersTable
