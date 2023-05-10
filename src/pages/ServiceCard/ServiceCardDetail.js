import { useState } from "react"
import { useNavigate } from "react-router-dom"

import classNames from "classnames"
import Button from "components/Button"
import DataItem from "components/DataItem"
import Icon from "components/Icon"
import Price from "components/Price"
import Tag from "components/Tag"
import CustomerModal from "components/CustomerModal"
import { CARD_STATUS, CARD_STATUS_TITLE } from "constants/Card"
import { formatDate } from "utils/dateTime"
import ListMembersInCard from "components/ListMembersInCard"

const ServiceCardDetail = ({ data, updateStatus }) => {
  const navigate = useNavigate()
  const [customerIdSelected, setCustomerIdSelected] = useState(null)
  const [openMemberListDrawer, setOpenMemberListDrawer] = useState(false)
  const [visibleCustomerModal, setVisibleCustomerModal] = useState(false)

  return (
    <div className="my-10 w-full">
      <div className="flex items-center">
        <div className="flex items-center flex-1 gap-x-4">
          <div className="flex items-center justify-center w-27.5 h-27.5 rounded-full bg-primary">
            <Icon name="coin" className="w-14 h-14 fill-white" />
          </div>
          <div className="flex-1">
            <p className="text-24 font-bold">{`${data?.user?.firstName} ${data?.user?.lastName}`}</p>
            <p className="text-18 break-all">{data?.user?.email}</p>
            <Tag
              name={CARD_STATUS_TITLE[data?.status]}
              className={classNames("mt-4 rounded-lg", {
                "bg-green": data?.status === CARD_STATUS.ACTIVE,
                "bg-red": data?.status === CARD_STATUS.SUSPENDED,
                "bg-blue": data?.status === CARD_STATUS.COMPLETED,
              })}
            />
          </div>
        </div>
        <div className="flex items-center gap-x-2">
          <Button
            btnSize="auto"
            className="w-10 h-10"
            shape="circle"
            onClick={() => navigate(`/service-card/${data?.id}/edit`)}
          >
            <Icon name="edit" />
          </Button>
          <div className="space-y-2">
            {data?.status !== CARD_STATUS.COMPLETED && (
              <Button
                btnSize="auto"
                className="w-10 h-10 bg-blue2"
                shape="circle"
                onClick={() => updateStatus(CARD_STATUS.COMPLETED)}
              >
                <Icon name="tick-circle" className="fill-white" />
              </Button>
            )}
            {data?.status !== CARD_STATUS.ACTIVE && (
              <Button
                btnSize="auto"
                className="w-10 h-10 bg-green"
                shape="circle"
                onClick={() => updateStatus(CARD_STATUS.ACTIVE)}
              >
                <Icon name="tick-circle" className="fill-white" />
              </Button>
            )}
            {data?.status !== CARD_STATUS.SUSPENDED && (
              <Button
                btnSize="auto"
                className="w-10 h-10 bg-red"
                shape="circle"
                onClick={() => updateStatus(CARD_STATUS.SUSPENDED)}
              >
                <Icon name={data?.publishedAt ? "slash" : "tick-circle"} className="fill-white" />
              </Button>
            )}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 grid-flow-row gap-y-20 mt-12">
        <DataItem icon="key" title="Card ID" value={data?.code} />
        <DataItem icon="calendar" title="Created Date" value={formatDate(data?.createdAt)} />
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
        <DataItem icon="calendar" title="Active Date" value={formatDate(data?.createdAt)} />

        <DataItem
          icon="grammerly"
          title="Treatment"
          value={
            data?.service?.code ? (
              <div>
                <p>{data?.service?.code}</p>
                <p>{data?.service?.name}</p>
              </div>
            ) : (
              "-"
            )
          }
        />

        <DataItem
          icon="coin"
          title="Card Value"
          value={<Price price={data?.usageLimit * parseInt(data?.service?.price)} />}
        />
        <DataItem
          icon="money"
          title="Remain Value"
          value={<span className="font-bold">{`${data?.remainValue}/${data?.usageLimit}`}</span>}
        />
        <DataItem
          icon="2-user"
          title="Members"
          value={`${data?.extraMembers?.length || 0} members`}
          footer={
            data?.extraMembers?.length > 0 && (
              <Button
                btnSize="small"
                className="mt-2"
                onClick={() => setOpenMemberListDrawer(true)}
              >
                View Detail
              </Button>
            )
          }
        />
      </div>
      <CustomerModal
        customerId={customerIdSelected}
        visibleModal={visibleCustomerModal}
        onClose={() => setVisibleCustomerModal(false)}
      />
      <ListMembersInCard
        cardId={data?.id}
        openDrawer={openMemberListDrawer}
        onClose={() => setOpenMemberListDrawer(false)}
      />
    </div>
  )
}

export default ServiceCardDetail
