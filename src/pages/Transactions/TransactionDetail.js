import dayjs from "dayjs"
import { useState } from "react"

import Button from "components/Button"
import DataItem from "components/DataItem"
import Icon from "components/Icon"
import Price from "components/Price"
import Tag from "components/Tag"
import {
  BILLING_TYPE,
  BILLING_TYPE_TITLE,
  PAYMENT_METHOD,
  PAYMENT_METHOD_TITLE,
} from "constants/Transaction"
import TransactionTotalValue from "./components/TransactionTotalValue"
import { renderTransactionCheckinStatusColor, toCapitalize } from "utils/string"
import CustomerModal from "../../components/CustomerModal"

const TransactionDetail = ({data}) => {
  const [openTotalValueDrawer, setOpenTotalValueDrawer] = useState(false)
  const [customerIdSelected, setCustomerIdSelected] = useState(null)
  const [visibleCustomerModal, setVisibleCustomerModal] = useState(false)

  return (
    <div className="mt-10 w-full">
      <div className="flex items-center">
        <div className="flex items-center flex-1 gap-x-4">
          <div className="flex items-center justify-center w-27.5 h-27.5 rounded-full bg-primary">
            <Icon name="coin" className="w-14 h-14 fill-white"/>
          </div>
          <div className="flex-1">
            <p className="text-24 font-bold">{data?.code}</p>
            <p className="text-18">{`${dayjs(data?.createdAt).format(
              "DD MMMM, YYYY [|] HH:mm"
            )}`}</p>
            <Tag
              name={toCapitalize(data?.status)}
              className={`${renderTransactionCheckinStatusColor(data?.status)} mt-4`}
            />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 grid-flow-row gap-y-20 my-12">
        <DataItem icon="key" title="Transaction ID" value={data?.code}/>
        <DataItem
          icon="calendar"
          title="Purchased Date"
          value={dayjs(data?.createdAt).format("DD MMMM, YYYY [|] HH:mm")}
        />
        <DataItem
          icon="user-octagon"
          title="Customer ID"
          value={data?.user?.code}
          footer={
            <Button
              btnSize="small"
              className="mt-2"
              onClick={() => {
                setVisibleCustomerModal(true)
                setCustomerIdSelected(data?.user?.id)
              }}
            >
              View Detail
            </Button>
          }
        />
        <DataItem
          icon="user"
          title="Customer Name"
          value={`${data?.user?.firstName} ${data?.user?.lastName}`}
        />
        <DataItem
          icon="receipt"
          title="Billing Type"
          value={BILLING_TYPE_TITLE[data?.billingType]}
        />
        {data?.billingType === BILLING_TYPE.TREATMENT && (
          <DataItem
            icon="grammerly"
            title="Treatment"
            value={
              data?.treatment?.code ? (
                <div>
                  <p>{data?.treatment?.code}</p>
                  <p>{data?.treatment?.name}</p>
                </div>
              ) : (
                "-"
              )
            }
          />
        )}
        {data?.billingType === BILLING_TYPE.ORDER && (
          <DataItem icon="box-tick" title="Order" value={data?.order?.code || "-"}/>
        )}
        {data?.billingType === BILLING_TYPE.PRODUCT && (
          <DataItem
            icon="sidebar/products-active"
            title="Products"
            value={
              data?.products && Array.isArray(data?.products)
                ? data?.products?.map((product) => <p key={product?.code}>{product?.code}</p>)
                : "-"
            }
          />
        )}

        <DataItem
          icon="coin"
          title="Total Value"
          value={<Price price={data?.total}/>}
          footer={
            <Button btnSize="small" className="mt-2" onClick={() => setOpenTotalValueDrawer(true)}>
              View Detail
            </Button>
          }
        />
        <DataItem
          icon="money"
          title="Payment Method"
          value={
            <div>
              <p>{PAYMENT_METHOD_TITLE[data?.paymentMethod]}</p>
              <p>
                {[PAYMENT_METHOD.MEMBER_CARD || PAYMENT_METHOD.SERVICE_CARD]?.includes(
                  data?.paymentMethod
                ) && data?.card?.code}
              </p>
            </div>
          }
        />
        <DataItem
          icon="users"
          title="Staff"
          value={
            data?.staff ? (
              <div>
                <p>{data?.staff?.code}</p>
                <p>{`${data?.staff?.firstName} ${data?.staff?.lastName}`}</p>
              </div>
            ) : (
              "-"
            )
          }
        />
      </div>
      <TransactionTotalValue
        openDrawer={openTotalValueDrawer}
        handleClose={() => setOpenTotalValueDrawer(false)}
        subTotal={data?.subTotal}
        discount={data?.discount}
        vat={data?.vat}
        purchase={data?.purchase}
        change={data?.change}
        debtBalance={data?.debtBalance}
        total={data?.total}
      />
      <CustomerModal
        customerId={customerIdSelected}
        visibleModal={visibleCustomerModal}
        onClose={() => setVisibleCustomerModal(false)}
      />
    </div>
  )
}

export default TransactionDetail
