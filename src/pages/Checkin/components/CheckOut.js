import CheckoutItem from "./CheckOutItem";

const Checkout = ({ checkoutList, selectCheckout }) => {
  return (
    <>
      <h4 className="font-bold">Check out</h4>
      <div className="mt-10">
        <span className="font-bold text-32 text-primary">{`${checkoutList?.length} `}</span>
        <span className="text-32">Checked out</span>
      </div>

      <div className="mt-5 flex flex-col gap-y-4">
        {Array.isArray(checkoutList) &&
          checkoutList?.map((checkout) => (
            <CheckoutItem
              key={checkout.id}
              item={checkout}
              selectCheckout={selectCheckout}
            />
          ))}
      </div>
    </>
  );
};

export default Checkout;
