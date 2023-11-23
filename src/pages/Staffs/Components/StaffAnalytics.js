import DataItem from "components/DataItem";
import { formatDate } from "utils/dateTime";

const StaffAnalytics = ({ data }) => {
  
  return (
    <div className="pt-20">
      <p className="font-bold">Staff Analytics</p>
      <div className="mt-5 p-6 rounded-lg bg-rightContent h-full flex flex-col gap-y-10">
        <DataItem
          icon="timer"
          title="Last Signed In"
          value={
            data?.last_logged_in
              ? formatDate(data?.last_logged_in, "DD MMM, YYYY | HH:mm")
              : "-"
          }
        />

        {/*<DataItem*/}
        {/*  icon="coin"*/}
        {/*  title="Interest Earning"*/}
        {/*  value={`${formatPrice(28900000)} đ`}*/}
        {/*  footer={*/}
        {/*    <Button btnSize="small" className="mt-2">*/}
        {/*      View Detail*/}
        {/*    </Button>*/}
        {/*  }*/}
        {/*/>*/}
      </div>
    </div>
  );
};

export default StaffAnalytics;
