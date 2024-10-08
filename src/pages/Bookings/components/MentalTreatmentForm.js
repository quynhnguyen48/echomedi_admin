import { useCallback, useEffect, useState, useRef, useMemo } from "react"
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import * as yup from "yup"
import { yupResolver } from "@hookform/resolvers/yup"
import keys from "lodash/keys"
import classNames from "classnames"
import { toast } from "react-toastify"
import MDEditor from "@uiw/react-md-editor"
import { CUSTOMER_TAG, GENDER } from "constants/Customer"
import { REGION_DATA } from "constants/Regions"
import { getListUsersByRole } from "services/api/users"
import { uploadMedia } from "services/api/mediaLibrary"
import Input from "components/Input"
import Textarea from "components/Textarea"
import TagifyInput from "components/TagifyInput"
import Select from "components/Select"
import Button from "components/Button"
import Icon from "components/Icon"
import ChooseAssetsFromLibraryDrawer from "components/ChooseAssetsFromLibraryDrawer"
import { convertToKebabCase } from "utils/string"
import { getStrapiMedia } from "utils/media"
import { WEEK_DAYS } from "constants/Dates"
import { createNewTreatment, updateMedicalRecord, createOrUpdateTreatment } from "services/api/medicalRecord"
import { updateStatusBooking } from "services/api/bookings"
import { updatePatient } from "services/api/patient";
import { generateHoursInterval } from "utils/timeSlots"
import { getErrorMessage } from "utils/error"
import { formatStrapiArr, formatStrapiObj } from "utils/strapi"
import { getTreatmentCategories } from "services/api/treatmentCagegory"
import { useScrollToError } from "hooks/useScrollToError"
import axios from "../../../services/axios"
import axios2 from "axios"
import SearchInput from "components/SearchInput"
import Datepicker from "components/Datepicker"
import moment from "moment"
import PrescriptionModal from "./PrescriptionModal"
import PreviousMr from "./PreviousMr"
import AdditionalPrescriptionModal from "./AdditionalPrescriptionModal"
import TestResultsModal from "./TestResultsModal"
import Tagify from '@yaireo/tagify'
import '@yaireo/tagify/dist/tagify.css' // imports tagify SCSS file from within
import { useSelector } from "react-redux";
import { JWT_TOKEN, BRANCH } from "../../../constants/Authentication"
import { cloneDeep, flatten, groupBy } from "lodash"
const branch = localStorage.getItem(BRANCH);
import { getMedicalRecords } from "services/api/medicalRecord"
import { formatDate } from "utils/dateTime"

const PROCEDURE_ITEM_DEFAULT = {
  image: null,
  en: "",
  vi: "",
}

const RESULTS_ITEM_DEFAULT = {
  title: {
    en: "",
    vi: "",
  },
  images: [],
}

const MEMBERSHIP_PKGS = [
  {
    value: "gold",
    label: "Thành viên vàng",
    price: 8000000,
  },
  {
    value: "platinum",
    label: "Thành viên bạch kim",
    price: 16000000,
  },
  {
    value: "medical_provider",
    label: "Medical provider",
  },
  {
    value: "toddler",
    label: "Thành viên gói nhà trẻ",
    price: 3000000,
  },
];

