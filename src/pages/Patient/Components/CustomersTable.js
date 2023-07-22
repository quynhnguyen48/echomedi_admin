import { useMemo, useCallback } from "react"
import classNames from "classnames"
import dayjs from "dayjs";

import Table from "components/Table"
import MembershipTag from "components/Tag/MembershipTag"
import Avatar from "components/Avatar"
import { getStrapiMedia } from "utils/media"
import { formatDate } from "utils/dateTime";

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
            {originalRow?.membership && (
              <MembershipTag 
              color={getMembershipColor(originalRow?.membership)}
              backgroundColor={getMembershipBackgroundColor(originalRow?.membership)}
              name={originalRow?.membership} className={`font-bold ${
                        originalRow?.id === activeRow?.id ? "fill-white" : `fill-${getMembershipColor(originalRow?.membership)} text-${getMembershipColor(originalRow?.membership)}`
                      }`}/>
            )}
          </span>
        ),
        collapse: true,
        width: 80,
      },
      // {
      //   Header: "Gói thành viên",
      //   accessor: (originalRow) => (
      //     <div className="flex items-center gap-x-4">
      //       {originalRow?.membership && (
      //         <MembershipTag 
      //         color={getMembershipColor(originalRow?.membership)}
      //         backgroundColor={getMembershipBackgroundColor(originalRow?.membership)}
      //         name={originalRow?.membership} className={`font-bold ${
      //                   originalRow?.id === activeRow?.id ? "fill-white" : `fill-${getMembershipColor(originalRow?.membership)} text-${getMembershipColor(originalRow?.membership)}`
      //                 }`}/>
      //       )}
      //     </div>
      //   ),
      //   collapse: true,
      //   width: 110,
      // },
      {
        Header: "Ngày tạo",
        accessor: (originalRow) => originalRow?.createdAt && <div><p>{formatDate(originalRow?.createdAt, "DD MMMM")}</p><p>{formatDate(originalRow?.createdAt, "YYYY")}</p></div>,
        collapse: true,
        width: 80,
      },
      {
        Header: "Tên",
        accessor: (originalRow) => (
          <div className="flex items-center gap-x-4">
            <span>{`${originalRow?.full_name}`}</span>
          </div>
        ),
        collapse: true,
        width: 180,
      },
      
    ]
    if (activeRow) return defaultColumns
    return [
      ...defaultColumns,
      {
        Header: "Giới tính",
        hidden: isModal,
        accessor: (originalRow) => <span className="capitalize">{originalRow.gender == "male" ? "Nam": "Nữ"}</span>,
        collapse: true,
        width: 60,
      },
      {
        Header: "Năm sinh",
        collapse: true,
        width: 80,
        accessor: (originalRow) => originalRow?.birthday && <span>{formatDate(originalRow?.birthday, "DD MMMM, YYYY")} ({2023-dayjs(originalRow.birthday).year()})</span>,
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
      // {
      //   Header: "Lần khám gần nhất",
      //   align: "right",
      //   hidden: isModal,
      //   // accessor: (originalRow) => <span className="capitalize">{formatDate(originalRow.booking.bookingDate)}</span>,
      //   collapse: true,
      //   width: 120,
      // },
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
