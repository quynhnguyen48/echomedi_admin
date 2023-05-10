import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify"

import Page from "components/Page";
import { getUserById } from "services/api/users";
import { getErrorMessage } from "utils/error"
import CustomersForm from "./components/CustomersForm";

const EditCustomer = () => {
  const { id } = useParams();
  const [customerData, setCustomerData] = useState();

  useEffect(() => {
    (async () => {
      try {
        const res = await getUserById(id);
        if (res.data) {
          setCustomerData(res.data);
        }
      } catch (error) {
        toast.error(getErrorMessage(error))
      }
    })();
  }, [id]);

  return (
    <Page title="Quản lý khách hàng">
      <p className="text-16 font-bold">Sửa thông tin khách hàng</p>
      <div className="bg-form mt-4 rounded-t-2xl p-6">
        {customerData && <CustomersForm data={customerData} />}
      </div>
    </Page>
  );
};

export default EditCustomer;
