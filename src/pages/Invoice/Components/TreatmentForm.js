import { useEffect, useState } from "react"
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import * as yup from "yup"
import { yupResolver } from "@hookform/resolvers/yup"
import cloneDeep from "lodash/cloneDeep"
import keys from "lodash/keys"
import classNames from "classnames"
import { toast } from "react-toastify"
import MDEditor from "@uiw/react-md-editor"

import Input from "components/Input"
import Select from "components/Select"
import Button from "components/Button"
import Icon from "components/Icon"
import ChooseAssetsFromLibraryDrawer from "components/ChooseAssetsFromLibraryDrawer"
import { convertToKebabCase } from "utils/string"
import { getStrapiMedia } from "utils/media"
import { WEEK_DAYS } from "constants/Dates"
import { createNewTreatment, updateTreatment } from "services/api/treatment"
import { generateHoursInterval } from "utils/timeSlots"
import { getErrorMessage } from "utils/error"
import { formatStrapiArr } from "utils/strapi"
import { getTreatmentCategories } from "services/api/treatmentCagegory"
import { useScrollToError } from "hooks/useScrollToError"
import axios from "../../../services/axios";
import SearchInput from "components/SearchInput"

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

const TreatmentForm = ({ data, user, readonly = false }) => {
  const navigate = useNavigate()
  const [visibleChooseAssetsFromLibraryDrawer, setVisibleChooseAssetsFromLibraryDrawer] =
    useState(false)
  const [imageType, setImageType] = useState(null)
  const [step, setStep] = useState(null)
  const [timeSlots, setTimeSlots] = useState([])
  const [treatmentCategories, setTreatmentCategories] = useState([]);
  const [medicalServices, setMedicalServices] = useState([]);
  const [bundleServices, setBundleServices] = useState([]);
  const [usedMedicalServices, setUsedMedicalServices] = useState([]);
  const [usedBundleMedicalServices, setUsedBundleMedicalServices] = useState([]);
  const [filterBundleService, setFilterBundleService] = useState("");
  const [filterUsedBundleService, setFilterUsedBundleService] = useState("");
  const [filterService, setFilterService] = useState("");
  const [filterUsedService, setFilterUsedService] = useState("");
  const [existServices, setExistServices] = useState({});
  const [total, setTotal] = useState(0);
  const [servicesData, setServicesData] = useState([]);
  const [bundleServicesData, setBundleServicesData] = useState([]);
  const validationSchema = yup.object({
    circuit: yup.number().required("Background image is required"),
    temperature: yup.number(),
    blood_pressure: yup.number(),
    respiratory_rate: yup.number(),
    height: yup.number(),
    weight: yup.number(),
    bmi: yup.number(),
    spo2: yup.number(),
    // code: yup.string(),
    // categories: yup.array().min(1, "Categories is required"),
    // name: yup.string().required("Treatment name is required"),
    // slug: yup.string().required("Treatment slug is required"),
    // title: yup.object({
    //   en: yup.string().required("Treatment Title English is required"),
    //   vi: yup.string().required("Treatment Title Vietnamese is required"),
    // }),
    // background: yup.object().required("Background image is required").nullable(),
    // thumbnail: yup.object().required("Thumbnail image is required").nullable(),
    // unit: yup.string().required("Treatment unit is required"),
    // price: yup.string().required("Treatment price is required"),
    // isSpecial: yup.boolean(),
    // isHighTechnology: yup.boolean(),
    // haveAreasTreatment: yup.boolean(),
    // treatmentAreaDescription: yup.object().shape({
    //   en: yup.string(),
    //   vi: yup.string(),
    // }),
    // highlight: yup.object({
    //   en: yup.string().required("Highlight Content English is required"),
    //   vi: yup.string().required("Highlight Content Vietnamese is required"),
    // }),
    // procedure: yup.array().of(
    //   yup.object().shape({
    //     image: yup.object().nullable(),
    //     en: yup.string(),
    //     vi: yup.string(),
    //   })
    // ),
    // timeSession: yup.object({
    //   date: yup.array().min(1, "Date is required"),
    //   time: yup.array(),
    // }),
    // dayTime: yup.object({
    //   start: yup.string().required("Day time start is required"),
    //   end: yup.string().required("Day time end is required"),
    // }),
    // nightTime: yup.object({
    //   start: yup.string().required("Night time start is required"),
    //   end: yup.string().required("Night time end is required"),
    // }),
    // interval: yup.string().required("Interval is required"),
    // results: yup.array().of(
    //   yup.object().shape({
    //     title: yup.object({
    //       en: yup.string(),
    //       vi: yup.string(),
    //     }),
    //     images: yup.array(),
    //   })
    // ),
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
      respiratory_rate: data?.respiratory_rate || "",
      height: data?.height || "",
      weight: data?.weight || "",
      bmi: data?.bmi || "",
      spo2: data?.spo2 || '',
      code: data?.code || "",
      categories: data?.categories || "",
      name: data?.name || "",
      slug: data?.slug || "",
      title: data?.title || "",
      background: data?.background || null,
      thumbnail: data?.thumbnail || null,
      unit: data?.unit || "",
      price: data?.price || "",
      isSpecial: data?.isSpecial || false,
      isHighTechnology: data?.isHighTechnology || false,
      haveAreasTreatment: data?.haveAreasTreatment || false,
      areaImage: data?.areaImage || null,
      treatmentAreaDescription: {
        en: data?.treatmentAreaDescription?.en || "",
        vi: data?.treatmentAreaDescription?.vi || "",
      },
      highlight: {
        en: data?.highlight?.en || "",
        vi: data?.highlight?.vi || "",
      },
      procedure: data?.procedure || [PROCEDURE_ITEM_DEFAULT],
      timeSession: {
        date: data?.timeSession?.date || [],
        time: data?.timeSession?.time || [],
      },
      dayTime: {
        start: data?.dayTime?.split("-")[0].trim(),
        end: data?.dayTime?.split("-")[1].trim(),
      },
      nightTime: {
        start: data?.nightTime?.split("-")[0].trim(),
        end: data?.nightTime?.split("-")[1].trim(),
      },
      interval: data?.interval,
      results: data?.results,
    },
  })
  useScrollToError(errors)

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

  useEffect(() => {
    if (readonly) {
      const bundleServicesData_ = JSON.parse(data.bundle_services);
      setBundleServicesData(bundleServicesData_);
      const servicesData_ = JSON.parse(data.services);
      setServicesData(servicesData_);
    }

    loadMedicalServices();
    loadBundleServices();

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

  const downloadPDF = () => {
    const toastId = toast.loading("Đang tải");
    axios.post("/product/generatePDF", {
      "dan_toc": "Kinh",
      "full_name": user.firstName + " " + user.lastName,
      "gender": user.gender ?? "",
      "province": user.address?.province?.name ?? "",
      "district": user.address?.district?.name ?? "",
      "ward": user.address?.ward?.name ?? "",
      "circuit": getValues("circuit"),
      "temperature": getValues("temperature"),
      "blood_pressure": getValues("blood_pressure"),
      "respiratory_rate": getValues("respiratory_rate"),
      "height": getValues("height"),
      "weight": getValues("weight"),
      "bmi": getValues("bmi"),
      "spo2": getValues("spo2"),
      "ly_do_vao_vien": getValues("ly-do-vao-vien"),
      "hoi_benh": getValues("hoi-benh"),
      "kham_benh": getValues("kham-benh"),
      "chan_doan": getValues("chan-doan"),
      "huong_dieu_tri": getValues("huong-dieu-tri"),
      "ly-do-nhap-vien": getValues("ly-do-vao-vien"),
      "ngay_sinh": "",
      "quoc_gia": "Viet Nam",
      "address": user.address?.address ?? "",
      "phone": user.phone ?? "",
      "quoc_tich": "Vietnamese",
      "nghe_nghiep": "",
      "email": "",
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
      })
  }

  const loadMedicalServices = () => {
    const id = toast.loading("Đang tải dữ liệu các dịch vụ");
    axios.get("/medical-services?pagination[pageSize]=1000")
      .then(response => {
        setMedicalServices(response.data.data);
      }).finally(() => {
        toast.dismiss(id);
      });
  }

  const loadBundleServices = () => {
    const id = toast.loading("Đang tải dữ liệu các gói dịch vụ");
    axios.get("/service-bundles?pagination[pageSize]=1000&populate=*")
      .then(response => {
        setBundleServices(response.data.data);
      })
      .finally(() => {
        toast.dismiss(id);
      });
  }

  const addMedicalService = (m) => {
    if (m.id in existServices) {
      toast.error("Không thể thêm dịch vụ này vì bị trùng.")
    } else {
      let a = [...usedMedicalServices];
      a.concat(m);
      a.push(m);
      setUsedMedicalServices(a);

      let newExistServices = {...existServices};
      newExistServices[m.id] = true;
      setExistServices(newExistServices);

      let b = [...medicalServices];
      b = b.filter(el => el.id != m.id);
      setMedicalServices(b);

      const newTotal = total + m.attributes.price;
      if (!isNaN(newTotal)) setTotal(newTotal);
    }
  }

  const addBundleMedicalService = (m) => {
    const ms = m.attributes.medical_services.data;
    const exist = ms.some(s => s.id in existServices);

    if (exist) {
      toast.error("Không thể thêm dịch vụ này vì bị trùng.")
    } else {
      let newExistServices = {...existServices};
      ms.forEach(s => newExistServices[s.id] = true);
      setExistServices(newExistServices);

      let a = [...usedBundleMedicalServices];
      a.concat(m);
      a.push(m);
      setUsedBundleMedicalServices(a);

      let b = [...bundleServices];
      b = b.filter(el => el.id != m.id);
      setBundleServices(b);
      
      const newTotal = total + m.attributes.price;
      if (!isNaN(newTotal)) setTotal(newTotal);
    }
  }

  const handleSearchBundleService = (e) => {
    setFilterBundleService(e.target.value);
  }

  const removeMedicalService = (m) => {
    let newExistServices = {...existServices};
    delete newExistServices[m.id];
    setExistServices(newExistServices);
      
    let a = [...medicalServices];
    a.concat(m);
    a.push(m);
    setMedicalServices(a);

    let b = [...usedMedicalServices];
    b = b.filter(el => el.id != m.id);
    setUsedMedicalServices(b);

    const newTotal = total - m.attributes.price;
    if (!isNaN(newTotal)) setTotal(newTotal);
  }

  const removeBundleMedicalService = (m) => {
    const ms = m.attributes.medical_services.data;
    let newExistServices = {...existServices};
    ms.forEach(s => delete newExistServices[s.id]);
    setExistServices(newExistServices);

    let a = [...bundleServices];
    a.concat(m);
    a.push(m);
    setBundleServices(a);

    let b = [...usedBundleMedicalServices];
    b = b.filter(el => el.id != m.id);
    setUsedBundleMedicalServices(b);

    const newTotal = total - m.attributes.price;
    if (!isNaN(newTotal)) setTotal(newTotal);
  }

  const onSubmit = async (formData) => {
    try {
      const payload = {
        ...formData,
        dayTime: `${formData?.dayTime?.start}-${formData?.dayTime?.end}`,
        nightTime: `${formData?.nightTime?.start}-${formData?.nightTime?.end}`,
        price: Number(formData?.price),
        procedure: formData?.procedure.filter((item) => !!item.en),
        services: JSON.stringify(usedMedicalServices),
        bundle_services: JSON.stringify(usedBundleMedicalServices),
        patient: user.id,
        total,
      }
      if (!!data?.id) {
        await updateTreatment(data.id, payload)
        toast.success("Update the treatment successfully")
        navigate("/medical-records");
      } else {
        const result = await createNewTreatment(payload);
        toast.success("Lưu hồ sơ bệnh án thành công");
        window.location.href = `/medical-records/${result.data.data.id}/view`;
      }
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  const downloadInvoice = () => {
    const toastId = toast.loading("Đang tải");
    axios.post("/product/generatePhieuCLS", {
      // axios2.post("http://localhost:1337/api/product/generatePhieuCLS", {
      "id": data.id,
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
      })
  }

  const generatePhieuChiDinh = () => {
    const toastId = toast.loading("Đang tải");
    axios.post("/product/generatePhieuChiDinh", {
    // axios2.post("http://localhost:1337/api/product/generatePhieuChiDinh", {
      "id": data.id,
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
      })
  }

  useEffect(() => {
    if (data) {
      generateTimeSlots()
    }
  }, [data])

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-6">
          {/* <div className="grid grid-cols-2 gap-6">
            <Controller
              name="code"
              control={control}
              render={({ field: { value } }) => (
                <Input
                  value={value}
                  name="code"
                  label="Treatment ID"
                  placeholder="Treatment Id"
                  disabled
                />
              )}
            />
            <Controller
              name="categories"
              control={control}
              render={({ field: { value } }) => (
                <Select
                  isMulti
                  placeholder="Select Treatment Category"
                  label="Category"
                  name="categories"
                  onChange={(e) => {
                    setValue(
                      "categories",
                      e.map((i) => ({
                        id: i.value,
                      })),
                      { shouldValidate: true, shouldDirty: true }
                    )
                  }}
                  value={
                    value && treatmentCategories.filter((c) => value.some((v) => v.id === c.value))
                  }
                  options={treatmentCategories}
                  errors={errors?.categoryId?.message}
                />
              )}
            />
          </div> */}
          <div className="grid grid-cols-6 gap-6">
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
                // errors={errors?.name?.message}
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
                // errors={errors?.name?.message}
                />
              )}
            />
            <Controller
              name="blood_pressure"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Input
                disabled={readonly}
                  onChange={onChange}
                  value={value}
                  name="blood_pressure"
                  label="Huyết áp(mmHg)"
                  placeholder={""}
                // errors={errors?.name?.message}
                />
              )}
            />
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
                // errors={errors?.name?.message}
                />
              )}
            />
            <Controller
              name="height"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Input
                disabled={readonly}
                  onChange={onChange}
                  value={value}
                  name="height"
                  label="Chiều cao(Cm)"
                  placeholder={""}
                // errors={errors?.name?.message}
                />
              )}
            />
            <Controller
              name="weight"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Input
                disabled={readonly}
                  onChange={onChange}
                  value={value}
                  name="weight"
                  label="Cân nặng(Kg)"
                  placeholder={""}
                // errors={errors?.name?.message}
                />
              )}
            />
            <Controller
              name="bmi"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Input
                disabled={readonly}
                  onChange={onChange}
                  value={value}
                  name="bmi"
                  label="BMI"
                  placeholder={""}
                // errors={errors?.name?.message}
                />
              )}
            />
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
                // errors={errors?.name?.message}
                />
              )}
            />
            {/* <Controller
              name="slug"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Input
                  onChange={onChange}
                  value={value}
                  name="slug"
                  label="Treatment Slug"
                  placeholder={"Input Treatment Slug"}
                  errors={errors?.slug?.message}
                />
              )}
            /> */}
          </div>
          <div className="grid grid-cols-2 gap-6">
            <Controller
              name="ly-do-vao-vien"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Lý do vào viện"
                  size="large"
                  name="title.en"
                  value={value}
                  disabled={readonly}
                  onChange={onChange}
                  errors={errors?.title?.en?.message}
                />
              )}
            />
            <Controller
              name="hoi-benh"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Input
                disabled={readonly}
                  label="Hỏi bệnh"
                  name="hoi-benh"
                  value={value}
                  onChange={onChange}
                  errors={errors?.title?.en?.message}
                />
              )}
            />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <Controller
              name="kham-benh"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Input
                disabled={readonly}
                  label="Khám bệnh"
                  name="kham-benh"
                  value={value}
                  onChange={onChange}
                  errors={errors?.title?.en?.message}
                />
              )}
            />
            <Controller
              name="chan-doan"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Input
                disabled={readonly}
                  label="Chẩn đoán"
                  name="title.en"
                  value={value}
                  onChange={onChange}
                  errors={errors?.title?.en?.message}
                />
              )}
            />
          </div>
          <div className="space-y-4">
            <Controller
              name="huong-dieu-tri"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Input
                disabled={readonly}
                  label="Hướng điều trị"
                  name="huong-dieu-tri"
                  value={value}
                  onChange={onChange}
                  errors={errors?.title?.en?.message}
                />
              )}
            />
          </div>

          <div>
            {servicesData && servicesData.map(s => <p>{s.attributes.label}</p>)}
            {bundleServicesData && bundleServicesData.map(s => <div>
              <p className="font-semibold">{s.attributes.label}</p>
              {s.attributes.medical_services.data.map(ss => <p>{ss.attributes.label}</p>)}
            </div>)}
          </div>
          
          {!readonly && <div className="grid grid-cols-2 gap-6">
          <div>
              <p className="inline-block text-16 font-bold mb-2">Gói dịch vụ</p>
              <SearchInput
                placeholder="Nhập tên gói cần tìm"
                className="flex-1 mb-2"
                value={filterBundleService}
                onChange={handleSearchBundleService}
              />
            <div style={{

              maxHeight: "300px",
              overflow: "scroll",

            }}>
              {bundleServices && 
              (!!filterBundleService ? bundleServices.filter(m => matchSearchString(m.attributes.label, filterBundleService)) : bundleServices)
              .map(m => <div className="mb-2">
                <Button
                  type="button"
                  className={"inline"}
                  icon={<Icon name="add-circle" className="fill-white" />}
                  onClick={() => addBundleMedicalService(m)}
                >{m.attributes.label + " " + numberWithCommas(m.attributes.price) + "đ"}
                </Button>
              </div>)}
            </div>
            </div>
            <div>
              <p className="inline-block text-16 font-bold mb-2">Gói dịch vụ sử dụng</p>
              <SearchInput
                placeholder="Nhập tên gói cần tìm"
                className="flex-1 mb-2"
                value={filterUsedBundleService}
                onChange={e => {setFilterUsedBundleService(e.target.value)}}
              />
            <div style={{

              maxHeight: "300px",
              overflow: "scroll",

            }}>
              {usedBundleMedicalServices && 
              (!!filterUsedBundleService ? usedBundleMedicalServices.filter(m => matchSearchString(m.attributes.label, filterUsedBundleService)) : usedBundleMedicalServices)
              .map(m => <div className="mb-2">
                <Button
                  type="button"
                  className={"inline"}
                  icon={<Icon name="close-circle" className="fill-white" />}
                  onClick={() => removeBundleMedicalService(m)}
                >{m.attributes.label  + " " + numberWithCommas(m.attributes.price) + "đ"}
                </Button>
              </div>)}
            </div></div>
          </div>}
          {!readonly &&
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="inline-block text-16 font-bold mb-2">Dịch vụ</p>
              <SearchInput
                placeholder="Nhập tên gói cần tìm"
                className="flex-1 mb-2"
                value={filterService}
                onChange={e => setFilterService(e.target.value)}
              />
              <div style={{

                maxHeight: "500px",
                overflow: "scroll",

              }}>

                {medicalServices && 
                (!!filterService ? medicalServices.filter(m => matchSearchString(m.attributes.label, filterService)) : medicalServices)
                .map(m => <div className="mb-2">
                  <Button
                    type="button"
                    className={"inline"}
                    icon={<Icon name="add-circle" className="fill-white" />}
                    onClick={() => addMedicalService(m)}
                  >{m.attributes.label  + " " + numberWithCommas(m.attributes.price) + "đ"}
                  </Button>
                </div>)}
              </div>
            </div>
            <div>
              <p className="inline-block text-16 font-bold mb-2">Dịch vụ sử dụng</p>
              <SearchInput
                placeholder="Nhập tên gói cần tìm"
                className="flex-1 mb-2"
                value={filterUsedService}
                onChange={e => setFilterUsedService(e.target.value)}
              />
            <div style={{

              maxHeight: "500px",
              overflow: "scroll",

            }}>
              {usedMedicalServices && 
                (!!filterUsedService ? usedMedicalServices.filter(m => matchSearchString(m.attributes.label, filterUsedService)) : usedMedicalServices)
              .map(m => <div className="mb-2">
                <Button
                  type="button"
                  className={"inline"}
                  icon={<Icon name="close-circle" className="fill-white" />}
                  onClick={() => removeMedicalService(m)}
                >{m.attributes.label  + " " + numberWithCommas(m.attributes.price) + "đ"}
                </Button>
              </div>)}
            </div>
            </div>
          </div>}
          {/* <p className="text-xl font-semibold text-right">Tổng {numberWithCommas(total)}</p> */}
        </div>

        <div className="flex gap-x-4 mt-10">
          {!readonly && <Button className="fill-primary" type="submit">
            Save
          </Button>}
          {!readonly && <Button
            btnType="outline"
            type="reset"
            onClick={(e) => {
              navigate(-1);
            }}
          >
            Cancel
          </Button>}
          <Button
            btnType="outline"
            type="reset"
            onClick={(e) => {
              // console.log('getValues', getValues("bmi"))
              downloadPDF();
            }}
          >
            Tải bệnh án
          </Button>
          {readonly && <Button
            btnType="outline"
            type="reset"
            onClick={(e) => {
              // console.log('getValues', getValues("bmi"))
              downloadInvoice();
            }}
          >
            Tải hoá đơn
          </Button>}
          {readonly && <Button
            btnType="outline"
            type="reset"
            onClick={(e) => {
              // console.log('getValues', getValues("bmi"))
              generatePhieuChiDinh();
            }}
          >
            Tải phiếu chỉ định
          </Button>}
        </div>
      </form>

      <ChooseAssetsFromLibraryDrawer
        openDrawer={visibleChooseAssetsFromLibraryDrawer}
        onClose={() => setVisibleChooseAssetsFromLibraryDrawer(false)}
        multiple={imageType === "results"}
        onFinish={handleAssetsSelected}
      />
    </>
  )
}

