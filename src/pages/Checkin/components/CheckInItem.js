import { useMemo } from "react"
import dayjs from "dayjs"
import { isMobile } from "react-device-detect"

import Button from "components/Button"
import Icon from "components/Icon"
import Tag from "components/Tag"
import Avatar from "components/Avatar"
import { getStrapiMedia } from "utils/media"
import { renderTransactionCheckinStatusColor, toCapitalize } from "utils/string"
import { formatDate } from "utils/dateTime"
import { BILLING_TYPE, TRANSACTION_CHECKIN_STATUS } from "constants/Transaction"
import Timer from "components/Timer"

const CheckInItem = ({
  checkin,
  onCheckout,
  onEdit,
  onShowCustomerModal,
  onShowCreateNewCustomerModal,
}) => {
  const personName = useMemo(
    () =>
      checkin?.user
        ? `${checkin?.user?.firstName} ${checkin?.user?.lastName}`
        : checkin?.metadata?.personName,
    [checkin?.metadata?.personName, checkin?.user]
  )

  const checkinDate = useMemo(
    () => checkin?.metadata?.date || checkin?.createdAt,
    [checkin?.createdAt, checkin?.metadata?.date]
  )

  const checkinStatus = useMemo(() => {
    return checkin?.status
  }, [checkin])

  const treatmentTransaction = useMemo(
    () =>
      Array.isArray(checkin?.transactions) &&
      checkin?.transactions?.find((transaction) => {
        return (
          transaction?.billingType === BILLING_TYPE.TREATMENT &&
          transaction.status === TRANSACTION_CHECKIN_STATUS.PROGRESS
        )
      }),
    [checkin?.transactions]
  )

  const duration = useMemo(() => {
    if (treatmentTransaction) {
      const treatmentInterval = treatmentTransaction?.treatment?.interval.split(":")
      const treatmentIntervalSeconds =
        parseInt(treatmentInterval[0]) * 3600 + parseInt(treatmentInterval[1]) * 60
      const durationTmp = dayjs(treatmentTransaction?.startedTreatmentAt).diff(
        dayjs(new Date()),
        "second"
      )
      return durationTmp + treatmentIntervalSeconds
    }
  }, [
    treatmentTransaction?.startedTreatmentAt,
    treatmentTransaction?.status,
    treatmentTransaction?.treatment?.interval,
  ])

  const isGuestUser = useMemo(() => {
    return !checkin.user && !checkin?.metadata?.aliasID
  }, [checkin.metadata, checkin.user])

  return (
    <div className="relative cursor-pointer flex flex-col items-center justify-between bg-white rounded-xl px-4 py-6 w-60 md:p-6 md:w-full">
      <div className="absolute space-y-2 right-6 top-6">
        {!checkin.user && (
          <Button shape="circle" onClick={onEdit}>
            <Icon name="edit" />
          </Button>
        )}
        {checkin.user && (
          <Button onClick={onCheckout} btnSize="auto" className="bg-red w-10 h-10" shape="circle">
            <Icon name="logout-circle" className="fill-white" />
          </Button>
        )}
      </div>
      <div className="flex flex-col items-center md:flex-row md:w-full space-y-3 md:space-y-0 md:space-x-2">
        <div className="relative">
          {isGuestUser ? (
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center relative">
              {!isMobile && (
                <button
                  className="absolute bottom-0 right-0 border-2 border-white bg-white rounded-full"
                  onClick={onShowCreateNewCustomerModal}
                >
                  <Icon name="add-circle" className="fill-primary w-6 h-6" />
                </button>
              )}
              <Icon name="user" className="fill-white w-14 h-14" />
            </div>
          ) : (
            <Avatar
              className="z-10 relative"
              name={personName}
              alt={personName}
              size={isMobile ? 72 : 80}
              src={
                checkin?.user?.avatar
                  ? getStrapiMedia({ url: checkin?.user?.avatar })
                  : checkin?.metadata?.detected_image_url
              }
            />
          )}
          {checkinStatus === TRANSACTION_CHECKIN_STATUS.PROGRESS && (
            <div className="absolute -left-9 bottom-0 z-0">
              <Avatar
                name={`${treatmentTransaction?.staff?.firstName} ${treatmentTransaction?.staff?.lastName}`}
                alt={`${treatmentTransaction?.staff?.firstName} ${treatmentTransaction?.staff?.lastName}`}
                size={48}
                src={
                  treatmentTransaction?.staff?.avatar
                    ? getStrapiMedia({ url: treatmentTransaction?.staff?.avatar })
                    : checkin?.metadata?.detected_image_url
                }
              />
            </div>
          )}
        </div>
        <div className="flex flex-col items-center md:items-start space-y-2 md:space-y-1">
          <button onClick={checkin.user && onShowCustomerModal} className="text-left">
            <b className="font-bold text-18">{isGuestUser ? "Guest" : personName}</b>
          </button>
          {
            <p className="text-12 ">
              {isGuestUser ? "This is Guest account" : checkin?.user?.email || "-"}
            </p>
          }
          {
            <b className="font-bold text-14">
              {isGuestUser ? "-" : checkin?.user?.phone ? checkin?.user?.phone : "-"}
            </b>
          }
        </div>
      </div>
      <div className="flex flex-col items-center justify-between md:flex-row md:w-full mt-4 md:mt-6">
        <div className="flex items-center">
          <Tag
            secondary
            name={toCapitalize(checkinStatus)}
            className={`${renderTransactionCheckinStatusColor(checkinStatus)}`}
          />
          {checkinStatus === TRANSACTION_CHECKIN_STATUS.PROGRESS && isMobile && (
            <div className="ml-4">
              <Avatar
                name={`${treatmentTransaction?.staff?.firstName} ${treatmentTransaction?.staff?.lastName}`}
                alt={`${treatmentTransaction?.staff?.firstName} ${treatmentTransaction?.staff?.lastName}`}
                size={28}
                src={
                  treatmentTransaction?.staff?.avatar
                    ? getStrapiMedia({ url: treatmentTransaction?.staff?.avatar })
                    : checkin?.metadata?.detected_image_url
                }
              />
            </div>
          )}
        </div>

        <div className="mt-4 md:mt-0">
          {checkinStatus === TRANSACTION_CHECKIN_STATUS.PROGRESS ? (
            <Timer secondary duration={duration} isStartTimer />
          ) : (
            <p className="text-14 font-bold">{checkinDate && formatDate(checkinDate, "HH:MM")}</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default CheckInItem
