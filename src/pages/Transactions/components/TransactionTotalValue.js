import DataItem from "components/DataItem";
import Drawer from "components/Drawer";
import Price from "components/Price";

const TransactionTotalValue = ({
  openDrawer,
  handleClose,
  subTotal,
  discount,
  vat,
  total,
  purchase,
  change,
  debtBalance,
}) => {
  return (
    <Drawer open={openDrawer} onClose={handleClose}>
      <div className="mt-6">
        <DataItem
          icon="coin"
          title="Total Value"
          value={<Price price={total} />}
        />
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <span>Sub.Total</span>
            <Price price={subTotal} priceClassName="text-secondary" />
          </div>
          <div className="flex items-center justify-between">
            <span>Discount</span>
            <Price
              price={discount}
              prefix="-"
              priceClassName="text-secondary"
            />
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
            <Price price={change} priceClassName="text-secondary" />
          </div>
          <div className="flex items-center justify-between">
            <span>Debt Balance</span>
            <Price price={debtBalance} priceClassName="text-secondary" />
          </div>
        </div>
      </div>
    </Drawer>
  );
};

export default TransactionTotalValue;
