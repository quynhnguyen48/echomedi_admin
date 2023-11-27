import dayjs from "dayjs";
import { useMemo, useState } from "react";
import orderBy from "lodash/orderBy"
import sumBy from "lodash/sumBy"

import Button from "components/Button";
import DataItem from "components/DataItem";
import BookingStatusTag from "components/Tag/BookingStatusTag";
import { formatPrice } from "utils/number";

import CustomerBookingHistory from "./CustomerBookingHistory";
import CustomerLikedProducts from "./CustomerLikedProducts";
import CustomerLikedTreatments from "./CustomerLikedTreatments";
import CustomerPurchaseHistory from "./CustomerPurchaseHistory";

const CustomerAnalytics = ({ data }) => {
  const [openBookingHistoryDrawer, setOpenBookingHistoryDrawer] =
    useState(false);

  const [openLikedTreatmentsDrawer, setOpenLikedTreatmentsDrawer] =
    useState(false);

  const [openPurchaseHistoryDrawer, setOpenPurchaseHistoryDrawer] =
    useState(false);

  const [openLikedProductsDrawer, setOpenLikedProductsDrawer] = useState(false);

  const bookings = useMemo(() => orderBy(data?.bookings, ['createdAt'],['desc']), [data.bookings]);
  const treatmentHistories = useMemo(() => orderBy(data?.treatment_histories, ['createdAt'],['desc']), [data.treatment_histories]);
  const orders = useMemo(() => orderBy(data?.orders, ['createdAt'],['desc']), [data?.orders]);
  const transactions = useMemo(() => orderBy(data?.transactions, ['createdAt'],['desc']), [data?.transactions]);


  return (
    <div>
      <p className="font-bold">Customer Analytics</p>
      {data && (
        <div className="mt-5 p-6 rounded-lg flex flex-col gap-y-2 bg-rightContent">
          <DataItem
            icon="calendar-tick"
            title="Latest Booking History"
            value={bookings.length ? dayjs(bookings[0]?.createdAt).format(
              "DD MMMM, YYYY [|] HH:mm"
            ) : '-'}
            footer={
            !!bookings.length &&
              <div className="flex gap-x-2 mt-2">
                <BookingStatusTag status={bookings[0]?.status} />
                <Button
                  btnSize="small"
                  onClick={() => setOpenBookingHistoryDrawer(true)}
                >
                  View Detail
                </Button>
              </div>
            }
          />
          <DataItem
            icon="grammerly"
            title="Latest Treatment"
            value={treatmentHistories[0]?.treatment?.name || "-"}
          />
          <DataItem
            icon="wallet"
            title="Total Purchased"
            value={
              orders?.length
                ? `${formatPrice(
                    sumBy(orders, (order) => parseInt(order?.total) || 0)
                  )} vnđ`
                : "-"
            }
            footer={
            !!orders?.length &&
              <Button
                btnSize="small"
                className="mt-2"
                onClick={() => setOpenPurchaseHistoryDrawer(true)}
              >
                View Detail
              </Button>
            }
          />
          <DataItem
            icon="receipt"
            title="Latest Transaction"
            value={
              transactions.length
                ? `${formatPrice(parseInt(transactions[0]?.total) || 0)} vnđ`
                : "-"
            }
          />
          <DataItem
            icon="sidebar/check-in-active"
            title="Latest Checked in"
            value={
              data?.lastCheckedIn
                ? dayjs(data?.lastCheckedIn).format("DD MMMM, YYYY [|] HH:mm")
                : "-"
            }
          />
          <DataItem
            icon="like"
            title="Liked Products"
            value={data?.productWishlist?.length ? `${data?.productWishlist?.length} Products` : '-'}
            footer={
              !!data?.productWishlist?.length &&
              <Button
                btnSize="small"
                className="mt-2"
                onClick={() => setOpenLikedProductsDrawer(true)}
              >
                View Detail
              </Button>
            }
          />
          <DataItem
            icon="heart"
            title="Liked Treatments"
            value={data?.serviceWishlist?.length ? `${data?.serviceWishlist?.length} treatments` : '-'}
            footer={
              !!data?.serviceWishlist?.length &&
              <Button
                btnSize="small"
                className="mt-2"
                onClick={() => setOpenLikedTreatmentsDrawer(true)}
              >
                View Detail
              </Button>
            }
          />
        </div>
      )}
      <CustomerBookingHistory
        bookings={bookings}
        openDrawer={openBookingHistoryDrawer}
        onClose={() => setOpenBookingHistoryDrawer(false)}
      />
      <CustomerPurchaseHistory
        orders={orders}
        openDrawer={openPurchaseHistoryDrawer}
        onClose={() => setOpenPurchaseHistoryDrawer(false)}
      />
      <CustomerLikedTreatments
        treatmentIds={data?.serviceWishlist}
        openDrawer={openLikedTreatmentsDrawer}
        onClose={() => setOpenLikedTreatmentsDrawer(false)}
      />
      <CustomerLikedProducts
        productIds={data?.productWishlist}
        openDrawer={openLikedProductsDrawer}
        onClose={() => setOpenLikedProductsDrawer(false)}
      />
    </div>
  );
};

export default CustomerAnalytics;
