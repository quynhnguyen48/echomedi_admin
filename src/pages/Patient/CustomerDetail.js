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
import { useDispatch, useSelector } from "react-redux";
import { isMobile } from "react-device-detect"


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
  const currentUser = useSelector((state) => state.user.currentUser);

  useEffect(() => {
    if (data?.id) {
      ; (async () => {
        try {
          const res1 = await getRelationshipById(data?.id)
          let rs = res1.data.relationships.map(r => {
            let res = { ...r };
            return res;
          })
          setRelationships(rs);

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
    <div className={`w-full ${isMobile ? '' : 'max-h-tableBody'} overflow-scroll px-2`} id='customer-detail'>
      <div className="flex items-center gap-x-2">
        {currentUser?.role?.type != "doctor"
          && currentUser?.role?.type != "nurse"
          && <div className="flex gap-x-2">
            <Button
              btnSize="auto"
              className="w-10 h-10"
              shape="circle"
              onClick={() => navigate(`/patient/${data?.id}/edit`)}
            >
              <Icon name="edit" />
            </Button>
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
          </div>}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-1 gap-x-10 mt-4">
        <div className="flex flex-col gap-y-1">
          <DataItem icon="user" title="Tên" value={`${data?.full_name?.toUpperCase()}`} />
          <DataItem icon="message" title="Email" value={data?.email} />
          <DataItem icon="man" title="Giới tính" value={data?.gender == "male" ? "Nam" : "Nữ"} valueClassName="capitalize" />
          <DataItem
            icon="cake"
            title="Ngày sinh"
            value={data?.birthday ? dayjs(data?.birthday).format("DD MMMM, YYYY") : ''}
          />
          <DataItem icon="call" title="Số điện thoại" value={data?.phone} />
          <DataItem icon="call" title="Số điện thoại người thân" value={data?.relative_phone} />
          {data?.patient_source && <DataItem icon="heart" title="Nguồn" value={data?.patient_source?.data?.attributes?.label} />}
          <div className="col-span-1">
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
          </div>
          {data.start_date_membership &&
            <DataItem
              icon="cake"
              title="Ngày bắt đầu membership"
              value={dayjs(data?.start_date_membership).format("DD MMMM, YYYY")}
            />}
          {data.membership_profile_file?.data &&
            <a target="_blank" href={getStrapiMedia(data.membership_profile_file?.data?.attributes)}>
              <DataItem icon="man" title="Kế hoạch sức khoẻ" value={data.membership_profile_file?.data?.attributes?.name} />
            </a>}
          {data.discount && JSON.parse(data.discount) &&
            <DataItem icon="man" title="Khuyến mãi" value={JSON.parse(data.discount)?.map(e => <p>{e.value}</p>)} />
          }
        </div>
        <div className="my-4">
          <div className="flex flex-row sm:flex-col align-center">
            <span className="font-bold mr-4 mt-1">Các mối quan hệ:</span>
            {currentUser?.role?.type != "doctor" &&
              currentUser?.role?.type != "nurse" &&
              <Button onClick={e => setVisiblePrescriptionModal(true)}>Cập nhật</Button>}
          </div>
          {relationships?.map(item => <p>- {item?.label} : {item?.patient?.uid} - {item?.patient?.full_name} <a target="_blank" href={`/patient/${item?.patient?.id}/view`}><svg className="inline" fill="#000000" width="20px" height="20px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M21.92,11.6C19.9,6.91,16.1,4,12,4S4.1,6.91,2.08,11.6a1,1,0,0,0,0,.8C4.1,17.09,7.9,20,12,20s7.9-2.91,9.92-7.6A1,1,0,0,0,21.92,11.6ZM12,18c-3.17,0-6.17-2.29-7.9-6C5.83,8.29,8.83,6,12,6s6.17,2.29,7.9,6C18.17,15.71,15.17,18,12,18ZM12,8a4,4,0,1,0,4,4A4,4,0,0,0,12,8Zm0,6a2,2,0,1,1,2-2A2,2,0,0,1,12,14Z" /></svg></a></p>)}

          <CustomerMedicalRecords
            userId={data?.id}
            openDrawer={openCustomerAccountBalanceDrawer}
            onClose={() => setOpenCustomerAccountBalanceDrawer(false)}
          />
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


    </div>
  )
}

export default CustomerDetail


const translateSource = (s) => {
  switch (s) {
    case "app":
      return "APP";
      break;
    case "web":
      return "WEB";
      break;
    case "app_be":
      return "App be";
      break;
    case "other":
      return "Khác";
      break;
  }
  return "";
}