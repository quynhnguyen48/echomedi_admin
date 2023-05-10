import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

import Page from "components/Page"
import { getTreatmentById } from "services/api/treatment"
import { formatStrapiArr, formatStrapiObj } from "utils/strapi"
import TreatmentForm from "./Components/TreatmentForm"

const UpsertTreatment = () => {
  const { id } = useParams();
  const [editMode, setEditMode] = useState(!!id);
  const navigate = useNavigate();
  const [treatmentData, setTreatmentData] = useState(null)

  useEffect(() => {
    (async () => {
      try {
        if (id) {
          setEditMode(true)
          const res = await getTreatmentById(id);
          if (res.data) {
            const treatment = formatStrapiObj(res.data);
            if (treatment) {
              setTreatmentData({
                ...treatment,
                areaImage: formatStrapiObj(treatment?.areaImage),
                background: formatStrapiObj(treatment?.background),
                thumbnail: formatStrapiObj(treatment?.thumbnail),
                categories: formatStrapiArr(treatment?.categories),
                results: treatment?.results.map(result => ({
                  ...result,
                  images: formatStrapiArr(result.images)
                })),
                procedure: treatment?.procedure.map(p => ({
                  ...p,
                  image: formatStrapiObj(p.image)
                })),
              });
            } else {
              navigate("/treatments");
            }
          }
        }
      } catch (error) {
      } finally {
      }
    })();
  }, [id, navigate]);

  return (
    <Page title="Treatment Management">
      <p className="text-16 font-bold">
        {`${editMode ? 'Edit' : 'Create new'} Treatment`}
      </p>
      <div className="bg-form mt-4 rounded-t-2xl p-6">
        {editMode ? (treatmentData && <TreatmentForm data={treatmentData} />) : <TreatmentForm />}
      </div>
    </Page>
  )
}

export default UpsertTreatment
