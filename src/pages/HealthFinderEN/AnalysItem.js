import Icon from "components/Icon";

const AnalysItem = ({ iconName, title, value, valueClassName }) => {
  return (
    <div className="flex items-center gap-x-4">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
        <Icon width={28} height={28} name={iconName} className="fill-primary" />
      </div>
      <div className="flex-1 overflow-x-hidden">
        <p className="text-18">{title}</p>
        <p className={`text-32 font-bold ${valueClassName}`}>{value}</p>
      </div>
    </div>
  );
};

export default AnalysItem;
