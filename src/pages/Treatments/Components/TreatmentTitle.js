import DataItem from "components/DataItem";
import Drawer from "components/Drawer";
import MultiLanguagesItem from "components/MultiLanguage/MultiLanguagesItem";

const TreatmentTitle = ({ openDrawer, onClose, title = {} }) => {
  return (
    <Drawer open={openDrawer} onClose={onClose}>
      <DataItem
        icon="save"
        title="Treatment Title"
        valueClassName="text-18"
        value={`${title?.en}`}
      />
      <div className="mt-6">
        <p className="font-bold">Title</p>
        <MultiLanguagesItem
          titleClassName="w-6"
          languagePack={[
            { title: `EN`, detail: title?.en },
            { title: `VN`, detail: title?.vi },
          ]}
        />
      </div>
    </Drawer>
  );
};

export default TreatmentTitle;
