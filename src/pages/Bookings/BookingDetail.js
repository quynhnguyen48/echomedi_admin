import { useState } from "react"
import dayjs from "dayjs"
import { useNavigate } from "react-router-dom"

import DataItem from "components/DataItem"
import Button from "components/Button"
import Icon from "components/Icon"
import BookingStatusTag from "components/Tag/BookingStatusTag"
import CustomerModal from "components/CustomerModal"
import { BOOKING_STATUS } from "constants/Booking"
import TestResultsModal from "./components/TestResultsModal"

const BookingDetail = ({ data, onUpdateStatus }) => {
  const navigate = useNavigate()
  const [customerIdSelected, setCustomerIdSelected] = useState(null)
  const [visibleCustomerModal, setVisibleCustomerModal] = useState(false)

  return (
    <div className="mt-10 w-full">
      <div className="flex items-center">
        <div className="flex items-center flex-1 gap-x-4">
          <div className="flex items-center justify-center w-27.5 h-27.5 rounded-full bg-primary">
            <Icon name="calendar-tick" className="w-14 h-14 fill-white" />
          </div>
          <div className="flex-1">
            <p className="text-24 font-bold">{data?.code}</p>
            <p className="text-18">{`${dayjs(data?.bookingDate).format("DD MMMM, YYYY")} | ${
              data?.timeSession
            }`}</p>
            <BookingStatusTag status={data?.status} className="mt-4" />
          </div>
        </div>
        {data?.status === BOOKING_STATUS.ON_SCHEDULED && (
          <div className="flex items-center gap-x-2">
            <Button
              btnSize="auto"
              className="w-10 h-10"
              shape="circle"
              onClick={() => navigate(`/bookings/${data?.id}/edit`)}
            >
              <Icon name="edit" />
            </Button>
            <div className="space-y-2">
              <Button
                disabled={[BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.CANCELED].includes(
                  data?.status
                )}
                btnSize="auto"
                className="w-10 h-10 bg-blue2"
                shape="circle"
                onClick={() => onUpdateStatus(BOOKING_STATUS.CONFIRMED)}
              >
                <Icon name="tick-circle" className="fill-white" />
              </Button>
              <Button
                btnSize="auto"
                className="w-10 h-10 bg-red"
                shape="circle"
                onClick={() => onUpdateStatus(BOOKING_STATUS.CANCELED)}
              >
                <Icon name="slash" className="fill-white" />
              </Button>
            </div>
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 grid-flow-row gap-y-20 mt-12">
        <DataItem icon="key" title="Booking ID" value={data?.code} />
        <DataItem
          icon="user-octagon"
          title="Customer ID"
          value={data?.user?.code}
          footer={
            <Button
              btnSize="small"
              className="mt-2"
              onClick={() => {
                setVisibleCustomerModal(true)
                setCustomerIdSelected(data?.user?.id)
              }}
            >
              View Detail
            </Button>
          }
        />
        <DataItem
          icon="calendar"
          title="Date"
          value={data?.bookingDate ? dayjs(data?.bookingDate).format("DD MMMM, YYYY") : "-"}
        />
        <DataItem icon="clock" title="Time Session" value={data?.timeSession} />
        <DataItem icon="grammerly" title="Treatment" value={data?.treatment?.name || "-"} />
        <DataItem
          icon="menu-board"
          title="Note"
          value={data?.note || "-"}
          valueClassName="capitalize"
        />
        <DataItem icon="call" title="Customer Phone Number" value={data?.user?.phone} />
        <DataItem
          icon="location"
          title="Address"
          value={
            data?.user?.address
              ? `${data?.user?.address?.address || ""}, ${data?.user?.address?.ward?.name || ""}, ${
                  data?.user?.address?.district?.name || ""
                }, ${data?.user?.address?.province?.name || ""}`
              : "-"
          }
        />
        <DataItem icon="sidebar/staffs-active" title="Staffs" value={data?.staff?.code || "-"} />
      </div>
      <CustomerModal
        customerId={customerIdSelected}
        visibleModal={visibleCustomerModal}
        onClose={() => setVisibleCustomerModal(false)}
      />
    </div>
  )
}

export default BookingDetail
