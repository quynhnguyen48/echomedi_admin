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

  return (
    <div className="my-10 w-full">
      <div className="grid grid-cols-1 gap-4">
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
      </div>
      <div className="my-4">
        <div className="flex flex-row align-center">
          <span className="font-bold mr-4 mt-1">Các dịch vụ con:</span>
          {editable && <Button onClick={e => setVisiblePrescriptionModal(true)}>Thay đổi dịch vụ</Button>}
        </div>
        <ol style={{ listStyleType: "decimal", marginLeft: "30px" }}>
          {Array.isArray(data?.medical_services) && data?.medical_services?.map(item => <li>{item.label}</li>)}
        </ol>
      </div>
      {visiblePrescriptionModal && (
        <PrescriptionModal
          patientId={data?.patient?.id}
          bundleServiceId={data?.id}
          visibleModal={visiblePrescriptionModal}
          onClose={() => setVisiblePrescriptionModal(false)}
        />
      )}
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
        <div className="grid grid-cols-4 gap-4">
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
                  <div className="flex inline flex-row items-center">
                    <input onChange={e => setDisabledQ2(!disabledQ2)} className="w-5 h-5 mr-1 accent-green" type="checkbox" checked={!disabledQ2}></input>
                    <span>active</span>
                  </div>
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
                  <div className="flex inline flex-row items-center">
                    <input onChange={e => setDisabledQ7(!disabledQ7)} className="w-5 h-5 mr-1  accent-green" type="checkbox" checked={!disabledQ7}></input>
                    <span>active</span>
                  </div>
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
                  <div className="flex inline flex-row items-center">
                    <input onChange={e => setDisabledBD(!disabledBD)}
                      className="w-5 h-5 mr-1  accent-green" type="checkbox" checked={!disabledBD}></input>
                    <span>active</span>
                  </div>
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
                  setMedicalProviderGoldPercentage(e.target.value);
                }}
                value={medicalProviderGoldPercentage}
                label={<div>
                  <span className="mr-5">Thành viên medical provider GOLD (%)</span>
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
                  setMedicalProviderPlatinumPercentage(e.target.value);
                }}
                value={medicalProviderPlatinumPercentage}
                label={<div>
                  <span className="mr-5">Thành viên medical provider PLATINUM (%)</span>
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
                  setMonthlyMedicalProviderGold(e.target.value);
                }}
                value={monthlyMedicalProviderGold}
                label={<div>
                  <span className="mr-5">Miễn phí số lần theo tháng - Thành viên medical provider GOLD</span>
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
                  setYearlyMedicalProviderGold(e.target.value);
                }}
                value={yearlyMedicalProviderGold}
                label={<div>
                  <span className="mr-5">Miễn phí số lần theo năm - Thành viên medical provider GOLD</span>
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
                  setMonthlyMedicalProviderPlatinum(e.target.value);
                }}
                value={monthlyMedicalProviderPlatinum}
                label={<div>
                  <span className="mr-5">Miễn phí số lần theo tháng - Thành viên medical provider PLATINUM</span>
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
                  setYearlyMedicalProviderPlatinum(e.target.value);
                }}
                value={yearlyMedicalProviderPlatinum}
                label={<div>
                  <span className="mr-5">Miễn phí số lần theo năm - Thành viên medical provider PLATINUM</span>
                </div>}
                name="code"
              />
            )}
          />
        </div>
      </div>
      {editable && <Button className="mt-4" type="button" onClick={async () => {
        const payload = {
          price,
          label,
          Locations: [
            {
              location: "q2",
              price: priceq2,
              disabled: disabledQ2,
            },
            {
              location: "q7",
              price: priceq7,
              disabled: disabledQ7,
            },
            {
              location: "binhduong",
              price: pricebd,
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
          }
        };


        await updateServiceBundle(data?.id, payload)
        toast.success("Lưu thành công")
        window.location.reload();
      }}>Lưu</Button>}
    </div>
  )
}

export default ProductDetail
