import { useCallback, useRef, useState, useEffect } from "react";
import classNames from "classnames";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify"

import Select from "components/Select"
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
import {
  getPatientSource,
} from "services/api/patientSource";
import { BRANCH } from "constants/Authentication"

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
  const { query } = useParams();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [detailData, setDetailData] = useState();
  const [searchKey, setSearchKey] = useState(query);
  const [modalVisible, setModalVisible] = useState(false);
  const [slotInfo, setSlotInfo] = useState({});
  const fetchIdRef = useRef(0);
  const [patients, setPatients] = useState([]);
  const currentUser = useSelector((state) => state.user.currentUser);
  const [patientSource, setPatientSource] = useState();
  const [source, setSource] = useState();

  const getBranchDomain = () => {
		const branch = localStorage.getItem(BRANCH);
		switch (branch) {
		  case "q7":
			return "contact33";
			break;
		  case "q2":
			return "contact33";
			break;
		  case "binhduong":
			return "contact33";
			break;
		}
	}

	const getBranchUsername = () => {
		const branch = localStorage.getItem(BRANCH);
		switch (branch) {
		  case "q7":
			return "101";
			break;
		  case "q2":
			return "201";
			break;
		  case "binhduong":
			return "301";
			break;
		}
	}

	const getBranchPassword = () => {
		const branch = localStorage.getItem(BRANCH);
		switch (branch) {
		  case "q7":
			return "YUJDpbWb6d";
			break;
		  case "q2":
			return "yaGapxveRi";
			break;
		  case "binhduong":
			return "D6pVyi9ODx";
			break;
		}
	}

  useEffect(() => {
    ; (async () => {
      let config = {
        theme: 'default',
        callbacks: {
          register: (data) => {
            // Sự kiện xảy ra khi trạng thái kết nối tổng đài thay đổi
            console.log('register:', data);
          },
          connecting: (data) => {
            // Sự kiện xảy ra khi bắt đầu thực hiện cuộc gọi ra
            console.log('connecting:', data);
          },
          invite: (data) => {
            // navigate( '/patient-search/' + data.phone);
            setSearchKey(data.phone)
          },
          inviteRejected: (data) => {
            // Sự kiện xảy ra khi có cuộc gọi tới, nhưng bị tự động từ chối
            // trong khi đang diễn ra một cuộc gọi khác
            console.log('inviteRejected:', data);
          },
          ringing: (data) => {
            // Sự kiện xảy ra khi cuộc gọi ra bắt đầu đổ chuông
            console.log('ringing:', data);
          },
          accepted: (data) => {
            // Sự kiện xảy ra khi cuộc gọi vừa được chấp nhận
            console.log('accepted:', data);
          },
          incall: (data) => {
            // Sự kiện xảy ra mỗi 1 giây sau khi cuộc gọi đã được chấp nhận
            console.log('incall:', data);
          },
          acceptedByOther: (data) => {
            // Sự kiện dùng để kiểm tra xem cuộc gọi bị kết thúc
            // đã được chấp nhận ở thiết bị khác hay không
            console.log('acceptedByOther:', data);
          },
          ended: (data) => {
            // Sự kiện xảy ra khi cuộc gọi kết thúc
            console.log('ended:', data);
          },
          holdChanged: (status) => {
            // Sự kiện xảy ra khi trạng thái giữ cuộc gọi thay đổi
            console.log('on hold:', status);
          },
          saveCallInfo: (data) => {
            // let { callId, note, ...formData } = data;
            // Sự kiện xảy ra khi cuộc gọi đã có đổ chuông hoặc cuộc gọi tới, khi user có nhập note input mặc định hoặc form input custom
            console.log('on save call info:', data);
          },
          infoLastCall: (data) => {
            // Sự kiện xảy ra khi có bật options.showInfoLastCall và SDK có get được data cho số điện thoại đang gọi
            console.log('on found info last call:', data);
          },
        }
      };
      omiSDK.init(config, () => {
        omiSDK.register({
          domain: 'contact33',
          username: '404', // tương đương trường "sip_user" trong thông tin số nội bộ
          password: 'JobxGQqjYo'
        });
      });

      try {
        const res = await getPatientSource()
        const data = formatStrapiArr(res?.data);
        let rs = data.map(r => {
          r.label = r.label;
          r.value = r.value;
          return r;
        })

        rs.unshift({
          label: "Không",
        });

        setPatientSource(rs);
      } catch (error) { }
    })()
  }, [])

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await getListPatients(
          {
            pageSize: 15,
            page: pageIndex + 1,
          },
          {
            internal: {
              $ne: 'yes'
            }
          }
        );
        setPageCount(res?.data?.meta?.pagination?.pageCount)
        if (res.data) {
          let cnt = res.data.length;
          let patients = formatStrapiArr(res.data);
          setPatients(patients);
          if (cnt == 1) {
            setDetailData(patients[0])
          }
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    document.getElementById('customer-detail')?.scrollIntoView()
  }, [detailData])

  const fetchData = useCallback(
    async ({ pageSize, pageIndex }) => {
      const fetchId = ++fetchIdRef.current;
      setLoading(true);
      let filters = {
        internal: {
          $null: true,
        }
      };
      // if (searchKey?.length ) {
      filters = {
        $and: [
          {
            $or: [
              { full_name: { $containsi: searchKey } },
              { full_name_i: { $containsi: searchKey } },
              { uid: { $containsi: searchKey } },
              { email: { $containsi: searchKey } },
              { phone: { $containsi: searchKey } }
            ]
          },
          {
            patient_source: source?.id
          }
        ],
        internal: {
          $null: true,
        }
      }
      // }

      const res = await getListPatients(
        {
          pageSize: 15,
          page: pageIndex + 1,
        },
        filters,
        [
          "relationships",
          "relationships.patient",
          "membership_profile_file",
          "patient_source",
          "patient_source.image",
          "user",
          "remaining_services",
          "remaining_services.medical_service",
        ]
      )
      if (res.data) {
      }
      let data = formatStrapiArr(res.data);
      setPageCount(res?.data?.meta?.pagination?.pageCount)
      setData(data);
      setLoading(false);
      if (data.length == 1) {
        setDetailData(data[0])
      }

    },
    [patients, searchKey, source]
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
      title="Danh sách khách hàng"
    >
      <div className="w-full grid grid-cols-3 sm:grid-cols-1 items-center gap-x-9">
        <SearchInput
          placeholder="Tìm bằng ID / Tên / Email / SDT"
          className="flex-1"
          defaultValue={searchKey}
          onSearch={(value) => {
            dispatch(resetPageIndex())
            setSearchKey(removeVietnameseTones(value))
          }}
        />
        <div className="flex">
          <Select
            placeholder="Nguồn"
            label=""
            wrapperClassName="w-[400px]"
            name="patient_source"
            options={patientSource}
            value={source && patientSource?.find((s) => s.id === source.id)}
            onChange={(e) => {
              setSource(e);
            }}
          />
          {currentUser?.role?.type != "doctor"
            && currentUser?.role?.type != "nurse"
            && <Button
              className={"w-52 sm:m-auto mt-1"}
              onClick={() => {
                navigate("/patient/create");
              }}
            >
              Tạo bệnh nhân mới
            </Button>}
        </div>
      </div>

      <div className="mt-1">
      </div>
      <Modal contentClassName="bg-modal" visibleModal={modalVisible} showCloseButton={true} onClose={() => setModalVisible(false)}>
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
          "sm:block flex gap-x-2": detailData,
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

function removeVietnameseTones(str) {
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a")
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e")
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i")
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o")
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u")
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y")
  str = str.replace(/đ/g, "d")
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A")
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E")
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I")
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O")
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U")
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y")
  str = str.replace(/Đ/g, "D")
  // Some system encode vietnamese combining accent as individual utf-8 characters
  // Một vài bộ encode coi các dấu mũ, dấu chữ như một kí tự riêng biệt nên thêm hai dòng này
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, "") // ̀ ́ ̃ ̉ ̣  huyền, sắc, ngã, hỏi, nặng
  str = str.replace(/\u02C6|\u0306|\u031B/g, "") // ˆ ̆ ̛  Â, Ê, Ă, Ơ, Ư
  // Remove extra spaces
  // Bỏ các khoảng trắng liền nhau
  str = str.replace(/ + /g, " ")
  str = str.trim()
  // Remove punctuations
  // Bỏ dấu câu, kí tự đặc biệt
  str = str.replace(
    /!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g,
    " "
  )
  return str
}