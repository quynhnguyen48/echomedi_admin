import { useMemo, useCallback } from "react";
import classNames from "classnames";

import Table from "components/Table";
import Tag from "components/Tag";
import { formatDate } from "utils/dateTime";

const TreatmentHistoryTable = ({
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
        Header: "History ID",
        accessor: (originalRow) => (
          <span
            className={`font-bold ${
              originalRow?.code === activeRow?.code ? "text-white" : "text-primary"
            }`}
          >{originalRow?.code}</span>
        ),
        collapse: true,
        width: 140,
      },
      {
        Header: "Email",
        accessor: (originalRow) => <span>{originalRow.user.email}</span>,
        collapse: true,
        width: 240,
      },
    ];
    if (activeRow) return defaultColumns;
    return [
      { ...defaultColumns[0] },
      {
        Header: "Created Date",
        accessor: (originalRow) => (
          <span>{formatDate(originalRow.createdAt, "DD MMMM, YYYY")}</span>
        ),
        collapse: true,
        width: 140,
      },
      {
        Header: "Full Name",
        accessor: (originalRow) => (
          <span>
            {originalRow?.user?.firstName} {originalRow?.user?.lastName}
          </span>
        ),
        collapse: true,
        width: 200,
      },
      { ...defaultColumns[1] },
      {
        Header: "Treatment",
        accessor: (originalRow) => <span>{originalRow.treatment.name}</span>,
        collapse: true,
        width: 200,
      },
      {
        Header: "Progress",
        accessor: (originalRow) => (
          <span>
            {originalRow.history.length} / {originalRow.progressTimes}
          </span>
        ),
        collapse: true,
        width: 100,
      },
      {
        Header: "Status",
        align: "right",
        accessor: (originalRow) => (
          <Tag
            className={classNames({
              "bg-red": !originalRow.publishedAt,
              "bg-blue":
                !!originalRow.publishedAt &&
                originalRow.history.length === originalRow.progressTimes,
              "bg-green":
                !!originalRow.publishedAt &&
                originalRow.history.length < originalRow.progressTimes,
            })}
            name={
              !originalRow.publishedAt
                ? "Canceled"
                : originalRow.history.length === originalRow.progressTimes
                ? "Completed"
                : "On-Progress"
            }
          />
        ),
        collapse: true,
        width: 140,
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

export default TreatmentHistoryTable;
