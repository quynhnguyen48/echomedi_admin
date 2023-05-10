import DataItem from "components/DataItem";
import { formatDate } from "utils/dateTime";

const TransactionAnalytics = ({ data }) => {
  return (
    <>
      <h4 className="font-bold">Transaction Analysis</h4>
      <div className="mt-5 p-6 rounded-lg flex flex-col gap-y-10 bg-rightContent">
        <DataItem
          icon="calendar"
          title="Checkin Date"
          value={
            data?.check_in?.createdAt &&
            formatDate(data?.check_in?.createdAt, "DD MMMM, YYYY [|] HH:mm")
          }
        />
        <DataItem icon="coin" title="Note" value={data?.note} />
      </div>
    </>
  );
};

export default TransactionAnalytics;
