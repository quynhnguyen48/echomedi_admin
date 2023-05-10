import { useMemo } from "react";

import Table from "components/Table";
import Price from "components/Price";

const ProductsReportTable = ({
  data,
  loading,
  fetchData,
}) => {
  const columns = useMemo(() => {
    return [
      {
        Header: "Product ID",
        accessor: (originalRow) => (
          <span className="font-bold text-primary">{originalRow?.code}</span>
        ),
        collapse: true,
        width: 120,
      },
      {
        Header: "Name",
        accessor: (originalRow) => <span>{originalRow?.title}</span>,
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
        Header: "Revenue",
        accessor: (originalRow) => {
          return (
            originalRow?.revenue ? <Price price={originalRow?.revenue} /> : <b>0đ</b>
          )
        },
        collapse: true,
        width: 120,
      }
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

export default ProductsReportTable;
