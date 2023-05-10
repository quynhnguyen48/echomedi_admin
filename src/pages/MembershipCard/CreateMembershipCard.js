import Page from "components/Page";
import MembershipCardForm from "./components/MembershipCardForm";

const CreateMembershipCard = () => {
  return (
    <Page title="Membership Card Management">
      <p className="text-16 font-bold">Create New Membership Card</p>
      <div className="bg-form mt-4 rounded-t-2xl p-6">
        <MembershipCardForm />
      </div>
    </Page>
  );
};

export default CreateMembershipCard;
