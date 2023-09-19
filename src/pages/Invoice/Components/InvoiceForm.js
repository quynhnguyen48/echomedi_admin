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
import Select from "components/Select"
import { useSelector } from "react-redux";

const InvoiceForm = ({
  id,
  invoiceData,
  cashier_in_charge,
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
  const [cashierInCharge, setCashierInCharge] = useState();
  const [cashierData, setCashierData] = useState([]);
  const currentUser = useSelector((state) => state.user.currentUser)

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
          return `<tag title='${tagData.value
            }' contenteditable='false' spellcheck="false" class='tagify__tag ${tagData.class ? tagData.class : ""
            }' ${this.getAttributes(tagData)}>
                      <x title='remove tag' class='tagify__tag__removeBtn'></x>
                      <div>
                          <span class='tagify__tag-text'>${tagData.value}</span>
                      </div>
                  </tag>`
        } catch (err) { }
      },

      dropdownItem: function (tagData) {
        try {
          return `<div ${this.getAttributes(tagData)} class='tagify__dropdown__item ${tagData.class ? tagData.class : ""
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

    setCashierData([
      {
        value: currentUser?.id,
        label: `${currentUser?.patient?.full_name}`,
      }
    ])

    console.log('invoiceData', cashier_in_charge)
    if (cashier_in_charge) {
      setCashierInCharge({
        value: cashier_in_charge.id,
        label: cashier_in_charge?.patient?.data?.attributes?.full_name,
      })
    }
  }, [])

  useEffect(() => {
    setDoneLoadTagify(false)
    if (cashier_in_charge) {
      setCashierInCharge({
        value: cashier_in_charge.id,
        label: cashier_in_charge?.patient?.data?.attributes?.full_name,
      })
    } else {
      setCashierInCharge(null)
    }
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
        } catch (error) { }
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
            cashier_in_charge: cashierInCharge?.value,
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
      setIsLoading(false);
      if (!published) togglePublish();
      // window.location.reload();
    }
  }

  const renderFields = (fields, name) => {
    return (
      <div class="grid grid-cols-1 divide-y">
        {fields?.map((item, index) => (
          <div className="grid grid-cols-7 gap-2 py-4">
            <p className="col-span-3">{item?.label}</p>
            {/* <div className="col-span-3 text-right"> */}
            <div>
              {!getValues(`${name}[${index}].discountFixedPrice`) && !getValues(`${name}[${index}].discountPercentage`) && <Price price={item?.price} priceClassName="text-secondary font-normal" />}
              {(getValues(`${name}[${index}].discountFixedPrice`) || getValues(`${name}[${index}].discountPercentage`)) && <del><Price price={item?.price} priceClassName="text-secondary font-normal" /></del>}
              {(getValues(`${name}[${index}].discountFixedPrice`) || getValues(`${name}[${index}].discountPercentage`)) &&
                <Price price={(item.price - getValues(`${name}[${index}].discountFixedPrice`) ?? 0)} priceClassName="text-secondary font-normal" />
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
                    console.log('target value', e.target.value)
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
            <div className="col-span-1">
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
      setTotalDiscountFixedPrice(invoiceData?.totalDiscountFixedPrice)
      setTotalDiscountPercentage(invoiceData?.totalDiscountPercentage)
      reset({
        bundleServices: invoiceData?.bundleServices?.filter(ms => !ms["paid"]),
        medicalServices: invoiceData?.medicalServices?.filter(ms => !ms["paid"]),
        cliniqueServices: invoiceData?.cliniqueServices?.filter(ms => !ms["paid"]),
        membership: invoiceData?.membership,
        note: invoiceData?.note,
      })
    } else {
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
        bundleServices: bundleServices?.filter(item => !item["attributes"]["paid"])

          .map((item) => ({
            id: item?.id,
            price: item?.attributes?.original_price ?? item?.attributes?.price,
            label: item?.attributes?.label,
            discountFixedPrice: item?.attributes?.original_price * item.attributes["discount_percentage"] / 100,
            discountPercentage: item.attributes["discount_percentage"],
            note: item?.attributes?.discount_note
          })),
        medicalServices: medicalServices?.filter(item => !item["attributes"]["paid"])
          .map((item) => ({
            id: item?.id,
            price: item?.attributes?.original_price ?? item?.attributes?.price,
            label: item?.attributes?.label,
            discountFixedPrice: item?.attributes?.original_price * item.attributes["discount_percentage"] / 100,
            discountPercentage: item.attributes["discount_percentage"],
            note: item?.attributes?.discount_note
          })),
        cliniqueServices: cliniqueServices?.filter(item => !item["attributes"]["paid"])
        .map((item) => ({
          id: item?.id,
          price: item?.attributes?.original_price ?? item?.attributes?.price,
          label: item?.attributes?.label,
          discountFixedPrice: item?.attributes?.original_price * item.attributes["discount_percentage"] / 100,
            discountPercentage: item.attributes["discount_percentage"],
          note: item?.attributes?.discount_note
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
        <div className="grid grid-cols-7 gap-2">
          <p className="font-bold col-span-3">Dịch vụ thực hiện</p>
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
      <div className="grid grid-cols-7 gap-2  border-t-1 pt-2">
        <p className="font-bold col-span-3">Tổng chi phí</p>
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
                  setTotalDiscountPercentage(parseInt(value / subTotal * 10000) / 100)
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
                setTotalDiscountFixedPrice(parseInt(e.target.value) * subTotal / 100)
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
      <div className="grid grid-cols-7 gap-2">
        <p className="font-bold col-span-3">Tổng giảm giá</p>
        <div className="col-span-1">
          <Price price={totalDiscount + totalDiscountFixedPrice} />
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2">
        <p className="font-bold col-span-3">Tổng thanh toán</p>
        <div className="col-span-1">
          <Price price={subTotal - totalDiscount - totalDiscountFixedPrice} />
        </div>
      </div>
      <div className="w-full">

        <Select
          isDisabled={published}
          icon={<svg className="inline" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" height="20px" width="20px" version="1.1" id="Layer_1" viewBox="0 0 512 512" xmlSpace="preserve">
          <path fill="#507C5C" d="M256,288.24c-68.519,0-124.264-55.744-124.264-124.264V107.12c0-8.208,6.653-14.861,14.861-14.861  c8.208,0,14.861,6.653,14.861,14.861v56.857c0,52.129,42.412,94.541,94.541,94.541s94.541-42.412,94.541-94.541  c0-8.208,6.653-14.861,14.861-14.861c8.208,0,14.861,6.653,14.861,14.861C380.264,232.495,324.519,288.24,256,288.24z" />
          <path fill="#CFF09E" d="M365.402,107.12H146.598c0,0,0-42.777,0-61.911c0-40.462,218.805-40.462,218.805,0  C365.402,64.341,365.402,107.12,365.402,107.12z" />
          <path fill="#507C5C" d="M365.402,121.981H146.598c-8.208,0-14.861-6.653-14.861-14.861V45.207C131.736,4.405,218.637,0,256,0  s124.264,4.405,124.264,45.207v61.913C380.264,115.328,373.61,121.981,365.402,121.981z M161.459,92.258h189.08V46.331  c-5.265-6.069-36.943-16.608-94.539-16.608s-89.274,10.538-94.541,16.608L161.459,92.258L161.459,92.258z" />
          <path fill="#CFF09E" d="M319.904,326.235H192.096c-38.576,0-69.849,31.273-69.849,69.849v101.055h267.506V396.084  C389.753,357.507,358.48,326.235,319.904,326.235z M337.736,437.943H265.41v-50.281h72.326L337.736,437.943L337.736,437.943z" />
          <path fill="#507C5C" d="M389.753,512H122.247c-8.208,0-14.861-6.653-14.861-14.861V396.084  c0-46.709,38.001-84.71,84.71-84.71h127.808c46.709,0,84.71,38.001,84.71,84.71v101.055C404.614,505.347,397.961,512,389.753,512z   M137.109,482.277h237.783v-86.193c0-30.32-24.667-54.987-54.987-54.987H192.096c-30.32,0-54.987,24.667-54.987,54.987  L137.109,482.277L137.109,482.277z M337.736,452.804H265.41c-8.208,0-14.861-6.653-14.861-14.861v-50.281  c0-8.208,6.653-14.861,14.861-14.861h72.326c8.208,0,14.861,6.653,14.861,14.861v50.281  C352.598,446.15,345.944,452.804,337.736,452.804z M280.273,423.081h42.603v-20.558h-42.603V423.081z" />
        </svg>}
          placeholder="Thu ngân phụ trách"
          label="Thu ngân phụ trách"
          name="cashier_in_charge"
          onChange={(e) => {
            setCashierInCharge(e)
          }}
          value={cashierInCharge}
          options={cashierData}
          errors={errors?.address?.province?.message}
        />
      </div>
      <div className="flex gap-x-4 !mt-5 justify-end">
        <Button type="submit" loading={isLoading}>
          {published ? "Tải hoá đơn" : "Lưu và tải hóa đơn"}
        </Button>
        {/* <Button type="button" loading={isLoading} onClick={togglePublish}>
          Đã thanh toán
        </Button> */}
      </div>
    </form>
  )
}

export default InvoiceForm
