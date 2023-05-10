import Page from "components/Page"
import ServiceCardForm from "./components/ServiceCardForm"

const CreateServiceCard = () => {
  return (
    <Page title="Service Card Management">
      <p className="text-16 font-bold">Create New Service Card</p>
      <div className="bg-form mt-4 rounded-t-2xl p-6">
        <ServiceCardForm />
      </div>
    </Page>
  )
}

export default CreateServiceCard
