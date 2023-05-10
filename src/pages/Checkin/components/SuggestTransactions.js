import classNames from "classnames"
import Button from "components/Button"
import Slider from "components/Slider"
import { BOOKING_STATUS, BOOKING_STATUS_TITLE } from "constants/Booking"
import { BILLING_TYPE, PAYMENT_METHOD, TRANSACTION_TYPE } from "constants/Transaction"
import dayjs from "dayjs"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { toast } from "react-toastify"
import { createNewTransaction, getSuggestionServices } from "services/api/transactions"
import { getErrorMessage } from "utils/error"
import { getStrapiMedia } from "utils/media"

const isToday = require("dayjs/plugin/isToday")
dayjs.extend(isToday)

const SuggestTransactions = ({
  checkin,
  userId,
  fetchTransactions,
  onCreateTransactionSuccess,
}) => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const currentUser = useSelector((state) => state.user.currentUser)

  useEffect(() => {
    ;(async () => {
      if (userId) {
        try {
          const res = await getSuggestionServices(userId)
          setData(res.data)
        } catch (error) {}
      }
    })()
  }, [userId])

  const formatTreatmentTime = (value) => {
    let suffix = "th"
    if (value === 1) suffix = "st"
    if (value === 2) suffix = "nd"
    if (value === 3) suffix = "rd"
    return `${value}${suffix}`
  }

  const handleCreateTransaction = async (service) => {
    try {
      setLoading(true)
      const treatment = service?.card?.service

      const res = await createNewTransaction({
        card: { id: service?.card?.id },
        user: userId,
        billingType: BILLING_TYPE.TREATMENT,
        treatment: treatment?.id,
        paymentMethod: PAYMENT_METHOD.SERVICE_CARD,
        type: TRANSACTION_TYPE.EXPENSE,
        subTotal: treatment?.price,
        vat: 0,
        total: treatment?.price,
        purchase: treatment?.price,
        debtBalance: 0,
        change: 0,
        staff: currentUser?.id,
        check_in: checkin?.id,
      })
      await onCreateTransactionSuccess(res?.data)
      await fetchTransactions()
      toast.success("Created successfully")
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  if (!data) return null

  return (
    <div className="mt-6">
      <Slider
        slideItemClassName="!w-[260px]"
        title="Suggestion Services"
        items={data?.map((item) => (
          <div className="bg-primary/10 p-6 rounded-xl">
            <div className="space-y-2 text-14">
              <img
                className="w-12 h-12 rounded-full object-cover"
                src={getStrapiMedia({ url: item?.card?.service?.thumbnail?.url })}
                alt=""
              />
              <p className="font-bold">{item?.card?.service?.name}</p>
              <p>{`This is ${formatTreatmentTime(item?.nextBooking?.treatmentTime)} time`}</p>
              <div className="border-1 border-dashed border-primary" />
              {item?.card && (
                <>
                  <div className="flex">
                    Service Card: <p className="font-bold text-primary ml-1">{item?.card?.code}</p>
                  </div>
                  <div className="flex">
                    Remaining Value:{" "}
                    <p
                      className={classNames("font-bold ml-1", {
                        "text-primary": item?.card?.remainValue > 2,
                        "text-red": item?.card?.remainValue <= 2,
                      })}
                    >
                      {item?.card?.remainValue}
                    </p>{" "}
                    / {item?.card?.usageLimit}
                  </div>
                  <div className="border-1 border-dashed border-primary" />
                </>
              )}
              <div className="flex">
                Next Booking on:{" "}
                <p className="font-bold ml-1">
                  {dayjs(item?.nextBooking?.bookingDate).isToday()
                    ? "Today"
                    : dayjs(item?.nextBooking?.bookingDate).format("DD MMM YYYY")}
                </p>
              </div>
              {item?.lastBooking && (
                <div className="flex">
                  Last Booking:{" "}
                  <p
                    className={classNames("font-bold ml-1", {
                      "text-blue4": item?.lastBooking?.status === BOOKING_STATUS.CONFIRMED,
                      "text-red": item?.lastBooking?.status === BOOKING_STATUS.CANCELED,
                    })}
                  >
                    {BOOKING_STATUS_TITLE[item?.lastBooking?.status]}
                  </p>
                </div>
              )}
            </div>
            <Button
              loading={loading}
              className="mt-4"
              onClick={() => handleCreateTransaction(item)}
            >
              Create Transaction
            </Button>
          </div>
        ))}
      />
    </div>
  )
}

export default SuggestTransactions
