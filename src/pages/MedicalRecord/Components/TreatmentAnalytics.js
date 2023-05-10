import DataItem from "components/DataItem";

const TreatmentAnalytics = ({ data }) => {
  return (
    <div className="h-full">
      <p className="font-bold">Treatment Analytics</p>
      <div className="h-full mt-5 p-6 rounded-lg flex flex-col gap-y-10 bg-rightContent">
        <DataItem
          icon="calendar-tick"
          title="Total Booking"
          value={`${data?.bookings?.length || 0} Bookings`}
        />
        <DataItem
          icon="timer"
          title="Total Treat"
          value={
            <div>
              <p>{`${data?.totalTreat?.customers || 0} Customers`}</p>
              <p>{`${data?.treatments?.count || 0} Treatments`}</p>
            </div>
          }
        />
        <DataItem
          icon="like"
          title="Total Liked"
          value={`${data?.totalLiked || 0} Likes`}
        />
        <DataItem
          icon="eye"
          title="Total Views"
          value={`${data?.totalViews || 0} Views`}
        />
      </div>
    </div>
  );
};

export default TreatmentAnalytics;
