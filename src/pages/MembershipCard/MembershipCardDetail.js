import { useState } from "react"
import { getStrapiMedia } from "utils/media"
import { useNavigate } from "react-router-dom"
import dayjs from "dayjs"
import classNames from "classnames"

import DataItem from "components/DataItem"
import Tag from "components/Tag"
import Button from "components/Button"
import Icon from "components/Icon"
import Avatar from "components/Avatar"
import Price from "components/Price"
import CustomerModal from "components/CustomerModal"
import { CARD_STATUS } from "constants/Card"
import MembershipCardTransaction from "./components/MembershipCardTransaction"
import ListMembersInCard from "components/ListMembersInCard"

const MembershipCardDetail = ({ data, updateStatus }) => {
  const navigate = useNavigate()
  const [openMemberCardTransactionDrawer, setOpenMemberCardTransactionDrawer] = useState(false)
  const [openMemberListDrawer, setOpenMemberListDrawer] = useState(false)
  const [customerIdSelected, setCustomerIdSelected] = useState(null)
  const [visibleCustomerModal, setVisibleCustomerModal] = useState(false)

  return (
    <div className="mt-10 w-full">
      <div className="flex items-center gap-x-2">
        <div className="flex items-center flex-1 gap-x-4">
          <Avatar
            size={110}
            src={getStrapiMedia({ url: data?.avatar })}
            name={`${data?.user?.firstName} ${data?.user?.lastName}`}
          />
          <div className="flex-1">
            <p className="text-24 font-bold">{`${data?.user?.firstName} ${data?.user?.lastName}`}</p>
            <p className="text-18 break-all">{data?.user?.email}</p>
            <Tag
              className={classNames("mt-4 rounded-lg", {
                "bg-red": data.user?.blocked,
                "bg-green": !data.user?.blocked,
              })}
              name={data.user?.blocked ? CARD_STATUS.SUSPENDED : CARD_STATUS.ACTIVE}
            />
          </div>
        </div>
        <div className="flex gap-x-2">
          <Button
            btnSize="auto"
            className="w-10 h-10"
            shape="circle"
            onClick={() => navigate(`/membership-card/${data?.id}/edit`)}
          >
            <Icon name="edit" />
          </Button>
          <Button
            btnSize="auto"
            className={`w-10 h-10 ${data?.status === CARD_STATUS.ACTIVE ? "bg-red" : "bg-green"} `}
            shape="circle"
            onClick={() =>
              updateStatus(
                data?.status === CARD_STATUS.ACTIVE ? CARD_STATUS.SUSPENDED : CARD_STATUS.ACTIVE
              )
            }
          >
            <Icon
              name={data?.status === CARD_STATUS.ACTIVE ? "slash" : "tick-circle"}
              className="fill-white"
            />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-2 grid-flow-row gap-y-20 mt-12">
        <DataItem icon="key" title="Card ID" value={data?.code} />
        <DataItem
          icon="calendar"
          title="Created Date"
          value={dayjs(data?.createdAt).format("DD MMMM, YYYY")}
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
          icon="coin"
          title="Remaining Value"
          value={<Price price={data?.remainValue} />}
          valueClassName="capitalize"
          footer={
            <Button
              btnSize="small"
              className="mt-2"
              onClick={() => setOpenMemberCardTransactionDrawer(true)}
            >
              View Detail
            </Button>
          }
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
      <MembershipCardTransaction
        openDrawer={openMemberCardTransactionDrawer}
        onClose={() => setOpenMemberCardTransactionDrawer(false)}
        data={data}
      />
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

export default MembershipCardDetail
