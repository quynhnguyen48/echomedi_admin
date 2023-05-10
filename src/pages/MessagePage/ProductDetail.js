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

const ProductDetail = ({ data, onTogglePublish, onUpdateProduct }) => {
  const navigate = useNavigate()
  const [openProductDescriptionDrawer, setOpenProductDescriptionDrawer] = useState(false)
  const [openProductImagesDrawer, setOpenProductImagesDrawer] = useState(false)
  const [openProductVariantsDrawer, setOpenProductVariantsDrawer] = useState(false)
  const [openProductInventoryDrawer, setOpenProductInventoryDrawer] = useState(false)
  const [visiblePrescriptionModal, setVisiblePrescriptionModal] = useState(false);
  const validationSchema = yup.object({});
  const [price, setPrice] = useState(0);
  const [priceq2, setPriceQ2] = useState(0);
  const [priceq7, setPriceQ7] = useState(0);
  const [pricebd, setPriceBD] = useState(0);
  const [label, setLabel] = useState("");

  useEffect(() => {
    setPrice(data?.price);
    setLabel(data?.label)
    if (data.Locations) {
      setPriceQ2(0);
      setPriceQ7(0);
      setPriceBD(0);
      data.Locations?.forEach(l => {
        if (l["location"] == "q2") {
          setPriceQ2(l["price"]);
        }
        if (l["location"] == "q7") {
          setPriceQ7(l["price"]);
        }
        if (l["location"] == "binhduong") {
          setPriceBD(l["price"]);
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
      <div className="grid grid-cols-3 gap-4">
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
          <Button onClick={e => setVisiblePrescriptionModal(true)}>Thay đổi dịch vụ</Button>
        </div>
        {data?.medical_services.map(item => <p>- {item.label}</p>)}
      </div>
      {visiblePrescriptionModal && (
        <PrescriptionModal
          patientId={data?.patient?.id}
          bundleServiceId={data?.id}
          visibleModal={visiblePrescriptionModal}
          onClose={() => setVisiblePrescriptionModal(false)}
        />
      )}
      <Controller
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
      />
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
                label="Giá tại CN quận 2"
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
                label="Giá tại CN quận 7"
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
                label="Giá tại CN Bình Dương"
                name="code"
                suffix={"đ"}
              />
            )}
          />
        </div>
      </div>
      <Button className="mt-4" type="button" onClick={async () => {
        const payload = {
          price,
          label,
          Locations: [
            {
              location: "q2",
              price: priceq2,
              disabled: false,
            },
            {
              location: "q7",
              price: priceq7,
              disabled: false,
            },
            {
              location: "binhduong",
              price: pricebd,
              disabled: false,
            }
          ]
        };


        await updateServiceBundle(data?.id, payload)
        toast.success("Lưu thành công")
      }}>Lưu</Button>
    </div>
  )
}

export default ProductDetail
