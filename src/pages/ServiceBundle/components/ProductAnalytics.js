import DataItem from "components/DataItem";

const ProductAnalytics = ({ data }) => {
  return (
    <div className="h-full">
      <p className="font-bold">Thông số</p>
      <div className="mt-5 p-6 rounded-lg bg-rightContent h-full flex flex-col gap-y-10">
        <DataItem
          icon="box-tick"
          value={`${data?.totalSold || 0} Products`}
          title="Total Sold"
        />

        <DataItem
          icon="heart"
          value={`${data?.totalLikes || 0} Likes`}
          title="Total Liked"
        />
      </div>
    </div>
  );
};

export default ProductAnalytics;
