const CustomerAnalyticsItem = ({
  className,
  name,
  percentage,
  value,
  color,
}) => {
  return (
    <div className={className}>
      <div className="flex items-center gap-x-2">
        <div className="space-x-1.5">
          <span className={`inline-block w-2 h-2 rounded ${color}`} />
          <span className="text-14">{name}</span>
        </div>
        <span className="text-14 font-bold">{percentage}</span>
      </div>
      <p className="text-24 font-bold mt-2 ml-3">{value}</p>
    </div>
  );
};

export default CustomerAnalyticsItem;
