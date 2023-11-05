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
import { createNewTreatment, updateMedicalRecord } from "services/api/medicalRecord"
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
import AdditionalPrescriptionModal from "./AdditionalPrescriptionModal"
import TestResultsModal from "./TestResultsModal"
import Tagify from '@yaireo/tagify'
import '@yaireo/tagify/dist/tagify.css' // imports tagify SCSS file from within
import { useSelector } from "react-redux";
import { JWT_TOKEN, BRANCH } from "../../../constants/Authentication"
import { cloneDeep, flatten, groupBy } from "lodash"
const branch = localStorage.getItem(BRANCH);

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
    value: "business",
    label: "Gói doanh nghiệp",
  },
  {
    value: "non-resident",
    label: "Thành viên ngoại kiều",
    price: 10000000,
  },
  {
    value: "foreigner",
    label: "Thành viên ngoại kiều ngắn hạn (2 tuần)",
    price: 2500000,
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
  const [visibleAdditionalPrescriptionModal, setVisibleAdditionalPrescriptionModal] = useState(false);
  const [visibleTestResultModal, setVisibleTestResultModal] = useState(false)
  const [tagifyWhitelist, setTagifyWhitelist] = useState();
  const inputElement = useRef();
  const currentUser = useSelector((state) => state.user.currentUser)
  const [selectedMembership, setSelectedMembership] = useState();
  const [references, setReferences] = useState([]);
  const [searchTerms, setSearchTerms] = useState([]);
  const [searchData, setSearchData] = useState();

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
    // const el1 = document.getElementById('reasons_to_get_hospitalized');
    // var tagify = new Tagify(el1, {
    //   whitelist: currentUser.abbreviation?.reasons_to_get_hospitalized ?? [],
    //   dropdown: {
    //     enabled: 0,              // show the dropdown immediately on focus
    //     position: "text",         // place the dropdown near the typed text
    //     closeOnSelect: false,          // keep the dropdown open after selecting a suggestion
    //     highlightFirst: true,
    //   },
    //   backspace: 'edit',
    //   templates,
    //   delimiters: null,
    //   transformTag: (tag) => {
    //     const str = tag.value;
    //     const str2 = str.charAt(0).toUpperCase() + str.slice(1);
    //     tag.value = str2;
    //     return tag;
    //   }
    // });

    //     // bind "DragSort" to Tagify's main element and tell
    // // it that all the items with the below "selector" are "draggable"
    // var dragsort = new DragSort(tagify.DOM.scope, {
    //   selector: '.'+tagify.settings.classNames.tag,
    //   callbacks: {
    //       dragEnd: onDragEnd
    //   }
    // })

    // // must update Tagify's value according to the re-ordered nodes in the DOM
    // function onDragEnd(elm){
    //   tagify.updateValueByDOMTags()
    // }


    // const el2 = document.getElementById('inquiry');
    // var tagify = new Tagify(el2, {
    //   whitelist: currentUser.abbreviation?.inquiry ?? [],
    //   dropdown: {
    //     classname: "color-blue",
    //     enabled: 0,              // show the dropdown immediately on focus
    //     maxItems: 5,
    //     position: "text",         // place the dropdown near the typed text
    //     closeOnSelect: false,          // keep the dropdown open after selecting a suggestion
    //     highlightFirst: true
    //   },
    //   templates,
    //   backspace: 'edit',
    //   delimiters: null,
    //   transformTag: (tag) => {
    //     const str = tag.value;
    //     const str2 = str.charAt(0).toUpperCase() + str.slice(1);
    //     tag.value = str2;
    //     return tag;
    //   }
    // });

    // const el3 = document.getElementById('diagnose');
    // var tagify = new Tagify(el3, {
    //   whitelist: currentUser.abbreviation.diagnose ?? [],
    //   dropdown: {
    //     classname: "color-blue",
    //     enabled: 0,              // show the dropdown immediately on focus
    //     maxItems: 5,
    //     position: "text",         // place the dropdown near the typed text
    //     closeOnSelect: false,          // keep the dropdown open after selecting a suggestion
    //     highlightFirst: true
    //   },
    //   templates,
    //   backspace: 'edit',
    //   delimiters: null,
    //   transformTag: (tag) => {
    //     const str = tag.value;
    //     const str2 = str.charAt(0).toUpperCase() + str.slice(1);
    //     tag.value = str2;
    //     return tag;
    //   }
    // })

    // const el4 = document.getElementById('past_medical_history');
    // var tagify = new Tagify(el4, {
    //   whitelist: currentUser.abbreviation?.past_medical_history ?? [],
    //   dropdown: {
    //     classname: "color-blue",
    //     enabled: 0,              // show the dropdown immediately on focus
    //     maxItems: 5,
    //     position: "text",         // place the dropdown near the typed text
    //     closeOnSelect: false,          // keep the dropdown open after selecting a suggestion
    //     highlightFirst: true
    //   },
    //   templates,
    //   backspace: 'edit',
    //   delimiters: null,
    //   transformTag: (tag) => {
    //     const str = tag.value;
    //     const str2 = str.charAt(0).toUpperCase() + str.slice(1);
    //     tag.value = str2;
    //     return tag;
    //   }
    // })

    // const el5 = document.getElementById('examination');
    // var tagify = new Tagify(el5, {
    //   whitelist: currentUser.abbreviation.examination ?? [],
    //   dropdown: {
    //     classname: "color-blue",
    //     enabled: 0,              // show the dropdown immediately on focus
    //     maxItems: 5,
    //     position: "text",         // place the dropdown near the typed text
    //     closeOnSelect: false,          // keep the dropdown open after selecting a suggestion
    //     highlightFirst: true
    //   },
    //   templates,
    //   backspace: 'edit',
    //   delimiters: null,
    //   transformTag: (tag) => {
    //     const str = tag.value;
    //     const str2 = str.charAt(0).toUpperCase() + str.slice(1);
    //     tag.value = str2;
    //     return tag;
    //   }
    // })

    // const el6 = document.getElementById('treatment_regimen');
    // var tagify = new Tagify(el6, {
    //   whitelist: currentUser.abbreviation?.treatment_regimen ?? [],
    //   dropdown: {
    //     classname: "color-blue",
    //     enabled: 0,              // show the dropdown immediately on focus
    //     maxItems: 5,
    //     position: "text",         // place the dropdown near the typed text
    //     closeOnSelect: false,          // keep the dropdown open after selecting a suggestion
    //     highlightFirst: true
    //   },
    //   templates,
    //   backspace: 'edit',
    //   delimiters: null,
    //   transformTag: (tag) => {
    //     const str = tag.value;
    //     const str2 = str.charAt(0).toUpperCase() + str.slice(1);
    //     tag.value = str2;
    //     return tag;
    //   }
    // })

    // const el7 = document.getElementById('general_examination');
    // var tagify = new Tagify(el7, {
    //   whitelist: currentUser.abbreviation.general_examination ?? [],
    //   dropdown: {
    //     classname: "color-blue",
    //     enabled: 0,              // show the dropdown immediately on focus
    //     maxItems: 5,
    //     position: "text",         // place the dropdown near the typed text
    //     closeOnSelect: false,          // keep the dropdown open after selecting a suggestion
    //     highlightFirst: true
    //   },
    //   templates,
    //   backspace: 'edit',
    //   delimiters: null,
    //   transformTag: (tag) => {
    //     const str = tag.value;
    //     const str2 = str.charAt(0).toUpperCase() + str.slice(1);
    //     tag.value = str2;
    //     return tag;
    //   }
    // })

    // const el8 = document.getElementById('main_diagnose');
    // var tagify = new Tagify(el8, {
    //   whitelist: currentUser.abbreviation.main_diagnose ?? [],
    //   dropdown: {
    //     classname: "color-blue",
    //     enabled: 0,              // show the dropdown immediately on focus
    //     maxItems: 5,
    //     position: "text",         // place the dropdown near the typed text
    //     closeOnSelect: false,          // keep the dropdown open after selecting a suggestion
    //     highlightFirst: true
    //   },
    //   templates,
    //   backspace: 'edit',
    //   delimiters: null,
    //   transformTag: (tag) => {
    //     const str = tag.value;
    //     const str2 = str.charAt(0).toUpperCase() + str.slice(1);
    //     tag.value = str2;
    //     return tag;
    //   }
    // })

    // const el9 = document.getElementById('other_diagnose');
    // var tagify = new Tagify(el9, {
    //   whitelist: currentUser.abbreviation.other_diagnose ?? [],
    //   dropdown: {
    //     classname: "color-blue",
    //     enabled: 0,              // show the dropdown immediately on focus
    //     maxItems: 5,
    //     position: "text",         // place the dropdown near the typed text
    //     closeOnSelect: false,          // keep the dropdown open after selecting a suggestion
    //     highlightFirst: true
    //   },
    //   templates,
    //   backspace: 'edit',
    //   delimiters: null,
    //   transformTag: (tag) => {
    //     const str = tag.value;
    //     const str2 = str.charAt(0).toUpperCase() + str.slice(1);
    //     tag.value = str2;
    //     return tag;
    //   }
    // })

    // const el10 = document.getElementById('premise');
    // var tagify = new Tagify(el10, {
    //   whitelist: currentUser.abbreviation.premise ?? [],
    //   dropdown: {
    //     classname: "color-blue",
    //     enabled: 0,              // show the dropdown immediately on focus
    //     maxItems: 5,
    //     position: "text",         // place the dropdown near the typed text
    //     closeOnSelect: false,          // keep the dropdown open after selecting a suggestion
    //     highlightFirst: true
    //   },
    //   templates,
    //   backspace: 'edit',
    //   delimiters: null,
    //   transformTag: (tag) => {
    //     const str = tag.value;
    //     const str2 = str.charAt(0).toUpperCase() + str.slice(1);
    //     tag.value = str2;
    //     return tag;
    //   }
    // })

  }, [tagifyWhitelist]);

  const provincesList = REGION_DATA

  useEffect(() => {
    if (data) {
      if (!isNaN(data.total)) setTotal(data.total)
      if (data.bookingDate) {
        const bd = new Date(data.bookingDate)
        setBookingDate(bd)
        setBookingHour({ label: moment(bd).format("H:mm"), value: moment(bd).format("H:mm") })
      }
      console.log('data', data.patient.membership)
      if (data.patient.membership) {
        setSelectedMembership(MEMBERSHIP_PKGS.find(s => s.value == data.patient.membership));
      }

      loadData();
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
      // status: data?.medical_record?.data?.attributes?.status || "",
    },
  })
  // useScrollToError(errors)

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
      const bundleServicesData_ = JSON.parse(data.bundle_services)
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
      const servicesData_ = JSON.parse(data.services)
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
    if (currentUser?.role?.type == "doctor") {
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
    // if (data.patient.membership == "gold") {
    //   return;
    // }
    axios2
      // .get("https://api.echomedi.com/api/medical-services?pagination[page]=1&pagination[pageSize]=10000&populate=*")
      .get("https://api.echomedi.com/api/medical-service/getGoldMedicalServices/" + data.patient.id + "/" + selectedMembership?.value)
      // .get("http://localhost:1337/api/medical-service/getGoldMedicalServices/" + data.patient.id)
      .then((response) => {
        const services = response.data.data;
        let ms = services.filter(s => s.attributes?.group_service != "Khám lâm sàng");
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
          const servicesData = JSON.parse(data.services)
          const cliniqueServicesData = data.clinique_services;
          const usedIdMedicalServices = servicesData.map((ud) => ud.id)
          const usedIdCliniqueServices = cliniqueServicesData.map((ud) => ud.id)
          ms = ms.filter(s => usedIdMedicalServices.indexOf(s.id) == -1);
          cs = cs.filter(s => usedIdCliniqueServices.indexOf(s.id) == -1);
          setMedicalServices(ms);
          setCliniqueServices(cs);
        }
      })
      .finally(() => {
      })
  }

  const loadMedicalServices = () => {
    axios2
      .get("https://api.echomedi.com/api/medical-services?pagination[pageSize]=1000")
      .then((response) => {
        if (!data.services) {
          setMedicalServices(response.data.data)
        } else {
          const servicesData = JSON.parse(data.services)
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
        console.log('response', response)
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
              }
            }

            return s;
          });
          ms = ms.filter(s => !s.attributes["disabled"]);

          setBundleServices(ms)
        } else {
          const bundleServicesData_ = JSON.parse(data.bundle_services)
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
      { progress: 1, className: "w-[500px] left-[-177px]" }
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
      // toast.error("Không thể thêm dịch vụ này vì bị trùng: " + ms.filter(s => s.id in existServices).map(s => s.label).join(", "))
      // toast.error("Không thể thêm dịch vụ này vị bị trùng: " + )
      toast.error(
        <div>
          <p>Không thể thêm dịch vụ này vị bị trùng</p>
          {ms.filter(s => s.id in existServices).map(s => <p>{s.label}</p>)}
          {/* {m.attributes.medical_services.map((a) => (
            <p>{a.label}</p>

          ))} */}
        </div>,
        { progress: 1, className: "w-[500px] left-[-177px]" }
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
        dayTime: `${formData?.dayTime?.start}-${formData?.dayTime?.end}`,
        nightTime: `${formData?.nightTime?.start}-${formData?.nightTime?.end}`,
        price: Number(formData?.price),
        procedure: formData?.procedure.filter((item) => !!item.en),
        services: JSON.stringify(usedMedicalServices),
        bundle_services: JSON.stringify(usedBundleMedicalServices),
        clinique_services: usedCliniqueServices,
        membership: data.patient.membership ? data.medical_record?.data?.attributes.membership : JSON.stringify(selectedMembership),
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
        const result = await createNewTreatment(payload)
      }

      if (data?.status != formData.status) {
        await updateStatusBooking(data.id, formData.status)
      }

      toast.success("Lưu hồ sơ bệnh án thành công")
      window.location.href = `/bookings/medical-records/${data.id}/view`
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

        // if (bmi >= 23) {
        //   if (!data["Gói dược"]) {
        //     data["Gói dược"] = [];
        //   }
        //   data["Gói dược"].push({
        //     label: "Gói hỗ trợ giảm cân",
        //     type: "product",
        //     id: 17,
        //   });

        //   if (!data["Gói dinh dưỡng"]) {
        //     data["Gói dinh dưỡng"] = [];
        //   }
        //   data["Gói dinh dưỡng"].push({
        //     label: "Dinh dưỡng giảm cân",
        //     type: "service-bundle",
        //     id: 94,
        //   });

        //   if (!data["Gói gene"]) {
        //     data["Gói gene"] = [];
        //   }

        //   if (!data["Gói gene"].find(s => s.id == 107)) {
        //     data["Gói gene"].push({
        //       label: "Vitamin cho cuộc sức sống tràn đầy U-Vita",
        //       type: "service-bundle",
        //       id: 107,
        //     });
        //   }
        //   if (!data["Gói gene"].find(s => s.id == 108)) {
        //     data["Gói gene"].push({
        //       label: "Xua tan phiền não về cân nặng U-Weight",
        //       type: "service-bundle",
        //       id: 108,
        //     });
        //   }

        //   if (!data["Gói khám"]) {
        //     data["Gói khám"] = [];
        //   }
        //   data["Gói khám"].push({
        //     label: "QUẢN LÝ BỆNH BÉO PHÌ",
        //     type: "service-bundle",
        //     id: 62,
        //   });
        // } else if (bmi < 18) {
        //   data["Gói dinh dưỡng"] = [];
        //   data["Gói dinh dưỡng"].push({
        //     label: "Suy Dinh dưỡng",
        //   });
        // }

        setSearchData(data);
      })
      .finally(() => {
        toast.dismiss(toastId)
      })
  }, [searchTerms]);

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

  // const dataService = useMemo(() => {
  //   const formatServices = groupBy(searchData, "group")
  //   console.log('formatServices', formatServices)
  //   return Object.entries(searchData)
  //     .map(([serviceName, service]) => {
  //       if (!AVAILABLE_TEST_RESULT.includes(serviceName)) return null
  //       return service
  //     })
  //     ?.filter((service) => !!service)
  // }, [searchData])

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-6">
          <div class="accordion flex flex-col items-center">

            <div className="w-full">
              <input type="checkbox" name="panel" id="panel-1" class="hidden" />
              <label for="panel-1" class="relative block bg-black p-1 shadow border-b border-green cursor-pointer	bg-primary font-bold text-white ">1. Hành chính &#62;</label>
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
                    render={({ field: { value, ref } }) => (
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
                        render={({ field: { value, ref } }) => (
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
                        render={({ field: { value, ref } }) => (
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
                        render={({ field: { value, ref } }) => (
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

                </div>
              </div>
            </div>
            <div className="w-full">
              <input type="checkbox" name="panel" id="panel-2" class="hidden" />
              <label for="panel-2" class="relative block bg-black p-1 shadow border-b border-green cursor-pointer bg-primary text-white font-bold">2. Thông tin lịch hẹn &#62;</label>
              <div class="accordion__content overflow-scroll bg-grey-lighter">
                <div className="grid col-span-2 sm:grid-cols-1 grid-cols-2 gap-x-6 gap-y-4 py-4">
                  <Controller
                    name="bookingDate"
                    control={control}
                    render={({ field: { value, ref } }) => (
                      <Datepicker
                        disabled={true}
                        label="Ngày đặt lịch"
                        value={bookingDate}
                        onChange={
                          readonly
                            ? null
                            : (date) => {
                              setBookingDate(date)
                            }
                        }
                        errors={errors?.birthday?.message}
                      />
                    )}
                  />
                  <Controller
                    name="address.province"
                    control={control}
                    render={({ field: { value, ref } }) => (
                      <Select
                        isDisabled={true}
                        placeholder="Khung giờ"
                        label="Khung giờ"
                        name="address.province"
                        onChange={(e) => {
                          setBookingHour(e)
                        }}
                        value={bookingHour}
                        options={bookingHours()}
                        errors={errors?.address?.province?.message}
                      />
                    )}
                  />
                  <div className="col-span-2">
                    <Controller
                      name="note"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <Input
                          disabled={true}
                          name="note"
                          label="Nội dung đặt lịch"
                          placeholder={"Nhập nội dung đặt lịch"}
                          value={value}
                          onChange={onChange}
                          errors={errors?.address?.address?.message}
                        />
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full">
              <input type="checkbox" name="panel" id="panel-3" class="hidden" />
              <label for="panel-3" class="relative block bg-black p-1 shadow border-b border-green cursor-pointer	bg-primary text-white font-bold">3. Trạng thái &#62;</label>
              <div class="accordion__content overflow-scroll bg-grey-lighter">
                <div className="w-full">

                  <div className="grid sm:grid-cols-1 grid-cols-4 gap-x-6 gap-y-4 py-4">
                    <Controller
                      name="status"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <>
                          {bookingStatus.map((status) => (
                            <Button
                              disabled={readonly}
                              key={status}
                              onChange={onchange}
                              type="button"
                              className={classNames(
                                "text-center w-full h-14 pl-2 !justify-start capitalize",
                                {
                                  "bg-primary text-white font-bold": value === status,
                                  "bg-primary/10 text-primary font-normal": value !== status,
                                  "bg-[orange]": value === status && status === bookingStatus[0],
                                  "bg-[green]": value === status && status === bookingStatus[1],
                                  "bg-[blue]": value === status && status === bookingStatus[2],
                                  "bg-[grey]": value === status && status === bookingStatus[3],
                                  "bg-[purple]": value === status && status === bookingStatus[4],
                                  "bg-[red]": value === status && status === bookingStatus[5],
                                }
                              )}
                              onClick={() => setValue("status", status)}
                            >
                              {translate(status)}
                            </Button>
                          ))}
                          {errors?.status?.message && (
                            <p className="text-12 text-error mt-1">{errors?.status?.message}</p>
                          )}
                        </>
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full">
              <input type="checkbox" name="panel" id="panel-4" class="hidden" />
              <label for="panel-4" class="relative block bg-black p-1 shadow border-b border-green cursor-pointer	bg-primary text-white font-bold">4. Tư vấn ban đầu &#62;</label>
              <div class="accordion__content overflow-scroll bg-grey-lighter">
                <div className="w-full py-4">
                  <div className="w-full">
                    <Controller
                      name="cc_in_charge"
                      control={control}
                      render={({ field: { value, ref } }) => (
                        <Select
                          isDisabled={readonly}
                          icon={<svg className="inline" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" height="20px" width="20px" version="1.1" id="Layer_1" viewBox="0 0 512 512" xmlSpace="preserve">
                            <path fill="#507C5C" d="M256,288.24c-68.519,0-124.264-55.744-124.264-124.264V107.12c0-8.208,6.653-14.861,14.861-14.861  c8.208,0,14.861,6.653,14.861,14.861v56.857c0,52.129,42.412,94.541,94.541,94.541s94.541-42.412,94.541-94.541  c0-8.208,6.653-14.861,14.861-14.861c8.208,0,14.861,6.653,14.861,14.861C380.264,232.495,324.519,288.24,256,288.24z" />
                            <path fill="#CFF09E" d="M365.402,107.12H146.598c0,0,0-42.777,0-61.911c0-40.462,218.805-40.462,218.805,0  C365.402,64.341,365.402,107.12,365.402,107.12z" />
                            <path fill="#507C5C" d="M365.402,121.981H146.598c-8.208,0-14.861-6.653-14.861-14.861V45.207C131.736,4.405,218.637,0,256,0  s124.264,4.405,124.264,45.207v61.913C380.264,115.328,373.61,121.981,365.402,121.981z M161.459,92.258h189.08V46.331  c-5.265-6.069-36.943-16.608-94.539-16.608s-89.274,10.538-94.541,16.608L161.459,92.258L161.459,92.258z" />
                            <path fill="#CFF09E" d="M319.904,326.235H192.096c-38.576,0-69.849,31.273-69.849,69.849v101.055h267.506V396.084  C389.753,357.507,358.48,326.235,319.904,326.235z M337.736,437.943H265.41v-50.281h72.326L337.736,437.943L337.736,437.943z" />
                            <path fill="#507C5C" d="M389.753,512H122.247c-8.208,0-14.861-6.653-14.861-14.861V396.084  c0-46.709,38.001-84.71,84.71-84.71h127.808c46.709,0,84.71,38.001,84.71,84.71v101.055C404.614,505.347,397.961,512,389.753,512z   M137.109,482.277h237.783v-86.193c0-30.32-24.667-54.987-54.987-54.987H192.096c-30.32,0-54.987,24.667-54.987,54.987  L137.109,482.277L137.109,482.277z M337.736,452.804H265.41c-8.208,0-14.861-6.653-14.861-14.861v-50.281  c0-8.208,6.653-14.861,14.861-14.861h72.326c8.208,0,14.861,6.653,14.861,14.861v50.281  C352.598,446.15,345.944,452.804,337.736,452.804z M280.273,423.081h42.603v-20.558h-42.603V423.081z" />
                          </svg>}
                          placeholder="CC phụ trách"
                          label="CC phụ trách"
                          name="cc_in_charge"
                          onChange={(e) => {
                            setCCInCharge(e)
                          }}
                          value={CCInCharge}
                          options={CCData}
                          errors={errors?.address?.province?.message}
                        />
                      )}
                    />
                  </div>
                  {(readonly || data.patient.membership) && <div className="w-full">
                    {/* <Controller
                name="address.ward"
                control={control}
                render={({ field: { value, ref } }) => ( */}
                    <Select
                      isDisabled={readonly || data.patient.membership}
                      // placeholder="Chọn phường"
                      label="Gói thành viên"
                      name="address.ward"
                      onChange={(e) => {
                        let newTotal = total;
                        if (selectedMembership) {
                          total = total - selectedMembership.price;
                        }
                        total = total + e.price;
                        setTotal(total);
                        setSelectedMembership(e);
                        loadMedicalServices2();
                      }}
                      value={selectedMembership}
                      options={membershipPackage}
                      errors={errors?.address?.ward?.message}
                    />
                  </div>}
                  {!readonly && !data.patient.membership && (
                    <div className="grid grid-cols-1 gap-6 py-4">
                      <div>
                        <p className="inline-block text-16 font-bold mb-2">Gói thành viên</p>

                        <div
                          style={{
                            maxHeight: "300px",
                            display: "flex",
                            flexFlow: "row wrap",
                            alignContent: "space-between",
                            justifyContent: "space-between",
                          }}
                        >
                          {membershipPackage.map((m) => (
                            <div className="mb-2 flex">
                              <Button
                                type="button"
                                className={`inline ${selectedMembership?.value == m.value && "bg-red"}`}
                                icon={<Icon name="add-circle" className="fill-white" />}
                                onClick={() => {
                                  let newTotal = total;
                                  if (selectedMembership) {
                                    newTotal = newTotal - selectedMembership.price;
                                  }
                                  if (!selectedMembership || selectedMembership.value != m.value) {
                                    newTotal = newTotal + m.price;
                                    setSelectedMembership(m)
                                  } else {
                                    setSelectedMembership(null)
                                  }
                                  setTotal(newTotal);
                                }}
                              >
                                <p>{m.label}</p>
                                <p>{numberWithCommas(m.price)}</p>
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  {!readonly && (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-1">
                      <div>
                        <p className="inline-block text-16 font-bold mb-2">Khám lâm sàng</p>
                        <SearchInput
                          placeholder="Nhập tên gói cần tìm"
                          className="flex-1 mb-2"
                          value={filterCliniqueService}
                          onChange={e => setFilterCliniqueService(e.target.value)}
                        />
                        <div
                          style={{
                            maxHeight: "300px",
                            overflow: "scroll",
                          }}
                        >
                          {cliniqueServices &&
                            (!!filterCliniqueService
                              ? cliniqueServices.filter((m) =>
                                matchSearchString(m.attributes.label, filterCliniqueService)
                              )
                              : cliniqueServices
                            ).map((m) => (
                              <div className="mb-2 flex">
                                <Button
                                  type="button"
                                  className={"inline"}
                                  icon={<Icon name="add-circle" className="fill-white" />}
                                  onClick={() => addCliniqueService(m)}
                                >
                                  {m.attributes?.label} - <del>{m.attributes?.original_price}</del>
                                  <span>{numberWithCommas(m.attributes?.price)}</span>
                                  <span>{m.attributes.discount_note}</span>
                                </Button>
                              </div>
                            ))}
                        </div>
                      </div>
                      <div>
                        <p className="inline-block text-16 font-bold mb-2">Khám lâm sàng sử dụng</p>
                        <SearchInput
                          placeholder="Nhập tên gói cần tìm"
                          className="flex-1 mb-2"
                          value={filterUsedBundleService}
                          onChange={(e) => {
                            setFilterUsedBundleService(e.target.value)
                          }}
                        />
                        <div
                          style={{
                            maxHeight: "300px",
                            overflow: "scroll",
                          }}
                        >
                          {usedCliniqueServices &&
                            (!!filterUsedService
                              ? usedMedicalServices.filter((m) =>
                                matchSearchString(m.attributes.label, filterUsedService)
                              )
                              : usedCliniqueServices
                            ).map((m) => (
                              <div className="mb-2 flex">
                                <Button
                                  disabled={m.attributes?.paid}
                                  type="button"
                                  className={"inline"}
                                  icon={<Icon name="close-circle" className="fill-white" />}
                                  onClick={() => removeCliniqueService(m)}
                                >
                                  {m.attributes?.label} - <del>{m.attributes?.original_price}</del>
                                  <span>{numberWithCommas(m.attributes?.price)}</span>
                                  <span>{m.attributes.discount_note}</span>
                                  <span>{m.attributes?.paid ? '(Đã thanh toán)' : ''}</span>
                                </Button>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  )}
                  {readonly &&
                    <div>
                      <p className="font-bold">Dịch vụ lâm sàng: </p>
                      {usedCliniqueServices.map(c => <p>- {c.attributes.label}</p>)}
                    </div>
                  }
                </div>
              </div>
            </div>
            {currentUser?.role?.type != "care_concierge" &&
              <div className="w-full">
                <input type="checkbox" name="panel" id="panel-5" class="hidden" />
                <label for="panel-5" class="relative block bg-black p-1 shadow border-b border-green cursor-pointer	bg-primary text-white font-bold">5. Sinh hiệu &#62;</label>
                <div class="accordion__content overflow-scroll bg-grey-lighter">
                  <div className="w-full py-4">
                    <Controller
                      name="nurse_in_charge"
                      control={control}
                      render={({ field: { value, ref } }) => (
                        <Select
                          isDisabled={readonly}
                          icon={<svg className="inline" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" height="20px" width="20px" version="1.1" id="Layer_1" viewBox="0 0 512 512" xmlSpace="preserve">
                            <path fill="#507C5C" d="M256,288.24c-68.519,0-124.264-55.744-124.264-124.264V107.12c0-8.208,6.653-14.861,14.861-14.861  c8.208,0,14.861,6.653,14.861,14.861v56.857c0,52.129,42.412,94.541,94.541,94.541s94.541-42.412,94.541-94.541  c0-8.208,6.653-14.861,14.861-14.861c8.208,0,14.861,6.653,14.861,14.861C380.264,232.495,324.519,288.24,256,288.24z" />
                            <path fill="#CFF09E" d="M365.402,107.12H146.598c0,0,0-42.777,0-61.911c0-40.462,218.805-40.462,218.805,0  C365.402,64.341,365.402,107.12,365.402,107.12z" />
                            <path fill="#507C5C" d="M365.402,121.981H146.598c-8.208,0-14.861-6.653-14.861-14.861V45.207C131.736,4.405,218.637,0,256,0  s124.264,4.405,124.264,45.207v61.913C380.264,115.328,373.61,121.981,365.402,121.981z M161.459,92.258h189.08V46.331  c-5.265-6.069-36.943-16.608-94.539-16.608s-89.274,10.538-94.541,16.608L161.459,92.258L161.459,92.258z" />
                            <path fill="#CFF09E" d="M319.904,326.235H192.096c-38.576,0-69.849,31.273-69.849,69.849v101.055h267.506V396.084  C389.753,357.507,358.48,326.235,319.904,326.235z M337.736,437.943H265.41v-50.281h72.326L337.736,437.943L337.736,437.943z" />
                            <path fill="#507C5C" d="M389.753,512H122.247c-8.208,0-14.861-6.653-14.861-14.861V396.084  c0-46.709,38.001-84.71,84.71-84.71h127.808c46.709,0,84.71,38.001,84.71,84.71v101.055C404.614,505.347,397.961,512,389.753,512z   M137.109,482.277h237.783v-86.193c0-30.32-24.667-54.987-54.987-54.987H192.096c-30.32,0-54.987,24.667-54.987,54.987  L137.109,482.277L137.109,482.277z M337.736,452.804H265.41c-8.208,0-14.861-6.653-14.861-14.861v-50.281  c0-8.208,6.653-14.861,14.861-14.861h72.326c8.208,0,14.861,6.653,14.861,14.861v50.281  C352.598,446.15,345.944,452.804,337.736,452.804z M280.273,423.081h42.603v-20.558h-42.603V423.081z" />
                          </svg>}
                          placeholder="Điều dưỡng phụ trách"
                          label="Điều dưỡng phụ trách"
                          name="nurse_in_charge"
                          onChange={(e) => {
                            setNurseInCharge(e)
                          }}
                          value={nurseInCharge}
                          options={nurseData}
                          errors={errors?.address?.province?.message}
                        />
                      )}
                    />
                    <div className="grid sm:grid-cols-1 grid-cols-2 grid-cols-4 gap-6">
                      <Controller
                        name="circuit"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <Input
                            disabled={readonly}
                            onChange={onChange}
                            value={value}
                            name="circuit"
                            label="Mạch(lần/phút)"
                            placeholder={""}
                            onFocus={() => {
                              if (value == 0) {
                                setValue("circuit", "");
                              }
                            }}
                          />
                        )}
                      />
                      <Controller
                        name="temperature"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <Input
                            disabled={readonly}
                            onChange={onChange}
                            value={value}
                            name="temperature"
                            label="Nhiệt độ(*C)"
                            placeholder={""}
                            onFocus={() => {
                              if (value == 0) {
                                setValue("temperature", "");
                              }
                            }}
                          />
                        )}
                      />
                      <div className="">
                        <p style={{ marginBottom: "10px" }} className="font-bold">
                          Huyết áp(mmHg)
                        </p>
                        <div className="flex">
                          <Controller
                            name="blood_pressure"
                            control={control}
                            render={({ field: { onChange, value } }) => (
                              <Input
                                disabled={readonly}
                                onChange={onChange}
                                value={value}
                                name="blood_pressure"
                                placeholder={""}
                                onFocus={() => {
                                  if (value == 0) {
                                    setValue("blood_pressure", "");
                                  }
                                }}
                              />
                            )}
                          />

                          <span className="m-auto">/</span>
                          <Controller
                            name="blood_pressure2"
                            control={control}
                            render={({ field: { onChange, value } }) => (
                              <Input
                                disabled={readonly}
                                onChange={onChange}
                                value={value}
                                name="blood_pressure2"
                                placeholder={""}
                                onFocus={() => {
                                  if (value == 0) {
                                    setValue("blood_pressure2", "");
                                  }
                                }}
                              />
                            )}
                          />

                        </div>
                      </div>
                      <div className="">
                        <p style={{ marginBottom: "10px" }} className="font-bold">
                          Huyết áp(mmHg) lần 2
                        </p>
                        <div className="flex">
                          <Controller
                            name="blood_pressure_1"
                            control={control}
                            render={({ field: { onChange, value } }) => (
                              <Input
                                disabled={readonly}
                                onChange={onChange}
                                value={value}
                                name="blood_pressure_1"
                                placeholder={""}
                                onFocus={() => {
                                  if (value == 0) {
                                    setValue("blood_pressure_1", "");
                                  }
                                }}
                              />
                            )}
                          />

                          <span className="m-auto">/</span>
                          <Controller
                            name="blood_pressure2_1"
                            control={control}
                            render={({ field: { onChange, value } }) => (
                              <Input
                                disabled={readonly}
                                onChange={onChange}
                                value={value}
                                name="blood_pressure2_1"
                                placeholder={""}
                                onFocus={() => {
                                  if (value == 0) {
                                    setValue("blood_pressure2_1", "");
                                  }
                                }}
                              />
                            )}
                          />

                        </div>
                      </div>
                      <Controller
                        name="respiratory_rate"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <Input
                            disabled={readonly}
                            onChange={onChange}
                            value={value}
                            name="respiratory_rate"
                            label="Nhịp thở(Lần/phút)"
                            placeholder={""}
                            onFocus={() => {
                              if (value == 0) {
                                setValue("respiratory_rate", "");
                              }
                            }}
                          />
                        )}
                      />
                      {/* <Controller
              name="height"
              control={control}
              render={({ field: { onChange, value } }) => ( */}
                      <Input
                        disabled={readonly}
                        onChange={(e) => setHeight(e.target.value)}
                        value={height}
                        name="height"
                        label="Chiều cao(Cm)"
                        placeholder={""}
                        onFocus={() => {
                          if (height == 0) {
                            setHeight("")
                          }
                        }}
                      />
                      {/* )}
            /> */}
                      {/* <Controller
              name="weight"
              control={control}
              render={({ field: { onChange, value } }) => ( */}
                      <Input
                        disabled={readonly}
                        onChange={(e) => setWeight(e.target.value)}
                        value={weight}
                        name="weight"
                        label="Cân nặng(Kg)"
                        placeholder={""}
                      // errors={errors?.name?.message}
                      />
                      {/* )}
            /> */}
                      {/* <Controller
              name="bmi"
              control={control}
              render={({ field: { onChange, value } }) => ( */}
                      <Input
                        disabled={true}
                        // onChange={onChange}
                        value={bmi}
                        name="bmi"
                        label="BMI"
                        placeholder={""}
                      // errors={errors?.name?.message}
                      />
                      {/* )}
            /> */}
                      <Controller
                        name="spo2"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <Input
                            disabled={readonly}
                            onChange={onChange}
                            value={value}
                            name="spo2"
                            label="SPO2"
                            placeholder={""}
                            onFocus={() => {
                              if (value == 0) {
                                setValue("spo2", "");
                              }
                            }}
                          />
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>}
            {currentUser?.role?.type != "care_concierge" && <div className="w-full">
              <input type="checkbox" name="panel" id="panel-6" class="hidden" />
              <label for="panel-6" class="relative block bg-black p-1 shadow border-b border-green cursor-pointer	bg-primary text-white font-bold">6. Khám</label>
              <div class="accordion__content overflow-scroll bg-grey-lighter">
                <div className="w-full py-4">
                  <div className="grid grid-cols-1 gap-6">
                    <Controller
                      name="reasons_to_get_hospitalized"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <Textarea
                          id="reasons_to_get_hospitalized"
                          label={<div className="flex">
                            <span className="mr-2">Lý do đến khám</span>
                            <Button
                              btnSize="auto"
                              className="w-8 h-8"
                              shape="circle"
                              type="button"
                              onClick={() => navigate(`/settings/abbreviation`)}
                            >
                              <Icon name="edit" />
                            </Button></div>}
                          size="large"
                          name="title.en"
                          value={value}
                          disabled={readonly || currentUser?.role?.type == "nurse"}
                          onChange={onChange}
                          errors={errors?.title?.en?.message}
                        />
                      )}
                    />
                  </div>
                  <div className="grid sm:grid-cols-1 grid-cols-1 gap-6 mt-4">
                    <Controller
                      name="inquiry"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <Textarea
                          id="inquiry"
                          disabled={readonly || currentUser?.role?.type == "nurse"}
                          label="Bệnh sử"
                          name="inquiry"
                          value={value}
                          onChange={onChange}
                          errors={errors?.title?.en?.message}
                        />
                      )}
                    />
                    {/* <Controller
                      name="premise"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <Textarea
                          id="premise"
                          label="Tiền căn"
                          size="large"
                          name="premise"
                          value={value}
                          disabled={readonly || currentUser?.role?.type == "nurse"}
                          onChange={onChange}
                          errors={errors?.title?.en?.message}
                        />
                      )}
                    />
                    <Controller
                      name="general_examination"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <Textarea
                          id="general_examination"
                          disabled={readonly || currentUser?.role?.type == "nurse"}
                          label="Khám tổng quát"
                          name="general_examination"
                          value={value}
                          onChange={onChange}
                          errors={errors?.title?.en?.message}
                        />
                      )}
                    />
                    <Controller
                      name="examination"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <Textarea
                          id="examination"
                          disabled={readonly || currentUser?.role?.type == "nurse"}
                          label="Khám cơ quan"
                          name="examination"
                          value={value}
                          onChange={onChange}
                          errors={errors?.title?.en?.message}
                        />
                      )}
                    />


                    <Controller
                      name="main_diagnose"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <Textarea
                          id="main_diagnose"
                          disabled={readonly || currentUser?.role?.type == "nurse"}
                          label="Bệnh chính"
                          name="main_diagnose"
                          value={value}
                          onChange={onChange}
                        // errors={errors?.title?.en?.message}
                        />
                      )}
                    />
                    <Controller
                      name="other_diagnose"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <Textarea
                          id="other_diagnose"
                          disabled={readonly || currentUser?.role?.type == "nurse"}
                          label="Bệnh kèm theo"
                          name="other_diagnose"
                          value={value}
                          onChange={onChange}
                        // errors={errors?.title?.en?.message}
                        />
                      )}
                    /> */}

                  </div>
                  <p className="font-bold text-2xl">Tiền căn bản thân</p>
                  <div className="grid sm:grid-cols-1 grid-cols-2 gap-6 mt-4">
                    <Controller
                      name="noi_khoa"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <Textarea
                          id="noi_khoa"
                          disabled={readonly || currentUser?.role?.type == "nurse"}
                          label="Nội khoa"
                          name="noi_khoa"
                          value={value}
                          onChange={onChange}
                          errors={errors?.title?.en?.message}
                        />
                      )}
                    />
                    <Controller
                      name="ngoai_khoa"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <Textarea
                          id="ngoai_khoa"
                          label="Ngoại khoa"
                          size="large"
                          name="ngoai_khoa"
                          value={value}
                          disabled={readonly || currentUser?.role?.type == "nurse"}
                          onChange={onChange}
                          errors={errors?.title?.en?.message}
                        />
                      )}
                    />
                    <Controller
                      name="san_khoa"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <Textarea
                          id="san_khoa"
                          disabled={readonly || currentUser?.role?.type == "nurse"}
                          label="Sản khoa"
                          name="san_khoa"
                          value={value}
                          onChange={onChange}
                          errors={errors?.title?.en?.message}
                        />
                      )}
                    />
                    <Controller
                      name="tiem_chung"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <Textarea
                          id="tiem_chung"
                          disabled={readonly || currentUser?.role?.type == "nurse"}
                          label="Tiêm chủng"
                          name="tiem_chung"
                          value={value}
                          onChange={onChange}
                          errors={errors?.title?.en?.message}
                        />
                      )}
                    />
                    <Controller
                      name="di_ung"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <Textarea
                          id="di_ung"
                          disabled={readonly || currentUser?.role?.type == "nurse"}
                          label="Dị ứng"
                          name="di_ung"
                          value={value}
                          onChange={onChange}
                          errors={errors?.title?.en?.message}
                        />
                      )}
                    />
                    <Controller
                      name="thoi_quen"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <Textarea
                          id="thoi_quen"
                          disabled={readonly || currentUser?.role?.type == "nurse"}
                          label="Thói quen"
                          name="thoi_quen"
                          value={value}
                          onChange={onChange}
                          errors={errors?.title?.en?.message}
                        />
                      )}
                    />
                    <Controller
                      name="nguy_co_khac"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <Textarea
                          id="nguy_co_khac"
                          disabled={readonly || currentUser?.role?.type == "nurse"}
                          label="Nguy cơ khác"
                          name="nguy_co_khac"
                          value={value}
                          onChange={onChange}
                          errors={errors?.title?.en?.message}
                        />
                      )}
                    />
                    <Controller
                      name="van_de_khac"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <Textarea
                          id="van_de_khac"
                          disabled={readonly || currentUser?.role?.type == "nurse"}
                          label="Vấn đề khác"
                          name="van_de_khac"
                          value={value}
                          onChange={onChange}
                          errors={errors?.title?.en?.message}
                        />
                      )}
                    />

                    {/* <Controller
                      name="main_diagnose"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <Textarea
                          id="main_diagnose"
                          disabled={readonly || currentUser?.role?.type == "nurse"}
                          label="Bệnh chính"
                          name="main_diagnose"
                          value={value}
                          onChange={onChange}
                        // errors={errors?.title?.en?.message}
                        />
                      )}
                    />

                    <Controller
                      name="other_diagnose"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <Textarea
                          id="other_diagnose"
                          disabled={readonly || currentUser?.role?.type == "nurse"}
                          label="Bệnh kèm theo"
                          name="other_diagnose"
                          value={value}
                          onChange={onChange}
                        // errors={errors?.title?.en?.message}
                        />
                      )}
                    /> */}

                  </div>
                  <div className="mt-4"><Controller
                    name="tien_can_gia_dinh"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <Textarea
                        id="tien_can_gia_dinh"
                        disabled={readonly || currentUser?.role?.type == "nurse"}
                        label="Tiền căn gia đình"
                        name="tien_can_gia_dinh"
                        value={value}
                        onChange={onChange}
                        errors={errors?.title?.en?.message}
                      />
                    )}
                  />
                  </div>
                  <p className="font-bold text-2xl">Khám lâm sàng</p>
                  <div className="flex flex-col gap-6 mt-4">
                    <Controller
                      name="tong_quat"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <Textarea
                          id="tong_quat"
                          disabled={readonly || currentUser?.role?.type == "nurse"}
                          label="Tổng quát"
                          name="tong_quat"
                          value={value}
                          onChange={onChange}
                          errors={errors?.title?.en?.message}
                        />
                      )}
                    />
                    <Controller
                      name="tim_mach"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <Textarea
                          id="tim_mach"
                          disabled={readonly || currentUser?.role?.type == "nurse"}
                          label="Tim mạch"
                          name="tim_mach"
                          value={value}
                          onChange={onChange}
                          errors={errors?.title?.en?.message}
                        />
                      )}
                    />
                    <Controller
                      name="ho_hap"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <Textarea
                          id="ho_hap"
                          disabled={readonly || currentUser?.role?.type == "nurse"}
                          label="Hô hấp"
                          name="ho_hap"
                          value={value}
                          onChange={onChange}
                          errors={errors?.title?.en?.message}
                        />
                      )}
                    />
                    <Controller
                      name="tieu_hoa_tiet_nieu"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <Textarea
                          id="tieu_hoa_tiet_nieu"
                          disabled={readonly || currentUser?.role?.type == "nurse"}
                          label="Tiêu hóa tiết niệu"
                          name="tieu_hoa_tiet_nieu"
                          value={value}
                          onChange={onChange}
                          errors={errors?.title?.en?.message}
                        />
                      )}
                    />
                    <Controller
                      name="co_xuong_khop"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <Textarea
                          id="co_xuong_khop"
                          disabled={readonly || currentUser?.role?.type == "nurse"}
                          label="Cơ xương khớp"
                          name="co_xuong_khop"
                          value={value}
                          onChange={onChange}
                          errors={errors?.title?.en?.message}
                        />
                      )}
                    />
                    <Controller
                      name="than_kinh"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <Textarea
                          id="than_kinh"
                          disabled={readonly || currentUser?.role?.type == "nurse"}
                          label="Thần kinh"
                          name="than_kinh"
                          value={value}
                          onChange={onChange}
                          errors={errors?.title?.en?.message}
                        />
                      )}
                    />
                    <Controller
                      name="san_phu_khoa"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <Textarea
                          id="san_phu_khoa"
                          disabled={readonly || currentUser?.role?.type == "nurse"}
                          label="Sản phụ khoa"
                          name="san_phu_khoa"
                          value={value}
                          onChange={onChange}
                          errors={errors?.title?.en?.message}
                        />
                      )}
                    />
                    <Controller
                      name="mat_tai_mui_hong"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <Textarea
                          id="mat_tai_mui_hong"
                          disabled={readonly || currentUser?.role?.type == "nurse"}
                          label="Mắt - tai mũi họng - răng hàm mặt"
                          name="mat_tai_mui_hong"
                          value={value}
                          onChange={onChange}
                          errors={errors?.title?.en?.message}
                        />
                      )}
                    />
                    <Controller
                      name="co_quan_khac"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <Textarea
                          id="co_quan_khac"
                          disabled={readonly || currentUser?.role?.type == "nurse"}
                          label="Cơ quan khác"
                          name="co_quan_khac"
                          value={value}
                          onChange={onChange}
                          errors={errors?.title?.en?.message}
                        />
                      )}
                    />
                    <div className="col-span-1">
                      <Controller
                        name="cac_thang_diem_can_danh_gia"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <Textarea
                            id="cac_thang_diem_can_danh_gia"
                            disabled={readonly || currentUser?.role?.type == "nurse"}
                            label="Các thang điểm cần đánh giá"
                            name="cac_thang_diem_can_danh_gia"
                            value={value}
                            onChange={onChange}
                            errors={errors?.title?.en?.message}
                          />
                        )}
                      />
                    </div>
                    <div className="col-span-2">
                      <Controller
                        name="dinh_duong"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <Textarea
                            id="dinh_duong"
                            disabled={readonly || currentUser?.role?.type == "nurse"}
                            label="Dinh dưỡng"
                            name="dinh_duong"
                            value={value}
                            onChange={onChange}
                            errors={errors?.title?.en?.message}
                          />
                        )}
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-1 grid-cols-2 gap-6 mt-4">
                    <div className="col-span-2">
                      <Controller
                        name="ket_qua_cls"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <Textarea
                            id="ket_qua_cls"
                            disabled={readonly || currentUser?.role?.type == "nurse"}
                            label="Kết quả cận lâm sàng"
                            name="ket_qua_cls"
                            value={value}
                            onChange={onChange}
                            errors={errors?.title?.en?.message}
                          />
                        )}
                      />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-1 grid-cols-2 gap-6 mt-4">
                    <div className="col-span-2">
                      <Controller
                        name="chan_doan"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <Textarea
                            id="chan_doan"
                            disabled={readonly || currentUser?.role?.type == "nurse"}
                            label="Chẩn đoán"
                            name="chan_doan"
                            value={value}
                            onChange={onChange}
                            errors={errors?.title?.en?.message}
                          />
                        )}
                      />
                    </div>
                  </div>

                  <div className="mt-4"><Controller
                    name="treatment_regimen"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <Textarea
                        id="treatment_regimen"
                        disabled={readonly || currentUser?.role?.type == "nurse"}
                        label="Hướng điều trị"
                        name="treatment_regimen"
                        value={value}
                        onChange={onChange}
                        errors={errors?.title?.en?.message}
                      />
                    )}
                  />
                  </div>
                </div>
              </div>
            </div>}
            {currentUser?.role?.type != "care_concierge" &&
              <div className="w-full">
                <input type="checkbox" name="panel" id="panel-7" class="hidden" />
                <label for="panel-7" class="relative block bg-black p-1 shadow border-b border-green cursor-pointer	bg-primary text-white font-bold">7. Chỉ định dịch vụ/Gói dịch vụ</label>

                <div class="accordion__content overflow-scroll bg-grey-lighter">
                  <div className="w-full">
                    <h1>GỢI Ý:</h1>
                    <h1>Khách hàng {data?.patient?.gender == "male" ? "nam" : "nữ"}, {getAge(data?.patient?.birthday)} tuổi, BMI {bmi}, có các vấn đề sức khoẻ:</h1>
                    <div className="grid sm:grid-cols-1 grid-cols-4 gap-x-6 gap-y-4 py-4">
                      <Controller
                        name="searchTerm"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <>
                            {serviceGroups.map((searchTerm) => (
                              <Button
                                key={searchTerm}
                                onChange={onchange}
                                type="button"
                                className={classNames(
                                  "text-center w-full h-14 pl-2 !justify-start capitalize",
                                  {
                                    "bg-primary text-white font-bold": searchTerms.indexOf(searchTerm) != -1,
                                    "bg-primary/10 text-primary font-normal": searchTerms.indexOf(searchTerm) == -1,
                                  }
                                )}
                                onClick={() => {
                                  let newSearchTerms = [...searchTerms];
                                  const index = newSearchTerms.indexOf(searchTerm);
                                  if (index != -1) {
                                    newSearchTerms.splice(index, 1);
                                  } else {
                                    newSearchTerms.push(searchTerm);
                                  }
                                  setSearchTerms(newSearchTerms);
                                }}
                              >
                                {translateServiceGroup(searchTerm)}
                              </Button>
                            ))}
                            {errors?.status?.message && (
                              <p className="text-12 text-error mt-1">{errors?.status?.message}</p>
                            )}
                          </>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-1 gap-x-2">
                      {searchData && Object.entries(searchData)
                        .map(([serviceName, service]) => {
                          return <div><h1 className="font-bold">- {serviceName}</h1>
                            {service.map(s => {
                              const usedBS = usedBundleMedicalServices.find(us => us.id == s.id);
                              return <p className="flex items-center">
                                <div>
                                {s.type == "service-bundle" &&
                                  <Button
                                    disabled={usedBS?.attributes?.paid || readonly}
                                    type="button"
                                    className={"inline text-xs h-8 mr-4 mt-1"}
                                    icon={<Icon name="add-circle" className="fill-white" />}
                                    onClick={e => addBundleMedicalServiceById(s.id)}
                                  >
                                    {usedBS ? 'Bỏ' : "Thêm"}
                                  </Button>}

                                {s.type == "product" &&
                                  <Button
                                    type="button"
                                    className={"inline text-xs h-8 mr-4 mt-1"}
                                    icon={<Icon name="add-circle" className="fill-white" />}
                                    onClick={e => showProductDetail(s)}
                                  >
                                    Chi tiết
                                  </Button>}
                                {s.type == "product" &&
                                  <Button
                                    type="button"
                                    className={"inline text-xs h-8 mr-4 mt-1"}
                                    icon={<Icon name="add-circle" className="fill-white" />}
                                    onClick={e => addToPrescriptions(s)}
                                  >
                                    Thêm vào
                                    đơn thuốc
                                  </Button>}
                                  </div>
                                {s.label}
                                <div className="ml-4 font-bold"><span>{numberWithCommas(s?.price)}đ</span></div>
                              </p>
                            })}
                          </div>
                        })
                      }
                    </div>
                  </div>
                  <div className="w-full py-4">
                    <div>
                      {readonly && servicesData && servicesData.length > 0 && <p className="underline text-xl font-bold">Dịch vụ:</p>}
                      {readonly && servicesData && servicesData.map((s) => <p>{s.attributes.label}</p>)}
                      {readonly && bundleServicesData && bundleServicesData.length > 0 && <p className="underline mt-3 text-xl font-bold">Gói dịch vụ:</p>}
                      {readonly &&
                        bundleServicesData &&
                        bundleServicesData.map((s) => (
                          <div>
                            <p className="font-semibold">- {s.attributes.label}</p>
                            {s.attributes.medical_services.data?.map((ss) => (
                              <p>+ {ss.attributes.label} </p>
                            ))}
                          </div>
                        ))}
                    </div>
                    {!readonly && (
                      <div className="grid grid-cols-2 sm:grid-cols-1 gap-6">
                        <div>
                          <p className="inline-block text-16 font-bold mb-2">Gói dịch vụ</p>
                          <SearchInput
                            placeholder="Nhập tên gói cần tìm"
                            className="flex-1 mb-2"
                            value={filterBundleService}
                            onChange={handleSearchBundleService}
                          />
                          <div
                            style={{
                              maxHeight: "300px",
                              overflow: "scroll",
                            }}
                          >
                            {bundleServices &&
                              (!!filterBundleService
                                ? bundleServices.filter((m) =>
                                  matchSearchString(m.attributes.label, filterBundleService)
                                )
                                : bundleServices
                              ).map((m) => (
                                <div className="mb-2 flex">
                                  <Button
                                    disabled={currentUser?.role?.type == "nurse"}
                                    type="button"
                                    className={"inline text-xs h-16"}
                                    icon={<Icon name="add-circle" className="fill-white" />}
                                    onClick={() => addBundleMedicalService(m)}
                                  >
                                    <div className="flex flex-col">
                                      <div>{m.attributes?.label}</div>
                                      <div><span><del>{m.attributes?.original_price && numberWithCommas(m.attributes?.original_price) + 'đ'}</del>   {numberWithCommas(m.attributes?.price)}đ</span></div>
                                      <div><span>{m.attributes.discount_note}</span></div>
                                    </div>
                                  </Button>
                                  <Button
                                    type="button"
                                    className={"inline ml-1 text-xs h-16"}
                                    disabled={currentUser?.role?.type == "nurse"}
                                    onClick={(e) => {
                                      toast.success(
                                        <div>
                                          <p>Gói dịch vụ {m.attributes.label} gồm: </p>
                                          {m.attributes.medical_services.map((a, i) => (
                                            <p>{i + 1}. {a.label}</p>
                                          ))}
                                        </div>,
                                        { progress: 1, className: "w-[500px] left-[-177px]" }
                                      )
                                    }}
                                  >
                                    i
                                  </Button>
                                </div>
                              ))}
                          </div>
                        </div>
                        <div>
                          <p className="inline-block text-16 font-bold mb-2">Gói dịch vụ sử dụng</p>
                          <SearchInput
                            placeholder="Nhập tên gói cần tìm"
                            className="flex-1 mb-2"
                            value={filterUsedBundleService}
                            onChange={(e) => {
                              setFilterUsedBundleService(e.target.value)
                            }}
                          />
                          <div
                            style={{
                              maxHeight: "300px",
                              overflow: "scroll",
                            }}
                          >
                            {usedBundleMedicalServices &&
                              (!!filterUsedBundleService
                                ? usedBundleMedicalServices.filter((m) =>
                                  matchSearchString(m.attributes.label, filterUsedBundleService)
                                )
                                : usedBundleMedicalServices
                              ).map((m) => (
                                <div className="mb-2 flex">
                                  <Button
                                    disabled={currentUser?.role?.type == "nurse" || m.attributes?.paid}
                                    type="button"
                                    className={"inline text-xs h-16"}
                                    icon={<Icon name="close-circle" className="fill-white" />}
                                    onClick={() => removeBundleMedicalService(m)}
                                  >
                                    <div className="flex flex-col">
                                      <div>{m.attributes?.label}</div>
                                      <div><span><del>{m.attributes?.original_price && numberWithCommas(m.attributes?.original_price) + 'đ'}</del>   {numberWithCommas(m.attributes?.price)}đ</span></div>
                                      <div><span>{m.attributes.discount_note} {m.attributes?.paid ? '(Đã thanh toán)' : ''}</span></div>
                                    </div>
                                  </Button>
                                  <Button
                                    disabled={currentUser?.role?.type == "nurse"}
                                    type="button"
                                    className={"inline ml-1"}
                                    onClick={(e) => {
                                      toast.success(
                                        <div>
                                          <p>Gói dịch vụ {m.attributes.label} gồm: </p>
                                          {m.attributes.medical_services.map((a, i) => (
                                            <p>{i + 1}. {a.label}</p>
                                          ))}
                                        </div>,
                                        { progress: 1, className: "w-[500px] left-[-177px]" }
                                      )
                                    }}
                                  >
                                    i
                                  </Button>
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                    )}
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
              </div>}
            <div className="w-full">
              <input type="checkbox" name="panel" id="panel-8" class="hidden" />
              <label for="panel-8" class="relative block bg-black p-1 shadow border-b border-green cursor-pointer	bg-primary text-white font-bold">8. Các giấy tờ liên quan &#62;</label>
              <div class="accordion__content overflow-scroll bg-grey-lighter">
                <div className="w-full py-4">
                  <div className="flex flex-col items-start gap-x-4 pl-4">
                    {references?.map((item, index) => (
                      <div key={index} className="relative">
                        <a href={getStrapiMedia(item)} target="_blank" rel="noreferrer">
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
                        onChange={(e) => uploadAssets(data?.id, e)}
                        multiple
                      />
                      <p>Tải lên</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {
              <div className="w-full">
                <input type="checkbox" name="panel" id="panel-9" class="hidden" />
                <label for="panel-9" class="relative block bg-black p-1 shadow border-b border-green cursor-pointer	bg-primary text-white font-bold">9. CC note</label>
                <div class="accordion__content overflow-scroll bg-grey-lighter">
                  <div className="col-span-2">
                    <Controller
                      name="cc_note"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <Input
                          name="cc_note"
                          placeholder={"Nhập CC Note"}
                          value={value}
                          onChange={onChange}
                          errors={errors?.address?.address?.message}
                        />
                      )}
                    />
                  </div>
                </div>
              </div>}
            <div className="w-full flex flex-row">
              <Controller
                name="doctor_in_charge"
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
                      name="doctor_in_charge"
                      onChange={(e) => {
                        setDoctorInCharge(e)
                      }}
                      value={doctorInCharge}
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
          {readonly && currentUser?.role?.type != "care_concierge" && (
            <Button
              btnType="primary"
              type="reset"
              onClick={(e) => {
                downloadShortenPDFV2()
              }}
            >
              Tải bệnh án
            </Button>
          )}
          {currentUser.role.type != "pharmacist" && <Button
            btnType="primary"
            type="reset"
            onClick={(e) => {
              window.location.href = `/bookings/medical-records/${data.id}/edit`
            }}
          >
            Sửa bệnh án
          </Button>
          }
          {readonly && currentUser?.role?.type != "doctor" && currentUser?.role?.type != "nurse" && (
            <Button
              btnType="primary"
              type="reset"
              onClick={(e) => {
                // downloadInvoice()
                exportInvoice();
              }}
            >
              Xuất hoá đơn
            </Button>
          )}
          {readonly && currentUser?.role?.type != "care_concierge" && (
            <Button
              btnType="primary"
              type="reset"
              onClick={(e) => {
                generatePhieuChiDinh()
              }}
            >
              Tải phiếu chỉ định
            </Button>
          )}
          {currentUser?.role?.type != "care_concierge" && (<Button btnType="primary" type="reset" onClick={() => setVisiblePrescriptionModal(true)}>
            Đơn thuốc
          </Button>)}
          {currentUser?.role?.type != "care_concierge" && (<Button btnType="primary" type="reset" onClick={() => setVisibleAdditionalPrescriptionModal(true)}>
            Tư vấn TPCN
          </Button>)}
          {readonly && currentUser?.role?.type != "care_concierge" && (<Button btnType="primary" type="reset" onClick={() => setVisibleTestResultModal(true)}>
            Kết quả xét nghiệm
          </Button>)}
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
