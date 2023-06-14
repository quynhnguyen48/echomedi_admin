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
// import CustomerDebt from "./components/CustomerDebt"
import { getListCards } from "services/api/card"
import { CARD_STATUS, CARD_TYPE } from "constants/Card"
import { formatStrapiArr, formatStrapiObj } from "utils/strapi"
import CustomerAccountBalance from "./Components/CustomerAccountBalance"
import CustomerMedicalRecords from "./Components/CustomerMedicalRecords";
import { createBookingWithPatient, } from "services/api/bookings";
import { getRelationshipById } from "services/api/patient";
import { BRANCH } from "constants/Authentication"
import moment from "moment";
import Modal from "components/Modal"
import PrescriptionModal from "./PrescriptionModal";

dayjs.locale('vi')

const CustomerDetail = ({ data, onToggleStatus }) => {
  const navigate = useNavigate()
  const [totalDebt, setTotalDebt] = useState(0)
  const [accountBalance, setAccountBalance] = useState(0)
  const [openCustomerDebtDrawer, setOpenCustomerDebtDrawer] = useState(false)
  const [openCustomerAccountBalanceDrawer, setOpenCustomerAccountBalanceDrawer] = useState(true)
  const [listActiveMemberCard, setListActiveMemberCard] = useState([])
  const [visiblePrescriptionModal, setVisiblePrescriptionModal] = useState(false)
  const [show, setShow] = useState(false);
  const [relationships, setRelationships] = useState([]);

  useEffect(() => {
    if (data?.id) {
      ; (async () => {
        try {
          const res1 = await getRelationshipById(data?.id)
          let rs = res1.data.relationships.map( r => {
            let res = {...r};
            return res;
          })
          setRelationships(rs);

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
        } catch (error) { }
      })()
    }
  }, [data?.id])


  return (
    <div className="w-full max-h-tableBody overflow-scroll">
      <div className="flex items-center gap-x-2">
        <div className="flex gap-x-2">
          <Button
            btnSize="auto"
            className="w-10 h-10"
            shape="circle"
            onClick={() => navigate(`/patient/${data?.id}/edit`)}
          >
            <Icon name="edit" />
          </Button>
          <Button
            btnSize="auto"
            className="w-10 h-10"
            shape="circle"
            onClick={() => navigate(`/patient/${data?.id}/view`)}
          >
            <Icon name="eye" />
          </Button>
          {/* <Button
            btnSize="auto"
            className={`w-10 h-10 ${data?.blocked ? "bg-green" : "bg-red"}`}
            shape="circle"
            onClick={onToggleStatus}
          >
            <Icon name="slash" />
          </Button> */}
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
          {/* <Button
          icon={<Icon name="add-circle" className="fill-white" />}
          onClick={() => {
            navigate(`/medical-records/${data.id}/create`);
          }}
        >
          Tạo hồ sơ bệnh án
        </Button> */}
          <Button
            icon={<Icon name="add-circle" className="fill-white" />}
            onClick={async () => {
              await createBookingWithPatient({
                patient: data.id,
                status: "confirmed",
                createNewPatient: false,
                bookingDate: moment().toDate(),
                branch: localStorage.getItem(BRANCH),
                dontShowOnCalendar: true,
                notify: false,
              });

              navigate("/today-patient")
            }}
          >
            Đưa bệnh nhân vào danh sách tiếp đón
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-2 grid-flow-row gap-y-8 mt-4">
        <DataItem icon="user" title="Tên" value={`${data?.full_name}`} />
        <DataItem icon="message" title="Email" value={data?.email} />
        <DataItem icon="man" title="Giới tính" value={data?.gender == "male" ? "Nam" : "Nữ"} valueClassName="capitalize" />
        <DataItem
          icon="cake"
          title="Ngày sinh"
          value={dayjs(data?.birthday).format("DD MMMM, YYYY")}
        />
        <DataItem icon="call" title="Số điện thoại" value={data?.phone} />
        <DataItem icon="call" title="Số điện thoại người thân" value={data?.relative_phone} />
        <DataItem
          icon="location"
          title="Địa chỉ"
          value={
            data?.address
              ? `${data?.address?.address || ""}, ${data?.address?.ward?.name || ""}, ${data?.address?.district?.name || ""
              }, ${data?.address?.province?.name || ""}`
              : "-"
          }
        />
        <p>Relationships</p>
        <div className="my-4 mb-4">
          <div className="flex flex-row align-center">
            <span className="font-bold mr-4 mt-1">Các mối quan hệ:</span>
            <Button onClick={e => setVisiblePrescriptionModal(true)}>Cập nhật</Button>
          </div>
          {relationships?.map(item => <p>- {item?.label} : {item?.patient?.full_name}</p>)}
        </div>
        {visiblePrescriptionModal && (
          <PrescriptionModal
            patientId={data?.id}
            patient={data}
            // bundleServiceId={data?.id}
            setRelationships={setRelationships}
            visibleModal={visiblePrescriptionModal}
            onClose={() => setVisiblePrescriptionModal(false)}
          />
        )}
      </div>
      
      <CustomerMedicalRecords
        userId={data?.id}
        openDrawer={openCustomerAccountBalanceDrawer}
        onClose={() => setOpenCustomerAccountBalanceDrawer(false)}
      />
    </div>
  )
}

export default CustomerDetail
