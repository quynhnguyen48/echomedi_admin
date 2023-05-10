import { useCallback, useMemo } from "react";
import classNames from "classnames";
import last from "lodash/last";

import Table from "components/Table";
import Tag from "components/Tag";
import Avatar from "components/Avatar";
import { getStrapiMedia } from "utils/media";
import { CARD_STATUS, CARD_STATUS_TITLE } from "constants/Card";
import { formatDate } from "utils/dateTime";

const ServiceCardTable = ({
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
              originalRow?.id === activeRow?.id ? "text-white" : "text-primary"
            }`}
          >
            {originalRow?.code}
          </span>
        ),
        collapse: true,
        width: 150,
      },
      {
        Header: "Full Name",
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
        Header: "Treatment ID",
        accessor: (originalRow) => <span>{originalRow?.service?.code}</span>,
        collapse: true,
        width: 150,
      },
      {
        Header: "Remain Value",
        accessor: (originalRow) => (
          <span className={`font-bold ${originalRow?.usageLimit > 2 && originalRow?.remainValue <= 2 && 'text-red'}`}>
            {`${originalRow?.remainValue}/${originalRow?.usageLimit}`}
          </span>
        ),
        collapse: true,
        width: 120,
      },
      {
        Header: "Latest Usage",
        accessor: (originalRow) => (
          <span>
            {originalRow?.transactions?.length > 0
              ? formatDate(last(originalRow?.transactions).createdAt)
              : "-"}
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
            name={CARD_STATUS_TITLE[originalRow?.status]}
            className={classNames({
              "bg-green": originalRow?.status === CARD_STATUS.ACTIVE,
              "bg-red": originalRow?.status === CARD_STATUS.SUSPENDED,
              "bg-blue": originalRow?.status === CARD_STATUS.COMPLETED,
            })}
          />
        ),
        collapse: true,
        width: 120,
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

export default ServiceCardTable;
