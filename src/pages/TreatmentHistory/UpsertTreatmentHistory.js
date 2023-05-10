import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

import Page from "components/Page";
import { formatStrapiArr, formatStrapiObj } from "utils/strapi"
import { getTreatmentHistoryById } from "services/api/treatementHistory"
import TreatmentHistoryForm from "./Components/TreatmentHistoryForm"

const UpsertTreatmentHistory = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [editMode, setEditMode] = useState(false)
  const [treatmentHistoryData, setTreatmentHistoryData] = useState(null)

  useEffect(() => {
    (async () => {
      try {
        if (id) {
          setEditMode(true)
          const res = await getTreatmentHistoryById(id);
          if (res.data) {
            const treatmentHistoryFormatted = formatStrapiObj(res.data);
            if (treatmentHistoryFormatted) {
              setTreatmentHistoryData({
                ...treatmentHistoryFormatted,
                user: formatStrapiObj(treatmentHistoryFormatted.user),
                treatment: formatStrapiObj(treatmentHistoryFormatted.treatment),
                history: treatmentHistoryFormatted.history.map(history => ({
                  ...history,
                  images: formatStrapiArr(history.images)
                }))
              });
            } else {
              navigate("/treatment-history");
            }
          }
        }
      } catch (error) {
      } finally {
      }
    })();
  }, [id, navigate]);

  return (
    <Page title="Treatment History Management">
      <p className="text-16 mb-4 font-bold">{editMode ? 'Edit' : 'Create New'} Treatment History</p>
      {editMode ? (treatmentHistoryData && <TreatmentHistoryForm data={treatmentHistoryData} />) : <TreatmentHistoryForm />}
    </Page>
  );
};

export default UpsertTreatmentHistory;
