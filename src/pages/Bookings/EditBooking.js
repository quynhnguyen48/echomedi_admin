import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import Page from "components/Page";
import BookingForm from "./components/BookingForm";
import { getBookingById } from "services/api/bookings";
import { formatStrapiObj } from "utils/strapi";

const EditBooking = () => {
  const { id } = useParams();
  const [bookingData, setBookingData] = useState();

  useEffect(() => {
    (async () => {
      try {
        const res = await getBookingById(id);
        if (res.data) {
          const booking = formatStrapiObj(res.data);
          if (booking) {
            setBookingData({
              ...booking,
              staff: formatStrapiObj(booking.staff),
              user: formatStrapiObj(booking.user),
              treatment: formatStrapiObj(booking.treatment),
            });
          }
        }
      } catch (error) {
      } finally {
      }
    })();
  }, [id]);

  return (
    <Page title="Booking Management">
      <p className="text-16 font-bold">Edit Booking</p>
      <div className="bg-form mt-4 rounded-t-2xl p-6">
        {bookingData && <BookingForm data={bookingData} />}
      </div>
    </Page>
  );
};

export default EditBooking;
