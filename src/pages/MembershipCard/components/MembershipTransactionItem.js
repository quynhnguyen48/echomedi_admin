import Tag from "components/Tag"
import classNames from "classnames"
import dayjs from "dayjs"
import Price from "components/Price"
import { TRANSACTION_TYPE } from "constants/TransactionType"

const MembershipTransactionItem = ({ transaction }) => {
  return (
    <div className="rounded-xl flex justify-between bg-primary/10 p-4 items-start">
      <div className="flex flex-wrap">
        <span className="font-bold text-primary">{transaction?.code}</span>
        <span className="text-secondary text-14 w-full mt-2">
          {dayjs(transaction?.date).format("DD MMMM, YYYY | HH:mm")}
        </span>
        <Price price={transaction?.total} className="mt-4" />
      </div>
      <Tag
        name={transaction?.type}
        className={classNames("!rounded-lg text-center", {
          "bg-green": transaction?.type === TRANSACTION_TYPE.INCOME,
          "bg-red": transaction?.type === TRANSACTION_TYPE.EXPENSE,
        })}
      />
    </div>
  )
}

export default MembershipTransactionItem
