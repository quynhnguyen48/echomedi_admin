import classNames from "classnames"
import dayjs from "dayjs"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getStrapiMedia } from "utils/media"
import sumBy from "lodash/sumBy"
import { toast } from "react-toastify"
import { formatPrice } from "utils/number";

import Button from "components/Button"
import DataItem from "components/DataItem"
import Icon from "components/Icon"
import Tag from "components/Tag"
import { BRAND_STATUS } from "constants/Brand"
import ProductDescription from "./components/ProductDescription"
import ProductImages from "./components/ProductImages"
import ProductInventory from "./components/ProductInventory"
import ProductVariants from "./components/ProductVariants"
import PrescriptionModal from "./PrescriptionModal";
import Input from "components/Input";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup/dist/yup"
import * as yup from "yup"
import {
  updateServiceBundle
} from "services/api/serviceBundle";
import Tagify from '@yaireo/tagify'
import '@yaireo/tagify/dist/tagify.css' // imports tagify SCSS file from within
import Textarea from "components/Textarea"
import TagifyInput from "components/TagifyInput"

const ProductDetail = ({ data, onTogglePublish, onUpdateProduct, editable }) => {
  const navigate = useNavigate()
  const [openProductDescriptionDrawer, setOpenProductDescriptionDrawer] = useState(false)
  const [openProductImagesDrawer, setOpenProductImagesDrawer] = useState(false)
  const [openProductVariantsDrawer, setOpenProductVariantsDrawer] = useState(false)
  const [openProductInventoryDrawer, setOpenProductInventoryDrawer] = useState(false)
  const [visiblePrescriptionModal, setVisiblePrescriptionModal] = useState(false);
  const validationSchema = yup.object({});
  const [price, setPrice] = useState(0);
  const [priceq2, setPriceQ2] = useState(0);
  const [disabledQ2, setDisabledQ2] = useState(false);
  const [priceq7, setPriceQ7] = useState(0);
  const [disabledQ7, setDisabledQ7] = useState(false);
  const [pricebd, setPriceBD] = useState(0);
  const [disabledBD, setDisabledBD] = useState(false);
  const [label, setLabel] = useState("");
  const [goldPercentage, setGoldPercentage] = useState(0);
  const [monthlyGold, setMonthlyGold] = useState(0);
  const [yearlyGold, setYearlyGold] = useState(0);
  const [platinumPercentage, setPlatinumPercentage] = useState(0);
  const [monthlyPlatinum, setMonthlyPlatinum] = useState(0);
  const [yearlyPlatinum, setYearlyPlatinum] = useState(0);

  const [medicalProviderPercentage, setMedicalProviderPercentage] = useState(0);
  const [monthlyMedicalProvider, setMonthlyMedicalProvider] = useState(0);
  const [yearlyMedicalProvider, setYearlyMedicalProvider] = useState(0);

  const [medicalProviderGoldPercentage, setMedicalProviderGoldPercentage] = useState(0);
  const [monthlyMedicalProviderGold, setMonthlyMedicalProviderGold] = useState(0);
  const [yearlyMedicalProviderGold, setYearlyMedicalProviderGold] = useState(0);

  const [medicalProviderPlatinumPercentage, setMedicalProviderPlatinumPercentage] = useState(0);
  const [monthlyMedicalProviderPlatinum, setMonthlyMedicalProviderPlatinum] = useState(0);
  const [yearlyMedicalProviderPlatinum, setYearlyMedicalProviderPlatinum] = useState(0);

  
  const [infantPercentage, setInfantPercentage] = useState(0);
  const [monthlyInfant, setMonthlyInfant] = useState(0);
  const [yearlyInfant, setYearlyInfant] = useState(0);

  const [toddlerPercentage, setToddlerPercentage] = useState(0);
  const [monthlyToddler, setMonthlyToddler] = useState(0);
  const [yearlyToddler, setYearlyToddler] = useState(0);

  const [preschoolSchoolAgePercentage, setPreschoolSchoolAgePercentage] = useState(0);
  const [monthlyPreschoolSchoolAge, setMonthlyPreschoolSchoolAge] = useState(0);
  const [yearlyPreschoolSchoolAge, setYearlyPreschoolSchoolAge] = useState(0);

  const [tag, setTag] = useState(null);

  useEffect(() => {
    setPrice(data?.price);
    setLabel(data?.label)
    setPriceQ2(data?.price);
    setDisabledQ2(false);
    setPriceQ7(data?.price);
    setDisabledQ7(false);
    setPriceBD(data?.price);
    setDisabledBD(false);
    setGoldPercentage(data?.membership_discount?.gold_percentage);
    setPlatinumPercentage(data?.membership_discount?.platinum_percentage);
    setMonthlyGold(data?.membership_discount?.gold_monthly);
    setMonthlyPlatinum(data?.membership_discount?.platinum_monthly);
    setYearlyGold(data?.membership_discount?.gold_yearly);
    setYearlyPlatinum(data?.membership_discount?.platinum_yearly);

    setMedicalProviderPercentage(data?.membership_discount?.medical_provider_percentage);
    setMonthlyMedicalProvider(data?.membership_discount?.medical_provider_monthly);
    setYearlyMedicalProvider(data?.membership_discount?.medical_provider_yearly);

    setMedicalProviderGoldPercentage(data?.membership_discount?.medical_provider_gold_percentage);
    setMonthlyMedicalProviderGold(data?.membership_discount?.medical_provider_gold_monthly);
    setYearlyMedicalProviderGold(data?.membership_discount?.medical_provider_gold_yearly);

    setMedicalProviderPlatinumPercentage(data?.membership_discount?.medical_provider_platinum_percentage);
    setMonthlyMedicalProviderPlatinum(data?.membership_discount?.medical_provider_platinum_monthly);
    setYearlyMedicalProviderPlatinum(data?.membership_discount?.medical_provider_platinum_yearly);

    setInfantPercentage(data?.membership_discount?.infant_percentage);
    setMonthlyInfant(data?.membership_discount?.infant_monthly);
    setYearlyInfant(data?.membership_discount?.infant_yearly);

    setToddlerPercentage(data?.membership_discount?.toddler_percentage);
    setMonthlyToddler(data?.membership_discount?.toddler_monthly);
    setYearlyToddler(data?.membership_discount?.toddler_yearly);

    setPreschoolSchoolAgePercentage(data?.membership_discount?.preschool_school_age_percentage);
    setMonthlyPreschoolSchoolAge(data?.membership_discount?.preschool_school_age_monthly);
    setYearlyPreschoolSchoolAge(data?.membership_discount?.preschool_school_age_yearly);

    setTag(JSON.stringify(data?.tags ?? []))

    if (data.Locations) {
      data.Locations?.forEach(l => {
        if (l["location"] == "q2") {
          setPriceQ2(l["price"]);
          setDisabledQ2(l["disabled"]);
        }
        if (l["location"] == "q7") {
          setPriceQ7(l["price"]);
          setDisabledQ7(l["disabled"]);
        }
        if (l["location"] == "binhduong") {
          setPriceBD(l["price"]);
          setDisabledBD(l["disabled"]);
        }
      })
    }
  }, [data]);

  console.log('taggg', tag)

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
    getValues,
    setValue,
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
    },
  })

  console.log('tagg', tag)

  return (
    <div className="my-10 w-full">
      <div className="grid grid-cols-2 gap-4">
        <Controller
          name="code"
          label="Tên"
          control={control}
          render={({ field: { onChange, value } }) => (
            <Input
              label={'Tên'}
              onChange={e => setLabel(e.target.value)}
              value={label}
              name="code"
            />
          )}
        />
        <Controller
            name="membership_discount"
            control={control}
            render={({ field: { onChange, value } }) => (

              <Input
                onChange={e => {
                }}
                value={price}
                label={<div>
                  <span className="mr-5">Giá</span>
                </div>}
                name="code"
              />
            )}
          />
      </div>
      <div className="my-4">
        <div className="flex flex-row align-center">
        </div>
        <ol style={{ listStyleType: "decimal", marginLeft: "30px" }}>
          {Array.isArray(data?.Services) && data?.Services?.map(item => <li>{item?.count} x {item?.medical_service?.data?.attributes.label}</li>)}
        </ol>
      </div>
      
    </div>
  )
}


