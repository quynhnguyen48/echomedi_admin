import { useMemo, useState } from "react";
import last from "lodash/last";

import DataItem from "components/DataItem";
import Button from "components/Button";
import Price from "components/Price";
import ServiceCardUsages from "./ServiceCardUsages";
import { formatDate } from "utils/dateTime";

const ServiceCardAnalytics = ({ data }) => {
  const [openUsagesDrawer, setOpenUsagesDrawer] = useState(false);

  const totalRevenue = useMemo(() => {
    const { usageLimit, remainValue, service } = data;
    return (
      (parseInt(usageLimit) - parseInt(remainValue)) * parseInt(service?.price)
    );
  }, [data]);

  return (
    <>
      <h4 className="font-bold">Service Card Analysis</h4>
      <div className="mt-5 p-6 rounded-lg flex flex-col gap-y-10 bg-rightContent">
        <DataItem
          icon="sidebar/staffs-active"
          title="Creator"
          value={
            <>
              <p>{data?.staff?.code}</p>
              <p>{`${data?.staff?.firstName} ${data?.staff?.lastName}`}</p>
            </>
          }
        />
        <DataItem
          icon="coin"
          title="Total Revenue"
          value={<Price price={totalRevenue} />}
        />
        <DataItem
          icon="calendar"
          title="Lastest Used"
          value={
            data?.transactions?.length > 0
              ? formatDate(
                  last(data?.transactions).createdAt,
                  "DD MMMM, YYYY [|] HH:mm"
                )
              : "-"
          }
          footer={
            <Button
              btnSize="small"
              className="mt-2"
              onClick={() => setOpenUsagesDrawer(true)}
            >
              View Detail
            </Button>
          }
        />
      </div>
      <ServiceCardUsages
        openDrawer={openUsagesDrawer}
        handleClose={() => setOpenUsagesDrawer(false)}
        data={data}
      />
    </>
  );
};

export default ServiceCardAnalytics;
