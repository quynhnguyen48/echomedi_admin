import classNames from "classnames"
import dayjs from "dayjs"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getStrapiMedia } from "utils/media"
import sumBy from "lodash/sumBy"
import { toast } from "react-toastify"

import Button from "components/Button"
import DataItem from "components/DataItem"
import Icon from "components/Icon"
import Tag from "components/Tag"
import { BRAND_STATUS } from "constants/Brand"
import ProductDescription from "./components/ProductDescription"
import ProductImages from "./components/ProductImages"
import ProductInventory from "./components/ProductInventory"
import ProductVariants from "./components/ProductVariants"
import Input from "components/Input";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup/dist/yup"
import * as yup from "yup"
import { formatPrice } from "utils/number";
import { updateMedicalService } from "services/api/medicalService"

const ProductDetail = ({ data, onTogglePublish, onUpdateProduct, editable }) => {
  const navigate = useNavigate()
  const [openProductDescriptionDrawer, setOpenProductDescriptionDrawer] = useState(false)
  const [openProductImagesDrawer, setOpenProductImagesDrawer] = useState(false)
  const [openProductVariantsDrawer, setOpenProductVariantsDrawer] = useState(false)
  const [openProductInventoryDrawer, setOpenProductInventoryDrawer] = useState(false)
  const [price, setPrice] = useState(0);
  const [priceq2, setPriceQ2] = useState(0);
  const [disabledQ2, setDisabledQ2] = useState(false);
  const [priceq7, setPriceQ7] = useState(0);
  const [disabledQ7, setDisabledQ7] = useState(false);
  const [pricebd, setPriceBD] = useState(0);
  const [disabledBD, setDisabledBD] = useState(false);
  const [label, setLabel] = useState("");
  const [goldPercentage, setGoldPercentage] = useState(0);
  const [platinumPercentage, setPlatinumPercentage] = useState(0);
  const [monthlyGold, setMonthlyGold] = useState(0);
  const [monthlyPlatinum, setMonthlyPlatinum] = useState(0);
  const [yearlyGold, setYearlyGold] = useState(0);
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

  const validationSchema = yup.object({

  })

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
    getValues,
    setValue,
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {},
  })

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
    setYearlyGold(data?.membership_discount?.gold_yearly)
    setYearlyPlatinum(data?.membership_discount?.platinum_yearly)

    setInfantPercentage(data?.membership_discount?.infant_percentage);
    setMonthlyInfant(data?.membership_discount?.infant_monthly);
    setYearlyInfant(data?.membership_discount?.infant_yearly);

    setToddlerPercentage(data?.membership_discount?.toddler_percentage);
    setMonthlyToddler(data?.membership_discount?.toddler_monthly);
    setYearlyToddler(data?.membership_discount?.toddler_yearly);

    setPreschoolSchoolAgePercentage(data?.membership_discount?.preschool_school_age_percentage);
    setMonthlyPreschoolSchoolAge(data?.membership_discount?.preschool_school_age_monthly);
    setYearlyPreschoolSchoolAge(data?.membership_discount?.preschool_school_age_yearly);

    setMedicalProviderPercentage(data?.membership_discount?.medical_provider_percentage);
    setMonthlyMedicalProvider(data?.membership_discount?.medical_provider_monthly);
    setYearlyMedicalProvider(data?.membership_discount?.medical_provider_yearly);

    setMedicalProviderGoldPercentage(data?.membership_discount?.medical_provider_gold_percentage);
    setMonthlyMedicalProviderGold(data?.membership_discount?.medical_provider_gold_monthly);
    setYearlyMedicalProviderGold(data?.membership_discount?.medical_provider_gold_yearly);

    setMedicalProviderPlatinumPercentage(data?.membership_discount?.medical_provider_platinum_percentage);
    setMonthlyMedicalProviderPlatinum(data?.membership_discount?.medical_provider_platinum_monthly);
    setYearlyMedicalProviderPlatinum(data?.membership_discount?.medical_provider_platinum_yearly);


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

  return (
    <div className="my-10 w-full">
      <div className="flex items-center gap-x-2">
        <div className="flex items-center flex-1 gap-x-4">
          {/* <div className="w-30">
            <img src={getStrapiMedia(data?.images?.[0])} alt="Product" />
          </div> */}
          <div className="flex-1">
            <p className="text-24 font-bold">{data?.label}</p>
            <Tag
              className={classNames("mt-4 rounded-lg", {
                "bg-red": !data.publishedAt,
                "bg-green": data.publishedAt,
              })}
              name={data.publishedAt ? BRAND_STATUS.PUBLISHED : BRAND_STATUS.UNPUBLISHED}
            />
          </div>
        </div>
        {editable && <div className="flex gap-x-2">
          <Button
            btnSize="auto"
            className="w-10 h-10"
            shape="circle"
            onClick={() => navigate(`/medical-services/${data?.id}/edit`)}
          >
            <Icon name="edit" />
          </Button>

        </div>}
      </div>
      <div className="grid grid-cols-2 grid-flow-row gap-y-2 my-2">
        <DataItem icon="key" title="Tên" value={data?.label} />

        <DataItem icon="code" title="Code" value={data?.code} />
        <DataItem icon="host" title="Host" value={data?.host} />
        <DataItem icon="price" title="Giá" value={data?.price} />
        <DataItem icon="code" title="Group Service" value={data?.group_service} />
      </div>
      {/* <Controller
        name="code"
        control={control}
        render={({ field: { onChange, value } }) => (
          <Input
            onChange={e => {
              const value = e.target.value.replaceAll(".", "")
              onChange(value);
              setPrice(value)
            }}
            value={formatPrice(price)}
            label="Giá chung các CN"
            name="code"
            suffix={"đ"}
          />
        )}
      /> */}

      <div className="mt-6 space-y-6 flex-1 overflow-y-auto">
        <div className="grid grid-cols-3 gap-4">
          <Controller
            name="code"
            control={control}
            render={({ field: { onChange, value } }) => (

              <Input
                onChange={e => {
                  const value = e.target.value.replaceAll(".", "")
                  onChange(value);
                  setPriceQ2(value)
                }}
                value={formatPrice(priceq2)}
                label={<div>
                  <span className="mr-5">Giá tại CN quận 2</span>
                  <input onChange={e => setDisabledQ2(!disabledQ2)} className="w-5 h-5 mr-1 accent-green color-white" type="checkbox" checked={!disabledQ2}></input>
                </div>}
                name="code"
                suffix={"đ"}
              />
            )}
          />
          <Controller
            name="code"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Input
                onChange={e => {
                  const value = e.target.value.replaceAll(".", "")
                  onChange(value);
                  setPriceQ7(value)
                }}
                value={formatPrice(priceq7)}
                label={<div>
                  <span className="mr-5">Giá tại CN quận 7</span>
                  <input onChange={e => setDisabledQ7(!disabledQ7)} className="w-5 h-5 mr-1  accent-green" type="checkbox" checked={!disabledQ7}></input>
                </div>}
                name="code"
                suffix={"đ"}
              />
            )}
          />
          <Controller
            name="code"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Input
                onChange={e => {
                  const value = e.target.value.replaceAll(".", "")
                  onChange(value);
                  setPriceBD(value)
                }}
                value={formatPrice(pricebd)}
                label={<div>
                  <span className="mr-5">Giá tại CN Bình Dương</span>
                  <input onChange={e => setDisabledBD(!disabledBD)} className="w-5 h-5 mr-1  accent-green" type="checkbox" checked={!disabledBD}></input>
                </div>}
                name="code"
                suffix={"đ"}
              />
            )}
          />
          <Controller
            name="membership_discount"
            control={control}
            render={({ field: { onChange, value } }) => (

              <Input
                onChange={e => {
                  setGoldPercentage(e.target.value);
                }}
                value={goldPercentage}
                label={<div>
                  <span className="mr-5">Thành viên vàng (%)</span>
                </div>}
                name="code"
                suffix={"%"}
              />
            )}
          />
          <Controller
            name="code"
            control={control}
            render={({ field: { onChange, value } }) => (

              <Input
                onChange={e => {
                  setPlatinumPercentage(e.target.value);
                }}
                value={platinumPercentage}
                label={<div>
                  <span className="mr-5">Thành viên bạch kim (%)</span>
                </div>}
                name="code"
                suffix={"%"}
              />
            )}
          />
          <Controller
            name="code"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Input
                onChange={e => {
                  setMedicalProviderPercentage(e.target.value);
                }}
                value={medicalProviderPercentage}
                label={<div>
                  <span className="mr-5">Thành viên medical provider (%)</span>
                </div>}
                name="code"
                suffix={"%"}
              />
            )}
          />
          <Controller
            name="code"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Input
                onChange={e => {
                  setInfantPercentage(e.target.value);
                }}
                value={infantPercentage}
                label={<div>
                  <span className="mr-5">Thành viên gói nhũ nhi (%)</span>
                </div>}
                name="code"
                suffix={"%"}
              />
            )}
          />
          <Controller
            name="code"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Input
                onChange={e => {
                  setToddlerPercentage(e.target.value);
                }}
                value={toddlerPercentage}
                label={<div>
                  <span className="mr-5">Thành viên gói nhà trẻ (%)</span>
                </div>}
                name="code"
                suffix={"%"}
              />
            )}
          />
          <Controller
            name="code"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Input
                onChange={e => {
                  setPreschoolSchoolAgePercentage(e.target.value);
                }}
                value={preschoolSchoolAgePercentage}
                label={<div>
                  <span className="mr-5">Thành viên gói học đường (%)</span>
                </div>}
                name="code"
                suffix={"%"}
              />
            )}
          />
          <Controller
            name="code"
            control={control}
            render={({ field: { onChange, value } }) => (

              <Input
                onChange={e => {
                  setMonthlyGold(e.target.value);
                }}
                value={monthlyGold}
                label={<div>
                  <span className="mr-5">Miễn phí số lần theo tháng - Thành viên vàng</span>
                </div>}
                name="code"
              />
            )}
          />
          <Controller
            name="code"
            control={control}
            render={({ field: { onChange, value } }) => (

              <Input
                onChange={e => {
                  setYearlyGold(e.target.value);
                }}
                value={yearlyGold}
                label={<div>
                  <span className="mr-5">Miễn phí số lần theo năm - Thành viên vàng</span>
                </div>}
                name="code"
              />
            )}
          />
          <Controller
            name="code"
            control={control}
            render={({ field: { onChange, value } }) => (

              <Input
                onChange={e => {
                  setMonthlyPlatinum(e.target.value);
                }}
                value={monthlyPlatinum}
                label={<div>
                  <span className="mr-5">Miễn phí số lần theo tháng - Thành viên bạch kim</span>
                </div>}
                name="code"
              />
            )}
          />
          <Controller
            name="code"
            control={control}
            render={({ field: { onChange, value } }) => (

              <Input
                onChange={e => {
                  setYearlyPlatinum(e.target.value);
                }}
                value={yearlyPlatinum}
                label={<div>
                  <span className="mr-5">Miễn phí số lần theo năm - Thành viên bạch kim</span>
                </div>}
                name="code"
              />
            )}
          />

          <Controller
            name="code"
            control={control}
            render={({ field: { onChange, value } }) => (

              <Input
                onChange={e => {
                  setMonthlyMedicalProvider(e.target.value);
                }}
                value={monthlyMedicalProvider}
                label={<div>
                  <span className="mr-5">Miễn phí số lần theo tháng - Thành viên medical provider</span>
                </div>}
                name="code"
              />
            )}
          />
          <Controller
            name="code"
            control={control}
            render={({ field: { onChange, value } }) => (

              <Input
                onChange={e => {
                  setYearlyMedicalProvider(e.target.value);
                }}
                value={yearlyMedicalProvider}
                label={<div>
                  <span className="mr-5">Miễn phí số lần theo năm - Thành viên medical provider</span>
                </div>}
                name="code"
              />
            )}
          />

          <Controller
            name="code"
            control={control}
            render={({ field: { onChange, value } }) => (

              <Input
                onChange={e => {
                  setMonthlyInfant(e.target.value);
                }}
                value={monthlyInfant}
                label={<div>
                  <span className="mr-5">Miễn phí số lần theo tháng - Thành viên gói nhũ nhi</span>
                </div>}
                name="code"
              />
            )}
          />
          <Controller
            name="code"
            control={control}
            render={({ field: { onChange, value } }) => (

              <Input
                onChange={e => {
                  setYearlyInfant(e.target.value);
                }}
                value={yearlyInfant}
                label={<div>
                  <span className="mr-5">Miễn phí số lần theo năm - Thành viên gói nhũ nhi</span>
                </div>}
                name="code"
              />
            )}
          />

          <Controller
            name="code"
            control={control}
            render={({ field: { onChange, value } }) => (

              <Input
                onChange={e => {
                  setMonthlyToddler(e.target.value);
                }}
                value={monthlyToddler}
                label={<div>
                  <span className="mr-5">Miễn phí số lần theo tháng - Thành viên gói nhà trẻ</span>
                </div>}
                name="code"
              />
            )}
          />
          <Controller
            name="code"
            control={control}
            render={({ field: { onChange, value } }) => (

              <Input
                onChange={e => {
                  setYearlyToddler(e.target.value);
                }}
                value={yearlyToddler}
                label={<div>
                  <span className="mr-5">Miễn phí số lần theo năm - Thành viên gói nhà trẻ</span>
                </div>}
                name="code"
              />
            )}
          />

          <Controller
            name="code"
            control={control}
            render={({ field: { onChange, value } }) => (

              <Input
                onChange={e => {
                  setMonthlyPreschoolSchoolAge(e.target.value);
                }}
                value={monthlyPreschoolSchoolAge}
                label={<div>
                  <span className="mr-5">Miễn phí số lần theo tháng - Thành viên gói học đường</span>
                </div>}
                name="code"
              />
            )}
          />
          <Controller
            name="code"
            control={control}
            render={({ field: { onChange, value } }) => (

              <Input
                onChange={e => {
                  setYearlyPreschoolSchoolAge(e.target.value);
                }}
                value={yearlyPreschoolSchoolAge}
                label={<div>
                  <span className="mr-5">Miễn phí số lần theo năm - Thành viên gói học đường</span>
                </div>}
                name="code"
              />
            )}
          />
        </div>
      </div>
      {editable && <Button className="mt-4" type="button" onClick={async () => {
        const payload = {
          price: parseInt(price),
          label,
          Locations: [
            {
              location: "q2",
              price: parseInt(priceq2),
              disabled: disabledQ2,
            },
            {
              location: "q7",
              price: parseInt(priceq7),
              disabled: disabledQ7,
            },
            {
              location: "binhduong",
              price: parseInt(pricebd),
              disabled: disabledBD,
            }
          ],
          membership_discount: {
            gold_percentage: goldPercentage,
            platinum_percentage: platinumPercentage,
            gold_monthly: monthlyGold,
            platinum_monthly: monthlyPlatinum,
            gold_yearly: yearlyGold,
            platinum_yearly: yearlyPlatinum,
            medical_provider_percentage: medicalProviderPercentage,
            medical_provider_monthly: monthlyMedicalProvider,
            medical_provider_yearly: yearlyMedicalProvider,
            medical_provider_gold_percentage: medicalProviderGoldPercentage,
            medical_provider_gold_monthly: monthlyMedicalProviderGold,
            medical_provider_gold_yearly: yearlyMedicalProviderGold,
            medical_provider_platinum_percentage: medicalProviderPlatinumPercentage,
            medical_provider_platinum_monthly: monthlyMedicalProviderPlatinum,
            medical_provider_platinum_yearly: yearlyMedicalProviderPlatinum,
            infant_percentage: infantPercentage,
            infant_monthly: monthlyInfant,
            infant_yearly: yearlyInfant,
            toddler_percentage: toddlerPercentage,
            toddler_monthly: monthlyToddler,
            toddler_yearly: yearlyToddler,
            preschool_school_age_percentage: preschoolSchoolAgePercentage,
            preschool_school_age_monthly: monthlyPreschoolSchoolAge,
            preschool_school_age_yearly: yearlyPreschoolSchoolAge,
          }
        };


        // await updateServiceBundle(data?.id, payload)
        await updateMedicalService(data?.id, payload);
        toast.success("Lưu thành công");
        window.location.reload();
      }}>Lưu</Button>}
    </div>
  )
}

export default ProductDetail
