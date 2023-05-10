import dayjs from "dayjs"
import classNames from "classnames"
import { useNavigate } from "react-router-dom"
import sumBy from "lodash/sumBy"

import DataItem from "components/DataItem"
import Tag from "components/Tag"
import Button from "components/Button"
import Icon from "components/Icon"
import Avatar from "components/Avatar"
import { getStrapiMedia } from "utils/media"
import { formatPrice } from "utils/number"
import { useEffect, useState } from "react"
import { getUserDebt } from "services/api/transactions"
import CustomerDebt from "./components/CustomerDebt"
import { getListCards } from "services/api/card"
import { CARD_STATUS, CARD_TYPE } from "constants/Card"
import { formatStrapiArr, formatStrapiObj } from "utils/strapi"
import CustomerAccountBalance from "./components/CustomerAccountBalance"
import CustomerMedicalRecords from "./components/CustomerMedicalRecords";

const CustomerDetail = ({ data, onToggleStatus }) => {
  const navigate = useNavigate()
  const [totalDebt, setTotalDebt] = useState(0)
  const [accountBalance, setAccountBalance] = useState(0)
  const [openCustomerDebtDrawer, setOpenCustomerDebtDrawer] = useState(false)
  const [openCustomerAccountBalanceDrawer, setOpenCustomerAccountBalanceDrawer] = useState(false)
  const [listActiveMemberCard, setListActiveMemberCard] = useState([])

  useEffect(() => {
    if (data?.id) {
      ;(async () => {
        try {
          const res = await getUserDebt({ userId: data?.id })
          setTotalDebt(res?.data?.[0]?.totalDebt || 0)

          const cardRes = await getListCards(
            { pageSize: 1000 },
            {
              status: CARD_STATUS.ACTIVE,
              type: CARD_TYPE.MEMBERSHIP_CARD,
              $or: [
                {
                  user: data?.id,
                },
                {
                  extraMembers: { member: data?.id },
                },
              ],
            }
          )
          const listCards = formatStrapiArr(cardRes.data)
          setListActiveMemberCard(listCards)
          setAccountBalance(
            sumBy(listCards, (card) => {
              if (card?.user?.data?.id === data?.id) {
                return parseInt(card?.remainValue)
              } else {
                const member = card?.extraMembers?.find(
                  (member) => formatStrapiObj(member?.member)?.id
                )
                return parseInt(member?.remainValue)
              }
            })
          )
        } catch (error) {}
      })()
    }
  }, [data?.id])

  return (
    <div className="my-10 w-full">
      <div className="flex items-center gap-x-2">
        <div className="flex items-center flex-1 gap-x-4">
          <Avatar
            size={110}
            src={getStrapiMedia({ url: data?.avatar })}
            name={`${data?.firstName} ${data?.lastName}`}
          />
          <div className="flex-1">
            <p className="text-24 font-bold">{`${data?.firstName} ${data?.lastName}`}</p>
            <p className="text-18 break-all">{data?.email}</p>
            <Tag
              className={classNames("mt-4 rounded-lg", {
                "bg-red": data.blocked,
                "bg-green": !data.blocked,
              })}
              name={data.blocked ? "Blocked" : "Active"}
            />
            {data?.customerTag === "new" && (
              <Tag className="ml-2 rounded-lg bg-pink2" name="New Customer" />
            )}
          </div>
        </div>
        <div className="flex gap-x-2">
          <Button
            btnSize="auto"
            className="w-10 h-10"
            shape="circle"
            onClick={() => navigate(`/customers/${data?.id}/edit`)}
          >
            <Icon name="edit" />
          </Button>
          <Button
            btnSize="auto"
            className={`w-10 h-10 ${data?.blocked ? "bg-green" : "bg-red"}`}
            shape="circle"
            onClick={onToggleStatus}
          >
            <Icon name="slash" />
          </Button>
          {/* <Button
            btnSize="auto"
            className={`w-10 h-10 ${data?.blocked ? "bg-green" : "bg-red"}`}
            shape="circle"
            onClick={() => {
              navigate(`/medical-records/${data.id}/create`);
            }}
          >
            <Icon name="check" />
          </Button> */}
        </div>
      </div>
      <div className="grid grid-cols-2 grid-flow-row gap-y-20 mt-12">
        <DataItem icon="user-octagon" title="Customer ID" value={data?.code} />
        <DataItem
          icon="sidebar/check-in-active"
          title="Joined Date"
          value={dayjs(data?.createdAt).format("DD MMMM, YYYY")}
        />
        <DataItem icon="user" title="Full Name" value={`${data?.firstName} ${data?.lastName}`} />
        <DataItem icon="message" title="Email" value={data?.email} />
        <DataItem icon="man" title="Gender" value={data?.gender} valueClassName="capitalize" />
        <DataItem
          icon="cake"
          title="Date of Birth"
          value={dayjs(data?.birthday).format("DD MMMM, YYYY")}
        />
        <DataItem icon="call" title="Phone Number" value={data?.phone} />
        <DataItem
          icon="location"
          title="Address"
          value={
            data?.address
              ? `${data?.address?.address || ""}, ${data?.address?.ward?.name || ""}, ${
                  data?.address?.district?.name || ""
                }, ${data?.address?.province?.name || ""}`
              : "-"
          }
        />
        <DataItem
          icon="coin"
          title="Bệnh án"
          footer={
            <Button
              btnSize="small"
              className="mt-2"
              onClick={() => setOpenCustomerAccountBalanceDrawer(true)}
            >
              View Detail
            </Button>
          }
        />
        <DataItem
          icon="coin"
          title="Debt Balance"
          value={`${formatPrice(totalDebt)} vnđ`}
          footer={
            <Button
              btnSize="small"
              className="mt-2"
              onClick={() => setOpenCustomerDebtDrawer(true)}
            >
              View Detail
            </Button>
          }
        />
      </div>
      <CustomerDebt
        userId={data?.id}
        totalDebt={totalDebt}
        openDrawer={openCustomerDebtDrawer}
        onClose={() => setOpenCustomerDebtDrawer(false)}
      />
      {/* <CustomerAccountBalance
        cardIds={listActiveMemberCard?.map((card) => card?.id)}
        userId={data?.id}
        accountBalance={accountBalance}
        openDrawer={openCustomerAccountBalanceDrawer}
        onClose={() => setOpenCustomerAccountBalanceDrawer(false)}
      /> */}
      <CustomerMedicalRecords 
        userId={data?.id}
        openDrawer={openCustomerAccountBalanceDrawer}
        onClose={() => setOpenCustomerAccountBalanceDrawer(false)}
      />
    </div>
  )
}

export default CustomerDetail
