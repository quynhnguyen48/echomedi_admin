import Icon from "components/Icon"
import Avatar from "components/Avatar"
import Price from "components/Price"
import { formatDate } from "utils/dateTime"
import { BILLING_TYPE } from "constants/Transaction"
import sumBy from "lodash/sumBy"
import Button from "../../../components/Button"

const CheckoutConfirmation = ({ checkin, onClose }) => {
  const renderBillingTypeName = (transaction) => {
    switch (transaction?.billingType) {
      case BILLING_TYPE.TREATMENT:
        return transaction?.treatment?.name
      case BILLING_TYPE.PRODUCT:
        return `${sumBy(transaction?.products, (product) => product?.amount)} Products`
      case BILLING_TYPE.ORDER:
        return `Order ${transaction?.order?.code}`
      case BILLING_TYPE.CARD_CANCELED:
        return `Card Canceled ${transaction?.card?.code}`
      default:
        break
    }
  }
  return (
    <>
      <div className="flex items-center justify-between">
        <h5 className="font-bold">Billing</h5>
        <button onClick={onClose}>
          <Icon name="close-circle" className="fill-orange w-7 h-7" />
        </button>
      </div>
      <div className="flex space-x-4 mt-6">
        <Avatar size={80} />
        <div className="flex-1 space-y-1">
          <h2 className="font-bold text-primary">ECHO MEDI</h2>
        </div>
      </div>
      <ul className="space-y-2 mt-4 pb-4 border-b-1 border-primary/30">
        <li className="flex items-center justify-between">
          <p>
            {checkin?.user?.firstName} {checkin?.user?.lastName}
          </p>
          <p>{formatDate(checkin?.user?.birthday, "DD/MM/YYYY")}</p>
        </li>
        <li className="flex items-center justify-between">
          <p>{checkin?.user?.phone || "None"}</p>
          <p>{formatDate(checkin?.createdAt, "HH:mm")}</p>
        </li>
      </ul>
      <ul className="space-y-2 mt-4 pb-4 border-b-1 border-primary/30">
        {checkin?.transactions?.map((transaction) => (
          <li key={transaction?.id} className="flex items-center justify-between">
            <p className="text-14">{renderBillingTypeName(transaction)}</p>
            <Price
              price={transaction?.total}
              priceClassName="text-secondary"
              className="!text-14"
            />
          </li>
        ))}
      </ul>
      <ul className="space-y-2 mt-4 pb-4 border-b-1 border-primary/30">
        <li className="flex items-center justify-between">
          <p>Sub.Total</p>
          <Price
            price={sumBy(checkin?.transactions, (transaction) => parseInt(transaction.subTotal))}
            priceClassName="text-secondary"
          />
        </li>
        <li className="flex items-center justify-between">
          <p>Discount</p>
          <Price
            price={sumBy(checkin?.transactions, (transaction) => parseInt(transaction.discount))}
            priceClassName="text-secondary"
          />
        </li>
        <li className="flex items-center justify-between">
          <p>VAT</p>
          <Price
            price={sumBy(
              checkin?.transactions,
              (transaction) => parseInt(transaction.vat) * (parseInt(transaction.total) / 100)
            )}
            priceClassName="text-secondary"
          />
        </li>
      </ul>
      <ul className="space-y-2 mt-4 pb-4 border-b-1 border-primary/30">
        <li className="flex items-center justify-between">
          <p>Total</p>
          <Price
            price={sumBy(checkin?.transactions, (transaction) => parseInt(transaction.total))}
          />
        </li>
        <li className="flex items-center justify-between">
          <p>Purchase</p>
          <Price
            price={sumBy(checkin?.transactions, (transaction) => parseInt(transaction.purchase))}
            priceClassName="text-secondary"
          />
        </li>
        <li className="flex items-center justify-between">
          <p>Change</p>
          <Price
            price={sumBy(checkin?.transactions, (transaction) => parseInt(transaction.change))}
            priceClassName="text-secondary"
          />
        </li>
        <li className="flex items-center justify-between">
          <p>Debt Balance</p>
          <Price
            price={sumBy(checkin?.transactions, (transaction) => parseInt(transaction.debtBalance))}
            priceClassName="text-secondary"
          />
        </li>
      </ul>
      <p className="mt-4 mb-8">
        Cam on quy khach da mua hang va su dung dich vu o ECHO MEDI !!!
      </p>
      <Button btnSize="medium" className="w-full">
        PRINT
      </Button>
    </>
  )
}

export default CheckoutConfirmation
