import dayjs from "dayjs";
import { useEffect, useState } from "react";

import PieChart from "components/PieChart";
import { NEW_RANGES } from "constants/Dashboard";
import { getListCheckinToday } from "services/api/checkin";
import { getPercentage } from "utils/number";
import { formatStrapiArr, formatStrapiObj } from "utils/strapi";
import AnalysItem from "./AnalysItem";
import CustomerAnalyticsItem from "./CustomerAnalyticsItem";

const CheckinAnalytics = ({ className }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await getListCheckinToday();
        const listCheckin = formatStrapiArr(res.data)?.map((checkin) => ({
          ...checkin,
          user: formatStrapiObj(checkin.user),
        }));

        const total = listCheckin?.length;
        const listNewCustomer = listCheckin?.filter(
          (checkin) =>
            dayjs().diff(dayjs(checkin?.user?.createdAt), "days") > NEW_RANGES
        );
        setData({
          total,
          newCustomer: listNewCustomer?.length || 0,
          oldCustomer: total - (listNewCustomer?.length || 0),
        });
      } catch (error) {}
    })();
  }, []);

  return (
    <div className={`rounded-t-xl p-4 bg-white ${className}`}>
      <AnalysItem
        iconName="sidebar/check-in-active"
        title="Lượng Check-in hôm nay "
        value={data?.total}
      />
      <div className="flex items-end justify-between">
        <div className="flex-1">
          <CustomerAnalyticsItem
            className="mt-6"
            name="Khách hàng mới"
            percentage={getPercentage(data?.newCustomer, data?.total)}
            value={data?.newCustomer || 0}
            color="bg-primary"
          />
          <CustomerAnalyticsItem
            className="mt-8"
            name="Khách hàng cũ"
            percentage={getPercentage(data?.oldCustomer, data?.total)}
            value={data?.oldCustomer || 0}
            color="bg-red"
          />
        </div>
        <div className="flex justify-center flex-1">
          <PieChart
            width={188}
            height={188}
            data={[
              { name: "New Customer", value: data?.newCustomer },
              { name: "Old Customers", value: data?.oldCustomer },
            ]}
            colors={["#3D7368", "#ED1C24"]}
            hideInfo
          />
        </div>
      </div>
    </div>
  );
};

export default CheckinAnalytics;
