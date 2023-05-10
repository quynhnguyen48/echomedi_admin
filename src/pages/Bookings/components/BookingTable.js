import dayjs from "dayjs";
import { useCallback, useMemo } from "react";

import Avatar from "components/Avatar";
import Table from "components/Table";
import BookingStatusTag from "components/Tag/BookingStatusTag";
import { getStrapiMedia } from "utils/media";
import classNames from "classnames"

const BookingTable = ({
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
          onClickRow(null);
        } else {
          onClickRow(row);
        }
      }
    },
    [activeRow?.id, isModal, onClickRow]
  );

  const columns = useMemo(() => {
    const defaultColumns = [
      // {
      //   Header: "Booking ID",
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
        Header: "Full Name",
        hidden: isModal,
        accessor: (originalRow) => (
          <div className="flex items-center gap-x-4">
            <Avatar
              className={classNames({
                "!bg-white !text-primary": originalRow?.id === activeRow?.id
              })}
              round
              size={32}
              src={getStrapiMedia({ url: originalRow.user?.avatar })}
              name={`${originalRow.user?.firstName} ${originalRow.user?.lastName}`}
            />
            <span>{`${originalRow.user?.firstName} ${originalRow.user?.lastName}`}</span>
          </div>
        ),
        collapse: true,
        width: 200,
      },
    ];
    if (activeRow) return defaultColumns;

    return [
      ...defaultColumns,
      {
        Header: "Customer ID",
        hidden: isModal,
        accessor: (originalRow) => <span>{originalRow?.user?.code}</span>,
        collapse: true,
        width: 150,
      },
      {
        Header: "Date / Time",
        accessor: (originalRow) => (
          <span>
            {originalRow?.bookingDate
              ? `${dayjs(originalRow?.bookingDate).format("DD MMMM, YYYY")} | ${
                  originalRow?.timeSession
                }`
              : ""}
          </span>
        ),
        collapse: true,
        width: 250,
      },
      {
        Header: "Treatment",
        accessor: (originalRow) => (
          <span>{originalRow?.treatment?.name || ""}</span>
        ),
        collapse: true,
        width: 150,
      },
      {
        Header: "Status",
        align: "right",
        accessor: (originalRow) => (
          <BookingStatusTag status={originalRow?.status} isRoundedFull />
        ),
        collapse: true,
        width: 100,
      },
    ];
  }, [activeRow]);

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
  );
};

export default BookingTable;
