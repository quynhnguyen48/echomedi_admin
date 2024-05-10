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
import { toast } from "react-toastify";
import axios from "../../services/axios";


const CustomerDetail = ({ data, onToggleStatus }) => {
  const navigate = useNavigate()
  const [totalDebt, setTotalDebt] = useState(0)
  const [accountBalance, setAccountBalance] = useState(0)
  const [openCustomerDebtDrawer, setOpenCustomerDebtDrawer] = useState(false)
  const [openCustomerAccountBalanceDrawer, setOpenCustomerAccountBalanceDrawer] = useState(true)
  const [listActiveMemberCard, setListActiveMemberCard] = useState([])


  const downloadMedicalRecord = () => {
    const toastId = toast.loading("Đang tải");
    axios.post("/product/downloadMedicalRecord", {
      "id": data.medical_record.id,
    }, {
      responseType: 'arraybuffer',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/pdf'
      }
    })
      .then((response) => {
        const b = new Blob([response.data], { type: 'application/pdf' });
        var url = window.URL.createObjectURL(b)
        window.open(url)
        setTimeout(() => window.URL.revokeObjectURL(url), 100)
      })
      .finally(() => {
        toast.dismiss(toastId);
      });
  }

  const downloadPDF = () => {
    const toastId = toast.loading("Đang tải");
    axios.post("/product/generatePhieuCLS", {
      // axios2.post("http://localhost:1337/api/product/generatePhieuCLS", {
      "id": data.booking.medical_record.id,
    }, {
      responseType: 'arraybuffer',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/pdf'
      }
    })
      .then((response) => {
        const b = new Blob([response.data], { type: 'application/pdf' });
        var url = window.URL.createObjectURL(b)
        window.open(url)
        setTimeout(() => window.URL.revokeObjectURL(url), 100)
      })
      .finally(() => {
        toast.dismiss(toastId);
      });
  }

  const generatePhieuChiDinh = () => {
    const toastId = toast.loading("Đang tải");
    axios.post("/product/generatePhieuChiDinh", {
      // axios2.post("http://localhost:1337/api/product/generatePhieuChiDinh", {
      "id": data.booking.medical_record.id,
    }, {
      responseType: 'arraybuffer',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/pdf'
      }
    })
      .then((response) => {
        const b = new Blob([response.data], { type: 'application/pdf' })
        var url = window.URL.createObjectURL(b)
        window.open(url)
        setTimeout(() => window.URL.revokeObjectURL(url), 100)
      })
      .finally(() => {
        toast.dismiss(toastId);
      });

    try {
      window.flutter_inappwebview.callHandler('generatePhieuChiDinh', data.booking.medical_record.id);
    } catch (e) {
      console.log('error download inapp view', e);
    }
  }

  useEffect(() => {
    if (data?.id) {
      ; (async () => {
        try {
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
    <div className="my-10 w-full">
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
        </div>
      </div>
      <div className="grid grid-cols-2 grid-flow-row gap-y-8 mt-4">
        <DataItem icon="user" title="Tên" value={`${data?.patient?.full_name}`} />
        <DataItem icon="message" title="Email" value={data?.patient?.email} />
        <DataItem icon="man" title="Giới tính" value={data?.patient?.gender == "male" ? "Nam" : "Nữ"} valueClassName="capitalize" />
        <DataItem
          icon="cake"
          title="Ngày sinh"
          value={dayjs(data?.patient?.birthday).format("DD MMMM, YYYY")}
        />
        <DataItem icon="call" title="Số điện thoại" value={data?.patient?.phone} />
        <DataItem
          icon="location"
          title="Địa chỉ"
          value={
            data?.patient?.address
              ? `${data?.patient?.address?.address || ""}, ${data?.patient?.address?.ward?.name || ""}, ${data?.patient?.address?.district?.name || ""
              }, ${data?.patient?.address?.province?.name || ""}`
              : "-"
          }
        />
        {data?.patient?.discount && JSON.parse(data?.patient?.discount) &&
          <DataItem icon="man" title="Khuyến mãi" value={JSON.parse(data?.patient?.discount)?.map(e => <p>{e.value}</p>)} />
        }
      </div>
      <div className="flex flex-col space-y-1 mt-4">
        {data.medical_record ? <Button
          onClick={() => {
            navigate(`/bookings/medical-records/${data.id}/view`);
          }}
        >
          Xem hồ sơ bệnh án
        </Button> :
          <Button
            icon={<Icon name="add-circle" className="fill-white" />}
            onClick={() => {
              navigate(`/bookings/medical-records/${data.id}/create`);
            }}
          >
            Tạo hồ sơ bệnh án
          </Button>}
          {data.medical_record ? <Button
          onClick={() => {
            navigate(`/bookings/medical-records/${data.id}/view`);
          }}
        >
          Xem hồ sơ bệnh án nhi
        </Button> :
          <Button
            icon={<Icon name="add-circle" className="fill-white" />}
            onClick={() => {
              navigate(`/bookings/medical-records-pediatrics/${data.id}/create`);
            }}
          >
            Tạo hồ sơ bệnh án nhi
          </Button>}
        {data.medical_record ? <Button
          onClick={() => {
            navigate(`/bookings/mental-health-medical-records/${data.id}/create`);
          }}
        >
          Xem hồ sơ bệnh án tâm lý
        </Button> :
          <Button
            icon={<Icon name="add-circle" className="fill-white" />}
            onClick={() => {
              navigate(`/bookings/mental-health-medical-records/${data.id}/create`);
            }}
          >
            Tạo hồ sơ bệnh án tâm lý
          </Button>}
          {data.medical_record ? <Button
          onClick={() => {
            navigate(`/bookings/pediatric-mental-health-medical-records/${data.id}/create`);
          }}
        >
          Xem hồ sơ bệnh án tâm lý nhi
        </Button> :
          <Button
            icon={<Icon name="add-circle" className="fill-white" />}
            onClick={() => {
              navigate(`/bookings/pediatric-mental-health-medical-records/${data.id}/create`);
            }}
          >
            Tạo hồ sơ bệnh án tâm lý nhi
          </Button>}
        {data.medical_record && <Button
          onClick={() => {
            navigate(`/bookings/medical-records/${data.id}/edit`);
          }}
        >
          Sửa hồ sơ bệnh án
        </Button>}
        {data.medical_record && <Button
          onClick={() => downloadMedicalRecord()}
        >
          Tải bệnh án
        </Button>}
        {data.medical_record && <Button
          onClick={() => generatePhieuChiDinh()}
        >
          Tải phiếu chỉ định
        </Button>}
      </div>
      <CustomerMedicalRecords
        userId={data?.patient?.id}
        openDrawer={openCustomerAccountBalanceDrawer}
        onClose={() => setOpenCustomerAccountBalanceDrawer(false)}
      />
    </div>
  )
}

export default CustomerDetail
