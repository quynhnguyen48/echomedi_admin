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
    case "medical_provider": 
      return "#FFC300";
    case "medical_provider_gold":
      return "#DAF7A6";
    case "medical_provider_platinum":
      return "#581845";
    case "foreigner":
      return "#25F3BB";
    case "medical_provider":
      return "Medical provider";
    case "medical_provider_gold":
      return "Medical provider + Membership Gold";
    case "medical_provider_platinum":
      return "Medical provider + Membership Platinum"
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
    case "medical_provider": 
      return "#607d8b";
    case "medical_provider_gold":
      return "#607d8b";
    case "medical_provider_platinum":
      return "#607d8b";
    case "foreigner":
      return "#25F3BB";
  }
}
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
            {originalRow?.id}
          </span>
        ),
        collapse: true,
        width: 50,
      },
      {
        Header: "Trạng thái",
        accessor: (originalRow) => (
          <span
            className={`font-bold ${
              originalRow?.id === activeRow?.id ? "text-white" : "text-primary"
            }`}
          >
            {translate(originalRow?.status)}
          </span>
        ),
        collapse: true,
        width: 70,
      },
      {
        Header: "Gói thành viên",
        accessor: (originalRow) => (
          <div className="flex items-center gap-x-4">
            {originalRow?.patient?.membership && (
              <MembershipTag 
              color={getMembershipColor(originalRow?.patient?.membership)}
              backgroundColor={getMembershipBackgroundColor(originalRow?.patient?.membership)}
              name={originalRow?.patient?.membership} className={`font-bold ${
                        originalRow?.id === activeRow?.id ? "fill-white" : `fill-${getMembershipColor(originalRow?.patient?.membership)} text-${getMembershipColor(originalRow?.patient?.membership)}`
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
            <span>{`${originalRow?.patient?.full_name}`}</span>
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
        accessor: (originalRow) => <span className="capitalize">{originalRow?.patient?.gender}</span>,
        collapse: true,
        width: 80,
      },
      {
        Header: "Năm sinh",
        collapse: true,
        width: 80,
        accessor: (originalRow) => originalRow?.patient?.birthday && <span>{formatDate(originalRow?.patient?.birthday, "DD MMMM, YYYY")} ({2023-dayjs(originalRow.birthday).year()})</span>,
      },
      {
        Header: "Số điện thoại",
        collapse: true,
        width: 80,
        accessor: (originalRow) => <span>{originalRow?.patient?.phone}</span>,
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
        accessor: (originalRow) => <span className="capitalize">{formatDate(originalRow.bookingDate, "H:mm")}</span>,
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
