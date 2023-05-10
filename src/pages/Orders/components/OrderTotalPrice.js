import DataItem from "components/DataItem";
import Drawer from "components/Drawer";
import Price from "components/Price";

const OrderTotalPrice = ({ openDrawer, onClose, detail }) => (
  <Drawer open={openDrawer} onClose={onClose}>
    <div className="mt-8 ">
      <div key={detail?.id}>
        <DataItem
          icon="coin"
          title="Total Price"
          value={<Price className="text-14 mt-1" price={detail?.total} />}
        />
      </div>
      <div className="grid grid-cols-2 gap-4 mt-4 text-16">
        <div>Sub.Total</div>
        <div className="justify-self-end">
          <Price
            className="text-14 mt-1"
            priceClassName="font-bold !text-secondary"
            price={detail?.subTotal}
          />
        </div>

        <div>Promotion</div>
        <div className="justify-self-end">
          <Price
            className="text-14 mt-1"
            priceClassName="font-bold !text-secondary"
            price={detail?.promotion}
          />
        </div>

        <div>Tax</div>
        <div className="justify-self-end">
          <Price
            className="text-14 mt-1"
            priceClassName="font-bold !text-secondary"
            price={detail?.tax}
          />
        </div>

        <div>Shipping Fee</div>
        <div className="justify-self-end">
          <Price
            className="text-14 mt-1"
            priceClassName="font-bold !text-secondary"
            price={detail?.shippingFee}
          />
        </div>

        <div>Total</div>
        <Price
          className="text-14 mt-1 justify-self-end"
          price={detail?.total}
        />
      </div>
    </div>
  </Drawer>
)

export default OrderTotalPrice;
