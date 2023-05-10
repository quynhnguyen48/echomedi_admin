import Icon from "components/Icon"
import CustomersForm from "../../Customers/components/CustomersForm"

const CreateNewCustomerModal = ({ visibleModal, onUpdateGuestUserCheckin, onClose }) => {
  return (
    <>
      <div
        className={`justify-center items-center flex overflow-hidden fixed inset-0 z-20 outline-none focus:outline-none transition-all ${
          visibleModal ? "visible" : "invisible"
        }`}
      >
        <div className="relative rounded-lg shadow-lg overflow-y-auto max-h-[90vh] w-[1028px] min-h-[460px] bg-white">
          <div className="bg-form p-12 pt-6">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-24 font-bold">Create New Customer</h4>
              <button onClick={onClose}>
                <Icon name="close-circle" className="fill-orange w-7 h-7" />
              </button>
            </div>
            <CustomersForm
              fromCheckIn
              onCloseModal={onClose}
              onUpdateGuestUserCheckin={onUpdateGuestUserCheckin}
            />
          </div>
        </div>
      </div>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-10 bg-primary/70 transition-all ${
          visibleModal ? "visible" : "invisible"
        }`}
      />
    </>
  )
}

export default CreateNewCustomerModal
