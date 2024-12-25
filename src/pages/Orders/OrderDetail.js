import classNames from "classnames";
import {
  ORDER_PAYMENT_METHOD_TITLE,
  ORDER_STATUS,
  ORDER_STATUS_TITLE,
} from "constants/Order";
import dayjs from "dayjs";
import { useState } from "react";

import Button from "components/Button";
import DataItem from "components/DataItem";
import Icon from "components/Icon";
import Price from "components/Price";
import Tag from "components/Tag";
import OrderProductList from "./components/OrderProductList";
import OrderTotalPrice from "./components/OrderTotalPrice";
import CustomerModal from "../../components/CustomerModal"
import { numberWithCommas } from "pages/Invoice/Components/InvoiceTable";

const OrderDetail = ({ data, onUpdateStatus, onDelete }) => {
  const [openProductListDrawer, setOpenProductListDrawer] = useState(false);
  const [openTotalPriceDrawer, setOpenTotalPriceDrawer] = useState(false);
  const [customerIdSelected, setCustomerIdSelected] = useState(null)
  const [visibleCustomerModal, setVisibleCustomerModal] = useState(false)
  const [orderIdSelected, setOrderIdSelected] = useState(null);

  return (
    <div className="mt-10 w-full">
      <div className="flex items-center gap-x-2">
        <div className="flex items-center flex-1 gap-x-4">
          <div className="flex items-center justify-center w-28 h-28 rounded-full bg-primary">
            <Icon name="box-tick" className="w-16 h-16 fill-white" />
          </div>

          <div className="flex-1">
            <p className="text-24 font-bold break-all">{data?.code}</p>
            <p className="text-18 break-all">
              {data?.orderedDate &&
                dayjs(data?.orderedDate).format("DD MMMM, YYYY | HH:mm")}
            </p>
            <Tag
              className={classNames("mt-4 rounded-lg", {
                "bg-yellow": data?.status === ORDER_STATUS.ORDERED,
                "bg-blue": data?.status === ORDER_STATUS.COMPLETED,
                "bg-red": data?.status === ORDER_STATUS.CANCELED,
                "bg-orange": data?.status === ORDER_STATUS.DRAFT,
              })}
              name={ORDER_STATUS_TITLE[data?.status]}
            />
          </div>
        </div>
        {/* <div className="flex gap-x-2">
          <Button
            disabled={data?.status === ORDER_STATUS.COMPLETED}
            btnSize="auto"
            className="w-10 h-10"
            shape="circle"
            onClick={() => onUpdateStatus(ORDER_STATUS.COMPLETED)}
          >
            <Icon name="tick-circle" className="fill-white" />
          </Button>
          <Button
            btnSize="auto"
            className="w-10 h-10 bg-red"
            shape="circle"
            onClick={onDelete}
          >
            <Icon name="trash" className="fill-white" />
          </Button>
        </div> */}
      </div>
      <div className="grid grid-cols-2 grid-flow-row gap-y-8 mt-4">
        <DataItem icon="key" title="Order ID" value={data?.code} />
        {/* <DataItem
          icon="user-octagon"
          title="Customer ID"
          value={data?.user?.code}
          footer={
            <Button
              btnSize="small"
              className="mt-2"
              onClick={() => {
                setVisibleCustomerModal(true)
                setCustomerIdSelected(setCustomerIdSelected(data?.users_permissions_user?.data?.attributes?.patient?.data?.attributes?.uid))
              }}
            >
              View Detail
            </Button>
          }
        /> */}

        <DataItem
          icon="3dcube"
          title="Products"
          footer={
            <Button
              className="mt-2"
              btnSize="small"
              onClick={() => {
                setOrderIdSelected(data?.id);
                setOpenProductListDrawer(true);
              }}
            >
              View Detail
            </Button>}
        />

        <DataItem
          icon="calendar"
          title="Order Date"
          value={dayjs(data?.createdAt).format("DD MMMM, YYYY | HH:mm")}
          valueClassName="capitalize"
        />

        <DataItem
          icon="coin"
          title="Total Price"
          value={numberWithCommas(data?.total)}
          valueClassName={"text-orange font-bold"}
          footer={
            <Button
              className="mt-2"
              btnSize="small"
              onClick={() => setOpenTotalPriceDrawer(true)}
            >
              View Detail
            </Button>
          }
        />

        <DataItem
          icon="message"
          title="Payment Method"
          value={ORDER_PAYMENT_METHOD_TITLE[data?.paymentMethod]}
        />
        <DataItem icon="user" title="Receiver" value={data?.contactReceiver} />
        <DataItem
          icon="call"
          title="Phone Number"
          value={data?.users_permissions_user?.data?.attributes?.phone}
        />
        <DataItem
          icon="location"
          title="Address"
          value={
            data?.contactAddress
              ? `${data?.contactAddress?.address || ""} ${data?.contactAddress?.ward?.name || ""
              } ${data?.contactAddress?.district?.name || ""} ${data?.contactAddress?.province?.name || ""
              }`
              : "-"
          }
        />
      </div>

      <OrderProductList
        products={data?.products}
        openDrawer={openProductListDrawer}
        orderIdSelected={orderIdSelected}
        onClose={() => setOpenProductListDrawer(false)}
      />
      <OrderTotalPrice
        detail={data}
        openDrawer={openTotalPriceDrawer}
        onClose={() => setOpenTotalPriceDrawer(false)}
      />
      <CustomerModal
        customerId={customerIdSelected}
        visibleModal={visibleCustomerModal}
        onClose={() => setVisibleCustomerModal(false)}
      />
    </div>
  );
};

export default OrderDetail;
