import { useMemo, useCallback } from "react"
import classNames from "classnames"
import dayjs from "dayjs";
import { getStrapiMedia } from "utils/media";

import Table from "components/Table"
import Tag from "components/Tag"
import { CATEGORY_STATUS } from "constants/Category"
import Price from "components/Price"
import { formatDate } from "utils/dateTime"
import MembershipTag from "components/Tag/MembershipTag"
import { isMobile } from "react-device-detect";

const translateStatus = (status) => {
  switch (status) {
    case "result_received":
      return "Đã có KQXN";
    case "result_examined":
      return "Đã xem KQXN";
    case "result_done":
      return "Hoàn thành";
  }
}

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

const TreatmentsTable = ({ data, activeRow, loading, pageCount, onClickRow, fetchData }) => {
  console.log('dataaa', data)
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
            {originalRow?.patient?.membership && (
              <MembershipTag 
              color={getMembershipColor(originalRow?.patient?.membership)}
              backgroundColor={getMembershipBackgroundColor(originalRow?.patient?.membership)}
              name={originalRow?.patient?.membership} className={`font-bold ${
                        originalRow?.id === activeRow?.id ? "fill-white" : `fill-${getMembershipColor(originalRow?.patient?.membership)} text-${getMembershipColor(originalRow?.patient?.membership)}`
                      }`}/>
            )}
            {getStrapiMedia(originalRow?.patient?.patient_source?.image) && <img src={getStrapiMedia(originalRow?.patient?.patient_source?.image)} alt="Product" className="w-30" />}
            {originalRow?.uid}
          </span>
        ),
        collapse: true,
        width: !isMobile ? 70 : 30,
      },
      {
        Header: "Tên",
        accessor: (originalRow) => <div><a className="hover:underline" href={`/patient/${originalRow?.patient?.uid}`}>{originalRow?.patient?.full_name?.toUpperCase()}</a><h1>
          <svg className="inline" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" height="20px" width="20px" version="1.1" id="Layer_1" viewBox="0 0 512 512" xmlSpace="preserve">
<path fill="#507C5C" d="M256,288.24c-68.519,0-124.264-55.744-124.264-124.264V107.12c0-8.208,6.653-14.861,14.861-14.861  c8.208,0,14.861,6.653,14.861,14.861v56.857c0,52.129,42.412,94.541,94.541,94.541s94.541-42.412,94.541-94.541  c0-8.208,6.653-14.861,14.861-14.861c8.208,0,14.861,6.653,14.861,14.861C380.264,232.495,324.519,288.24,256,288.24z"/>
<path fill="#CFF09E" d="M365.402,107.12H146.598c0,0,0-42.777,0-61.911c0-40.462,218.805-40.462,218.805,0  C365.402,64.341,365.402,107.12,365.402,107.12z"/>
<path fill="#507C5C" d="M365.402,121.981H146.598c-8.208,0-14.861-6.653-14.861-14.861V45.207C131.736,4.405,218.637,0,256,0  s124.264,4.405,124.264,45.207v61.913C380.264,115.328,373.61,121.981,365.402,121.981z M161.459,92.258h189.08V46.331  c-5.265-6.069-36.943-16.608-94.539-16.608s-89.274,10.538-94.541,16.608L161.459,92.258L161.459,92.258z"/>
<path fill="#CFF09E" d="M319.904,326.235H192.096c-38.576,0-69.849,31.273-69.849,69.849v101.055h267.506V396.084  C389.753,357.507,358.48,326.235,319.904,326.235z M337.736,437.943H265.41v-50.281h72.326L337.736,437.943L337.736,437.943z"/>
<path fill="#507C5C" d="M389.753,512H122.247c-8.208,0-14.861-6.653-14.861-14.861V396.084  c0-46.709,38.001-84.71,84.71-84.71h127.808c46.709,0,84.71,38.001,84.71,84.71v101.055C404.614,505.347,397.961,512,389.753,512z   M137.109,482.277h237.783v-86.193c0-30.32-24.667-54.987-54.987-54.987H192.096c-30.32,0-54.987,24.667-54.987,54.987  L137.109,482.277L137.109,482.277z M337.736,452.804H265.41c-8.208,0-14.861-6.653-14.861-14.861v-50.281  c0-8.208,6.653-14.861,14.861-14.861h72.326c8.208,0,14.861,6.653,14.861,14.861v50.281  C352.598,446.15,345.944,452.804,337.736,452.804z M280.273,423.081h42.603v-20.558h-42.603V423.081z"/>
</svg>
           {originalRow?.doctor_in_charge?.fullname}</h1></div>,
        collapse: true,
        width: 70,
      },
    ]
    if (activeRow) return defaultColumns
    return isMobile ? [...defaultColumns] :  [
      ...defaultColumns,
      // {
      //   Header: "Category",
      //   accessor: (originalRow) =>
      //     originalRow.categories.map((c, index) => (
      //       <span key={index} className="block">
      //         {c.title.en}
      //       </span>
      //     )),
      //   collapse: true,
      //   width: 150,
      // },
      {
        Header: "Trạng thái",
        collapse: true,
        width: 50,
        accessor: (originalRow) => <span>{translateStatus(originalRow.status)}</span>,
      },
      {
        Header: "Năm sinh",
        collapse: true,
        width: 50,
        accessor: (originalRow) => originalRow.patient?.birthday && <span>{dayjs(originalRow.patient?.birthday).year()} ({2023-dayjs(originalRow.patient?.birthday).year()})</span>,
      },
      {
        Header: "Số điện thoại",
        collapse: true,
        width: 50,
        accessor: (originalRow) => <span>{originalRow.patient?.phone}</span>,
      },
      {
        Header: "Ngày khám bệnh",
        accessor: (originalRow) => {
          return (
            <div className="flex">
              <span className="">{formatDate(originalRow.createdAt, "DD MMMM, YYYY")}</span>
            </div>
          )
        },
        collapse: true,
        width: 50,
      },
      {
        Header: "Ngày tái khám",
        accessor: (originalRow) => {
          return (
            <div className="flex">
              <span className="">{originalRow.prescription?.reExaminationDate && formatDate(originalRow.prescription?.reExaminationDate, "DD MMMM, YYYY")}</span>
            </div>
          )
        },
        collapse: true,
        width: 50,
      },
      // {
      //   Header: "Status",
      //   accessor: (originalRow) => (
      //     <Tag
      //       className={classNames({
      //         "bg-red": !originalRow.publishedAt,
      //         "bg-green": originalRow.publishedAt,
      //       })}
      //       name={originalRow.publishedAt ? CATEGORY_STATUS.PUBLISHED : CATEGORY_STATUS.UNPUBLISHED}
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
      className="mt-2"
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

export default TreatmentsTable
