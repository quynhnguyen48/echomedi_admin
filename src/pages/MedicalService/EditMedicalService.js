import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify"

import Page from "components/Page";
import { getUserById } from "services/api/users";
import { getErrorMessage } from "utils/error"
import PatientForm from "./components/PatientForm";
import { getPatientById } from "services/api/patient";
import { getMedicalServiceById } from "services/api/medicalService";
import { formatStrapiArr, formatStrapiObj } from "utils/strapi"

const EditCustomer = () => {
  const { id } = useParams();
  const [medicalServiceData, setMedicalServiceData] = useState();

  useEffect(() => {
    (async () => {
      try {
        const res = await getMedicalServiceById(id);
        console.log('resss', res);
        if (res.data) {
          setMedicalServiceData(formatStrapiObj(res.data));
        }
      } catch (error) {
        toast.error(getErrorMessage(error))
      }
    })();
  }, [id]);

  return (
    <Page title="Quản lý dịch vụ">
      <p className="text-16 font-bold">Sửa thông tin dịch vụ</p>
      <div className="bg-form mt-4 rounded-t-2xl p-6">
        {medicalServiceData && <PatientForm data={medicalServiceData} />}
      </div>
    </Page>
  );
};

export default EditCustomer;
