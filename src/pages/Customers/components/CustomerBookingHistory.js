import dayjs from "dayjs"

import DataItem from "components/DataItem"
import Drawer from "components/Drawer"
import SearchInput from "components/SearchInput"
import BookingStatusTag from "components/Tag/BookingStatusTag"
import { useState } from "react"

const CustomerBookingHistory = ({ openDrawer, onClose, bookings = [] }) => {
  const [searchKey, setSearchKey] = useState()

  return (
    <Drawer open={openDrawer} onClose={onClose}>
      <DataItem
        icon="calendar-tick"
        title="Booking History"
        value={`${bookings?.length} Bookings`}
      />
      <SearchInput placeholder="Search by Booking ID" className="mt-6" onSearch={setSearchKey} />
      <div className="mt-8 space-y-4">
        {Array.isArray(bookings) &&
          bookings
            ?.filter((booking) => booking?.code?.search(new RegExp(searchKey, "i")) > -1)
            ?.map((booking) => (
              <div key={booking?.id} className="bg-primary/10 p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-primary">{booking?.code}</span>
                  <BookingStatusTag status={booking?.status} />
                </div>
                <p className="text-14 text-secondary/[56]">
                  {dayjs(booking?.createdAt).format("DD MMMM, YYYY [|] HH:mm")}
                </p>
                <p className="text-16 font-bold mt-4">{booking?.treatment?.name || ""}</p>
              </div>
            ))}
      </div>
    </Drawer>
  )
}

export default CustomerBookingHistory
