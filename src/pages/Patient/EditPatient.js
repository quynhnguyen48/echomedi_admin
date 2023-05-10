import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { toast } from "react-toastify"

import Page from "components/Page";
import { getUserById } from "services/api/users";
import { getErrorMessage } from "utils/error"
import PatientForm from "./Components/PatientForm";
import { getPatientById } from "services/api/patient";
import { formatStrapiArr, formatStrapiObj } from "utils/strapi"

const EditCustomer = () => {
  const { id } = useParams();
  const [customerData, setCustomerData] = useState();
  let location = useLocation();
  const readOnly = location.pathname.endsWith("view");

  useEffect(() => {
    (async () => {
      try {
        const res = await getPatientById(id);
        if (res.data) {
          setCustomerData(formatStrapiObj(res.data));
        }
      } catch (error) {
        toast.error(getErrorMessage(error))
      }
    })();
  }, [id]);

  return (
    <Page title="Quản lý khách hàng">
      <p className="text-16 font-bold">{readOnly ? "Xem" : "Sửa"} thông tin khách hàng</p>
      <div className="bg-form mt-4 rounded-t-2xl p-6">
        {customerData && <PatientForm data={customerData} readOnly={readOnly}/>}
      </div>
    </Page>
  );
};

export default EditCustomer;
