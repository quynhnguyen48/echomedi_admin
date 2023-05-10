import { useMemo } from "react";

import Table from "components/Table";
import Price from "components/Price";

const ServiceCardsReportTable = ({
  data,
  loading,
  fetchData,
}) => {
  const columns = useMemo(() => {
    return [
      {
        Header: "Treatment ID",
        accessor: (originalRow) => (
          <span className="font-bold text-primary">{originalRow?.code}</span>
        ),
        collapse: true,
        width: 120,
      },
      {
        Header: "Treatment Title",
        accessor: (originalRow) => <span>{originalRow?.name}</span>,
        collapse: true,
        width: 200,
      },
      {
        Header: "Quantity",
        accessor: (originalRow) => <span>{originalRow?.quantity}</span>,
        collapse: true,
        width: 80,
      },
      {
        Header: "Usage",
        accessor: (originalRow) => <span>{originalRow?.usage}</span>,
        collapse: true,
        width: 80,
      },
      {
        Header: "Income",
        accessor: (originalRow) => {
          return (
            originalRow?.revenue ? <Price price={originalRow?.income} /> : <b>0đ</b>
          )
        },
        collapse: true,
        width: 120,
      },
      {
        Header: "Revenue",
        accessor: (originalRow) => {
          return (
            originalRow?.revenue ? <Price price={originalRow?.revenue} /> : <b>0đ</b>
          )
        },
        collapse: true,
        width: 120,
      },
    ];
  }, []);

  return (
    <Table
      columns={columns}
      data={data}
      fetchData={fetchData}
      loading={loading}
      fullHeight
      hidePagination
    />
  );
};

export default ServiceCardsReportTable;
