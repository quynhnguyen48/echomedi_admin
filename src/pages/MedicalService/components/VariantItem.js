import Price from "components/Price";

const VariantItem = ({ variant, className = "" }) => {
  return (
    <div className={`mt-4 p-5 rounded-xl bg-primary/10 w-full ${className}`}>
      <div className="flex">
        <span className="w-30">Size</span>
        <span className="font-bold">{`${variant?.size}${variant?.unit}`}</span>
      </div>
      <div className="flex mt-2">
        <span className="w-30">Price</span>
        <div className="flex">
          <Price price={variant?.discountPrice} />
          <Price
            className="ml-5"
            priceClassName="line-through decoration-orange decoration-0 font-normal"
            price={variant?.price}
          />
        </div>
      </div>
      <div className="flex mt-3">
        <span className="w-30">Inventory</span>
        <span>{variant?.inventory}</span>
      </div>
    </div>
  );
};

export default VariantItem;
