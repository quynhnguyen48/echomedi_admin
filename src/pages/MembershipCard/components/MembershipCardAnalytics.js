import { useMemo } from "react";
import sumBy from "lodash/sumBy";

import DataItem from "components/DataItem";
import Price from "components/Price";
import dayjs from "dayjs";
import classNames from "classnames";
import { TRANSACTION_TYPE } from "constants/TransactionType";
import { PAYMENT_METHOD } from "constants/Transaction";

const MembershipCardAnalytics = ({ data }) => {
  const latestTransaction = useMemo(() => {
    return data?.transactions?.[0];
  }, [data?.transactions]);

  const totalPurchased = useMemo(() => {
    const purchasedByMoney = data?.transactions?.filter(
      (transaction) =>
        ![PAYMENT_METHOD.MEMBER_CARD, PAYMENT_METHOD.SERVICE_CARD]?.includes(
          transaction.paymentMethod
        )
    );
    return sumBy(purchasedByMoney, "total");
  }, [data?.transactions]);

  return (
    <div className="h-full">
      <p className="font-bold">Card Analytics</p>
      {data && (
        <div className="mt-5 p-6 h-full rounded-lg flex flex-col gap-y-10 bg-rightContent">
          <DataItem
            icon="coin"
            title="Latest Transaction"
            value={
              <div className="flex flex-wrap">
                {latestTransaction ? (
                  <>
                    <Price
                      price={latestTransaction?.total || 0}
                      prefix={
                        latestTransaction?.type === TRANSACTION_TYPE.INCOME
                          ? "+"
                          : "-"
                      }
                      priceClassName={classNames({
                        "text-blue3":
                          latestTransaction?.type === TRANSACTION_TYPE.INCOME,
                        "text-orange":
                          latestTransaction?.type === TRANSACTION_TYPE.EXPENSE,
                      })}
                    />
                    <span>
                      {dayjs(latestTransaction?.date).format(
                        "DD MMMM, YYYY | HH:mm"
                      )}
                    </span>
                  </>
                ) : (
                  "-"
                )}
              </div>
            }
          />
          <DataItem
            icon="coin"
            title="Total Purchased"
            value={<Price price={totalPurchased} />}
          />
        </div>
      )}
    </div>
  );
};

export default MembershipCardAnalytics;
