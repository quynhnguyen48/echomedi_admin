import { useMemo, useCallback } from "react";
import classNames from "classnames";
import dayjs from "dayjs";

import Table from "components/Table";
import Tag from "components/Tag";
import Avatar from "components/Avatar";
import { getStrapiMedia } from "utils/media";
import Price from "components/Price";
import { CARD_STATUS, CARD_STATUS_TITLE } from "constants/Card";

const MembershipCardsTable = ({
  data,
  activeRow,
  loading,
  pageCount,
  onClickRow,
  fetchData,
}) => {
  const handleClickRow = useCallback(
    (row) => {
      if (row?.id === activeRow?.id) {
        onClickRow(null);
      } else {
        onClickRow(row);
      }
    },
    [activeRow?.id, onClickRow]
  );

  const columns = useMemo(() => {
    const defaultColumns = [
      {
        Header: "Card ID",
        accessor: (originalRow) => (
          <span
            className={`font-bold ${
              originalRow?.code === activeRow?.code
                ? "text-white"
                : "text-primary"
            }`}
          >
            {originalRow?.code}
          </span>
        ),
        collapse: true,
        width: 150,
      },
      {
        Header: "Name",
        accessor: (originalRow) => (
          <div className="flex items-center gap-x-4">
            <Avatar
              src={getStrapiMedia({ url: originalRow?.user?.avatar })}
              name={`${originalRow?.user?.firstName} ${originalRow?.user?.lastName}`}
              className={
                originalRow?.id === activeRow?.id && "!bg-white !text-primary"
              }
            />
            <span>{`${originalRow?.user?.firstName} ${originalRow?.user?.lastName}`}</span>
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
        accessor: (originalRow) => <span>{originalRow?.user?.code}</span>,
        collapse: true,
        width: 150,
      },
      {
        Header: "Remain value",
        accessor: (originalRow) => <Price price={originalRow.remainValue} />,
        collapse: true,
        width: 150,
      },
      {
        Header: "Created Date",
        accessor: (originalRow) => (
          <span className="capitalize">
            {dayjs(originalRow?.createdAt).format("DD MMMM, YYYY")}
          </span>
        ),
        collapse: true,
        width: 120,
      },
      {
        Header: "Status",
        align: "right",
        accessor: (originalRow) => (
          <Tag
            className={classNames({
              "bg-red": originalRow.status === CARD_STATUS.SUSPENDED,
              "bg-green": originalRow.status === CARD_STATUS.ACTIVE,
            })}
            name={CARD_STATUS_TITLE[originalRow?.status]}
          />
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

export default MembershipCardsTable;
