import Page from "components/Page";
import CustomersForm from "./components/CustomersForm";

const CreateCustomers = () => {
  return (
    <Page title="Quản lý gói dịch vụ">
      <p className="text-16 font-bold">Tạo gói dịch vụ mới</p>
      <div className="bg-form mt-4 rounded-t-2xl px-6">
        <CustomersForm />
      </div>
    </Page>
  );
};

export default CreateCustomers;
