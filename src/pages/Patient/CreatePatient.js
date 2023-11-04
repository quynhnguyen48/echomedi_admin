import Page from "components/Page";
import CustomersForm from "./Components/CustomersForm";

const CreateCustomers = () => {
  return (
    <Page title="Quản lý bệnh nhân">
      <p className="text-16 font-bold">Tạo bệnh nhân mới</p>
      <div className="bg-form mt-4 rounded-t-2xl px-2">
        <CustomersForm />
      </div>
    </Page>
  );
};

export default CreateCustomers;
