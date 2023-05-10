import Price from "components/Price"
import { BILLING_TYPE } from "constants/Transaction"

const TransactionBilling = ({ subTotal, discount, vat, total, purchase, billingType }) => {
  return (
    <div>
      <p className="font-bold">Billing</p>
      <div className="mt-6 space-y-4">
        <div className="flex items-center justify-between">
          <span>Sub.Total</span>
          <Price price={subTotal} priceClassName="text-secondary" />
        </div>
        <div className="flex items-center justify-between">
          <span>Discount</span>
          <Price price={discount} prefix="-" priceClassName="text-secondary" />
        </div>
        <div className="flex items-center justify-between">
          <span>VAT</span>
          <Price price={vat} suffix="%" priceClassName="text-secondary" />
        </div>
        <div className="w-full h-px bg-primary/30" />
        <div className="flex items-center justify-between">
          <span>Total</span>
          <Price price={total || 0} />
        </div>
        <div className="flex items-center justify-between">
          <span>Purchase</span>
          <Price price={purchase} priceClassName="text-secondary" />
        </div>
        <div className="flex items-center justify-between">
          <span>Change</span>
          <Price
            price={
              billingType === BILLING_TYPE.CARD_CANCELED
                ? 0
                : purchase >= total
                ? purchase - total
                : 0
            }
            priceClassName="text-secondary"
          />
        </div>
        <div className="flex items-center justify-between">
          <span>Debt Balance</span>
          <Price
            price={
              billingType === BILLING_TYPE.DEBT_COLLECTION
                ? Math.min(purchase, total) * -1
                : billingType === BILLING_TYPE.CARD_CANCELED
                ? total
                : purchase < total
                ? total - purchase
                : 0
            }
            priceClassName="text-secondary"
          />
        </div>
      </div>
    </div>
  )
}

export default TransactionBilling
