import { useMemo, useCallback } from "react"
import classNames from "classnames"
import dayjs from "dayjs";

import Table from "components/Table"
import MembershipTag from "components/Tag/MembershipTag"
import Avatar from "components/Avatar"
import { getStrapiMedia } from "utils/media"
import { formatDate } from "utils/dateTime";
import { isMobile } from "react-device-detect";

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
    case "infant":
      return "white";
    case "toddler":
      return "black";
    case "family":
      return "white";
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
    case "infant":
      return "#FFC100";
    case "toddler":
      return "#A3D8FF";
    case "family":
      return "#75A47F";
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
    const defaultColumns = 
    [
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
            {getStrapiMedia(originalRow?.patient_source.data?.attributes.image.data?.attributes) &&
             <img src={getStrapiMedia(originalRow?.patient_source.data?.attributes.image.data?.attributes)} alt="Product" className="w-20 mt-1" />}
          </span>
        ),
        collapse: true,
        width: 80,
      },
      {
        Header: "Ngày tạo",
        accessor: (originalRow) => originalRow?.createdAt && <div><p>{formatDate(originalRow?.createdAt, "DD/MM/YYYY")}</p></div>,
        collapse: true,
        width: 80,
      },
      {
        Header: "Tên",
        accessor: (originalRow) => (
          <div className="flex items-center gap-x-4">
            <span>{`${originalRow?.full_name?.toUpperCase()}`}</span>
          </div>
        ),
        collapse: true,
        width: 100,
      },
      
    ]
    if (activeRow) return defaultColumns
    return isMobile ? [...defaultColumns] : [
      ...defaultColumns,
      {
        Header: "Giới tính",
        hidden: isModal,
        accessor: (originalRow) => <span className="capitalize">{originalRow.gender == "male" ? "Nam": originalRow.gender == "female" ? "Nữ" : ""}</span>,
        collapse: true,
        width: 40,
      },
      {
        Header: "Năm sinh",
        collapse: true,
        width: 50,
        accessor: (originalRow) => originalRow?.birthday && <span>{formatDate(originalRow?.birthday, "DD/MM/YYYY")}</span>,
      },
      {
        Header: "Số điện thoại",
        collapse: true,
        width: 70,
        accessor: (originalRow) => <span>{originalRow.phone?.replace('+84', '0')}</span>,
      },
      {
        Header: "Email",
        accessor: "email",
        collapse: true,
        width: 150,
      },
      {
        Header: "Đã đăng ký [ID]",
        collapse: true,
        width: 50,
        accessor: (originalRow) => <span>{originalRow.user?.data?.id}</span>,
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
