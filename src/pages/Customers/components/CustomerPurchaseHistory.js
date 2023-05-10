import classNames from "classnames"
import dayjs from "dayjs"
import sumBy from "lodash/sumBy"

import DataItem from "components/DataItem"
import Drawer from "components/Drawer"
import Price from "components/Price"
import SearchInput from "components/SearchInput"
import Tag from "components/Tag"
import { ORDER_STATUS, ORDER_STATUS_TITLE } from "constants/Order"
import { useState } from "react"

const CustomerPurchaseHistory = ({ openDrawer, onClose, orders }) => {
  const [searchKey, setSearchKey] = useState()

  return (
    <Drawer open={openDrawer} onClose={onClose}>
      <DataItem icon="box-tick" title="Purchased History" value={`${orders?.length || 0} Orders`} />
      <SearchInput placeholder="Search by Order ID" className="mt-6" onSearch={setSearchKey} />
      <div className="mt-8 space-y-4">
        {Array.isArray(orders) &&
          orders
            ?.filter((order) => order?.code?.search(new RegExp(searchKey, "i")) > -1)
            ?.map((order) => (
              <div key={order?.id} className="bg-primary/10 p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-primary">{order.code || `#ORD.${order.id}`}</span>
                  <Tag
                    name={ORDER_STATUS_TITLE[order?.status]}
                    className={classNames("!rounded-lg", {
                      "bg-green": order?.status === ORDER_STATUS.COMPLETED,
                      "bg-red": order?.status === ORDER_STATUS.CANCELED,
                      "bg-yellow": order?.status === ORDER_STATUS.ORDERED,
                    })}
                  />
                </div>
                <p className="text-14 text-secondary/[56]">
                  {dayjs(order?.createdAt).format("DD MMMM, YYYY [|] HH:mm")}
                </p>
                <div className="flex justify-between mt-4">
                  <Price price={order?.total} />
                  <p>{`${sumBy(order?.products, "amount")} products`}</p>
                </div>
              </div>
            ))}
      </div>
    </Drawer>
  )
}

export default CustomerPurchaseHistory