const TreatmentForm = ({ data, user, readonly = false }) => {
  const navigate = useNavigate()
  const [visibleChooseAssetsFromLibraryDrawer, setVisibleChooseAssetsFromLibraryDrawer] =
    useState(false)
  const [imageType, setImageType] = useState(null)
  const [step, setStep] = useState(null)
  const [timeSlots, setTimeSlots] = useState([])
  const [treatmentCategories, setTreatmentCategories] = useState([])
  const [cliniqueServices, setCliniqueServices] = useState([]);
  const [medicalServices, setMedicalServices] = useState([])
  const [bundleServices, setBundleServices] = useState([])
  const [usedMedicalServices, setUsedMedicalServices] = useState([])
  const [usedCliniqueServices, setUsedCliniqueServices] = useState([])
  const [usedBundleMedicalServices, setUsedBundleMedicalServices] = useState([])
  const [filterBundleService, setFilterBundleService] = useState("")
  const [filterUsedBundleService, setFilterUsedBundleService] = useState("")
  const [filterService, setFilterService] = useState("")
  const [filterUsedService, setFilterUsedService] = useState("")
  const [filterCliniqueService, setFilterCliniqueService] = useState("")
  const [existServices, setExistServices] = useState({})
  const [total, setTotal] = useState(0)
  const [servicesData, setServicesData] = useState([])
  const [bundleServicesData, setBundleServicesData] = useState([])
  const [bookingDate, setBookingDate] = useState(null)
  const [bookingHour, setBookingHour] = useState("")
  const [doctorInCharge, setDoctorInCharge] = useState();
  const [counselorInCharge, setCounselorInCharge] = useState();
  const [cashierInCharge, setCashierInCharge] = useState();
  const [CCInCharge, setCCInCharge] = useState();
  const [nurseInCharge, setNurseInCharge] = useState();
  const [districtList, setDistrictList] = useState([])
  const [wardList, setWardList] = useState([])
  const [membershipPackage, setMembershipPackages] = useState([])
  const [loadingCustomers, setLoadingCustomers] = useState(false)
  const [customersData, setCustomersData] = useState([])
  const [CCData, setCCData] = useState([])
  const [cashierData, setCashierData] = useState([]);
  const [nurseData, setNurseData] = useState([])
  const [height, setHeight] = useState(data.height)
  const [weight, setWeight] = useState(data.weight)
  const [bmi, setBMI] = useState(data.bmi)
  const [bp1, setBP1] = useState(data.blood_pressure ?? '')
  const [bp2, setBP2] = useState(data.blood_pressure2 ?? '')
  const [visiblePrescriptionModal, setVisiblePrescriptionModal] = useState(false)
  const [visiblePreviousMr, setVisiblePreviousMr] = useState(false)
  const [activePreviousMr, setActivePreviousMr] = useState(0)
  const [visibleAdditionalPrescriptionModal, setVisibleAdditionalPrescriptionModal] = useState(false);
  const [visibleTestResultModal, setVisibleTestResultModal] = useState(false)
  const [tagifyWhitelist, setTagifyWhitelist] = useState();
  const inputElement = useRef();
  const currentUser = useSelector((state) => state.user.currentUser)
  const [selectedMembership, setSelectedMembership] = useState();
  const [references, setReferences] = useState([]);
  const [keHoachThamVan, setKeHoachThamVan] = useState([]);
  const [cacGiayToLienQuan, setCacGiayToLienQuan] = useState([]);
  const [searchTerms, setSearchTerms] = useState([]);
  const [searchData, setSearchData] = useState();
  const [previousMr, setPreviousMr] = useState([]);

  useEffect(() => {
    setMembershipPackages(MEMBERSHIP_PKGS);
  }, [])

  useEffect(() => {
    if (!currentUser) return;

    const templates = {
      tag: function (tagData) {
        try {
          return `<tag title='${tagData.value}' contenteditable='false' spellcheck="false" class='tagify__tag ${tagData.class ? tagData.class : ""}' ${this.getAttributes(tagData)}>
                      <x title='remove tag' class='tagify__tag__removeBtn'></x>
                      <div>
                          <span class='tagify__tag-text'>${tagData.value}</span>
                      </div>
                  </tag>`
        }
        catch (err) { }
      },

      dropdownItem: function (tagData) {
        try {
          return `<div ${this.getAttributes(tagData)} class='tagify__dropdown__item ${tagData.class ? tagData.class : ""}' >
                          <span>${tagData.searchBy.toLowerCase()}</span> |
                          <span>${tagData.value}</span>
                      </div>`
        }
        catch (err) { console.error(err) }
      }
    };
  }, [tagifyWhitelist]);

  const fetchData = useCallback(async () => {
    if (data?.patient?.id) {
      let filter = {
        patient: data.patient.id,
      }
      const res = await getMedicalRecords({ pageSize: 1000 }, filter)
      const preMr = formatStrapiArr(res.data)?.filter(p => p.uid != data.uid)
      setPreviousMr(preMr)
    }
  }, [data])

  const provincesList = REGION_DATA

  useEffect(() => {
    if (data) {
      if (!isNaN(data.total)) setTotal(data.total)
      if (data.bookingDate) {
        const bd = new Date(data.bookingDate)
        setBookingDate(bd)
        setBookingHour({ label: moment(bd).format("H:mm"), value: moment(bd).format("H:mm") })
      }
      if (data.patient.membership) {
        setSelectedMembership(MEMBERSHIP_PKGS.find(s => s.value == data.patient.membership));
      }

      loadData();
      fetchData();
    }
  }, [data])

  useEffect(() => {
    if (height != 0) {
      const newBMI = Math.round((weight / height / height) * 1000000, 2) / 100
      setBMI(newBMI)
    }
  }, [height, weight])

  const bookingHours = () => {
    let result = []
    for (let i = 0; i < 24; ++i) {
      result.push({
        value: `${i}:00`,
        label: `${i}:00`,
      })
      result.push({
        value: `${i}:30`,
        label: `${i}:30`,
      })
    }
    return result
  }

  const provinceFormatted = () => {
    return provincesList.map((province) => ({
      value: province.id,
      label: province.name,
    }))
  }

  const validationSchema = yup.object({
    // circuit: yup.number().required("Background image is required"),
    // temperature: yup.number(),
    // blood_pressure: yup.number(),
    // respiratory_rate: yup.number(),
    // height: yup.number(),
    // weight: yup.number(),
    // bmi: yup.number(),
    // spo2: yup.number(),
  })

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      session: data?.session || "",
      nguoi_lien_he_luc_khan_cap: data?.nguoi_lien_he_luc_khan_cap || "",
      cac_luong_gia_va_trac_nghiem_da_thuc_hien: data?.cac_luong_gia_va_trac_nghiem_da_thuc_hien || "",
      ket_qua_trac_nghiem: data?.ket_qua_trac_nghiem || "",
      ly_do_den_tham_van: data?.ly_do_den_tham_van || "",
      hanh_vi_quan_sat: data?.hanh_vi_quan_sat || "",
      mo_ta_trieu_chung: data?.mo_ta_trieu_chung || "",
      thong_tin_nen_tang_boi_canh_lien_quan: data?.thong_tin_nen_tang_boi_canh_lien_quan || "",
      yeu_to_khoi_phat: data?.yeu_to_khoi_phat || "",
      yeu_to_bao_ve: data?.yeu_to_bao_ve || "",
      yeu_to_kich_hoat: data?.yeu_to_kich_hoat || "",
      yeu_to_duy_tri: data?.yeu_to_duy_tri || "",
      anh_huong_toi_cuoc_song: data?.anh_huong_toi_cuoc_song || "",
      cach_giai_quyet_van_de_da_su_dung: data?.cach_giai_quyet_van_de_da_su_dung || "",
      nhu_cau_va_muc_tieu_tham_van: data?.nhu_cau_va_muc_tieu_tham_van || "",
      tom_tat_van_de: data?.tom_tat_van_de || "",
      ghi_chu_cua_cvtl: data?.ghi_chu_cua_cvtl || "",
      circuit: data?.circuit || "",
      temperature: data?.temperature || "",
      blood_pressure: data?.blood_pressure || "",
      blood_pressure2: data?.blood_pressure2 || "",
      blood_pressure_1: data?.blood_pressure_1 || "",
      blood_pressure2_1: data?.blood_pressure2_1 || "",
      respiratory_rate: data?.respiratory_rate || "",
      height: data?.height || "",
      weight: data?.weight || "",
      bmi: data?.bmi || "",
      spo2: data?.spo2 || "",
      results: data?.results,
      phone: data?.patient?.phone || "",
      email: data?.patient?.email || "",
      firstName: data?.patient?.firstName || "",
      lastName: data?.patient?.lastName || "",
      full_name: data?.patient?.full_name || "",
      gender: data?.patient?.gender || "",
      phone: data?.patient?.phone || "",
      status: data?.status || "",
      noi_khoa: data?.noi_khoa || "Chưa ghi nhận",
      ngoai_khoa: data?.ngoai_khoa || "Chưa ghi nhận",
      san_khoa: data?.san_khoa || "Chưa ghi nhận",
      tiem_chung: data?.tiem_chung || "Chưa ghi nhận",
      di_ung: data?.di_ung || "Chưa ghi nhận",
      thoi_quen: data?.thoi_quen || "Chưa ghi nhận",
      nguy_co_khac: data?.nguy_co_khac || "Chưa ghi nhận",
      van_de_khac: data?.van_de_khac || "Chưa ghi nhận",
      tien_can_gia_dinh: data?.tien_can_gia_dinh || "Chưa ghi nhận",
      tong_quat: data?.tong_quat || "Bệnh tỉnh, sinh hiệu ổn",
      tim_mach: data?.tim_mach || "Tim đều",
      ho_hap: data?.ho_hap || "Phổi trong",
      tieu_hoa_tiet_nieu: data?.tieu_hoa_tiet_nieu || "Bụng mềm",
      co_xuong_khop: data?.co_xuong_khop || "Chưa ghi nhận bất thường",
      than_kinh: data?.than_kinh || "Chưa ghi nhận bất thường",
      san_phu_khoa: data?.san_phu_khoa || "Chưa ghi nhận bất thường",
      mat_tai_mui_hong: data?.mat_tai_mui_hong || "Chưa ghi nhận bất thường",
      co_quan_khac: data?.co_quan_khac || "Chưa ghi nhận bất thường",
      cac_thang_diem_can_danh_gia: data?.cac_thang_diem_can_danh_gia || "Chưa ghi nhận bất thường",
      dinh_duong: data?.dinh_duong || "Chưa ghi nhận bất thường",
      ket_qua_cls: data?.ket_qua_cls || "",
      chan_doan: data?.chan_doan || "",
      reasons_to_get_hospitalized: isJson(data?.reasons_to_get_hospitalized) ? parseJson(data?.reasons_to_get_hospitalized) : data?.reasons_to_get_hospitalized,
      premise: isJson(data?.premise) ? parseJson(data?.premise) : data?.premise,
      past_medical_history: isJson(data?.past_medical_history) ? parseJson(data?.past_medical_history) : data?.past_medical_history,
      main_diagnose: isJson(data?.main_diagnose) ? parseJson(data?.main_diagnose) : data?.main_diagnose,
      other_diagnose: isJson(data?.other_diagnose) ? parseJson(data?.other_diagnose) : data?.other_diagnose,
      inquiry: isJson(data?.inquiry) ? parseJson(data?.inquiry) : data?.inquiry,
      examination: isJson(data?.examination) ? parseJson(data?.examination) : data?.examination,
      general_examination: isJson(data?.general_examination) ? parseJson(data?.general_examination) : data?.general_examination,
      treatment_regimen: isJson(data?.treatment_regimen) ? parseJson(data?.treatment_regimen) : data?.treatment_regimen,
      birthday: !!data?.patient?.birthday ? new Date(data?.patient?.birthday) : null,
      address: {
        province: data?.patient?.address?.province || null,
        district: data?.patient?.address?.district || null,
        ward: data?.patient?.address?.ward || null,
        address: data?.patient?.address?.address || "",
      },
      note: data?.note || "",
      cc_note: data?.medical_record?.data?.attributes?.cc_note || "",
    },
  })

  const {
    fields: procedureFields,
    append: procedureAppend,
    remove: procedureRemove,
  } = useFieldArray({ name: "procedure", control })

  const {
    fields: resultsFields,
    append: resultsAppend,
    remove: resultsRemove,
  } = useFieldArray({ name: "results", control })

  const categoryName = useWatch({ control: control, name: "name" })

  useEffect(() => {
    if (categoryName !== data?.name) {
      setValue("slug", convertToKebabCase(categoryName))
    }
  }, [categoryName, data?.name, setValue])

  const loadData = () => {
    let newExistServices = {};
    if (data.bundle_services) {
      const bundleServicesData_ = typeof data.bundle_services == 'string' ? JSON.parse(data.bundle_services) : data.bundle_services;
      setBundleServicesData(bundleServicesData_)
      setUsedBundleMedicalServices(bundleServicesData_)

      bundleServicesData_.forEach(s => {
        if (Array.isArray(s.attributes?.medical_services)) {
          s.attributes?.medical_services?.forEach(ss => {
            newExistServices[ss.id] = true;
          })
        }
      });

    }
    if (data.services) {
      const servicesData_ = typeof data.services == 'string' ? JSON.parse(data.services) : data.services;
      setServicesData(servicesData_)
      setUsedMedicalServices(servicesData_)

      servicesData_.forEach(s => newExistServices[s.id] = true);

    }
    if (data.clinique_services) {
      const cliniqueServicesData = data.clinique_services;
      cliniqueServicesData.forEach(s => newExistServices[s.id] = true);
      setUsedCliniqueServices(cliniqueServicesData);
      setCliniqueServices(cliniqueServicesData);
    }

    if (data.doctor_in_charge) {
      setDoctorInCharge({
        value: data.doctor_in_charge.data?.id,
        label: data.doctor_in_charge.data?.attributes?.patient?.data?.attributes?.full_name,
      })
    }

    if (data.counselor_in_charge) {
      setCounselorInCharge({
        value: data.counselor_in_charge.data?.id,
        label: data.counselor_in_charge.data?.attributes?.patient?.data?.attributes?.full_name,
      })
    }

    if (data.cc_in_charge) {
      setCCInCharge({
        value: data.cc_in_charge.data?.id,
        label: data.cc_in_charge.data?.attributes?.patient?.data?.attributes?.full_name,
      })
    }

    if (data.nurse_in_charge) {
      setNurseInCharge({
        value: data.nurse_in_charge.data?.id,
        label: data.nurse_in_charge.data?.attributes?.patient?.data?.attributes?.full_name,
      })
    }

    if (data.cashier_in_charge) {
      setCashierInCharge({
        value: data.cashier_in_charge.data?.id,
        label: data.cashier_in_charge.data?.attributes?.patient?.data?.attributes?.full_name,
      })
    }

    if (data?.references) {
      setReferences(data.references);
    }

    if (data?.ke_hoach_tham_van) {
      setKeHoachThamVan(data.ke_hoach_tham_van);
    }

    if (data?.cac_giay_to_lien_quan) {
      setCacGiayToLienQuan(data.cac_giay_to_lien_quan);
    }

    setExistServices(newExistServices);
    loadTagifyWhitelist();
    loadMedicalServices2();
    loadDoctors();
    loadBundleServices()
      ; (async () => {
        try {
          const res = await getTreatmentCategories()
          if (res.data) {
            const categories = formatStrapiArr(res.data)
            setTreatmentCategories(
              categories.map((category) => ({
                value: category.id,
                label: category.title.en,
              }))
            )
          }
        } catch (error) { }
      })()
  }

  useEffect(() => {
    loadMedicalServices2();
    loadBundleServices();
  }, [selectedMembership])

  const handleAssetsSelected = (assets) => {
    switch (imageType) {
      case "background":
        setValue("background", assets)
        break
      case "thumbnail":
        setValue("thumbnail", assets)
        break
      case "areas":
        setValue("areaImage", assets)
        break
      case "highlight":
        setValue(`highlight[${step}].icon`, assets)
        break
      case "procedure":
        setValue(`procedure[${step}].image`, assets)
        break
      case "results":
        setValue(`results[${step}].images`, assets)
        break
      default:
        break
    }
  }

  const generateTimeSlots = () => {
    const interval = getValues("interval")?.split(":")
    const intervalMinutes = interval?.[0] * 60 + interval?.[1] * 1

    const dayTimeStart = getValues("dayTime.start")?.split(":")
    const dayTimeStartMinutes = dayTimeStart?.[0] * 60 + dayTimeStart?.[1] * 1
    const dayTimeEnd = getValues("dayTime.end")?.split(":")
    const dayTimeEndMinutes = dayTimeEnd?.[0] * 60 + dayTimeEnd?.[1] * 1
    const dayTimeArr = generateHoursInterval(
      dayTimeStartMinutes,
      dayTimeEndMinutes,
      intervalMinutes
    )
    let dayTimeSlots = []
    for (let i = 0; i < dayTimeArr.length - 1; i++) {
      dayTimeSlots.push(`${dayTimeArr[i]} - ${dayTimeArr[i + 1]}`)
    }

    const nightTimeStart = getValues("nightTime.start")?.split(":")
    const nightTimeStartMinutes = nightTimeStart?.[0] * 60 + nightTimeStart?.[1] * 1
    const nightTimeEnd = getValues("nightTime.end")?.split(":")
    const nightTimeEndMinutes = nightTimeEnd?.[0] * 60 + nightTimeEnd?.[1] * 1
    const nightTimeArr = generateHoursInterval(
      nightTimeStartMinutes,
      nightTimeEndMinutes,
      intervalMinutes
    )
    let nightTimeSlots = []
    for (let i = 0; i < nightTimeArr.length - 1; i++) {
      nightTimeSlots.push(`${nightTimeArr[i]} - ${nightTimeArr[i + 1]}`)
    }

    setTimeSlots([...dayTimeSlots, ...nightTimeSlots])
  }

  const removeImageItemResults = (images, index, item) => {
    const imagePos = images.findIndex((i) => i.id === item.id)
    const newImages = images
    imagePos === -1 ? newImages.push(item) : newImages.splice(imagePos, 1)
    setValue(`results[${index}].images`, newImages, { shouldValidate: true })
  }

  const exportInvoice = () => {
    axios
      .post("/bookings/exportInvoice", {
        id: data?.id,
      })
      .then((response) => {
        navigate("/invoices");
      })
      .finally(() => {
      })
  }

  const downloadPDF = () => {
    const toastId = toast.loading("Đang tải")
    const patient = data.patient
    axios
      .post(
        "/product/downloadMedicalRecord",
        {
          id: data.medical_record?.data?.id
        },
        {
          responseType: "arraybuffer",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/pdf",
          },
        }
      )
      .then((response) => {
        const b = new Blob([response.data], { type: "application/pdf" })
        var url = window.URL.createObjectURL(b)
        window.open(url)
        setTimeout(() => window.URL.revokeObjectURL(url), 100)
      })
      .finally(() => {
        toast.dismiss(toastId)
      })
  }

  const downloadShortenPDF = () => {
    const toastId = toast.loading("Đang tải")
    const patient = data.patient
    axios
      .post(
        "/product/downloadShortenMedicalRecord",
        {
          id: data.medical_record?.data?.id
        },
        {
          responseType: "arraybuffer",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/pdf",
          },
        }
      )
      .then((response) => {
        const b = new Blob([response.data], { type: "application/pdf" })
        var url = window.URL.createObjectURL(b)
        window.open(url)
        setTimeout(() => window.URL.revokeObjectURL(url), 100)
      })
      .finally(() => {
        toast.dismiss(toastId)
      })
  }

  const downloadShortenPDFV2 = () => {

    const toastId = toast.loading("Đang tải")
    const patient = data.patient
    axios
      .post(
        "/product/downloadShortenMedicalRecordV2",
        {
          id: data.medical_record?.data?.id
        },
        {
          responseType: "arraybuffer",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/pdf",
          },
        }
      )
      .then((response) => {
        const b = new Blob([response.data], { type: "application/pdf" })
        var url = window.URL.createObjectURL(b)
        window.open(url)
        setTimeout(() => window.URL.revokeObjectURL(url), 100)
      })
      .finally(() => {
        toast.dismiss(toastId)
      })

    try {
      window.flutter_inappwebview.callHandler('downloadMedicalRecord', data.medical_record?.data?.id);
    } catch (e) {
      console.log('error download inapp view', e);
    }
  }

  const loadTagifyWhitelist = () => {
    axios2
      .get("https://api.echomedi.com/api/tagify-whitelist")
      .then((response) => {
        setTagifyWhitelist(response.data.data.attributes.data);
      })
      .finally(() => {
      })
  }

  const loadDoctors = () => {
    if (currentUser?.role?.type == "counselor") {
      setCustomersData([{
        value: currentUser?.id,
        label: `${currentUser?.patient?.full_name}`,
      }]);
    } else {
      setCustomersData([]);
    }

    if (currentUser?.role?.type == "care_concierge") {
      setCCData([{
        value: currentUser?.id,
        label: `${currentUser?.patient?.full_name}`,
      }]);
    } else {
      setCCData([]);
    }

    if (currentUser?.role?.type == "nurse") {
      setNurseData([{
        value: currentUser?.id,
        label: `${currentUser?.patient?.full_name}`,
      }]);
    } else {
      setNurseData([]);
    }

    setCashierData([
      {
        value: currentUser?.id,
        label: `${currentUser?.patient?.full_name}`,
      }
    ])
  }

  const loadMedicalServices2 = () => {
    let monthlyGold = [];
    let yearlyGold = [];
    console.log('loadMedicalServices2')
    axios2
      .get("https://api.echomedi.com/api/medical-service/getGoldMedicalServices/" + data.patient.id + "/" + selectedMembership?.value)
      .then((response) => {
        const services = response.data.data;
        let ms = services.filter(s => s.attributes?.group_service != "Khám lâm sàng" && s.attributes?.is_mental_health_service == true);
        ms = ms.map(s => {

          if (Array.isArray(s.attributes["Locations"])) {
            s.attributes["Locations"].forEach(sl => {
              if (sl["location"] == branch && !s.attributes.membership_gold) {
                s.attributes["disabled"] = sl["disabled"];
                if (Number.isInteger(sl["price"])) {
                  s.attributes["price"] = sl["price"];
                } else {
                  s.attributes["price"] = parseInt(sl["price"]);
                }
              }
            })
          }

          if (s.attributes["membership_discount"]) {
            if ((data.patient.membership == "gold" || selectedMembership?.value == "gold") && s.attributes["membership_discount"].gold_percentage && !s.attributes["membership_gold"]) {
              s.attributes["original_price"] = s.attributes["price"];
              s.attributes["discount_note"] = "Thành viên vàng";
              s.attributes["discount_percentage"] = s.attributes["membership_discount"].gold_percentage;
              s.attributes["price"] = s.attributes["price"] * (100 - s.attributes["membership_discount"].gold_percentage) / 100;
            }
            else if ((data.patient.membership == "platinum" || selectedMembership?.value == "platinum") && s.attributes["membership_discount"].platinum_percentage && !s.attributes["membership_gold"]) {
              s.attributes["discount_note"] = "Thành viên bạch kim";
              s.attributes["original_price"] = s.attributes["price"];
              s.attributes["discount_percentage"] = s.attributes["membership_discount"].platinum_percentage;
              s.attributes["price"] = s.attributes["price"] * (100 - s.attributes["membership_discount"].platinum_percentage) / 100;
            }
            else if ((selectedMembership?.value == "medical_provider" || data.patient.membership == "medical_provider") && s.attributes["membership_discount"].medical_provider_percentage && !s.attributes["membership_gold"]) {
              s.attributes["discount_note"] = "Thành viên Medical Provider";
              s.attributes["original_price"] = s.attributes["price"];
              s.attributes["discount_percentage"] = s.attributes["membership_discount"].medical_provider_percentage;
              s.attributes["price"] = s.attributes["price"] * (100 - s.attributes["membership_discount"].medical_provider_percentage) / 100;
            }
            else if ((selectedMembership?.value == "medical_provider_gold" || data.patient.membership == "medical_provider_gold") && s.attributes["membership_discount"].medical_provider_gold_percentage && !s.attributes["membership_gold"]) {
              s.attributes["discount_note"] = "Thành viên Medical Provider GOLD";
              s.attributes["original_price"] = s.attributes["price"];
              s.attributes["discount_percentage"] = s.attributes["membership_discount"].medical_provider_gold_percentage;
              s.attributes["price"] = s.attributes["price"] * (100 - s.attributes["membership_discount"].medical_provider_gold_percentage) / 100;
            }
            else if ((selectedMembership?.value == "medical_provider_platinum" || data.patient.membership == "medical_provider_platinum") && s.attributes["membership_discount"].medical_provider_platinum_percentage && !s.attributes["membership_gold"]) {
              s.attributes["discount_note"] = "Thành viên Medical Provider PLATINUM";
              s.attributes["original_price"] = s.attributes["price"];
              s.attributes["discount_percentage"] = s.attributes["membership_discount"].medical_provider_platinum_percentage;
              s.attributes["price"] = s.attributes["price"] * (100 - s.attributes["membership_discount"].medical_provider_platinum_percentage) / 100;
            }
          }

          return s;
        });

        ms = ms.filter(s => !s.attributes["disabled"]);

        let cs = services.filter(s => s.attributes.group_service == "Khám lâm sàng");
        cs = cs.map(s => {
          if (Array.isArray(s.attributes["Locations"])) {
            s.attributes["Locations"].forEach(sl => {
              if (sl["location"] == branch && !s.attributes.membership_gold) {
                s.attributes["disabled"] = sl["disabled"];
                s.attributes["price"] = parseInt(sl["price"]);
              }
            })
          }
          if (s.attributes["membership_discount"]) {
            if ((data.patient.membership == "gold" || selectedMembership?.value == "gold") && s.attributes["membership_discount"].gold_percentage && !s.attributes["membership_gold"]) {
              s.attributes["original_price"] = s.attributes["price"];
              s.attributes["discount_note"] = "Thành viên vàng";
              s.attributes["discount_percentage"] = s.attributes["membership_discount"].gold_percentage;
              s.attributes["price"] = s.attributes["price"] * (100 - s.attributes["membership_discount"].gold_percentage) / 100;
            }
            else if ((data.patient.membership == "platinum" || selectedMembership?.value == "platinum") && s.attributes["membership_discount"].platinum_percentage && !s.attributes["membership_gold"]) {
              s.attributes["discount_note"] = "Thành viên bạch kim";
              s.attributes["original_price"] = s.attributes["price"];
              s.attributes["discount_percentage"] = s.attributes["membership_discount"].platinum_percentage;
              s.attributes["price"] = s.attributes["price"] * (100 - s.attributes["membership_discount"].platinum_percentage) / 100;
            }
            else if ((selectedMembership?.value == "medical_provider" || data.patient.membership == "medical_provider") && s.attributes["membership_discount"].medical_provider_percentage && !s.attributes["membership_gold"]) {
              s.attributes["discount_note"] = "Thành viên Medical Provider";
              s.attributes["original_price"] = s.attributes["price"];
              s.attributes["discount_percentage"] = s.attributes["membership_discount"].medical_provider_percentage;
              s.attributes["price"] = s.attributes["price"] * (100 - s.attributes["membership_discount"].medical_provider_percentage) / 100;
            }
            else if ((selectedMembership?.value == "medical_provider_gold" || data.patient.membership == "medical_provider_gold") && s.attributes["membership_discount"].medical_provider_gold_percentage && !s.attributes["membership_gold"]) {
              s.attributes["discount_note"] = "Thành viên Medical Provider GOLD";
              s.attributes["original_price"] = s.attributes["price"];
              s.attributes["discount_percentage"] = s.attributes["membership_discount"].medical_provider_gold_percentage;
              s.attributes["price"] = s.attributes["price"] * (100 - s.attributes["membership_discount"].medical_provider_gold_percentage) / 100;
            }
            else if ((selectedMembership?.value == "medical_provider_platinum" || data.patient.membership == "medical_provider_platinum") && s.attributes["membership_discount"].medical_provider_platinum_percentage && !s.attributes["membership_gold"]) {
              s.attributes["discount_note"] = "Thành viên Medical Provider PLATINUM";
              s.attributes["original_price"] = s.attributes["price"];
              s.attributes["discount_percentage"] = s.attributes["membership_discount"].medical_provider_platinum_percentage;
              s.attributes["price"] = s.attributes["price"] * (100 - s.attributes["membership_discount"].medical_provider_platinum_percentage) / 100;
            }
          }
          return s;
        });
        cs = cs.filter(s => !s.attributes["disabled"]);
        if (!data.services) {
          setMedicalServices(ms);
          setCliniqueServices(cs);
        } else {
          const servicesData = typeof data.services == 'string' ? JSON.parse(data.services) : data.services;
          const cliniqueServicesData = data.clinique_services;
          const usedIdMedicalServices = servicesData.map((ud) => ud.id)
          const usedIdCliniqueServices = cliniqueServicesData?.map((ud) => ud.id) ?? [];
          ms = ms.filter(s => usedIdMedicalServices?.indexOf(s.id) == -1);
          cs = cs.filter(s => usedIdCliniqueServices?.indexOf(s.id) == -1);
          setMedicalServices(ms);
          setCliniqueServices(cs);
        }
      })
      .finally(() => {
      })
  }

  const loadMedicalServices = () => {
    axios2
      .get("https://api.echomedi.com/api/medical-services?pagination[pageSize]=1000&is_mental_health_service=true")
      .then((response) => {
        if (!data.services) {
          setMedicalServices(response.data.data)
        } else {
          const servicesData = typeof data.services == 'string' ? JSON.parse(data.services) : data.services;
          const usedIdMedicalServices = servicesData.map((ud) => ud.id)
          setMedicalServices(
            response.data.data.filter((m) => usedIdMedicalServices.indexOf(m.id) == -1)
          )
        }
      })
      .finally(() => {
        // toast.dismiss(id)
      })
  }

  const loadBundleServices = () => {
    axios2
      .get("https://api.echomedi.com/api/service-bundle/getGoldBundleServices/" + data.patient.id + "/" + selectedMembership?.value)
      .then((response) => {
        if (!data.bundle_services) {
          let ms = response.data.data;
          ms = ms.map(s => {
            if (Array.isArray(s.attributes["Locations"])) {
              s.attributes["Locations"].forEach(sl => {
                if (sl["location"] == branch && !s.attributes.membership_gold) {
                  s.attributes["disabled"] = sl["disabled"];
                  s.attributes["price"] = parseInt(sl["price"]);
                }
              })
            }

            if (s.attributes["membership_discount"] && !s.attributes["membership_gold"]) {
              if ((selectedMembership?.value == "gold" || data.patient.membership == "gold") && s.attributes["membership_discount"].gold_percentage) {
                s.attributes["original_price"] = s.attributes["price"];
                s.attributes["discount_note"] = "Thành viên vàng";
                s.attributes["discount_percentage"] = s.attributes["membership_discount"].gold_percentage;
                s.attributes["price"] = s.attributes["price"] * (100 - s.attributes["membership_discount"].gold_percentage) / 100;
              } else if ((selectedMembership?.value == "platinum" || data.patient.membership == "platinum") && s.attributes["membership_discount"].platinum_percentage) {
                s.attributes["discount_note"] = "Thành viên bạch kim";
                s.attributes["original_price"] = s.attributes["price"];
                s.attributes["discount_percentage"] = s.attributes["membership_discount"].platinum_percentage;
                s.attributes["price"] = s.attributes["price"] * (100 - s.attributes["membership_discount"].platinum_percentage) / 100;
              } else if ((selectedMembership?.value == "medical_provider" || data.patient.membership == "medical_provider") && s.attributes["membership_discount"].medical_provider_percentage) {
                s.attributes["discount_note"] = "Thành viên Medical Provider";
                s.attributes["original_price"] = s.attributes["price"];
                s.attributes["discount_percentage"] = s.attributes["membership_discount"].medical_provider_percentage;
                s.attributes["price"] = s.attributes["price"] * (100 - s.attributes["membership_discount"].medical_provider_percentage) / 100;
              } else if ((selectedMembership?.value == "infant" || data.patient.membership == "infant") && s.attributes["membership_discount"].infant_percentage) {
                s.attributes["discount_note"] = "Thành viên gói nhũ nhi";
                s.attributes["original_price"] = s.attributes["price"];
                s.attributes["discount_percentage"] = s.attributes["membership_discount"].infant_percentage;
                s.attributes["price"] = s.attributes["price"] * (100 - s.attributes["membership_discount"].infant_percentage) / 100;
              } else if ((selectedMembership?.value == "toddler" || data.patient.membership == "toddler") && s.attributes["membership_discount"].toddler_percentage) {
                s.attributes["discount_note"] = "Thành viên gói nhà trẻ";
                s.attributes["original_price"] = s.attributes["price"];
                s.attributes["discount_percentage"] = s.attributes["membership_discount"].toddler_percentage;
                s.attributes["price"] = s.attributes["price"] * (100 - s.attributes["membership_discount"].infant_percentage) / 100;
              } else if ((selectedMembership?.value == "preschool_school_age" || data.patient.membership == "preschool_school_age") && s.attributes["membership_discount"].preschool_school_age_percentage) {
                s.attributes["discount_note"] = "Thành viên gói học đường";
                s.attributes["original_price"] = s.attributes["price"];
                s.attributes["discount_percentage"] = s.attributes["membership_discount"].preschool_school_age_percentage;
                s.attributes["price"] = s.attributes["price"] * (100 - s.attributes["membership_discount"].preschool_school_age_percentage) / 100;
              }
            }

            return s;
          });
          ms = ms.filter(s => !s.attributes["disabled"]);

          setBundleServices(ms)
        } else {
          const bundleServicesData_ = typeof data.bundle_services == 'string' ? JSON.parse(data.bundle_services) : data.bundle_services;
          const usedIdMedicalServices = bundleServicesData_.map((ud) => ud.id)
          let ms = response.data.data;
          ms = ms.map(s => {
            if (Array.isArray(s.attributes["Locations"]) && !s.attributes["membership_gold"]) {
              s.attributes["Locations"].forEach(sl => {
                if (sl["location"] == branch) {
                  s.attributes["disabled"] = sl["disabled"];
                  s.attributes["price"] = parseInt(sl["price"]);
                }
              })
            }

            if (s["id"] == 42) console.log('selectedMembership', selectedMembership, s)

            if (s.attributes["membership_discount"] && !s.attributes["membership_gold"]) {
              if ((selectedMembership?.value == "gold" || data.patient.membership == "gold") && s.attributes["membership_discount"].gold_percentage) {
                s.attributes["original_price"] = s.attributes["price"];
                s.attributes["discount_note"] = "Thành viên vàng";
                s.attributes["discount_percentage"] = s.attributes["membership_discount"].gold_percentage;
                s.attributes["price"] = s.attributes["price"] * (100 - s.attributes["membership_discount"].gold_percentage) / 100;
              } else if ((selectedMembership?.value == "platinum" || data.patient.membership == "platinum") && s.attributes["membership_discount"].platinum_percentage) {
                s.attributes["discount_note"] = "Thành viên bạch kim";
                s.attributes["original_price"] = s.attributes["price"];
                s.attributes["discount_percentage"] = s.attributes["membership_discount"].platinum_percentage;
                s.attributes["price"] = s.attributes["price"] * (100 - s.attributes["membership_discount"].platinum_percentage) / 100;
              } else if ((selectedMembership?.value == "medical_provider" || data.patient.membership == "medical_provider") && s.attributes["membership_discount"].medical_provider_percentage) {
                s.attributes["discount_note"] = "Thành viên Medical Provider";
                s.attributes["original_price"] = s.attributes["price"];
                s.attributes["discount_percentage"] = s.attributes["membership_discount"].medical_provider_percentage;
                s.attributes["price"] = s.attributes["price"] * (100 - s.attributes["membership_discount"].medical_provider_percentage) / 100;
              } else if ((selectedMembership?.value == "infant" || data.patient.membership == "infant") && s.attributes["membership_discount"].infant_percentage) {
                s.attributes["discount_note"] = "Thành viên gói nhũ nhi";
                s.attributes["original_price"] = s.attributes["price"];
                s.attributes["discount_percentage"] = s.attributes["membership_discount"].infant_percentage;
                s.attributes["price"] = s.attributes["price"] * (100 - s.attributes["membership_discount"].infant_percentage) / 100;
              } else if ((selectedMembership?.value == "toddler" || data.patient.membership == "toddler") && s.attributes["membership_discount"].toddler_percentage) {
                s.attributes["discount_note"] = "Thành viên gói nhà trẻ";
                s.attributes["original_price"] = s.attributes["price"];
                s.attributes["discount_percentage"] = s.attributes["membership_discount"].toddler_percentage;
                s.attributes["price"] = s.attributes["price"] * (100 - s.attributes["membership_discount"].infant_percentage) / 100;
              } else if ((selectedMembership?.value == "preschool_school_age" || data.patient.membership == "preschool_school_age") && s.attributes["membership_discount"].preschool_school_age_percentage) {
                s.attributes["discount_note"] = "Thành viên gói học đường";
                s.attributes["original_price"] = s.attributes["price"];
                s.attributes["discount_percentage"] = s.attributes["membership_discount"].preschool_school_age_percentage;
                s.attributes["price"] = s.attributes["price"] * (100 - s.attributes["membership_discount"].preschool_school_age_percentage) / 100;
              }
            }

            return s;
          });
          ms = ms.filter(s => !s.attributes["disabled"]);
          setBundleServices(
            ms.filter((m) => usedIdMedicalServices.indexOf(m.id) == -1)
          )
        }
      })
      .finally(() => {
        // toast.dismiss(id)
      })
  }

  const addMedicalService = (m) => {
    if (m.id in existServices) {
      toast.error("Không thể thêm dịch vụ này vì bị trùng. " + m.attributes.label)
    } else {
      let a = [...usedMedicalServices]
      a.concat(m)
      a.push(m)
      setUsedMedicalServices(a)

      let newExistServices = { ...existServices }
      newExistServices[m.id] = true
      setExistServices(newExistServices)

      let b = [...medicalServices]
      b = b.filter((el) => el.id != m.id)
      setMedicalServices(b)

      const newTotal = total + m.attributes.price
      if (!isNaN(newTotal)) setTotal(newTotal)
    }
  }

  const addCliniqueService = (m) => {
    if (m.id in existServices) {
      toast.error("Không thể thêm dịch vụ này vì bị trùng. " + m.label)
    } else {
      let a = [...usedCliniqueServices]
      a.concat(m)
      a.push(m)
      setUsedCliniqueServices(a)

      let newExistServices = { ...existServices }
      newExistServices[m.id] = true
      setExistServices(newExistServices)

      let b = [...cliniqueServices]
      b = b.filter((el) => el.id != m.id)
      setCliniqueServices(b)


      const newTotal = total + m.attributes.price
      if (!isNaN(newTotal)) setTotal(newTotal)
    }
  }

  const showProductDetail = (p) => {
    toast.info(
      <div>
        <p>Gói dược {p.label} gồm: </p>
        {p.medicines.map((s, i) => <p> {i + 1}. {s.label}</p>)}
        {/* {m.attributes.medical_services.map((a) => (
          <p>{a.label}</p>

        ))} */}
      </div>,
      { progress: 1, className: "sm:w-full w-[500px] sm:left-0 left-[-177px]" }
    )
  }

  const addToPrescriptions = (p) => {
    axios
      .post("medical-record/addProduct", {
        id: data.medical_record?.data?.id,
        productId: p.id
      })
      .then((response) => {
        toast.success("Thêm gói dược vào đơn thuốc");
        setVisibleAdditionalPrescriptionModal(true);
      })
      .finally(() => {
      })
  }

  const addBundleMedicalServiceById = (id) => {
    console.log('addBundleMedicalServiceById', id, bundleServices)
    const bs = bundleServices.find(b => b.id == id);
    if (usedBundleMedicalServices.find(us => us.id == id)) {
      const bs = usedBundleMedicalServices.find(b => b.id == id);
      removeBundleMedicalService(bs);
    } else {
      addBundleMedicalService(bs);
    }
  }

  const addBundleMedicalService = (m) => {
    const ms = m.attributes.medical_services
    const exist = ms.some((s) => s.id in existServices)


    if (exist) {
      toast.error(
        <div>
          <p>Không thể thêm dịch vụ này vị bị trùng</p>
          {ms.filter(s => s.id in existServices).map(s => <p>{s.label}</p>)}
          {/* {m.attributes.medical_services.map((a) => (
            <p>{a.label}</p>

          ))} */}
        </div>,
        { progress: 1, className: "sm:w-full w-[500px] sm:left-0 left-[-177px]" }
      )
    } else {
      let newExistServices = { ...existServices }
      ms.forEach((s) => (newExistServices[s.id] = true))
      setExistServices(newExistServices)

      let a = [...usedBundleMedicalServices]
      a.concat(m)
      a.push(m)
      setUsedBundleMedicalServices(a)

      let b = [...bundleServices]
      b = b.filter((el) => el.id != m.id)
      setBundleServices(b)

      const newTotal = total + m.attributes.price
      if (!isNaN(newTotal)) setTotal(newTotal)
    }
  }

  const handleSearchBundleService = (e) => {
    setFilterBundleService(e.target.value)
  }

  const removeMedicalService = (m) => {
    let newExistServices = { ...existServices }
    delete newExistServices[m.id]
    setExistServices(newExistServices)

    let a = [...medicalServices]
    a.concat(m)
    a.push(m)
    setMedicalServices(a)

    let b = [...usedMedicalServices]
    b = b.filter((el) => el.id != m.id)
    setUsedMedicalServices(b)

    const newTotal = total - m.attributes.price
    if (!isNaN(newTotal)) setTotal(newTotal)
  }

  const removeCliniqueService = (m) => {
    let newExistServices = { ...existServices }
    delete newExistServices[m.id]
    setExistServices(newExistServices)

    let a = [...cliniqueServices]
    a.concat(m)
    a.push(m)
    setCliniqueServices(a)

    let b = [...usedCliniqueServices]
    b = b.filter((el) => el.id != m.id)
    setUsedCliniqueServices(b)

    const newTotal = total - m.attributes.price
    if (!isNaN(newTotal)) setTotal(newTotal)
  }

  const removeBundleMedicalService = (m) => {
    const ms = m.attributes.medical_services
    let newExistServices = { ...existServices }
    ms.forEach((s) => delete newExistServices[s.id])
    setExistServices(newExistServices)

    let a = [...bundleServices]
    a.concat(m)
    a.push(m)
    setBundleServices(a)

    let b = [...usedBundleMedicalServices]
    b = b.filter((el) => el.id != m.id)
    setUsedBundleMedicalServices(b)

    const newTotal = total - m.attributes.price
    if (!isNaN(newTotal)) setTotal(newTotal)
  }

  const createMembership = async () => {
    axios
      .post("/user/updateMe", {
        membership: selectedMembership.value,
      })
      .then((response) => {
        toast.success("Lưu thành công")
      })
      .catch(() => {
        toast.error("Có lỗi xảy ra")
      })
      .finally(() => {
        // setLoading(false)
      })
  }
  const onSubmit = async (formData) => {
    let circuit = 0, temperature = 0, respiratory_rate = 0, spo2 = 0, blood_pressure = 0, blood_pressure2 = 0, blood_pressure2_1 = 0, blood_pressure_1 = 0;
    try {
      circuit = parseInt(formData.circuit);
      temperature = parseFloat(formData.temperature);
      respiratory_rate = parseInt(formData.respiratory_rate);
      spo2 = parseInt(formData.spo2);
      blood_pressure = parseInt(formData.blood_pressure);
      blood_pressure2 = parseInt(formData.blood_pressure2);
      blood_pressure_1 = parseInt(formData.blood_pressure_1);
      blood_pressure2_1 = parseInt(formData.blood_pressure2_1);
    } catch {

    }
    try {
      const payload = {
        ...formData,
        is_mental_health_mr: true,
        dayTime: `${formData?.dayTime?.start}-${formData?.dayTime?.end}`,
        nightTime: `${formData?.nightTime?.start}-${formData?.nightTime?.end}`,
        price: Number(formData?.price),
        procedure: formData?.procedure.filter((item) => !!item.en),
        services: usedMedicalServices,
        bundle_services: usedBundleMedicalServices,
        clinique_services: usedCliniqueServices,
        membership: data.patient.membership ? data.medical_record?.data?.attributes.membership : selectedMembership,
        doctor_in_charge: doctorInCharge?.value,
        nurse_in_charge: nurseInCharge?.value,
        cc_in_charge: CCInCharge?.value,
        cashier_in_charge: cashierInCharge?.value,
        status: data?.medical_record?.data?.attributes?.status || "",
        patient: data.patient.id,
        total,
        booking: data.id,
        circuit,
        temperature,
        respiratory_rate,
        spo2,
        blood_pressure,
        blood_pressure2,
        blood_pressure_1,
        blood_pressure2_1,
        weight,
        height,
        bmi,
      }

      if (!payload.circuit) {
        delete payload.circuit;
      }
      if (!payload.temperature) {
        delete payload.temperature;
      }
      if (!payload.respiratory_rate) {
        delete payload.respiratory_rate;
      }
      if (!payload.spo2) {
        delete payload.spo2;
      }
      if (!payload.blood_pressure) {
        delete payload.blood_pressure;
      }
      if (!payload.blood_pressure2) {
        delete payload.blood_pressure2;
      }
      if (!payload.blood_pressure_1) {
        delete payload.blood_pressure_1;
      }
      if (!payload.blood_pressure2_1) {
        delete payload.blood_pressure2_1;
      }
      if (!payload.weight) {
        delete payload.weight;
      }
      if (!payload.height) {
        delete payload.height;
      }
      if (!payload.bmi) {
        delete payload.bmi;
      }
      if (!payload.clinique_services || (Array.isArray(payload.clinique_services) && payload.clinique_services.length == 0)) {
        delete payload.clinique_services;
      }

      if (!data.patient.membership && selectedMembership?.value) {
        const result = await updatePatient(data.patient.id, {
          data: {
            ...data.patient,
            membership: selectedMembership?.value,
          }
        });
      }

      if (data.medical_record?.data?.id) {
        const result = await updateMedicalRecord(data.medical_record?.data?.id, payload)
      } else {
        const result = await createOrUpdateTreatment(payload)
      }

      if (data?.status != formData.status) {
        await updateStatusBooking(data.id, formData.status)
      }

      toast.success("Lưu hồ sơ bệnh án thành công")
      window.location.href = `/bookings/mental-health-medical-records/${data.id}/view`
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  const downloadInvoice = () => {
    const toastId = toast.loading("Đang tải")
    axios
      .post(
        "/product/generatePhieuCLS",
        {
          id: data.medical_record?.data?.id,
        },
        {
          responseType: "arraybuffer",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/pdf",
          },
        }
      )
      .then((response) => {
        const b = new Blob([response.data], { type: "application/pdf" })
        var url = window.URL.createObjectURL(b)
        window.open(url)
        setTimeout(() => window.URL.revokeObjectURL(url), 100)
      })
      .finally(() => {
        toast.dismiss(toastId)
      })
  }

  const generatePhieuChiDinh = () => {
    const toastId = toast.loading("Đang tải")
    axios
      .post(
        "/product/generatePhieuChiDinh",
        {
          id: data.medical_record?.data?.id,
        },
        {
          responseType: "arraybuffer",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/pdf",
          },
        }
      )
      .then((response) => {
        const b = new Blob([response.data], { type: "application/pdf" })
        var url = window.URL.createObjectURL(b)
        window.open(url)
        setTimeout(() => window.URL.revokeObjectURL(url), 100)
      })
      .finally(() => {
        toast.dismiss(toastId)
      })

    try {
      window.flutter_inappwebview.callHandler('generatePhieuChiDinh', data.medical_record?.data?.id);
    } catch (e) {
      console.log('error download inapp view', e);
    }
  }

  useEffect(() => {
    if (data) {
      generateTimeSlots()
    }
  }, [data])

  useEffect(() => {
    let prefix = (data?.patient?.gender == 'male' ? 'nam' : 'nu'); // + '_18_39_';

    const age = getAge(data?.patient?.birthday);

    if (age >= 18 && age <= 39) {
      prefix = prefix + '_18_39_';
    } else if (age >= 40 && age <= 49) {
      prefix = prefix + '_40_49_';
    } else if (age >= 50 && age <= 64) {
      prefix = prefix + '_50_64_';
    } else if (age >= 65) {
      prefix = prefix + '_65_';
    }

    const searchTermss = searchTerms.map(s => prefix + s);
    if (searchTerms.length == 0) {
      setSearchData({});
      return;
    }
    const toastId = toast.loading("Đang tìm kiếm")
    axios
      .post(
        "/medical-service/searchV2",
        {
          searchTerm: searchTerms.map(s => prefix + s).join('|'),
          bmi,
        }
      )
      .then((response) => {
        let data = {};
        response.data.forEach(s => {
          let found = false;
          s.tags.forEach(t => {
            if (searchTermss.indexOf(t.searchBy) > -1 && !found) {
              if (!data[t.group]) {
                data[t.group] = [];
              }
              data[t.group].push(s);
              found = true;
            }
          });

        });

        setSearchData(data);
      })
      .finally(() => {
        toast.dismiss(toastId)
      })
  }, [searchTerms]);


  // upload refences
  const onFinish = async (id, files) => {
    let payload = cloneDeep(references)
    payload = [...payload, ...files]
    await updateMedicalRecord(data?.medical_record?.data?.id, {
      references: payload,
    })
    setReferences(payload)
  }

  const onRemove = async (value) => {
    try {
      let payload = cloneDeep(references)
      payload = payload?.filter((item) => item.id !== value.id)
      await updateMedicalRecord(data?.medical_record?.data?.id, {
        references: payload,
      })
      setReferences(payload)
    } catch (error) { }
  }

  const uploadAssets = useCallback(
    async (id, e) => {
      const toastId = toast.loading("Đang tải lên")
      try {
        const uploadedFiles = [...e.target.files]
        const promises = uploadedFiles?.map((file) => {
          const formData = new FormData()
          formData.append("files", file)
          return uploadMedia(formData)
        })
        const response = await Promise.all(promises)
        const files = flatten(response?.map((item) => item.data))
        if (files) {
          onFinish(id, files)
        }
      } catch (error) {
        // toast.error(getErrorMessage(error));
      } finally {
        toast.dismiss(toastId)
      }
    },
    [onFinish]
  )

  // upload Kế hoạch tham vấn:
  const onFinishKHTV = async (id, files) => {
    let payload = cloneDeep(keHoachThamVan)
    payload = [...payload, ...files]
    await updateMedicalRecord(data?.medical_record?.data?.id, {
      ke_hoach_tham_van: payload,
    })
    setKeHoachThamVan(payload)
  }

  const onRemoveKHTV = async (value) => {
    try {
      let payload = cloneDeep(keHoachThamVan)
      payload = payload?.filter((item) => item.id !== value.id)
      await updateMedicalRecord(data?.medical_record?.data?.id, {
        ke_hoach_tham_van: payload,
      })
      setKeHoachThamVan(payload)
    } catch (error) { }
  }

  const uploadAssetsKHTV = useCallback(
    async (id, e) => {
      const toastId = toast.loading("Đang tải lên")
      try {
        const uploadedFiles = [...e.target.files]
        const promises = uploadedFiles?.map((file) => {
          const formData = new FormData()
          formData.append("files", file)
          return uploadMedia(formData)
        })
        const response = await Promise.all(promises)
        const files = flatten(response?.map((item) => item.data))
        if (files) {
          onFinishKHTV(id, files)
        }
      } catch (error) {
        // toast.error(getErrorMessage(error));
      } finally {
        toast.dismiss(toastId)
      }
    },
    [onFinishKHTV]
  )

  // upload Các giấy tờ liên quan:
  const onFinishCGTLQ = async (id, files) => {
    let payload = cloneDeep(cacGiayToLienQuan)
    payload = [...payload, ...files]
    await updateMedicalRecord(data?.medical_record?.data?.id, {
      cac_giay_to_lien_quan: payload,
    })
    setCacGiayToLienQuan(payload)
  }

  const onRemoveCGTLQ = async (value) => {
    try {
      let payload = cloneDeep(references)
      payload = payload?.filter((item) => item.id !== value.id)
      await updateMedicalRecord(data?.medical_record?.data?.id, {
        cac_giay_to_lien_quan: payload,
      })
      setCacGiayToLienQuan(payload)
    } catch (error) { }
  }

  const uploadAssetsCGTLQ = useCallback(
    async (id, e) => {
      const toastId = toast.loading("Đang tải lên")
      try {
        const uploadedFiles = [...e.target.files]
        const promises = uploadedFiles?.map((file) => {
          const formData = new FormData()
          formData.append("files", file)
          return uploadMedia(formData)
        })
        const response = await Promise.all(promises)
        const files = flatten(response?.map((item) => item.data))
        if (files) {
          onFinishCGTLQ(id, files)
        }
      } catch (error) {
        // toast.error(getErrorMessage(error));
      } finally {
        toast.dismiss(toastId)
      }
    },
    [onFinishCGTLQ]
  )

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-6">
          <div class="accordion flex flex-col items-center">

            <div className="w-full">
              <input type="checkbox" name="panel" id="panel-1" class="hidden" />
              <label for="panel-1" class="relative block bg-black p-1 shadow border-b border-green cursor-pointer	bg-primary font-bold text-white hover:text-gray">A. Hành chính &#62;</label>
              <div class="accordion__content overflow-scroll bg-grey-lighter">
                <div className="flex flex-col">
                  <div className="">
                    <Controller
                      name="full_name"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <Input
                          disabled={true}
                          onChange={onChange}
                          value={value}
                          name="full_name"
                          label="Họ và tên"
                          placeholder={"Nhập họ và tên"}
                          errors={errors?.full_name?.message}
                        />
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-16 font-bold">Giới tính</label>
                    <div className="grid grid-cols-2 gap-x-6">
                      <Controller
                        name="gender"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <>
                            {[GENDER.MALE, GENDER.FEMALE]?.map((gender) => (
                              <Button
                                disabled={true}
                                key={gender}
                                onChange={onchange}
                                type="button"
                                className={classNames("w-full h-14 pl-6 !justify-start capitalize", {
                                  "bg-primary text-white font-bold": value === gender,
                                  "bg-primary/10 text-primary font-normal": value !== gender,
                                })}
                                onClick={() => setValue("gender", gender)}
                              >
                                {gender == "male" ? "Nam" : "Nữ"}
                              </Button>
                            ))}
                            {errors?.gender?.message && (
                              <p className="text-12 text-error mt-1">{errors?.gender?.message}</p>
                            )}
                          </>
                        )}
                      />
                    </div>
                  </div>

                  <Controller
                    name="birthday"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <Datepicker
                        disabled={true}
                        label="Ngày sinh"
                        value={value}
                        onChange={(date) => {
                          setValue("birthday", date)
                        }}
                        errors={errors?.birthday?.message}
                      />
                    )}
                  />
                  <Controller
                    name="phone"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <Input
                        disabled={true}
                        onChange={onChange}
                        value={value}
                        name="phone"
                        label="Số điện thoại"
                        placeholder={"Nhập số điện thoại"}
                        errors={errors?.phone?.message}
                      />
                    )}
                  />
                  <div className="grid col-span-2 sm:grid-cols-1 grid-cols-3 gap-x-6 gap-y-4  py-4">
                    <div className="w-full">
                      <Controller
                        name="address.province"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <Select
                            isDisabled={true}
                            placeholder="Chọn thành phố"
                            label="Thành phố"
                            name="address.province"
                            onChange={(e) => {
                              setValue(
                                "address.province",
                                { id: e.value, name: e.label },
                                { shouldDirty: true, shouldValidate: true }
                              )
                              let chosenProvince = provincesList?.find((item) => item.id === e.value)

                              setDistrictList(
                                chosenProvince?.level2s?.map((district) => {
                                  return {
                                    value: district.id,
                                    label: district.name,
                                    ...district,
                                  }
                                })
                              )

                              setValue("address.district", null, { shouldDirty: true })
                              setValue("address.ward", null, { shouldDirty: true })
                            }}
                            value={value && { value: value?.id, label: value?.name }}
                            options={provinceFormatted()}
                            errors={errors?.address?.province?.message}
                          />
                        )}
                      />
                    </div>
                    <div className="w-full">
                      <Controller
                        name="address.district"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <Select
                            isDisabled={true || !getValues("address.province")}
                            placeholder="Chọn quận"
                            label="Quận"
                            name="address.district"
                            onChange={(e) => {
                              setValue(
                                "address.district",
                                { id: e.value, name: e.label },
                                { shouldDirty: true, shouldValidate: true }
                              )
                              let chosenDistrict = districtList.filter(
                                (districtItem) => districtItem.id === e.value
                              )

                              setWardList(
                                chosenDistrict[0]?.level3s?.map((ward) => {
                                  return { value: ward.name, label: ward.name }
                                })
                              )

                              setValue("address.ward", null)
                            }}
                            value={value && { value: value?.id, label: value?.name }}
                            options={districtList}
                            errors={errors?.address?.district?.message}
                          />
                        )}
                      />
                    </div>
                    <div className="w-full">
                      <Controller
                        name="address.ward"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <Select
                            isDisabled={true || !getValues("address.district")}
                            placeholder="Chọn phường"
                            label="Phường"
                            name="address.ward"
                            onChange={(e) => {
                              setValue(
                                "address.ward",
                                { id: e.value, name: e.label },
                                { shouldDirty: true, shouldValidate: true }
                              )
                            }}
                            value={value && { value: value?.id, label: value?.name }}
                            options={wardList}
                            errors={errors?.address?.ward?.message}
                          />
                        )}
                      />
                    </div>
                  </div>
                  <Controller
                    name="address.address"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <Input
                        disabled={true}
                        name="address.address"
                        label="Địa chỉ"
                        placeholder={"Nhập địa chỉ"}
                        value={value}
                        onChange={onChange}
                        errors={errors?.address?.address?.message}
                      />
                    )}
                  />
                  <Controller
                    name="email"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <Input

                        disabled={true}
                        onChange={onChange}
                        value={value}
                        name="email"
                        label="Email"
                        placeholder={"Nhập Email"}
                        errors={errors?.email?.message}
                      />
                    )}
                  />

                  <Controller
                    name="session"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <Input
                        onChange={onChange}
                        value={value}
                        name="session"
                        label="Buổi"
                        placeholder={"Nhập Buổi"}
                        errors={errors?.email?.message}
                      />
                    )}
                  />

                  <Controller
                    name="nguoi_lien_he_luc_khan_cap"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <Input
                        onChange={onChange}
                        value={value}
                        name="nguoi_lien_he_luc_khan_cap"
                        label="Người liên hệ lúc khẩn cấp"
                        placeholder={"Nhập Người liên hệ lúc khẩn cấp"}
                        errors={errors?.email?.message}
                      />
                    )}
                  />

                </div>
              </div>
            </div>
            <div className="w-full">
              <input type="checkbox" name="panel" id="panel-2" class="hidden" />
              <label for="panel-2" class="relative block bg-black p-1 shadow border-b border-green cursor-pointer bg-primary text-white font-bold hover:text-gray">B. Đánh giá tâm lý &#62;</label>
              <div class="accordion__content overflow-scroll bg-grey-lighter">
                <div className="grid col-span-2 sm:grid-cols-1 grid-cols-1 gap-x-6 gap-y-4 py-4">
                  <Controller
                    name="cac_luong_gia_va_trac_nghiem_da_thuc_hien"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <Input
                        label="Các lượng giá và trắc nghiệm đã thực hiện"
                        value={value}
                        onChange={onChange}
                        errors={errors?.birthday?.message}
                      />
                    )}
                  />
                  {currentUser.role.type == "counselor" && <Controller
                    name="ket_qua_trac_nghiem"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <Input
                        label=" Kết quả trắc nghiệm (set quyền chỉ cho CVTL)"
                        value={value}
                        onChange={onChange}
                        errors={errors?.birthday?.message}
                      />
                    )}
                  />}
                </div>
              </div>
            </div>
            <div className="w-full">
              <input type="checkbox" name="panel" id="panel-3" class="hidden" />
              <label for="panel-3" class="relative block bg-black p-1 shadow border-b border-green cursor-pointer	bg-primary text-white font-bold  hover:text-gray">C. Hồ sơ tham vấn &#62;</label>
              <div class="accordion__content overflow-scroll bg-grey-lighter">
                <div className="w-full">

                  <div className="grid sm:grid-cols-1 grid-cols-1 gap-x-6 gap-y-4 py-4">
                    <Controller
                      name="ly_do_den_tham_van"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <Input
                          label="1. Lý do đến tham vấn"
                          value={value}
                          onChange={onChange}
                          errors={errors?.birthday?.message}
                        />
                      )}
                    />
                    <Controller
                      name="hanh_vi_quan_sat"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <Input
                          label="2. Hành vi quan sát"
                          value={value}
                          onChange={onChange}
                          errors={errors?.birthday?.message}
                        />
                      )}
                    />
                    <Controller
                      name="mo_ta_trieu_chung"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <Input
                          label="3. Mô tả triệu chứng"
                          value={value}
                          onChange={onChange}
                          errors={errors?.birthday?.message}
                        />
                      )}
                    />
                    {currentUser.role.type == "counselor" && <Controller
                      name="thong_tin_nen_tang_boi_canh_lien_quan"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <Input
                          label="4. Thông tin nền tảng và bối cảnh liên quan"
                          value={value}
                          onChange={onChange}
                          errors={errors?.birthday?.message}
                        />
                      )}
                    />}
                    {currentUser.role.type == "counselor" && <div>
                      <h1 className="text-xl underline mb-4">5. Các yếu tố liên quan</h1>
                      <Controller
                        name="yeu_to_khoi_phat"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <Input
                            label="5.1. Yếu tố khởi phát"
                            value={value}
                            onChange={onChange}
                            errors={errors?.birthday?.message}
                          />
                        )}
                      />
                      <Controller
                        name="yeu_to_bao_ve"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <Input
                            label="5.2. Yếu tố bảo vệ"
                            value={value}
                            onChange={onChange}
                            errors={errors?.birthday?.message}
                          />
                        )}
                      />
                      <Controller
                        name="yeu_to_kich_hoat"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <Input
                            label="5.3. Yếu tố kích hoạt"
                            value={value}
                            onChange={onChange}
                            errors={errors?.birthday?.message}
                          />
                        )}
                      />
                      <Controller
                        name="yeu_to_duy_tri"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <Input
                            label="5.3. Yếu tố duy trì"
                            value={value}
                            onChange={onChange}
                            errors={errors?.birthday?.message}
                          />
                        )}
                      />
                    </div>}
                    <Controller
                      name="anh_huong_toi_cuoc_song"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <Input
                          label="6. Ảnh hưởng tới cuộc sống"
                          value={value}
                          onChange={onChange}
                          errors={errors?.birthday?.message}
                        />
                      )}
                    />
                    {currentUser.role.type == "counselor" && <Controller
                      name="cach_giai_quyet_van_de_da_su_dung"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <Input
                          label="7. Cách giải quyết vấn đề đã sử dụng"
                          value={value}
                          onChange={onChange}
                          errors={errors?.birthday?.message}
                        />
                      )}
                    />}
                    <Controller
                      name="nhu_cau_va_muc_tieu_tham_van"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <Input
                          label="8. Nhu cầu và mục tiêu tham vấn"
                          value={value}
                          onChange={onChange}
                          errors={errors?.birthday?.message}
                        />
                      )}
                    />
                    <Controller
                      name="tom_tat_van_de"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <Input
                          label="9. Tóm tắt vấn đề"
                          value={value}
                          onChange={onChange}
                          errors={errors?.birthday?.message}
                        />
                      )}
                    />

                    <h1 className="font-bold">10. Kế hoạch tham vấn:</h1>
                    <div className="w-full py-2">
                      <div className="flex flex-col items-start gap-x-4 pl-4">
                        {Array.isArray(keHoachThamVan) && keHoachThamVan?.map((item, index) => (
                          <div key={index} className="relative">
                            <a className="text-blue font-bold" href={getStrapiMedia(item)} target="_blank" rel="noreferrer">
                              {item?.mime?.startsWith("image") ? (
                                <img className="rounded-xl w-30 h-30" src={getStrapiMedia(item)} alt="name" />
                              ) : (
                                <div className="hover:underline">
                                  {item?.name}
                                </div>
                              )}
                            </a>
                            {currentUser.role.type == "admin" && <div
                              onClick={(e) => {
                                e.stopPropagation()
                                onRemove(item)
                              }}
                              className="absolute cursor-pointer -top-0 -right-10 z-20"
                            >
                              <Icon name="close-circle" className="fill-red bg-white rounded-full" />
                            </div>}
                          </div>
                        ))}
                        <div className="inline-flex items-center justify-center rounded-xl bg-background h-14 w-14 relative border-primary border-1">
                          <input
                            // ref={ref}
                            type="file"
                            className="h-full w-full opacity-0 cursor-pointer absolute z-20"
                            onChange={(e) => uploadAssetsKHTV(data?.id, e)}
                            multiple
                          />
                          <p>Tải lên</p>
                        </div>
                      </div>
                    </div>
                    {currentUser.role.type == "counselor" && <div className="w-full py-2">
                      <h1 className="font-bold">11. Các giấy tờ liên quan:</h1>
                      <div className="flex flex-col items-start gap-x-4 pl-4">
                        {Array.isArray(cacGiayToLienQuan) && cacGiayToLienQuan?.map((item, index) => (
                          <div key={index} className="relative">
                            <a className="text-blue font-bold" href={getStrapiMedia(item)} target="_blank" rel="noreferrer">
                              {item?.mime?.startsWith("image") ? (
                                <img className="rounded-xl w-30 h-30" src={getStrapiMedia(item)} alt="name" />
                              ) : (
                                <div className="hover:underline">
                                  {item?.name}
                                </div>
                              )}
                            </a>
                            {currentUser.role.type == "admin" && <div
                              onClick={(e) => {
                                e.stopPropagation()
                                onRemove(item)
                              }}
                              className="absolute cursor-pointer -top-0 -right-10 z-20"
                            >
                              <Icon name="close-circle" className="fill-red bg-white rounded-full" />
                            </div>}
                          </div>
                        ))}
                        <div className="inline-flex items-center justify-center rounded-xl bg-background h-14 w-14 relative border-primary border-1">
                          <input
                            // ref={ref}
                            type="file"
                            className="h-full w-full opacity-0 cursor-pointer absolute z-20"
                            onChange={(e) => uploadAssetsCGTLQ(data?.id, e)}
                            multiple
                          />
                          <p>Tải lên</p>
                        </div>
                      </div>
                    </div>}
                    {currentUser.role.type == "counselor" && <Controller
                      name="ghi_chu_cua_cvtl"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <Input
                          label="12. Ghi chú của CVTL"
                          value={value}
                          onChange={onChange}
                          errors={errors?.birthday?.message}
                        />
                      )}
                    />}
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full">
              <input type="checkbox" name="panel" id="panel-4" class="hidden" />
              <label for="panel-4" class="relative block bg-black p-1 shadow border-b border-green cursor-pointer	bg-primary text-white font-bold  hover:text-gray">D. Tư vấn ban đầu &#62;</label>
              <div class="accordion__content overflow-scroll bg-grey-lighter">
                <div className="w-full">

                  {!readonly && currentUser?.role?.type != "care_concierge" && (
                    <div className="grid grid-cols-2 sm:grid-cols-1 gap-6">
                      <div>
                        <p className="inline-block text-16 font-bold mb-2">Dịch vụ</p>
                        <SearchInput
                          placeholder="Nhập tên gói cần tìm"
                          className="flex-1 mb-2"
                          value={filterService}
                          onChange={(e) => setFilterService(e.target.value)}
                        />
                        <div
                          style={{
                            maxHeight: "500px",
                            overflow: "scroll",
                          }}
                        >
                          {medicalServices &&
                            (!!filterService
                              ? medicalServices.filter((m) =>
                                matchSearchString(m.attributes?.label, filterService)
                              )
                              : medicalServices
                            ).map((m) => (
                              <div className="mb-2">
                                <Button
                                  disabled={currentUser?.role?.type == "nurse"}
                                  type="button"
                                  className={"inline text-xs flex-col flex h-16"}
                                  icon={<Icon name="add-circle" className="fill-white" />}
                                  onClick={() => addMedicalService(m)}
                                >
                                  <div className="flex flex-col">
                                    <div>{m.attributes?.label}</div>
                                    <div><span><del>{m.attributes?.original_price && numberWithCommas(m.attributes?.original_price) + 'đ'}</del>   {numberWithCommas(m.attributes?.price)}đ</span></div>
                                    <div><span>{m.attributes.discount_note}</span></div>
                                  </div>
                                </Button>
                              </div>
                            ))}
                        </div>
                      </div>
                      <div>
                        <p className="inline-block text-16 font-bold mb-2">Dịch vụ sử dụng</p>
                        <SearchInput
                          placeholder="Nhập tên gói cần tìm"
                          className="flex-1 mb-2"
                          value={filterUsedService}
                          onChange={(e) => setFilterUsedService(e.target.value)}
                        />
                        <div
                          style={{
                            maxHeight: "500px",
                            overflow: "scroll",
                          }}
                        >
                          {usedMedicalServices &&
                            (!!filterUsedService
                              ? usedMedicalServices.filter((m) =>
                                matchSearchString(m.attributes.label, filterUsedService)
                              )
                              : usedMedicalServices
                            ).map((m) => (
                              <div className="mb-2">
                                <Button
                                  disabled={currentUser?.role?.type == "nurse" || m.attributes?.paid}
                                  type="button"
                                  className={"inline text-xs h-16"}
                                  icon={<Icon name="close-circle" className="fill-white" />}
                                  onClick={() => removeMedicalService(m)}
                                >
                                  <div className="flex flex-col">
                                    <div>{m.attributes?.label}</div>
                                    <div><span><del>{m.attributes?.original_price && numberWithCommas(m.attributes?.original_price) + 'đ'}</del>   {numberWithCommas(m.attributes?.price)}đ</span></div>
                                    <div><span>{m.attributes.discount_note} {m.attributes?.paid ? '(Đã thanh toán)' : ''}</span></div>
                                  </div>
                                </Button>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="w-full flex flex-row">
              <Controller
                name="counselor_in_charge"
                control={control}
                render={({ field: { value, ref } }) => (
                  <div>
                    <Select
                      isDisabled={readonly}
                      icon={<svg className="inline" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" height="20px" width="20px" version="1.1" id="Layer_1" viewBox="0 0 512 512" xmlSpace="preserve">
                        <path fill="#507C5C" d="M256,288.24c-68.519,0-124.264-55.744-124.264-124.264V107.12c0-8.208,6.653-14.861,14.861-14.861  c8.208,0,14.861,6.653,14.861,14.861v56.857c0,52.129,42.412,94.541,94.541,94.541s94.541-42.412,94.541-94.541  c0-8.208,6.653-14.861,14.861-14.861c8.208,0,14.861,6.653,14.861,14.861C380.264,232.495,324.519,288.24,256,288.24z" />
                        <path fill="#CFF09E" d="M365.402,107.12H146.598c0,0,0-42.777,0-61.911c0-40.462,218.805-40.462,218.805,0  C365.402,64.341,365.402,107.12,365.402,107.12z" />
                        <path fill="#507C5C" d="M365.402,121.981H146.598c-8.208,0-14.861-6.653-14.861-14.861V45.207C131.736,4.405,218.637,0,256,0  s124.264,4.405,124.264,45.207v61.913C380.264,115.328,373.61,121.981,365.402,121.981z M161.459,92.258h189.08V46.331  c-5.265-6.069-36.943-16.608-94.539-16.608s-89.274,10.538-94.541,16.608L161.459,92.258L161.459,92.258z" />
                        <path fill="#CFF09E" d="M319.904,326.235H192.096c-38.576,0-69.849,31.273-69.849,69.849v101.055h267.506V396.084  C389.753,357.507,358.48,326.235,319.904,326.235z M337.736,437.943H265.41v-50.281h72.326L337.736,437.943L337.736,437.943z" />
                        <path fill="#507C5C" d="M389.753,512H122.247c-8.208,0-14.861-6.653-14.861-14.861V396.084  c0-46.709,38.001-84.71,84.71-84.71h127.808c46.709,0,84.71,38.001,84.71,84.71v101.055C404.614,505.347,397.961,512,389.753,512z   M137.109,482.277h237.783v-86.193c0-30.32-24.667-54.987-54.987-54.987H192.096c-30.32,0-54.987,24.667-54.987,54.987  L137.109,482.277L137.109,482.277z M337.736,452.804H265.41c-8.208,0-14.861-6.653-14.861-14.861v-50.281  c0-8.208,6.653-14.861,14.861-14.861h72.326c8.208,0,14.861,6.653,14.861,14.861v50.281  C352.598,446.15,345.944,452.804,337.736,452.804z M280.273,423.081h42.603v-20.558h-42.603V423.081z" />
                      </svg>}
                      placeholder="Bác sĩ phụ trách"
                      label="Bác sĩ phụ trách"
                      name="counselor_in_charge"
                      onChange={(e) => {
                        setCounselorInCharge(e)
                      }}
                      value={counselorInCharge}
                      options={customersData}
                      errors={errors?.address?.province?.message}
                    >

                    </Select>
                  </div>
                )}
              />
            </div>
          </div>
          <p className="text-xl font-semibold text-right">Tổng {numberWithCommas(total)}</p>
        </div>

        <div className="flex gap-2 py-4 grid grid-cols-4 sm:grid-cols-1 mb-2">
          {!readonly && (
            <Button className="fill-primary" type="submit">
              Lưu
            </Button>
          )}
          {!readonly && (
            <Button
              btnType="primary"
              type="reset"
              onClick={(e) => {
                navigate(-1)
              }}
            >
              Huỷ
            </Button>
          )}
          {readonly && currentUser?.role?.type != "doctor" && currentUser?.role?.type != "nurse" && (
            <Button
              btnType="primary"
              type="reset"
              onClick={(e) => {
                exportInvoice();
              }}
            >
              Xuất hoá đơn
            </Button>
          )}
        </div>
      </form>

      <ChooseAssetsFromLibraryDrawer
        openDrawer={visibleChooseAssetsFromLibraryDrawer}
        onClose={() => setVisibleChooseAssetsFromLibraryDrawer(false)}
        multiple={imageType === "results"}
        onFinish={handleAssetsSelected}
      />

      {visiblePrescriptionModal && (
        <PrescriptionModal
          patientId={data?.patient?.id}
          data={formatStrapiObj(data?.medical_record?.data)}
          medicalRecordId={data?.medical_record?.data?.id}
          visibleModal={visiblePrescriptionModal}
          onClose={() => setVisiblePrescriptionModal(false)}
        />
      )}
      {visiblePreviousMr && (
        <PreviousMr
          patientId={data?.patient?.id}
          data={activePreviousMr}
          medicalRecordId={data?.medical_record?.data?.id}
          visibleModal={visiblePreviousMr}
          onClose={() => setVisiblePreviousMr(false)}
        />
      )}
      {visiblePrescriptionModal && (
        <PrescriptionModal
          patientId={data?.patient?.id}
          data={formatStrapiObj(data?.medical_record?.data)}
          medicalRecordId={data?.medical_record?.data?.id}
          visibleModal={visiblePrescriptionModal}
          onClose={() => setVisiblePrescriptionModal(false)}
        />
      )}
      {visibleAdditionalPrescriptionModal && (
        <AdditionalPrescriptionModal
          patientId={data?.patient?.id}
          medicalRecordId={data?.medical_record?.data?.id}
          visibleModal={visibleAdditionalPrescriptionModal}
          onClose={() => setVisibleAdditionalPrescriptionModal(false)}
        />
      )}
      {visibleTestResultModal && (
        <TestResultsModal
          medicalRecordId={data?.medical_record?.data?.id}
          services={[
            ...(usedMedicalServices || []),
            ...flatten(
              usedBundleMedicalServices?.map((item) => item?.attributes?.medical_services?.data ?? item?.attributes?.medical_services)
            ),
          ]}
          visibleModal={visibleTestResultModal}
          onClose={() => setVisibleTestResultModal(false)}
        />
      )}
    </>
  )
}

const matchSearchString = (st, v) => {
  const str2 = removeVietnameseTones(st).toLowerCase()
  const v2 = removeVietnameseTones(v).toLowerCase()
  return str2.indexOf(v2) != -1
}

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

function numberWithCommas(x) {
  return x?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") ?? '0'
}

// const serviceLabels = ['Không có bệnh', 'Thần kinh', 'Hô hấp', 'Tim mạch', 'Thận tiết niệu', 'Cơ xương khớp', 'Nội tiết - chuyển hoá', 'Tiêu hoá'];
const serviceGroups = ['khong_co_benh', 'than_kinh', 'ho_hap', 'tim_mach', 'than_tiet_nieu', 'co_xuong_khop', 'noi_tiet_chuyen_hoa', 'tieu_hoa'];
const translateServiceGroup = (t) => {
  switch (t) {
    case "khong_co_benh":
      return "Không có bệnh"
      break;
    case "than_kinh":
      return "Thần kinh"
      break;
    case "ho_hap":
      return "Hô hấp"
      break;
    case "tim_mach":
      return "Tim mạch"
      break;
    case "than_tiet_nieu":
      return "Thận tiết niệu"
      break;
    case "co_xuong_khop":
      return "Cơ xương khớp"
      break;
    case "noi_tiet_chuyen_hoa":
      return "Nội tiết chuyển hoá"
      break;
    case "tieu_hoa":
      return "Tiêu hoá"
      break;
  }
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

function isJson(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

function parseJson(str) {
  try {
    let items = JSON.parse(str);
    return items.map(i => i.value).join("\n");
  } catch (e) {
    return str;
  }
}

function getAge(dateString) {
  var today = new Date();
  var birthDate = new Date(dateString);
  var age = today.getFullYear() - birthDate.getFullYear();
  var m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export default TreatmentForm