const matchSearchString = (st, v) => {
  const str2 = removeVietnameseTones(st).toLowerCase();
  const v2 = removeVietnameseTones(v).toLowerCase();
  return str2.indexOf(v2) != -1;
}

function removeVietnameseTones(str) {
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g,"a"); 
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g,"e"); 
  str = str.replace(/ì|í|ị|ỉ|ĩ/g,"i"); 
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g,"o"); 
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g,"u"); 
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g,"y"); 
  str = str.replace(/đ/g,"d");
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
  str = str.replace(/Đ/g, "D");
  // Some system encode vietnamese combining accent as individual utf-8 characters
  // Một vài bộ encode coi các dấu mũ, dấu chữ như một kí tự riêng biệt nên thêm hai dòng này
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // ̀ ́ ̃ ̉ ̣  huyền, sắc, ngã, hỏi, nặng
  str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // ˆ ̆ ̛  Â, Ê, Ă, Ơ, Ư
  // Remove extra spaces
  // Bỏ các khoảng trắng liền nhau
  str = str.replace(/ + /g," ");
  str = str.trim();
  // Remove punctuations
  // Bỏ dấu câu, kí tự đặc biệt
  str = str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g," ");
  return str;
}

function numberWithCommas(x) {
  return x?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export default TreatmentForm
