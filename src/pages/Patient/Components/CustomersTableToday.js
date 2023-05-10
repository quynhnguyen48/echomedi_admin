import { useMemo, useCallback } from "react"
import classNames from "classnames"

import Table from "components/Table"
import Tag from "components/Tag"
import Avatar from "components/Avatar"
import { getStrapiMedia } from "utils/media"
import { formatDate } from "utils/dateTime";
import MembershipTag from "components/Tag/MembershipTag"
import dayjs from "dayjs"

const getMembershipColor = (v) => {
  switch (v) {
    case "silver":
      return "#BDBDBD";
    case "gold":
      return "#EDF325";
    case "platinum":
      return "#E5E4E2";
    case "family": 
      return "#FFC300";
    case "business":
      return "#DAF7A6";
    case "non-resident":
      return "#581845";
    case "foreigner":
      return "#25F3BB";
  }
}


const getMembershipBackgroundColor = (v) => {
  switch (v) {
    case "silver":
      return "#607d8b";
    case "gold":
      return "#607d8b";
    case "platinum":
      return "grey";
    case "family": 
      return "#607d8b";
    case "business":
      return "#607d8b";
    case "non-resident":
      return "#607d8b";
    case "foreigner":
      return "#25F3BB";
  }
}


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
        Header: "Gói thành viên",
        accessor: (originalRow) => (
          <div className="flex items-center gap-x-4">
            {originalRow?.membership && (
              <MembershipTag 
              color={getMembershipColor(originalRow?.membership)}
              backgroundColor={getMembershipBackgroundColor(originalRow?.membership)}
              name={originalRow?.membership} className={`font-bold ${
                        originalRow?.id === activeRow?.id ? "fill-white" : `fill-${getMembershipColor(originalRow?.membership)} text-${getMembershipColor(originalRow?.membership)}`
                      }`}/>
            )}
          </div>
        ),
        collapse: true,
        width: 110,
      },
      {
        Header: "Tên",
        accessor: (originalRow) => (
          <div className="flex items-center gap-x-4">
            <span>{`${originalRow?.full_name}`}</span>
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
        Header: "Giới tính",
        hidden: isModal,
        accessor: (originalRow) => <span className="capitalize">{originalRow.gender}</span>,
        collapse: true,
        width: 80,
      },
      {
        Header: "Năm sinh",
        collapse: true,
        width: 80,
        accessor: (originalRow) => <span>{dayjs(originalRow.birthday).year()}</span>,
      },
      {
        Header: "Số điện thoại",
        collapse: true,
        width: 100,
        accessor: (originalRow) => <span>{originalRow.phone}</span>,
      },
      {
        Header: "Email",
        accessor: "email",
        collapse: true,
        width: 150,
      },
      {
        Header: "Thời gian",
        align: "right",
        hidden: isModal,
        // accessor: (originalRow) => (
        //   <Tag
        //     className={classNames({
        //       "bg-red": originalRow.blocked,
        //       "bg-green": !originalRow.blocked,
        //     })}
        //     name={originalRow.blocked ? "Blocked" : "Active"}
        //   />
        // ),
        accessor: (originalRow) => <span className="capitalize">{formatDate(originalRow.booking.bookingDate, "H:mm")}</span>,
        collapse: true,
        width: 100,
      },
    ]
  }, [activeRow, isModal])

  return (
    <Table
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
