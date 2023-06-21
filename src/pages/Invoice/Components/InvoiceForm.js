import { yupResolver } from "@hookform/resolvers/yup"
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form"
import { useEffect, useMemo, useState } from "react"
import * as yup from "yup"
import sumBy from "lodash/sumBy"

import Input from "components/Input"
import TagifyInput from "components/TagifyInput"
import Price from "components/Price"
import Button from "components/Button"
import { updateInvoiceById, updateAndDownloadInvoiceById } from "services/api/invoice"
import { toast } from "react-toastify"
import { getErrorMessage } from "utils/error"
import { formatStrapiObj } from "utils/strapi"
import Tagify from "@yaireo/tagify"
import axios2 from "axios"
import "@yaireo/tagify/dist/tagify.css" // imports tagify SCSS file from within
import { getDiscountSettings } from "services/api/settings"
import { formatPrice } from "utils/number";

const InvoiceForm = ({
  id,
  invoiceData,
  published,
  bundleServices,
  medicalServices,
  cliniqueServices,
  downloadPDF,
  onUpdate,
  membership,
  togglePublish,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const validationSchema = yup.object({})
  const [tagifyWhitelist, setTagifyWhitelist] = useState()
  const [doneLoadTagify, setDoneLoadTagify] = useState(false)
  const [discountReasons, setDiscountReasons] = useState(null)
  const [totalDiscountFixedPrice, setTotalDiscountFixedPrice] = useState(0);
  const [totalDiscountPercentage, setTotalDiscountPercentage] = useState(0);
  const [paid, setPaid] = useState(false);

  console.log('invoiceData', invoiceData)

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

  const { fields: bundleServicesFields } = useFieldArray({
    control,
    name: "bundleServices",
  })

  const { fields: medicalServicesFields } = useFieldArray({
    control,
    name: "medicalServices",
  })

  const { fields: membershipFields } = useFieldArray({
    control,
    name: "membership",
  })

  const { fields: cliniqueServicesFields } = useFieldArray({
    control,
    name: "cliniqueServices",
  })

  const bundleServicesValues = useWatch({ control: control, name: "bundleServices" })
  const medicalServicesValues = useWatch({ control: control, name: "medicalServices" })
  const cliniqueServicesValues = useWatch({ control: control, name: "cliniqueServices" })
  const membershipValues = useWatch({ control: control, name: "membership" })

  const subTotal = useMemo(
    () => sumBy([...(bundleServicesValues || []), 
    ...(medicalServicesValues || []), 
    ...(membershipValues || []),
    ...(cliniqueServicesValues || [])], "price"),
    [bundleServicesValues, medicalServicesValues, membershipValues, cliniqueServicesValues]
  )
  const totalDiscount = useMemo(
    () =>
      sumBy(
        [...(bundleServicesValues || []), 
        ...(medicalServicesValues || []),
        ...(cliniqueServicesValues || []),
        ...(membershipValues || []),
        ],
        (item) =>
          (parseInt(item?.discountFixedPrice) || 0)
      ),
    [bundleServicesValues, medicalServicesValues, cliniqueServicesValues, membershipValues]
  )

  useEffect(() => {
    if (!tagifyWhitelist || !discountReasons || doneLoadTagify) return;
    setDoneLoadTagify(true)
    const templates = {
      tag: function (tagData) {
        try {
          return `<tag title='${
            tagData.value
          }' contenteditable='false' spellcheck="false" class='tagify__tag ${
            tagData.class ? tagData.class : ""
          }' ${this.getAttributes(tagData)}>
                      <x title='remove tag' class='tagify__tag__removeBtn'></x>
                      <div>
                          <span class='tagify__tag-text'>${tagData.value}</span>
                      </div>
                  </tag>`
        } catch (err) {}
      },

      dropdownItem: function (tagData) {
        try {
          return `<div ${this.getAttributes(tagData)} class='tagify__dropdown__item ${
            tagData.class ? tagData.class : ""
          }' >
                          <span>${tagData.searchBy.toLowerCase()}</span> |
                          <span>${tagData.value}</span>
                      </div>`
        } catch (err) {
          console.error(err)
        }
      },
    }

    const tagifyWhiteList = discountReasons

  }, [tagifyWhitelist, id, discountReasons])

  useEffect(() => {
    loadTagifyWhitelist()
  }, [])

  useEffect(() => {
    setDoneLoadTagify(false)
  }, [id])

  const loadTagifyWhitelist = () => {
    axios2
      .get("https://api.echomedi.com/api/tagify-whitelist")
      .then((response) => {
        setTagifyWhitelist(response.data.data.attributes.data)
      })
      .finally(async () => {
        try {
          const res = await getDiscountSettings()
          const { reasons } = formatStrapiObj(res.data)
          if (Array.isArray(reasons) && reasons?.length) {
            setDiscountReasons(reasons)
          }
        } catch (error) {}
      })
  }

  const onSubmit = async (values) => {
    try {
      setIsLoading(true)
      const toastId = toast.loading("Đang tải")
      const res = await updateAndDownloadInvoiceById(
        id,
        {
          data: {
            ...values,
            subTotal,
            totalDiscount,
            totalDiscountFixedPrice,
            totalDiscountPercentage,
            total: subTotal - totalDiscount,
          },
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
      
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }

  const renderFields = (fields, name) => {
    return (
      <div class="grid grid-cols-1 divide-y">
        {fields?.map((item, index) => (
          <div className="grid grid-cols-6 gap-2 py-4">
            <p className="col-span-1">{item?.label}</p>
            {/* <div className="col-span-3 text-right"> */}
              <div>
              {!getValues(`${name}[${index}].discountFixedPrice`) && !getValues(`${name}[${index}].discountPercentage`) && <Price price={item?.price} priceClassName="text-secondary font-normal" />}
              {(getValues(`${name}[${index}].discountFixedPrice`) || getValues(`${name}[${index}].discountPercentage`)) && <del><Price price={item?.price} priceClassName="text-secondary font-normal" /></del>}
              {(getValues(`${name}[${index}].discountFixedPrice`) || getValues(`${name}[${index}].discountPercentage`)) &&
                <Price price={(item.price - getValues(`${name}[${index}].discountFixedPrice`) ?? 0) } priceClassName="text-secondary font-normal" />
              }
              </div>
              <div>
              <Controller
                name={`${name}[${index}].discountFixedPrice`}
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Input
                    disabled={published}
                    suffix={"đ"}
                    className="flex-1"
                    name={`${name}[${index}].discountFixedPrice`}
                    onChange={(e) => {
                      const value = e.target.value.replaceAll(".", "")
                      onChange(value);
                      setValue(`${name}[${index}].discountPercentage`, formatPrice(parseInt(value / item.price * 10000) / 100))
                    }}
                    onFocus={() => {
                      setValue(`${name}[${index}].discountFixedPrice`, '')
                      setValue(`${name}[${index}].discountPercentage`, '')
                    }}
                    value={formatPrice(value)}
                    placeholder="VNĐ"
                  />
                )}
              />
              </div>
              <Controller
                name={`${name}[${index}].discountPercentage`}
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Input
                  disabled={published}
                  suffix={"%"}
                    type="number"
                    // className="w-[100px]"
                    name={`${name}[${index}].discountPercentage`}
                    onChange={(e) => {
                      onChange(e);
                      setValue(`${name}[${index}].discountFixedPrice`, parseInt(e.target.value) * item.price / 100)
                    }}
                    onFocus={() => {
                      setValue(`${name}[${index}].discountFixedPrice`, '')
                      setValue(`${name}[${index}].discountPercentage`, '')
                    }}
                    value={value}
                    placeholder="%"
                  />
                )}
              />
              <div className="col-span-2">
              <Controller
                name={`${name}[${index}].note`}
                control={control}
                render={({ field: { onChange, value } }) => (
                  <TagifyInput
                    whiteList={discountReasons}
                    className="flex-1"
                    inputClassName="test"
                    name={`${name}[${index}].note`}
                    onChange={onChange}
                    value={value}
                    placeholder="Nhập ghi chú"
                    errors={errors?.[name]?.[index]?.note?.message}
                  />
                )}
              />
              </div>
          </div>
        ))}
        
      </div>
    )
  }

  useEffect(() => {
    if (invoiceData) {
      console.log('invoiceData', invoiceData)
      setTotalDiscountFixedPrice(invoiceData?.totalDiscountFixedPrice)
      setTotalDiscountPercentage(invoiceData?.totalDiscountPercentage)
      reset({
        bundleServices: invoiceData?.bundleServices,
        medicalServices: invoiceData?.medicalServices,
        cliniqueServices: invoiceData?.cliniqueServices,
        membership: invoiceData?.membership,
        note: invoiceData?.note,
      })
    } else {
      console.log('asd', membership)
      // console.log('cliniqueServices22', bundleServices?.map((item) => ({
      //   id: item?.id,
      //   price: item?.attributes?.price,
      //   label: item?.attributes?.label,
      //   discountFixedPrice: "",
      //   discountPercentage: "",
      // })), medicalServices?.map((item) => ({
      //   id: item?.id,
      //   price: item?.attributes?.price,
      //   label: item?.attributes?.label,
      //   discountFixedPrice: "",
      //   discountPercentage: "",
      // })), cliniqueServices)
      reset({
        bundleServices: bundleServices?.map((item) => ({
          id: item?.id,
          price: item?.attributes?.price,
          label: item?.attributes?.label,
          discountFixedPrice: "",
          discountPercentage: "",
        })),
        medicalServices: medicalServices?.map((item) => ({
          id: item?.id,
          price: item?.attributes?.price,
          label: item?.attributes?.label,
          discountFixedPrice: "",
          discountPercentage: "",
        })),
        cliniqueServices: cliniqueServices?.map((item) => ({
          id: item?.id,
          price: item?.attributes?.price,
          label: item?.attributes?.label,
          discountFixedPrice: "",
          discountPercentage: "",
        })),
        membership: membership ? [{
          id: membership?.id,
          price: membership?.price,
          label: membership?.label,
          discountFixedPrice: "",
          discountPercentage: "",
        }] : [],
        note: "",
      })
    }
  }, [bundleServices, invoiceData, medicalServices, membership, reset])

  return (
    <form className="space-y-2" onSubmit={handleSubmit(onSubmit)}>
      <div class="grid grid-cols-1 divide-y">
        <div className="grid grid-cols-6 gap-2">
          <p className="font-bold col-span-1">Dịch vụ thực hiện</p>
          <p className="font-bold col-span-1">Đơn giá</p>
          <p className="font-bold col-span-2">Giảm giá (VNĐ, %)</p>
          <p className="font-bold col-span-1">Ghi chú</p>
        </div>
        {renderFields(membershipFields, "membership")}
        {renderFields(cliniqueServicesFields, "cliniqueServices")}
        {renderFields(bundleServicesFields, "bundleServices")}
        {renderFields(medicalServicesFields, "medicalServices")}
      </div>
      <div className="mt-4">
      <p className="font-bold col-span-1">Ghi chú</p>
        <Controller
                name={`note`}
                control={control}
                render={({ field: { onChange, value } }) => (
                  <TagifyInput
                    whiteList={discountReasons}
                    className="flex-1"
                    inputClassName="test"
                    name={`note`}
                    onChange={onChange}
                    value={value}
                    placeholder="Nhập ghi chú"
                    errors={errors?.note?.message}
                  />
                )}
              />
              </div>
      <div className="grid grid-cols-6 gap-2  border-t-1 pt-2">
        <p className="font-bold col-span-1">Tổng chi phí</p>
        <div className="col-span-1">
          <Price price={subTotal} />
        </div>
        <div >
              <Controller
                name={`totalDiscountFixedPrice`}
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Input
                  disabled={published}
                    name={`totalDiscountFixedPrice`}
                    suffix="đ"
                    onFocus={() => {
                      setTotalDiscountFixedPrice('');
                      setTotalDiscountPercentage('');
                    }}
                    onChange={e => {
                      let value = e.target.value.replaceAll(".", "");
                      value = value ? value : 0;
                      onChange(value);
                      setTotalDiscountFixedPrice(parseInt(value));
                      setTotalDiscountPercentage(parseInt(value/subTotal*10000)/100)
                    }}
                    value={formatPrice(totalDiscountFixedPrice)}
                    placeholder="VNĐ"
                    // min={0}
                    // errors={errors?.[name]?.[index]?.discountFixedPrice?.message}
                  />
                )}
              />
              </div>
              <Controller
                name={`totalDiscountPercentage`}
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Input
                  disabled={published}
                    type="number"
                    // className="w-[100px]"
                    suffix="%"
                    name={`totalDiscountPercentage`}
                    onFocus={() => {
                      setTotalDiscountFixedPrice('');
                      setTotalDiscountPercentage('');
                    }}
                    onChange={e => {
                      setTotalDiscountPercentage(parseInt(e.target.value))
                      setTotalDiscountFixedPrice(parseInt(e.target.value));
                      setTotalDiscountFixedPrice(parseInt(e.target.value)*subTotal/100)
                    }
                    }
                    value={totalDiscountPercentage}
                    placeholder="%"
                    // min={0}
                    // errors={errors?.[name]?.[index]?.discountPercentage?.message}
                  />
                )}
              />
      </div>
      <div className="grid grid-cols-6 gap-2">
        <p className="font-bold col-span-1">Tổng giảm giá</p>
        <div className="col-span-1">
          <Price price={totalDiscount + totalDiscountFixedPrice} />
        </div>
      </div>
      <div className="grid grid-cols-6 gap-2">
        <p className="font-bold col-span-1">Tổng thanh toán</p>
        <div className="col-span-1">
          <Price price={subTotal - totalDiscount - totalDiscountFixedPrice} />
        </div>
      </div>
      <div className="flex gap-x-4 !mt-5 justify-end">
        <Button type="submit" loading={isLoading}>
          {published ? "Tải hoá đơn" : "Lưu và tải hóa đơn"}
        </Button>
        {!published && <Button type="button" loading={isLoading} onClick={togglePublish}>
          Đã thanh toán
        </Button>}
      </div>
    </form>
  )
}

export default InvoiceForm
