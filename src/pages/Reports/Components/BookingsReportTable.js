import { useMemo } from "react";

import Table from "components/Table";
import Price from "components/Price";

const BookingsReportTable = ({
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
        width: 100,
      },
      {
        Header: "Self-Booked",
        accessor: (originalRow) => <span>{originalRow?.selfBooked}</span>,
        collapse: true,
        width: 100,
      },
      {
        Header: "Admin Booked",
        accessor: (originalRow) => <span>{originalRow?.adminBooked}</span>,
        collapse: true,
        width: 100,
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

export default BookingsReportTable;
