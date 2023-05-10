import Page from "components/Page";
import CustomersForm from "./components/CustomersForm";

const CreateCustomers = () => {
  return (
    <Page title="Quản lý khách hàng">
      <p className="text-16 font-bold">Create New Customer</p>
      <div className="bg-form mt-4 rounded-t-2xl p-6">
        <CustomersForm />
      </div>
    </Page>
  );
};

export default CreateCustomers;
