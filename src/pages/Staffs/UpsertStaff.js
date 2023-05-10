import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Page from "components/Page";

import StaffForm from "./Components/StaffForm";
import { getStaffById } from "services/api/staff";

const UpsertStaff = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [editMode] = useState(!!id);
  const [staffData, setStaffData] = useState();

  useEffect(() => {
    (async () => {
      if (id) {
        try {
          const res = await getStaffById(id);
          if (res.data) {
            setStaffData(res.data);
          }
        } catch (error) {
          navigate("/staffs");
        } finally {
        }
      }
    })();
  }, [id, navigate]);

  return (
    <Page title="Staff Management">
      <p className="text-16 mb-4 font-bold">
        {editMode ? "Edit" : "Create New"} Staff
      </p>
      {editMode ? staffData && <StaffForm data={staffData} /> : <StaffForm />}
    </Page>
  );
};

export default UpsertStaff;
