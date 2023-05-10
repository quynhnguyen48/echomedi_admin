import { useMemo, useCallback } from "react";
import classNames from "classnames";

import Table from "components/Table";
import Tag from "components/Tag";
import { formatDate } from "utils/dateTime";
import { BRAND_STATUS } from "../../../constants/Brand"

const BlogTable = ({
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
        Header: "Blog ID",
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
        Header: "Title",
        accessor: (originalRow) => <>
          <span className={`block ${activeRow ? 'pr-4' : 'pr-0'}`}>{originalRow.title?.en}</span>
          <span className={`block ${activeRow ? 'pr-4' : 'pr-0'}`}>{originalRow.title?.vi}</span>
        </>,
        collapse: true,
        width: activeRow ? 200 : 400,
      },
    ];
    if (activeRow) return defaultColumns;
    return [
      ...defaultColumns,
      {
        Header: "Category",
        accessor: (originalRow => originalRow.categories.map((c, index) => {
          return (
            <span key={index} className="block">{c.name}</span>
          )
        })),
        collapse: true,
        width: 150,
      },
      {
        Header: "Created Date",
        accessor: (originalRow) => (
          <span>{formatDate(originalRow?.createdAt)}</span>
        ),
        collapse: true,
        width: 250,
      },
      {
        Header: "Status",
        align: "right",
        accessor: (originalRow) => (
          <Tag
            className={classNames({
              "bg-red": !originalRow.publishedAt,
              "bg-green": originalRow.publishedAt,
            })}
            name={
              originalRow.publishedAt
                ? BRAND_STATUS.PUBLISHED
                : BRAND_STATUS.UNPUBLISHED
            }
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

export default BlogTable;
