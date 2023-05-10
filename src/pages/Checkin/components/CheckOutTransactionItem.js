import { useMemo } from "react"
import dayjs from "dayjs"

import Price from "components/Price"
import Tag from "components/Tag"
import Avatar from "components/Avatar"
import Timer from "components/Timer"
import { renderTransactionCheckinStatusColor, toCapitalize } from "utils/string"
import { TRANSACTION_CHECKIN_STATUS } from "constants/Transaction"

const CheckOutTransactionItem = ({ transaction, showRemoveButton, handleRemove, onClick }) => {
  const duration = useMemo(() => {
    if (transaction?.status === TRANSACTION_CHECKIN_STATUS.PROGRESS) {
      const treatmentInterval = transaction?.treatment?.interval.split(":")
      const treatmentIntervalSeconds =
        parseInt(treatmentInterval[0]) * 3600 + parseInt(treatmentInterval[1]) * 60
      const durationTmp = dayjs(transaction?.startedTreatmentAt).diff(dayjs(new Date()), "second")
      return durationTmp + treatmentIntervalSeconds
    }
  }, [transaction?.startedTreatmentAt, transaction?.status, transaction?.treatment?.interval])

  return (
    <div className="relative">
      <button
        onClick={onClick}
        className="text-left rounded-xl flex justify-between bg-primary/10 p-4 items-start w-full"
      >
        <div className="flex flex-wrap">
          <span className="font-bold text-primary">{transaction?.code}</span>
          <span className="text-secondary/56 text-14 w-full mt-2">
            {dayjs(transaction?.createdAt).format("DD MMMM, YYYY | HH:mm")}
          </span>
          <Price price={transaction?.total} className="mt-4" />
        </div>
        <div className="flex flex-col self-stretch items-end justify-between">
          {transaction?.status && (
            <Tag
              secondary
              name={toCapitalize(transaction.status)}
              className={renderTransactionCheckinStatusColor(transaction.status)}
            />
          )}
          <div className="flex items-end space-x-4">
            {transaction?.status === TRANSACTION_CHECKIN_STATUS.PROGRESS && (
              <Timer secondary duration={duration} isStartTimer />
            )}
            <Avatar
              name={`${transaction?.staff?.firstName} ${transaction?.staff?.lastName}`}
              src={transaction?.staff?.avatar}
              size={48}
            />
          </div>
        </div>
      </button>
      {/*{showRemoveButton && transaction?.status === TRANSACTION_CHECKIN_STATUS.DONE && (*/}
      {/*  <Button*/}
      {/*    btnType="text"*/}
      {/*    btnSize="auto"*/}
      {/*    icon={<Icon name="close-circle" className="fill-gray w-5"/>}*/}
      {/*    className="absolute bottom-4 right-4"*/}
      {/*    onClick={handleRemove}*/}
      {/*  />*/}
      {/*)}*/}
    </div>
  )
}

export default CheckOutTransactionItem
