import Page from "components/Page";
import BookingForm from "./components/BookingForm";

const CreateBooking = () => {
  return (
    <Page title="Booking Management">
      <p className="text-16 font-bold">Create New Booking</p>
      <div className="bg-form mt-4 rounded-t-2xl p-6">
        <BookingForm data={null} />
      </div>
    </Page>
  );
};

export default CreateBooking;