const tags = [
  { value: "Nam | 18-39 | Gói khám | Không có bệnh", searchBy: "nam_18_39_khong_co_benh", group: "Gói khám" },
  { value: "Nam | 18-39 | Gói dược | Không có bệnh", searchBy: "nam_18_39_khong_co_benh", group: "Gói dược" },
  { value: "Nam | 18-39 | Gói gene | Không có bệnh", searchBy: "nam_18_39_khong_co_benh", group: "Gói gene" },
  { value: "Nam | 18-39 | Gói dinh dưỡng | Không có bệnh", searchBy: "nam_18_39_khong_co_benh", group: "Gói dinh dưỡng" },
  { value: "Nam | 18-39 | Gói Vaccine | Không có bệnh", searchBy: "nam_18_39_khong_co_benh", group: "Gói vaccine" },
  { value: "Nam | 18-39 | Tầm soát | Không có bệnh", searchBy: "nam_18_39_khong_co_benh", group: "Tầm soát" },

  { value: "Nữ | 18-39 | Gói khám | Không có bệnh", searchBy: "nu_18_39_khong_co_benh", group: "Gói khám" },
  { value: "Nữ | 18-39 | Gói dược | Không có bệnh", searchBy: "nu_18_39_khong_co_benh", group: "Gói dược" },
  { value: "Nữ | 18-39 | Gói gene | Không có bệnh", searchBy: "nu_18_39_khong_co_benh", group: "Gói gene" },
  { value: "Nữ | 18-39 | Gói dinh dưỡng | Không có bệnh", searchBy: "nu_18_39_khong_co_benh", group: "Gói dinh dưỡng" },
  { value: "Nữ | 18-39 | Gói Vaccine | Không có bệnh", searchBy: "nu_18_39_khong_co_benh", group: "Gói vaccine" },
  { value: "Nữ | 18-39 | Tầm soát | Không có bệnh", searchBy: "nu_18_39_khong_co_benh", group: "Tầm soát" },

  { value: "Nam | 18-39 | Gói khám | Thần kinh", searchBy: "nam_18_39_than_kinh", group: "Gói khám" },
  { value: "Nam | 18-39 | Gói dược | Thần kinh", searchBy: "nam_18_39_than_kinh", group: "Gói dược" },
  { value: "Nam | 18-39 | Gói gene | Thần kinh", searchBy: "nam_18_39_than_kinh", group: "Gói gene" },
  { value: "Nam | 18-39 | Gói dinh dưỡng | Thần kinh", searchBy: "nam_18_39_than_kinh", group: "Gói dinh dưỡng" },
  { value: "Nam | 18-39 | Gói Vaccine | Thần kinh", searchBy: "nam_18_39_than_kinh", group: "Gói vaccine" },
  { value: "Nam | 18-39 | Tầm soát | Thần kinh", searchBy: "nam_18_39_than_kinh", group: "Tầm soát" },

  { value: "Nữ | 18-39 | Gói khám | Thần kinh", searchBy: "nu_18_39_than_kinh", group: "Gói khám" },
  { value: "Nữ | 18-39 | Gói dược | Thần kinh", searchBy: "nu_18_39_than_kinh", group: "Gói dược" },
  { value: "Nữ | 18-39 | Gói gene | Thần kinh", searchBy: "nu_18_39_than_kinh", group: "Gói gene" },
  { value: "Nữ | 18-39 | Gói dinh dưỡng | Thần kinh", searchBy: "nu_18_39_than_kinh", group: "Gói dinh dưỡng" },
  { value: "Nữ | 18-39 | Gói Vaccine | Thần kinh", searchBy: "nu_18_39_than_kinh", group: "Gói vaccine" },
  { value: "Nữ | 18-39 | Tầm soát | Thần kinh", searchBy: "nu_18_39_than_kinh", group: "Tầm soát" },

  { value: "Nam | 18-39 | Gói khám | Hô hấp", searchBy: "nam_18_39_ho_hap", group: "Gói khám" },
  { value: "Nam | 18-39 | Gói dược | Hô hấp", searchBy: "nam_18_39_ho_hap", group: "Gói dược" },
  { value: "Nam | 18-39 | Gói gene | Hô hấp", searchBy: "nam_18_39_ho_hap", group: "Gói gene" },
  { value: "Nam | 18-39 | Gói dinh dưỡng | Hô hấp", searchBy: "nam_18_39_ho_hap", group: "Gói dinh dưỡng" },
  { value: "Nam | 18-39 | Gói Vaccine | Hô hấp", searchBy: "nam_18_39_ho_hap", group: "Gói vaccine" },
  { value: "Nam | 18-39 | Tầm soát | Hô hấp", searchBy: "nam_18_39_ho_hap", group: "Tầm soát" },

  { value: "Nữ | 18-39 | Gói khám | Hô hấp", searchBy: "nu_18_39_ho_hap", group: "Gói khám" },
  { value: "Nữ | 18-39 | Gói dược | Hô hấp", searchBy: "nu_18_39_ho_hap", group: "Gói dược" },
  { value: "Nữ | 18-39 | Gói gene | Hô hấp", searchBy: "nu_18_39_ho_hap", group: "Gói gene" },
  { value: "Nữ | 18-39 | Gói dinh dưỡng | Hô hấp", searchBy: "nu_18_39_ho_hap", group: "Gói dinh dưỡng" },
  { value: "Nữ | 18-39 | Gói Vaccine | Hô hấp", searchBy: "nu_18_39_ho_hap", group: "Gói vaccine" },
  { value: "Nữ | 18-39 | Tầm soát | Hô hấp", searchBy: "nu_18_39_ho_hap", group: "Tầm soát" },

  { value: "Nam | 18-39 | Gói khám | Tim mạch", searchBy: "nam_18_39_tim_mach", group: "Gói khám" },
  { value: "Nam | 18-39 | Gói dược | Tim mạch", searchBy: "nam_18_39_tim_mach", group: "Gói dược" },
  { value: "Nam | 18-39 | Gói gene | Tim mạch", searchBy: "nam_18_39_tim_mach", group: "Gói gene" },
  { value: "Nam | 18-39 | Gói dinh dưỡng | Tim mạch", searchBy: "nam_18_39_tim_mach", group: "Gói dinh dưỡng" },
  { value: "Nam | 18-39 | Gói Vaccine | Tim mạch", searchBy: "nam_18_39_tim_mach", group: "Gói vaccine" },
  { value: "Nam | 18-39 | Tầm soát | Tim mạch", searchBy: "nam_18_39_tim_mach", group: "Tầm soát" },

  { value: "Nữ | 18-39 | Gói khám | Tim mạch", searchBy: "nu_18_39_tim_mach", group: "Gói khám" },
  { value: "Nữ | 18-39 | Gói dược | Tim mạch", searchBy: "nu_18_39_tim_mach", group: "Gói dược" },
  { value: "Nữ | 18-39 | Gói gene | Tim mạch", searchBy: "nu_18_39_tim_mach", group: "Gói gene" },
  { value: "Nữ | 18-39 | Gói dinh dưỡng | Tim mạch", searchBy: "nu_18_39_tim_mach", group: "Gói dinh dưỡng" },
  { value: "Nữ | 18-39 | Gói Vaccine | Tim mạch", searchBy: "nu_18_39_tim_mach", group: "Gói vaccine" },
  { value: "Nữ | 18-39 | Tầm soát | Tim mạch", searchBy: "nu_18_39_tim_mach", group: "Tầm soát" },

  { value: "Nam | 18-39 | Gói khám | Thận - tiết niệu", searchBy: "nam_18_39_than_tiet_nieu", group: "Gói khám" },
  { value: "Nam | 18-39 | Gói dược | Thận - tiết niệu", searchBy: "nam_18_39_than_tiet_nieu", group: "Gói dược" },
  { value: "Nam | 18-39 | Gói gene | Thận - tiết niệu", searchBy: "nam_18_39_than_tiet_nieu", group: "Gói gene" },
  { value: "Nam | 18-39 | Gói dinh dưỡng | Thận - tiết niệu", searchBy: "nam_18_39_than_tiet_nieu", group: "Gói dinh dưỡng" },
  { value: "Nam | 18-39 | Gói Vaccine | Thận - tiết niệu", searchBy: "nam_18_39_than_tiet_nieu", group: "Gói vaccine" },
  { value: "Nam | 18-39 | Tầm soát | Thận - tiết niệu", searchBy: "nam_18_39_than_tiet_nieu", group: "Tầm soát" },

  { value: "Nữ | 18-39 | Gói khám | Thận - tiết niệu", searchBy: "nu_18_39_than_tiet_nieu", group: "Gói khám" },
  { value: "Nữ | 18-39 | Gói dược | Thận - tiết niệu", searchBy: "nu_18_39_than_tiet_nieu", group: "Gói dược" },
  { value: "Nữ | 18-39 | Gói gene | Thận - tiết niệu", searchBy: "nu_18_39_than_tiet_nieu", group: "Gói gene" },
  { value: "Nữ | 18-39 | Gói dinh dưỡng | Thận - tiết niệu", searchBy: "nu_18_39_than_tiet_nieu", group: "Gói dinh dưỡng" },
  { value: "Nữ | 18-39 | Gói Vaccine | Thận - tiết niệu", searchBy: "nu_18_39_than_tiet_nieu", group: "Gói vaccine" },
  { value: "Nữ | 18-39 | Tầm soát | Thận - tiết niệu", searchBy: "nu_18_39_than_tiet_nieu", group: "Tầm soát" },

  { value: "Nam | 18-39 | Gói khám | Cơ xương khớp", searchBy: "nam_18_39_co_xuong_khop", group: "Gói khám" },
  { value: "Nam | 18-39 | Gói dược | Cơ xương khớp", searchBy: "nam_18_39_co_xuong_khop", group: "Gói dược" },
  { value: "Nam | 18-39 | Gói gene | Cơ xương khớp", searchBy: "nam_18_39_co_xuong_khop", group: "Gói gene" },
  { value: "Nam | 18-39 | Gói dinh dưỡng | Cơ xương khớp", searchBy: "nam_18_39_co_xuong_khop", group: "Gói dinh dưỡng" },
  { value: "Nam | 18-39 | Gói Vaccine | Cơ xương khớp", searchBy: "nam_18_39_co_xuong_khop", group: "Gói vaccine" },
  { value: "Nam | 18-39 | Tầm soát | Cơ xương khớp", searchBy: "nam_18_39_co_xuong_khop", group: "Tầm soát" },

  { value: "Nữ | 18-39 | Gói khám | Cơ xương khớp", searchBy: "nu_18_39_co_xuong_khop", group: "Gói khám" },
  { value: "Nữ | 18-39 | Gói dược | Cơ xương khớp", searchBy: "nu_18_39_co_xuong_khop", group: "Gói dược" },
  { value: "Nữ | 18-39 | Gói gene | Cơ xương khớp", searchBy: "nu_18_39_co_xuong_khop", group: "Gói gene" },
  { value: "Nữ | 18-39 | Gói dinh dưỡng | Cơ xương khớp", searchBy: "nu_18_39_co_xuong_khop", group: "Gói dinh dưỡng" },
  { value: "Nữ | 18-39 | Gói Vaccine | Cơ xương khớp", searchBy: "nu_18_39_co_xuong_khop", group: "Gói vaccine" },
  { value: "Nữ | 18-39 | Tầm soát | Cơ xương khớp", searchBy: "nu_18_39_co_xuong_khop", group: "Tầm soát" },

  { value: "Nam | 18-39 | Gói khám | Nội tiết/ chuyển hoá", searchBy: "nam_18_39_noi_tiet_chuyen_hoa", group: "Gói khám" },
  { value: "Nam | 18-39 | Gói dược | Nội tiết/ chuyển hoá", searchBy: "nam_18_39_noi_tiet_chuyen_hoa", group: "Gói dược" },
  { value: "Nam | 18-39 | Gói gene | Nội tiết/ chuyển hoá", searchBy: "nam_18_39_noi_tiet_chuyen_hoa", group: "Gói gene" },
  { value: "Nam | 18-39 | Gói dinh dưỡng | Nội tiết/ chuyển hoá", searchBy: "nam_18_39_noi_tiet_chuyen_hoa", group: "Gói dinh dưỡng" },
  { value: "Nam | 18-39 | Gói Vaccine | Nội tiết/ chuyển hoá", searchBy: "nam_18_39_noi_tiet_chuyen_hoa", group: "Gói vaccine" },
  { value: "Nam | 18-39 | Tầm soát | Nội tiết/ chuyển hoá", searchBy: "nam_18_39_noi_tiet_chuyen_hoa", group: "Tầm soát" },

  { value: "Nữ | 18-39 | Gói khám | Nội tiết/ chuyển hoá", searchBy: "nu_18_39_noi_tiet_chuyen_hoa", group: "Gói khám" },
  { value: "Nữ | 18-39 | Gói dược | Nội tiết/ chuyển hoá", searchBy: "nu_18_39_noi_tiet_chuyen_hoa", group: "Gói dược" },
  { value: "Nữ | 18-39 | Gói gene | Nội tiết/ chuyển hoá", searchBy: "nu_18_39_noi_tiet_chuyen_hoa", group: "Gói gene" },
  { value: "Nữ | 18-39 | Gói dinh dưỡng | Nội tiết/ chuyển hoá", searchBy: "nu_18_39_noi_tiet_chuyen_hoa", group: "Gói dinh dưỡng" },
  { value: "Nữ | 18-39 | Gói Vaccine | Nội tiết/ chuyển hoá", searchBy: "nu_18_39_noi_tiet_chuyen_hoa", group: "Gói vaccine" },
  { value: "Nữ | 18-39 | Tầm soát | Nội tiết/ chuyển hoá", searchBy: "nu_18_39_noi_tiet_chuyen_hoa", group: "Tầm soát" },

  { value: "Nam | 18-39 | Gói khám | Tiêu hóa", searchBy: "nam_18_39_tieu_hoa", group: "Gói khám" },
  { value: "Nam | 18-39 | Gói dược | Tiêu hóa", searchBy: "nam_18_39_tieu_hoa", group: "Gói dược" },
  { value: "Nam | 18-39 | Gói gene | Tiêu hóa", searchBy: "nam_18_39_tieu_hoa", group: "Gói gene" },
  { value: "Nam | 18-39 | Gói dinh dưỡng | Tiêu hóa", searchBy: "nam_18_39_tieu_hoa", group: "Gói dinh dưỡng" },
  { value: "Nam | 18-39 | Gói Vaccine | Tiêu hóa", searchBy: "nam_18_39_tieu_hoa", group: "Gói vaccine" },
  { value: "Nam | 18-39 | Tầm soát | Tiêu hóa", searchBy: "nam_18_39_tieu_hoa", group: "Tầm soát" },

  { value: "Nữ | 18-39 | Gói khám | Tiêu hóa", searchBy: "nu_18_39_tieu_hoa", group: "Gói khám" },
  { value: "Nữ | 18-39 | Gói dược | Tiêu hóa", searchBy: "nu_18_39_tieu_hoa", group: "Gói dược" },
  { value: "Nữ | 18-39 | Gói gene | Tiêu hóa", searchBy: "nu_18_39_tieu_hoa", group: "Gói gene" },
  { value: "Nữ | 18-39 | Gói dinh dưỡng | Tiêu hóa", searchBy: "nu_18_39_tieu_hoa", group: "Gói dinh dưỡng" },
  { value: "Nữ | 18-39 | Gói Vaccine | Tiêu hóa", searchBy: "nu_18_39_tieu_hoa", group: "Gói vaccine" },
  { value: "Nữ | 18-39 | Tầm soát | Tiêu hóa", searchBy: "nu_18_39_tieu_hoa", group: "Tầm soát" },


  // 40-49
  { value: "Nam | 40-49 | Gói khám | Không có bệnh", searchBy: "nam_40_49_khong_co_benh", group: "Gói khám" },
  { value: "Nam | 40-49 | Gói dược | Không có bệnh", searchBy: "nam_40_49_khong_co_benh", group: "Gói dược" },
  { value: "Nam | 40-49 | Gói gene | Không có bệnh", searchBy: "nam_40_49_khong_co_benh", group: "Gói gene" },
  { value: "Nam | 40-49 | Gói dinh dưỡng | Không có bệnh", searchBy: "nam_40_49_khong_co_benh", group: "Gói dinh dưỡng" },
  { value: "Nam | 40-49 | Gói Vaccine | Không có bệnh", searchBy: "nam_40_49_khong_co_benh", group: "Gói vaccine" },
  { value: "Nam | 40-49 | Tầm soát | Không có bệnh", searchBy: "nam_40_49_khong_co_benh", group: "Tầm soát" },

  { value: "Nữ | 40-49 | Gói khám | Không có bệnh", searchBy: "nu_40_49_khong_co_benh", group: "Gói khám" },
  { value: "Nữ | 40-49 | Gói dược | Không có bệnh", searchBy: "nu_40_49_khong_co_benh", group: "Gói dược" },
  { value: "Nữ | 40-49 | Gói gene | Không có bệnh", searchBy: "nu_40_49_khong_co_benh", group: "Gói gene" },
  { value: "Nữ | 40-49 | Gói dinh dưỡng | Không có bệnh", searchBy: "nu_40_49_khong_co_benh", group: "Gói dinh dưỡng" },
  { value: "Nữ | 40-49 | Gói Vaccine | Không có bệnh", searchBy: "nu_40_49_khong_co_benh", group: "Gói vaccine" },
  { value: "Nữ | 40-49 | Tầm soát | Không có bệnh", searchBy: "nu_40_49_khong_co_benh", group: "Tầm soát" },

  { value: "Nam | 40-49 | Gói khám | Thần kinh", searchBy: "nam_40_49_than_kinh", group: "Gói khám" },
  { value: "Nam | 40-49 | Gói dược | Thần kinh", searchBy: "nam_40_49_than_kinh", group: "Gói dược" },
  { value: "Nam | 40-49 | Gói gene | Thần kinh", searchBy: "nam_40_49_than_kinh", group: "Gói gene" },
  { value: "Nam | 40-49 | Gói dinh dưỡng | Thần kinh", searchBy: "nam_40_49_than_kinh", group: "Gói dinh dưỡng" },
  { value: "Nam | 40-49 | Gói Vaccine | Thần kinh", searchBy: "nam_40_49_than_kinh", group: "Gói vaccine" },
  { value: "Nam | 40-49 | Tầm soát | Thần kinh", searchBy: "nam_40_49_than_kinh", group: "Tầm soát" },

  { value: "Nữ | 40-49 | Gói khám | Thần kinh", searchBy: "nu_40_49_than_kinh", group: "Gói khám" },
  { value: "Nữ | 40-49 | Gói dược | Thần kinh", searchBy: "nu_40_49_than_kinh", group: "Gói dược" },
  { value: "Nữ | 40-49 | Gói gene | Thần kinh", searchBy: "nu_40_49_than_kinh", group: "Gói gene" },
  { value: "Nữ | 40-49 | Gói dinh dưỡng | Thần kinh", searchBy: "nu_40_49_than_kinh", group: "Gói dinh dưỡng" },
  { value: "Nữ | 40-49 | Gói Vaccine | Thần kinh", searchBy: "nu_40_49_than_kinh", group: "Gói vaccine" },
  { value: "Nữ | 40-49 | Tầm soát | Thần kinh", searchBy: "nu_40_49_than_kinh", group: "Tầm soát" },

  { value: "Nam | 40-49 | Gói khám | Hô hấp", searchBy: "nam_40_49_ho_hap", group: "Gói khám" },
  { value: "Nam | 40-49 | Gói dược | Hô hấp", searchBy: "nam_40_49_ho_hap", group: "Gói dược" },
  { value: "Nam | 40-49 | Gói gene | Hô hấp", searchBy: "nam_40_49_ho_hap", group: "Gói gene" },
  { value: "Nam | 40-49 | Gói dinh dưỡng | Hô hấp", searchBy: "nam_40_49_ho_hap", group: "Gói dinh dưỡng" },
  { value: "Nam | 40-49 | Gói Vaccine | Hô hấp", searchBy: "nam_40_49_ho_hap", group: "Gói vaccine" },
  { value: "Nam | 40-49 | Tầm soát | Hô hấp", searchBy: "nam_40_49_ho_hap", group: "Tầm soát" },

  { value: "Nữ | 40-49 | Gói khám | Hô hấp", searchBy: "nu_40_49_ho_hap", group: "Gói khám" },
  { value: "Nữ | 40-49 | Gói dược | Hô hấp", searchBy: "nu_40_49_ho_hap", group: "Gói dược" },
  { value: "Nữ | 40-49 | Gói gene | Hô hấp", searchBy: "nu_40_49_ho_hap", group: "Gói gene" },
  { value: "Nữ | 40-49 | Gói dinh dưỡng | Hô hấp", searchBy: "nu_40_49_ho_hap", group: "Gói dinh dưỡng" },
  { value: "Nữ | 40-49 | Gói Vaccine | Hô hấp", searchBy: "nu_40_49_ho_hap", group: "Gói vaccine" },
  { value: "Nữ | 40-49 | Tầm soát | Hô hấp", searchBy: "nu_40_49_ho_hap", group: "Tầm soát" },

  { value: "Nam | 40-49 | Gói khám | Tim mạch", searchBy: "nam_40_49_tim_mach", group: "Gói khám" },
  { value: "Nam | 40-49 | Gói dược | Tim mạch", searchBy: "nam_40_49_tim_mach", group: "Gói dược" },
  { value: "Nam | 40-49 | Gói gene | Tim mạch", searchBy: "nam_40_49_tim_mach", group: "Gói gene" },
  { value: "Nam | 40-49 | Gói dinh dưỡng | Tim mạch", searchBy: "nam_40_49_tim_mach", group: "Gói dinh dưỡng" },
  { value: "Nam | 40-49 | Gói Vaccine | Tim mạch", searchBy: "nam_40_49_tim_mach", group: "Gói vaccine" },
  { value: "Nam | 40-49 | Tầm soát | Tim mạch", searchBy: "nam_40_49_tim_mach", group: "Tầm soát" },

  { value: "Nữ | 40-49 | Gói khám | Tim mạch", searchBy: "nam_40_49_tim_mach", group: "Gói khám" },
  { value: "Nữ | 40-49 | Gói dược | Tim mạch", searchBy: "nam_40_49_tim_mach", group: "Gói dược" },
  { value: "Nữ | 40-49 | Gói gene | Tim mạch", searchBy: "nam_40_49_tim_mach", group: "Gói gene" },
  { value: "Nữ | 40-49 | Gói dinh dưỡng | Tim mạch", searchBy: "nam_40_49_tim_mach", group: "Gói dinh dưỡng" },
  { value: "Nữ | 40-49 | Gói Vaccine | Tim mạch", searchBy: "nam_40_49_tim_mach", group: "Gói vaccine" },
  { value: "Nữ | 40-49 | Tầm soát | Tim mạch", searchBy: "nam_40_49_tim_mach", group: "Tầm soát" },

  { value: "Nam | 40-49 | Gói khám | Thận - tiết niệu", searchBy: "nam_40_49_than_tiet_nieu", group: "Gói khám" },
  { value: "Nam | 40-49 | Gói dược | Thận - tiết niệu", searchBy: "nam_40_49_than_tiet_nieu", group: "Gói dược" },
  { value: "Nam | 40-49 | Gói gene | Thận - tiết niệu", searchBy: "nam_40_49_than_tiet_nieu", group: "Gói gene" },
  { value: "Nam | 40-49 | Gói dinh dưỡng | Thận - tiết niệu", searchBy: "nam_40_49_than_tiet_nieu", group: "Gói dinh dưỡng" },
  { value: "Nam | 40-49 | Gói Vaccine | Thận - tiết niệu", searchBy: "nam_40_49_than_tiet_nieu", group: "Gói vaccine" },
  { value: "Nam | 40-49 | Tầm soát | Thận - tiết niệu", searchBy: "nam_40_49_than_tiet_nieu", group: "Tầm soát" },

  { value: "Nữ | 40-49 | Gói khám | Thận - tiết niệu", searchBy: "nu_40_49_than_tiet_nieu", group: "Gói khám" },
  { value: "Nữ | 40-49 | Gói dược | Thận - tiết niệu", searchBy: "nu_40_49_than_tiet_nieu", group: "Gói dược" },
  { value: "Nữ | 40-49 | Gói gene | Thận - tiết niệu", searchBy: "nu_40_49_than_tiet_nieu", group: "Gói gene" },
  { value: "Nữ | 40-49 | Gói dinh dưỡng | Thận - tiết niệu", searchBy: "nu_40_49_than_tiet_nieu", group: "Gói dinh dưỡng" },
  { value: "Nữ | 40-49 | Gói Vaccine | Thận - tiết niệu", searchBy: "nu_40_49_than_tiet_nieu", group: "Gói vaccine" },
  { value: "Nữ | 40-49 | Tầm soát | Thận - tiết niệu", searchBy: "nu_40_49_than_tiet_nieu", group: "Tầm soát" },

  { value: "Nam | 40-49 | Gói khám | Cơ xương khớp", searchBy: "nam_40_49_co_xuong_khop", group: "Gói khám" },
  { value: "Nam | 40-49 | Gói dược | Cơ xương khớp", searchBy: "nam_40_49_co_xuong_khop", group: "Gói dược" },
  { value: "Nam | 40-49 | Gói gene | Cơ xương khớp", searchBy: "nam_40_49_co_xuong_khop", group: "Gói gene" },
  { value: "Nam | 40-49 | Gói dinh dưỡng | Cơ xương khớp", searchBy: "nam_40_49_co_xuong_khop", group: "Gói dinh dưỡng" },
  { value: "Nam | 40-49 | Gói Vaccine | Cơ xương khớp", searchBy: "nam_40_49_co_xuong_khop", group: "Gói vaccine" },
  { value: "Nam | 40-49 | Tầm soát | Cơ xương khớp", searchBy: "nam_40_49_co_xuong_khop", group: "Tầm soát" },

  { value: "Nữ | 40-49 | Gói khám | Cơ xương khớp", searchBy: "nu_40_49_co_xuong_khop", group: "Gói khám" },
  { value: "Nữ | 40-49 | Gói dược | Cơ xương khớp", searchBy: "nu_40_49_co_xuong_khop", group: "Gói dược" },
  { value: "Nữ | 40-49 | Gói gene | Cơ xương khớp", searchBy: "nu_40_49_co_xuong_khop", group: "Gói gene" },
  { value: "Nữ | 40-49 | Gói dinh dưỡng | Cơ xương khớp", searchBy: "nu_40_49_co_xuong_khop", group: "Gói dinh dưỡng" },
  { value: "Nữ | 40-49 | Gói Vaccine | Cơ xương khớp", searchBy: "nu_40_49_co_xuong_khop", group: "Gói vaccine" },
  { value: "Nữ | 40-49 | Tầm soát | Cơ xương khớp", searchBy: "nu_40_49_co_xuong_khop", group: "Tầm soát" },

  { value: "Nam | 40-49 | Gói khám | Nội tiết/ chuyển hoá", searchBy: "nam_40_49_noi_tiet_chuyen_hoa", group: "Gói khám" },
  { value: "Nam | 40-49 | Gói dược | Nội tiết/ chuyển hoá", searchBy: "nam_40_49_noi_tiet_chuyen_hoa", group: "Gói dược" },
  { value: "Nam | 40-49 | Gói gene | Nội tiết/ chuyển hoá", searchBy: "nam_40_49_noi_tiet_chuyen_hoa", group: "Gói gene" },
  { value: "Nam | 40-49 | Gói dinh dưỡng | Nội tiết/ chuyển hoá", searchBy: "nam_40_49_noi_tiet_chuyen_hoa", group: "Gói dinh dưỡng" },
  { value: "Nam | 40-49 | Gói Vaccine | Nội tiết/ chuyển hoá", searchBy: "nam_40_49_noi_tiet_chuyen_hoa", group: "Gói vaccine" },
  { value: "Nam | 40-49 | Tầm soát | Nội tiết/ chuyển hoá", searchBy: "nam_40_49_noi_tiet_chuyen_hoa", group: "Tầm soát" },

  { value: "Nữ | 40-49 | Gói khám | Nội tiết/ chuyển hoá", searchBy: "nu_40_49_noi_tiet_chuyen_hoa", group: "Gói khám" },
  { value: "Nữ | 40-49 | Gói dược | Nội tiết/ chuyển hoá", searchBy: "nu_40_49_noi_tiet_chuyen_hoa", group: "Gói dược" },
  { value: "Nữ | 40-49 | Gói gene | Nội tiết/ chuyển hoá", searchBy: "nu_40_49_noi_tiet_chuyen_hoa", group: "Gói gene" },
  { value: "Nữ | 40-49 | Gói dinh dưỡng | Nội tiết/ chuyển hoá", searchBy: "nu_40_49_noi_tiet_chuyen_hoa", group: "Gói dinh dưỡng" },
  { value: "Nữ | 40-49 | Gói Vaccine | Nội tiết/ chuyển hoá", searchBy: "nu_40_49_noi_tiet_chuyen_hoa", group: "Gói vaccine" },
  { value: "Nữ | 40-49 | Tầm soát | Nội tiết/ chuyển hoá", searchBy: "nu_40_49_noi_tiet_chuyen_hoa", group: "Tầm soát" },

  { value: "Nam | 40-49 | Gói khám | Tiêu hóa", searchBy: "nam_40_49_tieu_hoa", group: "Gói khám" },
  { value: "Nam | 40-49 | Gói dược | Tiêu hóa", searchBy: "nam_40_49_tieu_hoa", group: "Gói dược" },
  { value: "Nam | 40-49 | Gói gene | Tiêu hóa", searchBy: "nam_40_49_tieu_hoa", group: "Gói gene" },
  { value: "Nam | 40-49 | Gói dinh dưỡng | Tiêu hóa", searchBy: "nam_40_49_tieu_hoa", group: "Gói dinh dưỡng" },
  { value: "Nam | 40-49 | Gói Vaccine | Tiêu hóa", searchBy: "nam_40_49_tieu_hoa", group: "Gói vaccine" },
  { value: "Nam | 40-49 | Tầm soát | Tiêu hóa", searchBy: "nam_40_49_tieu_hoa", group: "Tầm soát" },

  { value: "Nữ | 40-49 | Gói khám | Tiêu hóa", searchBy: "nu_40_49_tieu_hoa", group: "Gói khám" },
  { value: "Nữ | 40-49 | Gói dược | Tiêu hóa", searchBy: "nu_40_49_tieu_hoa", group: "Gói dược" },
  { value: "Nữ | 40-49 | Gói gene | Tiêu hóa", searchBy: "nu_40_49_tieu_hoa", group: "Gói gene" },
  { value: "Nữ | 40-49 | Gói dinh dưỡng | Tiêu hóa", searchBy: "nu_40_49_tieu_hoa", group: "Gói dinh dưỡng" },
  { value: "Nữ | 40-49 | Gói Vaccine | Tiêu hóa", searchBy: "nu_40_49_tieu_hoa", group: "Gói vaccine" },
  { value: "Nữ | 40-49 | Tầm soát | Tiêu hóa", searchBy: "nu_40_49_tieu_hoa", group: "Tầm soát" },

  // 50 - 64
  { value: "Nam | 50-64 | Gói khám | Không có bệnh", searchBy: "nam_50_64_khong_co_benh", group: "Gói khám" },
  { value: "Nam | 50-64 | Gói dược | Không có bệnh", searchBy: "nam_50_64_khong_co_benh", group: "Gói dược" },
  { value: "Nam | 50-64 | Gói gene | Không có bệnh", searchBy: "nam_50_64_khong_co_benh", group: "Gói gene" },
  { value: "Nam | 50-64 | Gói dinh dưỡng | Không có bệnh", searchBy: "nam_50_64_khong_co_benh", group: "Gói dinh dưỡng" },
  { value: "Nam | 50-64 | Gói Vaccine | Không có bệnh", searchBy: "nam_50_64_khong_co_benh", group: "Gói vaccine" },
  { value: "Nam | 50-64 | Tầm soát | Không có bệnh", searchBy: "nam_50_64_khong_co_benh", group: "Tầm soát" },

  { value: "Nữ | 50-64 | Gói khám | Không có bệnh", searchBy: "nu_50_64_khong_co_benh", group: "Gói khám" },
  { value: "Nữ | 50-64 | Gói dược | Không có bệnh", searchBy: "nu_50_64_khong_co_benh", group: "Gói dược" },
  { value: "Nữ | 50-64 | Gói gene | Không có bệnh", searchBy: "nu_50_64_khong_co_benh", group: "Gói gene" },
  { value: "Nữ | 50-64 | Gói dinh dưỡng | Không có bệnh", searchBy: "nu_50_64_khong_co_benh", group: "Gói dinh dưỡng" },
  { value: "Nữ | 50-64 | Gói Vaccine | Không có bệnh", searchBy: "nu_50_64_khong_co_benh", group: "Gói vaccine" },
  { value: "Nữ | 50-64 | Tầm soát | Không có bệnh", searchBy: "nu_50_64_khong_co_benh", group: "Tầm soát" },

  { value: "Nam | 50-64 | Gói khám | Thần kinh", searchBy: "nam_50_64_than_kinh", group: "Gói khám" },
  { value: "Nam | 50-64 | Gói dược | Thần kinh", searchBy: "nam_50_64_than_kinh", group: "Gói dược" },
  { value: "Nam | 50-64 | Gói gene | Thần kinh", searchBy: "nam_50_64_than_kinh", group: "Gói gene" },
  { value: "Nam | 50-64 | Gói dinh dưỡng | Thần kinh", searchBy: "nam_50_64_than_kinh", group: "Gói dinh dưỡng" },
  { value: "Nam | 50-64 | Gói Vaccine | Thần kinh", searchBy: "nam_50_64_than_kinh", group: "Gói vaccine" },
  { value: "Nam | 50-64 | Tầm soát | Thần kinh", searchBy: "nam_50_64_than_kinh", group: "Tầm soát" },

  { value: "Nữ | 50-64 | Gói khám | Thần kinh", searchBy: "nu_50_64_than_kinh", group: "Gói khám" },
  { value: "Nữ | 50-64 | Gói dược | Thần kinh", searchBy: "nu_50_64_than_kinh", group: "Gói dược" },
  { value: "Nữ | 50-64 | Gói gene | Thần kinh", searchBy: "nu_50_64_than_kinh", group: "Gói gene" },
  { value: "Nữ | 50-64 | Gói dinh dưỡng | Thần kinh", searchBy: "nu_50_64_than_kinh", group: "Gói dinh dưỡng" },
  { value: "Nữ | 50-64 | Gói Vaccine | Thần kinh", searchBy: "nu_50_64_than_kinh", group: "Gói vaccine" },
  { value: "Nữ | 50-64 | Tầm soát | Thần kinh", searchBy: "nu_50_64_than_kinh", group: "Tầm soát" },

  { value: "Nam | 50-64 | Gói khám | Hô hấp", searchBy: "nam_50_64_ho_hap", group: "Gói khám" },
  { value: "Nam | 50-64 | Gói dược | Hô hấp", searchBy: "nam_50_64_ho_hap", group: "Gói dược" },
  { value: "Nam | 50-64 | Gói gene | Hô hấp", searchBy: "nam_50_64_ho_hap", group: "Gói gene" },
  { value: "Nam | 50-64 | Gói dinh dưỡng | Hô hấp", searchBy: "nam_50_64_ho_hap", group: "Gói dinh dưỡng" },
  { value: "Nam | 50-64 | Gói Vaccine | Hô hấp", searchBy: "nam_50_64_ho_hap", group: "Gói vaccine" },
  { value: "Nam | 50-64 | Tầm soát | Hô hấp", searchBy: "nam_50_64_ho_hap", group: "Tầm soát" },

  { value: "Nữ | 50-64 | Gói khám | Hô hấp", searchBy: "nu_50_64_ho_hap", group: "Gói khám" },
  { value: "Nữ | 50-64 | Gói dược | Hô hấp", searchBy: "nu_50_64_ho_hap", group: "Gói dược" },
  { value: "Nữ | 50-64 | Gói gene | Hô hấp", searchBy: "nu_50_64_ho_hap", group: "Gói gene" },
  { value: "Nữ | 50-64 | Gói dinh dưỡng | Hô hấp", searchBy: "nu_50_64_ho_hap", group: "Gói dinh dưỡng" },
  { value: "Nữ | 50-64 | Gói Vaccine | Hô hấp", searchBy: "nu_50_64_ho_hap", group: "Gói vaccine" },
  { value: "Nữ | 50-64 | Tầm soát | Hô hấp", searchBy: "nu_50_64_ho_hap", group: "Tầm soát" },

  { value: "Nam | 50-64 | Gói khám | Tim mạch", searchBy: "nam_50_64_tim_mach", group: "Gói khám" },
  { value: "Nam | 50-64 | Gói dược | Tim mạch", searchBy: "nam_50_64_tim_mach", group: "Gói dược" },
  { value: "Nam | 50-64 | Gói gene | Tim mạch", searchBy: "nam_50_64_tim_mach", group: "Gói gene" },
  { value: "Nam | 50-64 | Gói dinh dưỡng | Tim mạch", searchBy: "nam_50_64_tim_mach", group: "Gói dinh dưỡng" },
  { value: "Nam | 50-64 | Gói Vaccine | Tim mạch", searchBy: "nam_50_64_tim_mach", group: "Gói vaccine" },
  { value: "Nam | 50-64 | Tầm soát | Tim mạch", searchBy: "nam_50_64_tim_mach", group: "Tầm soát" },

  { value: "Nữ | 50-64 | Gói khám | Tim mạch", searchBy: "nam_50_64_tim_mach", group: "Gói khám" },
  { value: "Nữ | 50-64 | Gói dược | Tim mạch", searchBy: "nam_50_64_tim_mach", group: "Gói dược" },
  { value: "Nữ | 50-64 | Gói gene | Tim mạch", searchBy: "nam_50_64_tim_mach", group: "Gói gene" },
  { value: "Nữ | 50-64 | Gói dinh dưỡng | Tim mạch", searchBy: "nam_50_64_tim_mach", group: "Gói dinh dưỡng" },
  { value: "Nữ | 50-64 | Gói Vaccine | Tim mạch", searchBy: "nam_50_64_tim_mach", group: "Gói vaccine" },
  { value: "Nữ | 50-64 | Tầm soát | Tim mạch", searchBy: "nam_50_64_tim_mach", group: "Tầm soát" },

  { value: "Nam | 50-64 | Gói khám | Thận - tiết niệu", searchBy: "nam_50_64_than_tiet_nieu", group: "Gói khám" },
  { value: "Nam | 50-64 | Gói dược | Thận - tiết niệu", searchBy: "nam_50_64_than_tiet_nieu", group: "Gói dược" },
  { value: "Nam | 50-64 | Gói gene | Thận - tiết niệu", searchBy: "nam_50_64_than_tiet_nieu", group: "Gói gene" },
  { value: "Nam | 50-64 | Gói dinh dưỡng | Thận - tiết niệu", searchBy: "nam_50_64_than_tiet_nieu", group: "Gói dinh dưỡng" },
  { value: "Nam | 50-64 | Gói Vaccine | Thận - tiết niệu", searchBy: "nam_50_64_than_tiet_nieu", group: "Gói vaccine" },
  { value: "Nam | 50-64 | Tầm soát | Thận - tiết niệu", searchBy: "nam_50_64_than_tiet_nieu", group: "Tầm soát" },

  { value: "Nữ | 50-64 | Gói khám | Thận - tiết niệu", searchBy: "nu_50_64_than_tiet_nieu", group: "Gói khám" },
  { value: "Nữ | 50-64 | Gói dược | Thận - tiết niệu", searchBy: "nu_50_64_than_tiet_nieu", group: "Gói dược" },
  { value: "Nữ | 50-64 | Gói gene | Thận - tiết niệu", searchBy: "nu_50_64_than_tiet_nieu", group: "Gói gene" },
  { value: "Nữ | 50-64 | Gói dinh dưỡng | Thận - tiết niệu", searchBy: "nu_50_64_than_tiet_nieu", group: "Gói dinh dưỡng" },
  { value: "Nữ | 50-64 | Gói Vaccine | Thận - tiết niệu", searchBy: "nu_50_64_than_tiet_nieu", group: "Gói vaccine" },
  { value: "Nữ | 50-64 | Tầm soát | Thận - tiết niệu", searchBy: "nu_50_64_than_tiet_nieu", group: "Tầm soát" },

  { value: "Nam | 50-64 | Gói khám | Cơ xương khớp", searchBy: "nam_50_64_co_xuong_khop", group: "Gói khám" },
  { value: "Nam | 50-64 | Gói dược | Cơ xương khớp", searchBy: "nam_50_64_co_xuong_khop", group: "Gói dược" },
  { value: "Nam | 50-64 | Gói gene | Cơ xương khớp", searchBy: "nam_50_64_co_xuong_khop", group: "Gói gene" },
  { value: "Nam | 50-64 | Gói dinh dưỡng | Cơ xương khớp", searchBy: "nam_50_64_co_xuong_khop", group: "Gói dinh dưỡng" },
  { value: "Nam | 50-64 | Gói Vaccine | Cơ xương khớp", searchBy: "nam_50_64_co_xuong_khop", group: "Gói vaccine" },
  { value: "Nam | 50-64 | Tầm soát | Cơ xương khớp", searchBy: "nam_50_64_co_xuong_khop", group: "Tầm soát" },

  { value: "Nữ | 50-64 | Gói khám | Cơ xương khớp", searchBy: "nu_50_64_co_xuong_khop", group: "Gói khám" },
  { value: "Nữ | 50-64 | Gói dược | Cơ xương khớp", searchBy: "nu_50_64_co_xuong_khop", group: "Gói dược" },
  { value: "Nữ | 50-64 | Gói gene | Cơ xương khớp", searchBy: "nu_50_64_co_xuong_khop", group: "Gói gene" },
  { value: "Nữ | 50-64 | Gói dinh dưỡng | Cơ xương khớp", searchBy: "nu_50_64_co_xuong_khop", group: "Gói dinh dưỡng" },
  { value: "Nữ | 50-64 | Gói Vaccine | Cơ xương khớp", searchBy: "nu_50_64_co_xuong_khop", group: "Gói vaccine" },
  { value: "Nữ | 50-64 | Tầm soát | Cơ xương khớp", searchBy: "nu_50_64_co_xuong_khop", group: "Tầm soát" },

  { value: "Nam | 50-64 | Gói khám | Nội tiết/ chuyển hoá", searchBy: "nam_50_64_noi_tiet_chuyen_hoa", group: "Gói khám" },
  { value: "Nam | 50-64 | Gói dược | Nội tiết/ chuyển hoá", searchBy: "nam_50_64_noi_tiet_chuyen_hoa", group: "Gói dược" },
  { value: "Nam | 50-64 | Gói gene | Nội tiết/ chuyển hoá", searchBy: "nam_50_64_noi_tiet_chuyen_hoa", group: "Gói gene" },
  { value: "Nam | 50-64 | Gói dinh dưỡng | Nội tiết/ chuyển hoá", searchBy: "nam_50_64_noi_tiet_chuyen_hoa", group: "Gói dinh dưỡng" },
  { value: "Nam | 50-64 | Gói Vaccine | Nội tiết/ chuyển hoá", searchBy: "nam_50_64_noi_tiet_chuyen_hoa", group: "Gói vaccine" },
  { value: "Nam | 50-64 | Tầm soát | Nội tiết/ chuyển hoá", searchBy: "nam_50_64_noi_tiet_chuyen_hoa", group: "Tầm soát" },

  { value: "Nữ | 50-64 | Gói khám | Nội tiết/ chuyển hoá", searchBy: "nu_50_64_noi_tiet_chuyen_hoa", group: "Gói khám" },
  { value: "Nữ | 50-64 | Gói dược | Nội tiết/ chuyển hoá", searchBy: "nu_50_64_noi_tiet_chuyen_hoa", group: "Gói dược" },
  { value: "Nữ | 50-64 | Gói gene | Nội tiết/ chuyển hoá", searchBy: "nu_50_64_noi_tiet_chuyen_hoa", group: "Gói gene" },
  { value: "Nữ | 50-64 | Gói dinh dưỡng | Nội tiết/ chuyển hoá", searchBy: "nu_50_64_noi_tiet_chuyen_hoa", group: "Gói dinh dưỡng" },
  { value: "Nữ | 50-64 | Gói Vaccine | Nội tiết/ chuyển hoá", searchBy: "nu_50_64_noi_tiet_chuyen_hoa", group: "Gói vaccine" },
  { value: "Nữ | 50-64 | Tầm soát | Nội tiết/ chuyển hoá", searchBy: "nu_50_64_noi_tiet_chuyen_hoa", group: "Tầm soát" },

  { value: "Nam | 50-64 | Gói khám | Tiêu hóa", searchBy: "nam_50_64_tieu_hoa", group: "Gói khám" },
  { value: "Nam | 50-64 | Gói dược | Tiêu hóa", searchBy: "nam_50_64_tieu_hoa", group: "Gói dược" },
  { value: "Nam | 50-64 | Gói gene | Tiêu hóa", searchBy: "nam_50_64_tieu_hoa", group: "Gói gene" },
  { value: "Nam | 50-64 | Gói dinh dưỡng | Tiêu hóa", searchBy: "nam_50_64_tieu_hoa", group: "Gói dinh dưỡng" },
  { value: "Nam | 50-64 | Gói Vaccine | Tiêu hóa", searchBy: "nam_50_64_tieu_hoa", group: "Gói vaccine" },
  { value: "Nam | 50-64 | Tầm soát | Tiêu hóa", searchBy: "nam_50_64_tieu_hoa", group: "Tầm soát" },

  { value: "Nữ | 50-64 | Gói khám | Tiêu hóa", searchBy: "nu_50_64_tieu_hoa", group: "Gói khám" },
  { value: "Nữ | 50-64 | Gói dược | Tiêu hóa", searchBy: "nu_50_64_tieu_hoa", group: "Gói dược" },
  { value: "Nữ | 50-64 | Gói gene | Tiêu hóa", searchBy: "nu_50_64_tieu_hoa", group: "Gói gene" },
  { value: "Nữ | 50-64 | Gói dinh dưỡng | Tiêu hóa", searchBy: "nu_50_64_tieu_hoa", group: "Gói dinh dưỡng" },
  { value: "Nữ | 50-64 | Gói Vaccine | Tiêu hóa", searchBy: "nu_50_64_tieu_hoa", group: "Gói vaccine" },
  { value: "Nữ | 50-64 | Tầm soát | Tiêu hóa", searchBy: "nu_50_64_tieu_hoa", group: "Tầm soát" },

  // 65
  { value: "Nam | 65 | Gói khám | Không có bệnh", searchBy: "nam_65_khong_co_benh", group: "Gói khám" },
  { value: "Nam | 65 | Gói dược | Không có bệnh", searchBy: "nam_65_khong_co_benh", group: "Gói dược" },
  { value: "Nam | 65 | Gói gene | Không có bệnh", searchBy: "nam_65_khong_co_benh", group: "Gói gene" },
  { value: "Nam | 65 | Gói dinh dưỡng | Không có bệnh", searchBy: "nam_65_khong_co_benh", group: "Gói dinh dưỡng" },
  { value: "Nam | 65 | Gói Vaccine | Không có bệnh", searchBy: "nam_65_khong_co_benh", group: "Gói vaccine" },
  { value: "Nam | 65 | Tầm soát | Không có bệnh", searchBy: "nam_65_khong_co_benh", group: "Tầm soát" },

  { value: "Nữ | 65 | Gói khám | Không có bệnh", searchBy: "nu_65_khong_co_benh", group: "Gói khám" },
  { value: "Nữ | 65 | Gói dược | Không có bệnh", searchBy: "nu_65_khong_co_benh", group: "Gói dược" },
  { value: "Nữ | 65 | Gói gene | Không có bệnh", searchBy: "nu_65_khong_co_benh", group: "Gói gene" },
  { value: "Nữ | 65 | Gói dinh dưỡng | Không có bệnh", searchBy: "nu_65_khong_co_benh", group: "Gói dinh dưỡng" },
  { value: "Nữ | 65 | Gói Vaccine | Không có bệnh", searchBy: "nu_65_khong_co_benh", group: "Gói vaccine" },
  { value: "Nữ | 65 | Tầm soát | Không có bệnh", searchBy: "nu_65_khong_co_benh", group: "Tầm soát" },

  { value: "Nam | 65 | Gói khám | Thần kinh", searchBy: "nam_65_than_kinh", group: "Gói khám" },
  { value: "Nam | 65 | Gói dược | Thần kinh", searchBy: "nam_65_than_kinh", group: "Gói dược" },
  { value: "Nam | 65 | Gói gene | Thần kinh", searchBy: "nam_65_than_kinh", group: "Gói gene" },
  { value: "Nam | 65 | Gói dinh dưỡng | Thần kinh", searchBy: "nam_65_than_kinh", group: "Gói dinh dưỡng" },
  { value: "Nam | 65 | Gói Vaccine | Thần kinh", searchBy: "nam_65_than_kinh", group: "Gói vaccine" },
  { value: "Nam | 65 | Tầm soát | Thần kinh", searchBy: "nam_65_than_kinh", group: "Tầm soát" },

  { value: "Nữ | 65 | Gói khám | Thần kinh", searchBy: "nu_65_than_kinh", group: "Gói khám" },
  { value: "Nữ | 65 | Gói dược | Thần kinh", searchBy: "nu_65_than_kinh", group: "Gói dược" },
  { value: "Nữ | 65 | Gói gene | Thần kinh", searchBy: "nu_65_than_kinh", group: "Gói gene" },
  { value: "Nữ | 65 | Gói dinh dưỡng | Thần kinh", searchBy: "nu_65_than_kinh", group: "Gói dinh dưỡng" },
  { value: "Nữ | 65 | Gói Vaccine | Thần kinh", searchBy: "nu_65_than_kinh", group: "Gói vaccine" },
  { value: "Nữ | 65 | Tầm soát | Thần kinh", searchBy: "nu_65_than_kinh", group: "Tầm soát" },

  { value: "Nam | 65 | Gói khám | Hô hấp", searchBy: "nam_65_ho_hap", group: "Gói khám" },
  { value: "Nam | 65 | Gói dược | Hô hấp", searchBy: "nam_65_ho_hap", group: "Gói dược" },
  { value: "Nam | 65 | Gói gene | Hô hấp", searchBy: "nam_65_ho_hap", group: "Gói gene" },
  { value: "Nam | 65 | Gói dinh dưỡng | Hô hấp", searchBy: "nam_65_ho_hap", group: "Gói dinh dưỡng" },
  { value: "Nam | 65 | Gói Vaccine | Hô hấp", searchBy: "nam_65_ho_hap", group: "Gói vaccine" },
  { value: "Nam | 65 | Tầm soát | Hô hấp", searchBy: "nam_65_ho_hap", group: "Tầm soát" },

  { value: "Nữ | 65 | Gói khám | Hô hấp", searchBy: "nu_65_ho_hap", group: "Gói khám" },
  { value: "Nữ | 65 | Gói dược | Hô hấp", searchBy: "nu_65_ho_hap", group: "Gói dược" },
  { value: "Nữ | 65 | Gói gene | Hô hấp", searchBy: "nu_65_ho_hap", group: "Gói gene" },
  { value: "Nữ | 65 | Gói dinh dưỡng | Hô hấp", searchBy: "nu_65_ho_hap", group: "Gói dinh dưỡng" },
  { value: "Nữ | 65 | Gói Vaccine | Hô hấp", searchBy: "nu_65_ho_hap", group: "Gói vaccine" },
  { value: "Nữ | 65 | Tầm soát | Hô hấp", searchBy: "nu_65_ho_hap", group: "Tầm soát" },

  { value: "Nam | 65 | Gói khám | Tim mạch", searchBy: "nam_65_tim_mach", group: "Gói khám" },
  { value: "Nam | 65 | Gói dược | Tim mạch", searchBy: "nam_65_tim_mach", group: "Gói dược" },
  { value: "Nam | 65 | Gói gene | Tim mạch", searchBy: "nam_65_tim_mach", group: "Gói gene" },
  { value: "Nam | 65 | Gói dinh dưỡng | Tim mạch", searchBy: "nam_65_tim_mach", group: "Gói dinh dưỡng" },
  { value: "Nam | 65 | Gói Vaccine | Tim mạch", searchBy: "nam_65_tim_mach", group: "Gói vaccine" },
  { value: "Nam | 65 | Tầm soát | Tim mạch", searchBy: "nam_65_tim_mach", group: "Tầm soát" },

  { value: "Nữ | 65 | Gói khám | Tim mạch", searchBy: "nam_65_tim_mach", group: "Gói khám" },
  { value: "Nữ | 65 | Gói dược | Tim mạch", searchBy: "nam_65_tim_mach", group: "Gói dược" },
  { value: "Nữ | 65 | Gói gene | Tim mạch", searchBy: "nam_65_tim_mach", group: "Gói gene" },
  { value: "Nữ | 65 | Gói dinh dưỡng | Tim mạch", searchBy: "nam_65_tim_mach", group: "Gói dinh dưỡng" },
  { value: "Nữ | 65 | Gói Vaccine | Tim mạch", searchBy: "nam_65_tim_mach", group: "Gói vaccine" },
  { value: "Nữ | 65 | Tầm soát | Tim mạch", searchBy: "nam_65_tim_mach", group: "Tầm soát" },

  { value: "Nam | 65 | Gói khám | Thận - tiết niệu", searchBy: "nam_65_than_tiet_nieu", group: "Gói khám" },
  { value: "Nam | 65 | Gói dược | Thận - tiết niệu", searchBy: "nam_65_than_tiet_nieu", group: "Gói dược" },
  { value: "Nam | 65 | Gói gene | Thận - tiết niệu", searchBy: "nam_65_than_tiet_nieu", group: "Gói gene" },
  { value: "Nam | 65 | Gói dinh dưỡng | Thận - tiết niệu", searchBy: "nam_65_than_tiet_nieu", group: "Gói dinh dưỡng" },
  { value: "Nam | 65 | Gói Vaccine | Thận - tiết niệu", searchBy: "nam_65_than_tiet_nieu", group: "Gói vaccine" },
  { value: "Nam | 65 | Tầm soát | Thận - tiết niệu", searchBy: "nam_65_than_tiet_nieu", group: "Tầm soát" },

  { value: "Nữ | 65 | Gói khám | Thận - tiết niệu", searchBy: "nu_65_than_tiet_nieu", group: "Gói khám" },
  { value: "Nữ | 65 | Gói dược | Thận - tiết niệu", searchBy: "nu_65_than_tiet_nieu", group: "Gói dược" },
  { value: "Nữ | 65 | Gói gene | Thận - tiết niệu", searchBy: "nu_65_than_tiet_nieu", group: "Gói gene" },
  { value: "Nữ | 65 | Gói dinh dưỡng | Thận - tiết niệu", searchBy: "nu_65_than_tiet_nieu", group: "Gói dinh dưỡng" },
  { value: "Nữ | 65 | Gói Vaccine | Thận - tiết niệu", searchBy: "nu_65_than_tiet_nieu", group: "Gói vaccine" },
  { value: "Nữ | 65 | Tầm soát | Thận - tiết niệu", searchBy: "nu_65_than_tiet_nieu", group: "Tầm soát" },

  { value: "Nam | 65 | Gói khám | Cơ xương khớp", searchBy: "nam_65_co_xuong_khop", group: "Gói khám" },
  { value: "Nam | 65 | Gói dược | Cơ xương khớp", searchBy: "nam_65_co_xuong_khop", group: "Gói dược" },
  { value: "Nam | 65 | Gói gene | Cơ xương khớp", searchBy: "nam_65_co_xuong_khop", group: "Gói gene" },
  { value: "Nam | 65 | Gói dinh dưỡng | Cơ xương khớp", searchBy: "nam_65_co_xuong_khop", group: "Gói dinh dưỡng" },
  { value: "Nam | 65 | Gói Vaccine | Cơ xương khớp", searchBy: "nam_65_co_xuong_khop", group: "Gói vaccine" },
  { value: "Nam | 65 | Tầm soát | Cơ xương khớp", searchBy: "nam_65_co_xuong_khop", group: "Tầm soát" },

  { value: "Nữ | 65 | Gói khám | Cơ xương khớp", searchBy: "nu_65_co_xuong_khop", group: "Gói khám" },
  { value: "Nữ | 65 | Gói dược | Cơ xương khớp", searchBy: "nu_65_co_xuong_khop", group: "Gói dược" },
  { value: "Nữ | 65 | Gói gene | Cơ xương khớp", searchBy: "nu_65_co_xuong_khop", group: "Gói gene" },
  { value: "Nữ | 65 | Gói dinh dưỡng | Cơ xương khớp", searchBy: "nu_65_co_xuong_khop", group: "Gói dinh dưỡng" },
  { value: "Nữ | 65 | Gói Vaccine | Cơ xương khớp", searchBy: "nu_65_co_xuong_khop", group: "Gói vaccine" },
  { value: "Nữ | 65 | Tầm soát | Cơ xương khớp", searchBy: "nu_65_co_xuong_khop", group: "Tầm soát" },

  { value: "Nam | 65 | Gói khám | Nội tiết/ chuyển hoá", searchBy: "nam_65_noi_tiet_chuyen_hoa", group: "Gói khám" },
  { value: "Nam | 65 | Gói dược | Nội tiết/ chuyển hoá", searchBy: "nam_65_noi_tiet_chuyen_hoa", group: "Gói dược" },
  { value: "Nam | 65 | Gói gene | Nội tiết/ chuyển hoá", searchBy: "nam_65_noi_tiet_chuyen_hoa", group: "Gói gene" },
  { value: "Nam | 65 | Gói dinh dưỡng | Nội tiết/ chuyển hoá", searchBy: "nam_65_noi_tiet_chuyen_hoa", group: "Gói dinh dưỡng" },
  { value: "Nam | 65 | Gói Vaccine | Nội tiết/ chuyển hoá", searchBy: "nam_65_noi_tiet_chuyen_hoa", group: "Gói vaccine" },
  { value: "Nam | 65 | Tầm soát | Nội tiết/ chuyển hoá", searchBy: "nam_65_noi_tiet_chuyen_hoa", group: "Tầm soát" },

  { value: "Nữ | 65 | Gói khám | Nội tiết/ chuyển hoá", searchBy: "nu_65_noi_tiet_chuyen_hoa", group: "Gói khám" },
  { value: "Nữ | 65 | Gói dược | Nội tiết/ chuyển hoá", searchBy: "nu_65_noi_tiet_chuyen_hoa", group: "Gói dược" },
  { value: "Nữ | 65 | Gói gene | Nội tiết/ chuyển hoá", searchBy: "nu_65_noi_tiet_chuyen_hoa", group: "Gói gene" },
  { value: "Nữ | 65 | Gói dinh dưỡng | Nội tiết/ chuyển hoá", searchBy: "nu_65_noi_tiet_chuyen_hoa", group: "Gói dinh dưỡng" },
  { value: "Nữ | 65 | Gói Vaccine | Nội tiết/ chuyển hoá", searchBy: "nu_65_noi_tiet_chuyen_hoa", group: "Gói vaccine" },
  { value: "Nữ | 65 | Tầm soát | Nội tiết/ chuyển hoá", searchBy: "nu_65_noi_tiet_chuyen_hoa", group: "Tầm soát" },

  { value: "Nam | 65 | Gói khám | Tiêu hóa", searchBy: "nam_65_tieu_hoa", group: "Gói khám" },
  { value: "Nam | 65 | Gói dược | Tiêu hóa", searchBy: "nam_65_tieu_hoa", group: "Gói dược" },
  { value: "Nam | 65 | Gói gene | Tiêu hóa", searchBy: "nam_65_tieu_hoa", group: "Gói gene" },
  { value: "Nam | 65 | Gói dinh dưỡng | Tiêu hóa", searchBy: "nam_65_tieu_hoa", group: "Gói dinh dưỡng" },
  { value: "Nam | 65 | Gói Vaccine | Tiêu hóa", searchBy: "nam_65_tieu_hoa", group: "Gói vaccine" },
  { value: "Nam | 65 | Tầm soát | Tiêu hóa", searchBy: "nam_65_tieu_hoa", group: "Tầm soát" },

  { value: "Nữ | 65 | Gói khám | Tiêu hóa", searchBy: "nu_65_tieu_hoa", group: "Gói khám" },
  { value: "Nữ | 65 | Gói dược | Tiêu hóa", searchBy: "nu_65_tieu_hoa", group: "Gói dược" },
  { value: "Nữ | 65 | Gói gene | Tiêu hóa", searchBy: "nu_65_tieu_hoa", group: "Gói gene" },
  { value: "Nữ | 65 | Gói dinh dưỡng | Tiêu hóa", searchBy: "nu_65_tieu_hoa", group: "Gói dinh dưỡng" },
  { value: "Nữ | 65 | Gói Vaccine | Tiêu hóa", searchBy: "nu_65_tieu_hoa", group: "Gói vaccine" },
  { value: "Nữ | 65 | Tầm soát | Tiêu hóa", searchBy: "nu_65_tieu_hoa", group: "Tầm soát" },
];


export default ProductDetail

