import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Tag from "components/Tag";
import { BOOKING_STATUS } from "constants/Booking";
import { getListBookings } from "services/api/bookings";
import { formatStrapiArr, formatStrapiObj } from "utils/strapi";
import Button from "components/Button";
import Icon from "components/Icon";

const LatestBookings = () => {
  const [bookings, setBookings] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await getListBookings(
          {
            pageSize: 10,
          },
          {
            status: BOOKING_STATUS.ON_SCHEDULED,
          }
        );
        if (res.data) {
          const listBookings = formatStrapiArr(res.data);
          setBookings(
            listBookings?.map((booking) => ({
              ...booking,
              staff: formatStrapiObj(booking.staff),
              user: formatStrapiObj(booking.user),
              patient: formatStrapiObj(booking.patient),
              treatment: formatStrapiObj(booking.treatment),
            }))
          );
        }
      } catch (error) {}
    })();
  }, []);


const translate = (t) => {
  switch (t) {
    case "scheduled":
      return "Chờ xác nhận"
      break;
    case "confirmed":
      return "Đã xác nhận"
      break;
    case "finished":
      return "Hoàn thành"
      break;
    case "cancelled":
      return "Huỷ"
      break;
  }
}

  return (
    <div className="pb-6 h-full overflow-auto">
      <span className="font-bold">Đặt hẹn mới nhất</span>
      <div className="mt-4 space-y-4">
        {Array.isArray(bookings) &&
          bookings?.map((booking) => (
            <div key={booking?.id} className="bg-primary/10 p-4 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-sm text-primary">{dayjs(booking?.bookingDate).format("DD MMMM, YYYY [|] HH:mm")}</span>
                <Tag name={translate(booking?.status)} className="bg-purple !rounded-lg" />
              </div>
              {/* <p className="text-14 text-secondary/[56]">
                {dayjs(booking?.createdAt).format("DD MMMM, YYYY [|] HH:mm")}
              </p> */}
              <p className="text-16 font-bold mt-4">
                {booking?.patient?.full_name || ""}
              </p>
              <Button
                btnSize="small"
                className="mt-2"
                onClick={() => navigate(`/bookings/medical-records/${booking?.id}/view`)}
              >
                Xem chi tiết
              </Button>
            </div>
          ))}
      </div>
    </div>
  );
};

export default LatestBookings;
