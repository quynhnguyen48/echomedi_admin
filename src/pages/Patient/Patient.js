import { useCallback, useRef, useState, useEffect } from "react";
import classNames from "classnames";
import { useNavigate } from "react-router-dom";
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
import CustomersTable from './Components/CustomersTable';
import CustomerDetail from './CustomerDetail';

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

const Treatments = () => {
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

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await getListPatients();
        setPageCount(res?.data?.meta?.pagination?.pageCount)
        if (res.data) {
          setPatients(formatStrapiArr(res.data));
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const fetchData = useCallback(
    async ({ pageSize, pageIndex }) => {
      const fetchId = ++fetchIdRef.current;
      setLoading(true);
      // const key = new RegExp(searchKey, "i");
      // const users = searchKey?.length
      //   ? patients?.filter(
      //     (user) =>
      //       `${user?.full_name}`.search(key) > -1 ||
      //       user?.uid?.search(key) > -1 ||
      //       user?.email?.search(key) > -1 ||
      //       user?.phone?.search(key) > -1
      //   )
      //   : patients;
      let filters = {};
      if (searchKey?.length) {
        filters = {
          $or: [
            { full_name: { $containsi: searchKey } }, 
            { full_name_i: { $containsi: searchKey } }, 
            { uid: { $containsi: searchKey } },
            { email: {$containsi: searchKey }},
            { phone: {$containsi: searchKey }}
          ],
        }
      }

        const res = await getListPatients(
          {
            pageSize: 10,
            page: pageIndex + 1,
          },
          filters
        )
        if (res.data) {
        }

        console.log('ress', formatStrapiArr(res.data))

        setData(formatStrapiArr(res.data));
        setLoading(false);

      // if (users && fetchId === fetchIdRef.current) {
      //   const startRow = pageSize * pageIndex;
      //   const endRow = startRow + pageSize;
      //   setData(users.slice(startRow, endRow));
      //   setPageCount(Math.ceil(users.length / pageSize));
      //   setLoading(false);
      // }
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

  console.log('data', data)

  return (
    <Page
      title="Danh sách khách hàng"
    // rightContent={detailData && <TreatmentAnalytics data={detailData} />}
    >
      {/* <div className="">
        <Button
          onClick={() => {
            navigate("/patient/create");
          }}
        >
          Tạo bệnh nhân mới
        </Button>
      </div> */}
      <div className="w-full flex items-center gap-x-9">

        <SearchInput
          placeholder="Tìm khách hàng bằng ID / Tên / Email / SDT"
          className="flex-1"
          onSearch={(value) => {
            dispatch(resetPageIndex())
            setSearchKey(value)
          }}
        />
        <Button
          onClick={() => {
            navigate("/patient/create");
          }}
        >
          Tạo bệnh nhân mới
        </Button>
      </div>
      <div className="mt-4">

        {/* <Calendar
      selectable={true}
      onSelectEvent={(e) => {
        console.log(e);
        setModalVisible(true);
      }}
      onSelecting={() => alert(312321)}
      localizer={localizer}
      events={bookings}
      startAccessor="start"
      endAccessor="end"
      style={{ height: 500 }}
      onSelectSlot={(slotInfo) => {
        console.log('slotInfo asd', slotInfo)
        setSlotInfo(slotInfo);
        setModalVisible(true);
      }}
    /> */}
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
        {detailData && <CustomerDetail data={detailData} onToggleStatus={null} />}
      </div>

    </Page>
  );
};

export default Treatments;
