import { useCallback, useEffect, useState, useRef } from "react"
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import * as yup from "yup"
import { yupResolver } from "@hookform/resolvers/yup"
import cloneDeep from "lodash/cloneDeep"
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
import { flatten } from "lodash"
import Tagify from '@yaireo/tagify'
import '@yaireo/tagify/dist/tagify.css' // imports tagify SCSS file from within
import { useSelector } from "react-redux";
import { JWT_TOKEN, BRANCH } from "../../../constants/Authentication"
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
    value: "family",
    label: "Gói gia đình",
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
  const [districtList, setDistrictList] = useState([])
  const [wardList, setWardList] = useState([])
  const [membershipPackage, setMembershipPackages] = useState([])
  const [loadingCustomers, setLoadingCustomers] = useState(false)
  const [customersData, setCustomersData] = useState([])
  const [height, setHeight] = useState(data.height)
  const [weight, setWeight] = useState(data.weight)
  const [bmi, setBMI] = useState(data.bmi)
  const [bp1, setBP1] = useState(data.blood_pressure)
  const [bp2, setBP2] = useState(data.blood_pressure2)
  const [visiblePrescriptionModal, setVisiblePrescriptionModal] = useState(false)
  const [visibleAdditionalPrescriptionModal, setVisibleAdditionalPrescriptionModal] = useState(false);
  const [visibleTestResultModal, setVisibleTestResultModal] = useState(false)
  const [tagifyWhitelist, setTagifyWhitelist] = useState();
  const inputElement = useRef();
  const currentUser = useSelector((state) => state.user.currentUser)
  const [selectedMembership, setSelectedMembership] = useState();
  const [references, setReferences] = useState([]);

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
      circuit: data?.circuit || 0,
      temperature: data?.temperature || 0,
      blood_pressure: data?.blood_pressure || 0,
      respiratory_rate: data?.respiratory_rate || 0,
      height: data?.height || "",
      weight: data?.weight || "",
      bmi: data?.bmi || "",
      spo2: data?.spo2 || 0,
      results: data?.results,
      phone: data?.patient?.phone || "",
      email: data?.patient?.email || "",
      firstName: data?.patient?.firstName || "",
      lastName: data?.patient?.lastName || "",
      full_name: data?.patient?.full_name || "",
      gender: data?.patient?.gender || "",
      phone: data?.patient?.phone || "",
      status: data?.status || "",
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
        s.attributes.medical_services.data?.forEach(ss => {
          newExistServices[ss.id] = true;
        })
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
      setUsedCliniqueServices(cliniqueServicesData);
      setCliniqueServices(cliniqueServicesData);
    }

    if (data.doctor_in_charge) {
      setDoctorInCharge({
        value: data.doctor_in_charge.id,
        label: data.doctor_in_charge.data?.attributes?.firstName + " " + data.doctor_in_charge.data?.attributes?.lastName,
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

  }, [])

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
    getListUsersByRole("admin")
      .then((res) => {
        if (res.data) {
          setCustomersData(
            res.data?.map((customer) => ({
              value: customer?.id,
              label: `${customer?.firstName} ${customer?.lastName}`,
            }))
          )
        }
        setLoadingCustomers(false)
      })
      .catch(() => {
        setLoadingCustomers(false)
      })
  }

  const loadMedicalServices2 = () => {
    let monthlyGold = [];
    let yearlyGold = [];
    // if (data.patient.membership == "gold") {
    //   return;
    // }
    axios2
      // .get("https://api.echomedi.com/api/medical-services?pagination[page]=1&pagination[pageSize]=10000&populate=*")
      // .get("https://api.echomedi.com/api/medical-service/getGoldMedicalServices/" + data.patient.id)
      .get("http://localhost:1337/api/medical-service/getGoldMedicalServices/" + data.patient.id)
      .then((response) => {
        const services = response.data.data;
        let ms = services.filter(s => s.attributes?.group_service != "Khám lâm sàng");
        ms = ms.map(s => {

          if (Array.isArray(s.attributes["Locations"])) {
            s.attributes["Locations"].forEach(sl => {
              if (sl["location"] == branch) {
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
            if (data.patient.membership == "gold" && s.attributes["membership_discount"].gold_percentage) {
              s.attributes["original_price"] = s.attributes["price"];
              s.attributes["discount_note"] = "Thành viên vàng";
              s.attributes["discount_percentage"] = s.attributes["membership_discount"].gold_percentage;
              s.attributes["price"] = s.attributes["price"] * (100 - s.attributes["membership_discount"].gold_percentage) / 100;
            }
            if (data.patient.membership == "platinum" && s.attributes["membership_discount"].platinum_percentage) {
              s.attributes["discount_note"] = "Thành viên bạch kim";
              s.attributes["original_price"] = s.attributes["price"];
              s.attributes["discount_percentage"] = s.attributes["membership_discount"].platinum_percentage;
              s.attributes["price"] = s.attributes["price"] * (100 - s.attributes["membership_discount"].platinum_percentage) / 100;
            }
          }

          return s;
        });

        ms = ms.filter(s => !s.attributes["disabled"]);

        let cs = services.filter(s => s.attributes.group_service == "Khám lâm sàng");
        cs = cs.map(s => {
          if (Array.isArray(s.attributes["Locations"])) {
            s.attributes["Locations"].forEach(sl => {
              if (sl["location"] == branch) {
                s.attributes["disabled"] = sl["disabled"];
                s.attributes["price"] = parseInt(sl["price"]);
              }
            })
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
      // .get("https://api.echomedi.com/api/service-bundles?pagination[page]=1&pagination[pageSize]=10000&populate=*")
      // .get("https://api.echomedi.com/api/service-bundle/getGoldBundleServices/" + data.patient.id)
      .get("http://localhost:1337/api/service-bundle/getGoldBundleServices/" + data.patient.id)
      .then((response) => {
        if (!data.bundle_services) {
          let ms = response.data.data;
          ms = ms.map(s => {
            if (Array.isArray(s.attributes["Locations"])) {
              s.attributes["Locations"].forEach(sl => {
                if (sl["location"] == branch) {
                  s.attributes["disabled"] = sl["disabled"];
                  s.attributes["price"] = parseInt(sl["price"]);
                }
              })
            }

            if (s.attributes["membership_discount"] && !s.attributes["membership_gold"]) {
              if (data.patient.membership == "gold" && s.attributes["membership_discount"].gold_percentage) {
                s.attributes["original_price"] = s.attributes["price"];
                s.attributes["discount_note"] = "Thành viên vàng";
                s.attributes["discount_percentage"] = s.attributes["membership_discount"].gold_percentage;
                s.attributes["price"] = s.attributes["price"] * (100 - s.attributes["membership_discount"].gold_percentage) / 100;
              } else if (data.patient.membership == "platinum" && s.attributes["membership_discount"].platinum_percentage) {
                s.attributes["discount_note"] = "Thành viên bạch kim";
                s.attributes["original_price"] = s.attributes["price"];
                s.attributes["discount_percentage"] = s.attributes["membership_discount"].platinum_percentage;
                s.attributes["price"] = s.attributes["price"] * (100 - s.attributes["membership_discount"].platinum_percentage) / 100;
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
            if (Array.isArray(s.attributes["Locations"])) {
              s.attributes["Locations"].forEach(sl => {
                if (sl["location"] == branch) {
                  s.attributes["disabled"] = sl["disabled"];
                  s.attributes["price"] = parseInt(sl["price"]);
                }
              })
            }

            if (s.attributes["membership_discount"] && !s.attributes["membership_gold"]) {
              if (data.patient.membership == "gold" && s.attributes["membership_discount"].gold_percentage) {
                s.attributes["original_price"] = s.attributes["price"];
                s.attributes["discount_note"] = "Thành viên vàng";
                s.attributes["discount_percentage"] = s.attributes["membership_discount"].gold_percentage;
                s.attributes["price"] = s.attributes["price"] * (100 - s.attributes["membership_discount"].gold_percentage) / 100;
              } else if (data.patient.membership == "platinum" && s.attributes["membership_discount"].platinum_percentage) {
                s.attributes["discount_note"] = "Thành viên bạch kim";
                s.attributes["original_price"] = s.attributes["price"];
                s.attributes["discount_percentage"] = s.attributes["membership_discount"].platinum_percentage;
                s.attributes["price"] = s.attributes["price"] * (100 - s.attributes["membership_discount"].platinum_percentage) / 100;
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
      toast.error("Không thể thêm dịch vụ này vì bị trùng.")
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
      toast.error("Không thể thêm dịch vụ này vì bị trùng.")
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

  const addBundleMedicalService = (m) => {
    const ms = m.attributes.medical_services
    const exist = ms.some((s) => s.id in existServices)

    if (exist) {
      toast.error("Không thể thêm dịch vụ này vì bị trùng.")
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
    let circuit = 0, temperature = 0, respiratory_rate = 0, spo2 = 0;
    try {
      circuit = parseInt(formData.circuit);
      temperature = parseInt(formData.temperature);
      respiratory_rate = parseInt(formData.respiratory_rate);
      spo2 = parseInt(formData.spo2);
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
        patient: data.patient.id,
        total,
        booking: data.id,
        circuit,
        temperature,
        respiratory_rate,
        spo2,
        blood_pressure: bp1,
        blood_pressure2: bp2,
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

      if (data?.status != payload.status) {
        await updateStatusBooking(data.id, payload.status)
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
  }

  useEffect(() => {
    if (data) {
      generateTimeSlots()
    }
  }, [data])

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

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-6">
          <div class="accordion flex flex-col items-center">

            <div className="w-full">
              <input type="checkbox" name="panel" id="panel-1" class="hidden" />
              <label for="panel-1" class="relative block bg-black p-1 shadow border-b border-green cursor-pointer	bg-form font-bold">1. Hành chính</label>
              <div class="accordion__content overflow-scroll bg-grey-lighter">
                <div className="grid sm:grid-cols-1 grid-cols-2 gap-x-6 gap-y-4 py-4">
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
              <label for="panel-2" class="relative block bg-black p-1 shadow border-b border-green cursor-pointer bg-form font-bold">2. Thông tin lịch hẹn</label>
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
              <label for="panel-3" class="relative block bg-black p-1 shadow border-b border-green cursor-pointer	bg-form font-bold">3. Trạng thái</label>
              <div class="accordion__content overflow-scroll bg-grey-lighter">
                <div className="w-full">
                  <Controller
                    name="doctor_in_charge"
                    control={control}
                    render={({ field: { value, ref } }) => (
                      <Select
                        // isDisabled={true}
                        placeholder="Bác sĩ phụ trách"
                        label="Bác sĩ phụ trách"
                        name="doctor_in_charge"
                        onChange={(e) => {
                          setDoctorInCharge(e)
                        }}
                        value={doctorInCharge}
                        options={customersData}
                        errors={errors?.address?.province?.message}
                      />
                    )}
                  />
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
              <label for="panel-4" class="relative block bg-black p-1 shadow border-b border-green cursor-pointer	bg-form font-bold">4. Tư vấn ban đầu</label>
              <div class="accordion__content overflow-scroll bg-grey-lighter">
                <div className="w-full py-4">
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
                      }}
                      value={selectedMembership}
                      options={membershipPackage}
                      errors={errors?.address?.ward?.message}
                    />
                    {/* )}
              /> */}
                  </div>}
                  {!readonly && !data.patient.membership && (
                    <div className="grid grid-cols-1 gap-6 py-4">
                      <div>
                        <p className="inline-block text-16 font-bold mb-2">Gói thành viên</p>
                        {/* <SearchInput
                  placeholder="Nhập tên gói cần tìm"
                  className="flex-1 mb-2"
                  value={filterBundleService}
                  onChange={handleSearchBundleService}
                /> */}
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
                    <div className="grid grid-cols-2 gap-6">
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
                                  {m.attributes.label}
                                  <span>{numberWithCommas(m.attributes.price)}</span>
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
                                  type="button"
                                  className={"inline"}
                                  icon={<Icon name="close-circle" className="fill-white" />}
                                  onClick={() => removeCliniqueService(m)}
                                >
                                  {m.attributes.label}
                                  <span>{numberWithCommas(m.attributes.price)}</span>
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
                <label for="panel-5" class="relative block bg-black p-1 shadow border-b border-green cursor-pointer	bg-form font-bold">5. Sinh hiệu</label>
                <div class="accordion__content overflow-scroll bg-grey-lighter">
                  <div className="w-full py-4">
                    <div className="grid sm: grid-cols-2 grid-cols-4 gap-6">
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
                      {/* <Controller
              name="blood_pressure"
              control={control}
              render={({ field: { onChange, value } }) => ( */}
                      <div className="">
                        <p style={{ marginBottom: "10px" }} className="font-bold">
                          Huyết áp(mmHg)
                        </p>
                        <div className="flex">
                          <Input
                            disabled={readonly}
                            onChange={(e) => setBP1(e.target.value)}
                            value={bp1}
                            name="blood_pressure"
                            placeholder={""}
                            onFocus={() => {
                              if (bp1 == 0) {
                                setBP1("");
                              }
                            }}
                          />
                          <span className="m-auto">/</span>
                          <Input
                            disabled={readonly}
                            onChange={(e) => setBP2(e.target.value)}
                            value={bp2}
                            name="blood_pressure"
                            placeholder={""}
                            onFocus={() => {
                              if (bp2 == 0) {
                                setBP2("");
                              }
                            }}
                          />
                        </div>
                      </div>
                      {/* )} */}
                      {/* /> */}
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
              <label for="panel-6" class="relative block bg-black p-1 shadow border-b border-green cursor-pointer	bg-form font-bold">6. Khám</label>
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
                            <span className="mr-2">Lý do nhập viện</span>
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
                  <div className="grid sm:grid-cols-1 grid-cols-2 gap-6 mt-4">
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
                    <Controller
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
                    />

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
                <label for="panel-7" class="relative block bg-black p-1 shadow border-b border-green cursor-pointer	bg-form font-bold">7. Chỉ định dịch vụ/Gói dịch vụ</label>
                <div class="accordion__content overflow-scroll bg-grey-lighter">
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
                      <div className="grid grid-cols-2 gap-6">
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
                                    className={"inline"}
                                    icon={<Icon name="add-circle" className="fill-white" />}
                                    onClick={() => addBundleMedicalService(m)}
                                  >
                                    {m.attributes?.label} - <del>{m.attributes?.original_price}</del>
                                    <span>{numberWithCommas(m.attributes?.price)}</span>
                                    <span>{m.attributes.discount_note}</span>
                                  </Button>
                                  {/* <Button 
                        onClick={e => {
                          // toast.success(<div>{m.attributes.medical_services.data.map(a => <p>{a.attributes.label}</p>)}</div>, 
                          // {progress: 1, className: "w-[500px] left-[-177px]"})
                        }}
                      className="ml-2" shape="circle">i</Button> */}
                                  <Button
                                    type="button"
                                    className={"inline ml-1"}
                                    disabled={currentUser?.role?.type == "nurse"}
                                    onClick={(e) => {
                                      toast.success(
                                        <div>
                                          {m.attributes.medical_services.map((a) => (
                                            <p>{a.label}</p>

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
                                    disabled={currentUser?.role?.type == "nurse"}
                                    type="button"
                                    className={"inline"}
                                    icon={<Icon name="close-circle" className="fill-white" />}
                                    onClick={() => removeBundleMedicalService(m)}
                                  >
                                    {m.attributes.label}
                                    <span>{numberWithCommas(m.attributes.price)}</span>
                                    <span>{m.attributes.discount_note}</span>
                                  </Button>
                                  <Button
                                    disabled={currentUser?.role?.type == "nurse"}
                                    type="button"
                                    className={"inline ml-1"}
                                    onClick={(e) => {
                                      toast.success(
                                        <div>
                                          {m.attributes.medical_services.map((a) => (
                                            <p>{a.label}</p>
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
                      <div className="grid grid-cols-2 gap-6">
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
                                    className={"inline"}
                                    icon={<Icon name="add-circle" className="fill-white" />}
                                    onClick={() => addMedicalService(m)}
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
                                    disabled={currentUser?.role?.type == "nurse"}
                                    type="button"
                                    className={"inline"}
                                    icon={<Icon name="close-circle" className="fill-white" />}
                                    onClick={() => removeMedicalService(m)}
                                  >
                                    {m.attributes.label}
                                    <span>{numberWithCommas(m.attributes.price)}</span>
                                    <span>{m.attributes.discount_note}</span>
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
            {currentUser?.role?.type != "care_concierge" &&
              <div className="w-full">
                <input type="checkbox" name="panel" id="panel-8" class="hidden" />
                <label for="panel-8" class="relative block bg-black p-1 shadow border-b border-green cursor-pointer	bg-form font-bold">8. Các giấy tờ liên quan</label>
                <div class="accordion__content overflow-scroll bg-grey-lighter">
                  <div className="w-full py-4">
                    <div className="flex items-center gap-x-4 pl-4">
                      {references?.map((item, index) => (
                        <div key={index} className="relative">
                          <a href={getStrapiMedia(item)} target="_blank" rel="noreferrer">
                            {item?.mime?.startsWith("image") ? (
                              <img className="rounded-xl w-30 h-30" src={getStrapiMedia(item)} alt="name" />
                            ) : (
                              <div className="inline-flex items-center justify-center rounded-xl bg-primary text-white font-bold h-30 w-30 relative border-primary border-1">
                                {item?.name}
                              </div>
                            )}
                          </a>
                          <div
                            onClick={(e) => {
                              e.stopPropagation()
                              onRemove(item)
                            }}
                            className="absolute cursor-pointer -top-2 -right-2 z-20"
                          >
                            <Icon name="close-circle" className="fill-red bg-white rounded-full" />
                          </div>
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
              </div>}
            {
              <div className="w-full">
                <input type="checkbox" name="panel" id="panel-9" class="hidden" />
                <label for="panel-9" class="relative block bg-black p-1 shadow border-b border-green cursor-pointer	bg-form font-bold">9. CC note</label>
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
          </div>
          <p className="text-xl font-semibold text-right">Tổng {numberWithCommas(total)}</p>
        </div>

        <div className="flex gap-2 my-4 grid grid-cols-4 sm:grid-cols-1 mb-2">
          {!readonly && (
            <Button className="fill-primary" type="submit">
              Lưu
            </Button>
          )}
          {!readonly && (
            <Button
              btnType="outline"
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
              btnType="outline"
              type="reset"
              onClick={(e) => {
                downloadPDF()
              }}
            >
              Tải bệnh án
            </Button>
          )}
          {readonly && currentUser?.role?.type != "care_concierge" && (
            <Button
              btnType="outline"
              type="reset"
              onClick={(e) => {
                downloadShortenPDF()
              }}
            >
              Tải bệnh án tóm tắt
            </Button>
          )}
          {readonly && (
            <Button
              btnType="outline"
              type="reset"
              onClick={(e) => {
                window.location.href = `/bookings/medical-records/${data.id}/edit`
              }}
            >
              Sửa bệnh án
            </Button>
          )}
          {readonly && currentUser?.role?.type != "doctor" && currentUser?.role?.type != "nurse" && (
            <Button
              btnType="outline"
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
              btnType="outline"
              type="reset"
              onClick={(e) => {
                generatePhieuChiDinh()
              }}
            >
              Tải phiếu chỉ định
            </Button>
          )}
          {readonly && currentUser?.role?.type != "care_concierge" && (<Button btnType="outline" type="reset" onClick={() => setVisiblePrescriptionModal(true)}>
            Đơn thuốc
          </Button>)}
          {readonly && currentUser?.role?.type != "care_concierge" && (<Button btnType="outline" type="reset" onClick={() => setVisibleAdditionalPrescriptionModal(true)}>
            Tư vấn TPCN
          </Button>)}
          {readonly && currentUser?.role?.type != "care_concierge" && (<Button btnType="outline" type="reset" onClick={() => setVisibleTestResultModal(true)}>
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
        // <PrescriptionModal
        //   patientId={data?.patient?.id}

        //   medicalRecordId={data?.medical_record?.data?.id}
        //   visibleModal={visiblePrescriptionModal}
        //   onClose={() => setVisiblePrescriptionModal(false)}
        // />

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
              usedBundleMedicalServices?.map((item) => item?.attributes?.medical_services?.data)
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
  return x?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
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

export default TreatmentForm
