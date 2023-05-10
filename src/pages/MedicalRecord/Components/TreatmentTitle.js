import DataItem from "components/DataItem";
import Drawer from "components/Drawer";
import MultiLanguagesItem from "components/MultiLanguage/MultiLanguagesItem";

const TreatmentTitle = ({ openDrawer, onClose, title = {} }) => {
  return (
    <Drawer open={openDrawer} onClose={onClose}>
      <DataItem
        icon="save"
        title="Services"
        valueClassName="text-18"
        value={`${title}`}
      />
      
    </Drawer>
  );
};

export default TreatmentTitle;
