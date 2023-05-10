import DataItem from "components/DataItem";
import Drawer from "components/Drawer";
import { WEEK_DAYS } from "constants/Dates";

const TreatmentSession = ({ openDrawer, onClose, data = {} }) => {
  return (
    <Drawer open={openDrawer} onClose={onClose}>
      <DataItem
        icon="save"
        title="Treatment Sessions"
        valueClassName="text-18"
        value={`${data?.date?.length} days available`}
      />
      <div>
        <p className="font-bold mt-6">Available Date</p>
        <div className="flex flex-wrap mt-4 gap-4">
          {data?.date?.map((item) => {
            return (
              <div className="px-5 h-12 bg-green2 flex items-center justify-center rounded-xl" key={item}>
                <span className="text-white font-bold">{WEEK_DAYS[item]}</span>
              </div>
            );
          })}
        </div>
        <div>
          <p className="font-bold mt-6">Available Time Session</p>
          <div className="flex flex-wrap mt-4 gap-4">
            {data?.time?.map((item) => {
              return (
                <div className="flex items-center justify-center rounded-xl text-center w-33 h-12 bg-green2" key={item}>
                  <span className="text-white font-bold">{item}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Drawer>
  );
};

export default TreatmentSession;
