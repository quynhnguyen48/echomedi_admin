import { useCallback, useRef, useState, useEffect } from "react";
import classNames from "classnames";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux"
import { toast } from "react-toastify"

import Button from "components/Button";
import Icon from "components/Icon";
import Page from "components/Page";
import SearchInput from "components/SearchInput";
import { getTreatments, updateTreatment } from "services/api/treatment"
import { getMedicalRecords } from "services/api/medicalRecord";
import { formatStrapiArr, formatStrapiObj } from "utils/strapi";
import { resetPageIndex } from "slice/tableSlice"
import TreatmentsTable from "./Components/TreatmentsTable";
import TreatmentAnalytics from "./Components/TreatmentAnalytics";
import { getErrorMessage } from "../../utils/error";
import { Calendar, globalizeLocalizer, dateFnsLocalizer } from 'react-big-calendar'
import globalize from 'globalize'
import "react-big-calendar/lib/css/react-big-calendar.css";
import viVN from 'date-fns/locale/vi'
import format from 'date-fns/format'
import parse from 'date-fns/parse'
import startOfWeek from 'date-fns/startOfWeek'
import getDay from 'date-fns/getDay'
import Modal from "components/Modal2"
import TreatmentForm from "./Components/CustomersForm";
import { getListPatients } from "services/api/patient";
import { getBookingById } from "services/api/bookings";
import CustomersTable from './Components/CustomersTableToday';
import CustomerDetail from './CustomerDetail';
import CustomerDetailToday from './CustomerDetailToday';
import axios from "../../services/axios";
import { JWT_TOKEN, BRANCH } from "../../constants/Authentication"
import dayjs from 'dayjs';

const locales = {
  'vi': viVN,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

function addDays(date, days) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

const bookingStatus = ["scheduled", "confirmed", "waiting", "postpone", "finished", "cancelled"];
const translate = (t) => {
  switch (t) {
    case "scheduled":
      return "Đặt lịch"
      break;
    case "confirmed":
      return "Đã xác nhận"
      break;
    case "finished":
      return "Hoàn thành"
      break;
    case "cancelled":
      return "Huỷ"
      break;
    case "postpone": 
      return "Hoãn lịch"
      break;
    case "waiting":
      return "Đã đến"
      break;
  }
}

const Treatments = () => {
  const { status } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [detailData, setDetailData] = useState();
  const [searchKey, setSearchKey] = useState();
  const [modalVisible, setModalVisible] = useState(false);
  const [slotInfo, setSlotInfo] = useState({});
  const fetchIdRef = useRef(0);
  const [patients, setPatients] = useState([]);
  const [startDate, setStartDate] = 
    useState(dayjs().hour(7).minute(0).toDate());
  const [endDate, setEndDate] = useState(dayjs().hour(7).minute(0).add(1, 'day').toDate());

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await axios.post("/bookings/getBookingWithRange", {
          data: {
            startDate,
            endDate,
            status: status ? [status]: bookingStatus,
            branch: localStorage.getItem(BRANCH),
          }
        })
        .then(response => {
          let bks = response.data.bookings
          .filter(b => !!b.patient)
          .map(b => {
            if (b.patient) {
              b.patient.booking = b;
            }
            return b.patient;
          });
          console.log('bks', response.data.bookings)
          setData(response.data.bookings);
        }).finally(() => {
          // toast.dismiss(id);
        });
      } catch (error) {
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const fetchData = useCallback(
    ({ pageSize, pageIndex }) => {
      const fetchId = ++fetchIdRef.current;
      setLoading(true);
      const key = new RegExp(searchKey, "i");
      const users = searchKey?.length
        ? patients?.filter(
            (user) =>
              `${user?.firstName} ${user?.lastName}`.search(key) > -1 ||
              user?.code?.search(key) > -1 ||
              user?.email?.search(key) > -1 ||
              user?.phone?.search(key) > -1
          )
        : patients;

      if (users && fetchId === fetchIdRef.current) {
        const startRow = pageSize * pageIndex;
        const endRow = startRow + pageSize;
        setData(users.slice(startRow, endRow));
        setPageCount(Math.ceil(users.length / pageSize));
        setLoading(false);
      }
    },
    [patients, searchKey]
  );

  const togglePublish = useCallback(async () => {
    try {
      const res = await updateTreatment(detailData?.id,
        {
          publishedAt: !!detailData?.publishedAt ? null : (new Date()).toISOString()
        }
      )
      let updatedData = formatStrapiObj(res.data)
      setDetailData((oldDetailData) => ({
        ...oldDetailData,
        publishedAt: updatedData?.publishedAt,
      }))
      setData((oldData) => {
        const pos = oldData.findIndex(t => t.id === detailData?.id)
        if (pos > -1) {
          oldData[pos].publishedAt = updatedData?.publishedAt
        }
        return oldData
      })
      toast.success(`Treatment ${!!detailData?.publishedAt ? 'unpublished' : 'published'} successfully!`)
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }, [detailData?.id, detailData?.publishedAt])

  return (
    <Page
      title="Danh sách tiếp đón"
    >
      <div className="mt-4">
    </div>
    <Modal contentClassName="bg-modal" visibleModal={modalVisible} showCloseButton={true} onClose={() => setModalVisible(false)}>
    <TreatmentForm slotInfo={slotInfo} />
    <Button
          onClick={() => {
            navigate("/customers/create");
          }}
        >
          Nhập phiếu
        </Button>
    </Modal>
    <ul className="flex mb-4">
      <Button
        onClick={() => window.location.href = "/today-patient"}
        className="inline-block ml-2"
      >
        Tất cả
      </Button>
      <Button
        onClick={() => window.location.href = "/today-patient/scheduled"}
        className="inline-block ml-2 bg-[orange]"
      >
        {translate("scheduled")}
      </Button>
      <Button
        onClick={() => window.location.href = "/today-patient/confirmed"}
        className="inline-block ml-2 bg-[green]"
      >
                {translate("confirmed")}
      </Button>
      <Button
        onClick={() => window.location.href = "/today-patient/waiting"}
        className="inline-block ml-2 bg-[blue]"
      >
                {translate("waiting")}
      </Button>
      <Button
        onClick={() => window.location.href = "/today-patient/finished"}
        className="inline-block ml-2 bg-[purple]"
      >
                {translate("finished")}
      </Button>
      <Button
        onClick={() => window.location.href = "/today-patient/cancelled"}
        className="inline-block ml-2 bg-[grey]"
      >
                {translate("cancelled")}
      </Button>
      <Button
        onClick={() => window.location.href = "/today-patient/postpone"}
        className="inline-block ml-2 bg-[red]"
      >
                {translate("postpone")}
      </Button>
      
    </ul>
      <div
        className={classNames({
          "w-full": !detailData,
          "flex gap-x-6": detailData,
        })}
      >
        <CustomersTable
          data={data}
          loading={loading}
          pageCount={pageCount}
          activeRow={detailData}
          fetchData={fetchData}
          onClickRow={setDetailData}
        />
        {detailData && <CustomerDetailToday data={detailData} onToggleStatus={null}/>}
      </div>
      
    </Page>
  );
};

export default Treatments;
