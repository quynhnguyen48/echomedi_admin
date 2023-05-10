import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import Page from "components/Page";
import MembershipCardForm from "./components/MembershipCardForm";
import { getCardById } from "services/api/card";
import { formatStrapiArr, formatStrapiObj } from "utils/strapi";

const EditMembershipCard = () => {
  const { id } = useParams();
  const [membershipData, setMembershipData] = useState();

  useEffect(() => {
    (async () => {
      try {
        const res = await getCardById(id);
        if (res.data) {
          const card = formatStrapiObj(res.data);
          if (card) {
            setMembershipData({
              ...card,
              user: formatStrapiObj(card.user),
              transactions: formatStrapiArr(card.transactions),
            });
          }
        }
      } catch (error) {
      } finally {
      }
    })();
  }, [id]);

  return (
    <Page title="Membership Card Management">
      <p className="text-16 font-bold">Edit Membership Card</p>
      <div className="bg-form mt-4 rounded-t-2xl p-6">
        {membershipData && <MembershipCardForm data={membershipData} />}
      </div>
    </Page>
  );
};

export default EditMembershipCard;
