import classNames from "classnames";
import Tag from "components/Tag";

import Price from "components/Price";
import { TRANSACTION_TYPE } from "constants/TransactionType";

const ServiceCardUsagesItem = ({
  code,
  createdAt,
  serviceCardUsaged,
  serviceCardLimit,
  servicePrice,
  transactionType,
}) => {
  return (
    <div className="rounded-xl flex justify-between bg-primary/10 p-4 items-start">
      <div className="flex flex-wrap">
        <span className="font-bold text-primary">{code}</span>
        <span className="text-secondary text-14 w-full mt-2">{createdAt}</span>
        <div className="flex mt-4">
          <span className="font-bold">{`${serviceCardUsaged}/${serviceCardLimit}  |`}</span>
          <Price price={servicePrice} className="ml-2" />
        </div>
      </div>
      <Tag
        name={transactionType}
        className={classNames("!rounded-lg text-center", {
          "bg-green": transactionType === TRANSACTION_TYPE.INCOME,
          "bg-red": transactionType === TRANSACTION_TYPE.EXPENSE,
        })}
      />
    </div>
  );
};

export default ServiceCardUsagesItem;
