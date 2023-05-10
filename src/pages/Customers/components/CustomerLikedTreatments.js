import { useEffect, useState } from "react";

import DataItem from "components/DataItem";
import Drawer from "components/Drawer";
import { getTreatments } from "services/api/treatment";
import { getStrapiMedia } from "utils/media";
import { formatStrapiArr, formatStrapiObj } from "utils/strapi";

const CustomerLikedTreatments = ({
  openDrawer,
  onClose,
  treatmentIds = [],
}) => {
  const [treatments, setTreatments] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await getTreatments(
          { pageSize: 1000 },
          { id: { $in: treatmentIds } }
        );
        if (res.data) {
          setTreatments(
            formatStrapiArr(res.data).map((treatment) => ({
              ...treatment,
              background: formatStrapiObj(treatment?.background),
            }))
          );
        }
      } catch (error) {
      } finally {
      }
    })();
  }, [treatmentIds]);

  return (
    <Drawer open={openDrawer} onClose={onClose}>
      <DataItem
        icon="heart"
        title="Liked Treatments"
        value={`${treatments?.length || 0} Treatments`}
      />
      <div className="mt-8 space-y-6">
        {Array.isArray(treatments) &&
          treatments?.map((treatment) => (
            <div key={treatment?.id}>
              <img
                className="w-full h-45 object-cover rounded-xl bg-primary"
                src={getStrapiMedia(treatment?.background)}
                alt={treatment?.name}
              />
              <p className="text-16 font-bold mt-4">{treatment?.name || ""}</p>
            </div>
          ))}
      </div>
    </Drawer>
  );
};

export default CustomerLikedTreatments;
