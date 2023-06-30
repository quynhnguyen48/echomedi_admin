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
    if (data.Locations) {
      setPriceQ2(0);
      setDisabledQ2(false);
      setPriceQ7(0);
      setDisabledQ7(false);
      setPriceBD(0);
      setDisabledBD(false);
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
      <div className="grid grid-cols-2 grid-flow-row gap-y-10 my-12">
        <DataItem icon="key" title="Tên" value={data?.label} />

        <DataItem icon="code" title="Code" value={data?.code} />
        <DataItem icon="host" title="Host" value={data?.host} />
        <DataItem icon="price" title="Giá" value={data?.price} />
        <DataItem icon="code" title="Group Service" value={data?.group_service} />
      </div>
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
        <div className="grid grid-cols-2 gap-4">
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
                  <input onChange={e => setDisabledQ2(!disabledQ2)} className="w-5 h-5 mr-1  accent-green" type="checkbox" checked={!disabledQ2}></input>
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
        </div>
      </div>
      {editable && <Button className="mt-4" type="button" onClick={async () => {
        const payload = {
          price: parseInt(price),
          label,
          Locations: [
            {
              location: "q2",
              price:parseInt(priceq2),
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
          ]
        };


        // await updateServiceBundle(data?.id, payload)
        await updateMedicalService(data?.id, payload);
        toast.success("Lưu thành công")
      }}>Lưu</Button>}
    </div>
  )
}

export default ProductDetail
