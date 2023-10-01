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
    <div className={`w-full ${isMobile ? '' : 'max-h-tableBody'} overflow-scroll px-2`}>
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
      <div className="flex flex-col-2 gap-x-10 mt-4">
        <div className="w-1/2 flex flex-col gap-y-1">
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
          {/* {data.membership_profile_file.data && <a target="_blank" href={getStrapiMedia(data.membership_profile_file?.data?.attributes)}>
        <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 24 24" fill="none">
<path d="M12 14.5V17.5M12 11.5H12.01M13 3H8.2C7.0799 3 6.51984 3 6.09202 3.21799C5.71569 3.40973 5.40973 3.71569 5.21799 4.09202C5 4.51984 5 5.0799 5 6.2V17.8C5 18.9201 5 19.4802 5.21799 19.908C5.40973 20.2843 5.71569 20.5903 6.09202 20.782C6.51984 21 7.0799 21 8.2 21H15.8C16.9201 21 17.4802 21 17.908 20.782C18.2843 20.5903 18.5903 20.2843 18.782 19.908C19 19.4802 19 18.9201 19 17.8V9M13 3L19 9M13 3V7.4C13 7.96005 13 8.24008 13.109 8.45399C13.2049 8.64215 13.3578 8.79513 13.546 8.89101C13.7599 9 14.0399 9 14.6 9H19" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
          Kế hoạch sức khoẻ</a>} */}
          {data.membership_profile_file?.data &&
            <a target="_blank" href={getStrapiMedia(data.membership_profile_file?.data?.attributes)}>
              <DataItem icon="man" title="Kế hoạch sức khoẻ" value={data.membership_profile_file?.data?.attributes?.name} />
            </a>}
        </div>
        <div className="my-4 w-1/2">
          <div className="flex flex-row align-center">
            <span className="font-bold mr-4 mt-1">Các mối quan hệ:</span>
            {currentUser?.role?.type != "doctor" &&
              currentUser?.role?.type != "nurse" &&
              <Button onClick={e => setVisiblePrescriptionModal(true)}>Cập nhật</Button>}
          </div>
          {relationships?.map(item => <p>- {item?.label} : {item?.patient?.full_name}</p>)}

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