import DataItem from "components/DataItem";
import { formatDate } from "utils/dateTime";

const TreatmentHistoryInformation = ({ data }) => {
  return (
    <>
      <h4 className="font-bold">Treatment History Information</h4>
      <div className="mt-5 p-6 rounded-lg flex flex-col gap-y-10 bg-rightContent">
        <DataItem
          icon="timer-2"
          title="Created By"
          value={
            <>
              <span className="block">
                {data?.createdBy?.firstName} {data?.createdBy?.lastName}
              </span>
              <span className="block">{formatDate(data?.createdAt)}</span>
            </>
          }
        />
        <DataItem
          icon="timer-2"
          title="Last Updated By"
          value={
            <>
              <span className="block">
                {data?.updatedBy?.firstName} {data?.updatedBy?.lastName}
              </span>
              <span className="block">{formatDate(data?.updatedAt)}</span>
            </>
          }
        />
      </div>
    </>
  );
};

export default TreatmentHistoryInformation;
