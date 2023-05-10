import { useEffect, useState } from "react"
import { useNavigate, useParams, useLocation } from "react-router-dom"

import Page from "components/Page"
import { getMedicalRecordById } from "services/api/medicalRecord"
import { formatStrapiArr, formatStrapiObj } from "utils/strapi"
import TreatmentForm from "./Components/TreatmentForm"
import { getUserById } from "services/api/users"
import { getPatientById } from "services/api/patient"
import DataItem from "components/DataItem"

const UpsertTreatment = () => {
  const { id, user_id } = useParams();
  const navigate = useNavigate();
  const [medicalRecordData, setMedicalRecordData] = useState(null);
  const [user, setUser] = useState({});
  const location = useLocation();
  const [viewMode, setViewMode] = useState(location.pathname.endsWith("view"));
  const [editMode, setEditMode] = useState(!!id && !location.pathname.endsWith("view"));


  useEffect(() => {
    (async () => {
      try {
        if (id) {
          const res = await getMedicalRecordById(id);
          if (res.data) {
            const medicalRecord = formatStrapiObj(res.data);
            if (medicalRecord) {
              setMedicalRecordData({
                ...medicalRecord,
                // areaImage: formatStrapiObj(medicalRecord?.areaImage),
                // background: formatStrapiObj(medicalRecord?.background),
                // thumbnail: formatStrapiObj(medicalRecord?.thumbnail),
                // categories: formatStrapiArr(medicalRecord?.categories),
                // results: medicalRecord?.results.map(result => ({
                //   ...result,
                //   images: formatStrapiArr(result.images)
                // })),
                // procedure: medicalRecord?.procedure.map(p => ({
                //   ...p,
                //   image: formatStrapiObj(p.image)
                // })),
              });
            } else {
              navigate("/treatments");
            }
          }
        }
      } catch (error) {
      } finally {
      }

      try {
        if (user_id) {
          const res = await getPatientById(user_id);
          // treatmentData.user = res.data;
          setUser(formatStrapiObj(res.data));
          console.log('user', res.data)
          // setTreatmentData(treatmentData);
          // if (res.data) {
          //   const treatment = formatStrapiObj(res.data);
          //   if (treatment) {
          //     setTreatmentData({
          //       ...treatment,
          //       areaImage: formatStrapiObj(treatment?.areaImage),
          //       background: formatStrapiObj(treatment?.background),
          //       thumbnail: formatStrapiObj(treatment?.thumbnail),
          //       categories: formatStrapiArr(treatment?.categories),
          //       results: treatment?.results.map(result => ({
          //         ...result,
          //         images: formatStrapiArr(result.images)
          //       })),
          //       procedure: treatment?.procedure.map(p => ({
          //         ...p,
          //         image: formatStrapiObj(p.image)
          //       })),
          //     });
          //   } else {
          //     navigate("/treatments");
          //   }
          // }
        }
      } catch (error) {
      } finally {
      }
    })();
  }, [id, navigate]);

  return (
    <Page title="Hồ sơ bệnh án">
      <p className="text-16 font-bold">
        {`${editMode ? 'Sửa' : 'Tạo mới'} hồ sơ bệnh án`}
      </p>
      <div className="my-4">
      <DataItem icon="user" title="Full Name" value={`${user?.full_name}`} />
      </div>
      <div className="bg-form mt-4 rounded-t-2xl p-6">

        {/* {editMode ? (medicalRecordData && <TreatmentForm data={medicalRecordData} user={user} />) : <TreatmentForm user={user}/>} */}
        {viewMode ? (medicalRecordData && <TreatmentForm data={medicalRecordData} user={user} readonly={true}/>) : <TreatmentForm user={user}/>}
      </div>
    </Page>
  )
}

export default UpsertTreatment
