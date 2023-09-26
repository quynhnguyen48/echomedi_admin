import { useEffect, useState } from "react"
import { yupResolver } from "@hookform/resolvers/yup"
import { Controller, useFieldArray, useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import * as yup from "yup"
import { toast } from "react-toastify"
import Tagify from '@yaireo/tagify'
import '@yaireo/tagify/dist/tagify.css' // imports tagify SCSS file from within
import TagifyInput from "components/TagifyInput"
import classNames from "classnames"
import Button from "components/Button"
import Icon from "components/Icon"
import Input from "components/Input"
import Select from "components/Select"
import Textarea from "components/Textarea"
import ChooseAssetsFromLibraryDrawer from "components/ChooseAssetsFromLibraryDrawer"
import {
  createProduct,
  getProductBrands,
  getProductCategories,
  updateProduct,
} from "services/api/products"
import { getStrapiMedia } from "utils/media"
import { formatStrapiArr } from "utils/strapi"
import { getErrorMessage } from "../../../utils/error"

const VARIANT_DEFAULT = {
  size: "",
  price: "",
  discountPrice: "",
  inventory: "",
}

const ProductForm = ({ data }) => {
  const navigate = useNavigate()

  const [productBrands, setProductBrands] = useState([])
  const [productCategories, setProductCategories] = useState([])
  const [visibleChooseAssetsFromLibraryDrawer, setVisibleChooseAssetsFromLibraryDrawer] =
    useState(false)

  const validationSchema = yup.object({
    // code: yup.string(),
    // title: yup.string().required("Product Title is required"),
    // category: yup.object().required("Product Category is required").nullable(),
    // brand: yup.object().required("Product Brand is required").nullable(),
    // shortDescription: yup.string().required("Product Sort Description is required"),
    // ingredients: yup.string().required("Product Ingredients is required"),
    // benefit: yup.string().required("Product Benefits is required"),
    // descriptions: yup.string().required("Product Descriptions is required"),
    // variants: yup.array().of(
    //   yup.object().shape({
    //     size: yup
    //       .string()
    //       .trim()
    //       .matches(/^[0-9]*$/, "Size is not in correct format")
    //       .required("Size is required"),
    //     price: yup
    //       .string()
    //       .trim()
    //       .matches(/^[0-9]*$/, "Price is not in correct format")
    //       .required("Price is required"),
    //     discountPrice: yup
    //       .string()
    //       .trim()
    //       .matches(/^[0-9]*$/, "Discount Price is not in correct format")
    //       .required("Discount Price is required"),
    //     inventory: yup
    //       .string()
    //       .trim()
    //       .matches(/^[0-9]*$/, "Inventory is not in correct format")
    //       .required("Inventory is required"),
    //     unit: yup.string().required("Unit is required"),
    //   })
    // ),
    // images: yup.array().min(1, "Images is required").nullable(),
  })

  const {
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      code: data?.code || "",
      label: data?.label || "",
      en_label: data?.en_label || "",
      desc: data?.desc || "",
      en_desc: data?.en_desc || "",
      price: data?.price || "",
      slug: data?.slug || "",
      tags: JSON.stringify(data?.tags),
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  })

  useEffect(() => {
    ; (async () => {
      try {
        const res = await getProductBrands()
        if (res.data) {
          const brands = formatStrapiArr(res.data)
          setProductBrands(
            brands?.map((brand) => ({
              value: brand.id,
              label: brand.name,
            }))
          )
        }
      } catch (error) { }
    })()
  }, [])

  useEffect(() => {
    ; (async () => {
      try {
        const res = await getProductCategories()
        if (res.data) {
          const categories = formatStrapiArr(res.data)
          setProductCategories(
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
    const currentAssets = getValues("images")
    setValue("images", [...currentAssets, ...assets], { shouldValidate: true, shouldDirty: true })
  }

  const removeProductImage = (images, imageSelected) => {
    const imagePos = images.findIndex((i) => i.id === imageSelected.id)
    const newImages = images
    imagePos === -1 ? newImages.push(imageSelected) : newImages.splice(imagePos, 1)
    setValue("images", newImages, { shouldValidate: true })
  }

  const onSubmit = async (formData) => {
    try {
      if (data?.id) {
        formData.tags = JSON.parse(formData.tags)
        await updateProduct(data?.id, formData)
        toast.success("Product updated successfully")
      } else {
        await createProduct(formData)
        toast.success("Product created successfully")
      }
      navigate(-1)
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-row">
      <div className="bg-form rounded-2xl p-6 space-y-6 flex-1">
        {/* <div
          className={classNames("grid gap-6", {
            "grid-cols-1": !data,
            "grid-cols-2": data,
          })}
        >
          {data && (
            <Controller
              name="code"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Product ID"
                  value={value}
                  name="code"
                  placeholder="Product ID"
                  disabled
                />
              )}
            />
          )}
        </div> */}

        <Controller
          name="label"
          control={control}
          render={({ field: { onChange, value } }) => (
            <Input
              label="Label"
              onChange={onChange}
              value={value}
              name="label"
              placeholder="Input Product Title"
              errors={errors?.title?.message}
            />
          )}
        />

        <Controller
          name={`tags`}
          control={control}
          render={({ field: { onChange, value } }) => (
            <TagifyInput
            label="Health finder tags"
              whiteList={tags}
              className="flex-1"
              inputClassName="test"
              name={`tags`}
              onChange={onChange}
              value={value}
              placeholder="Nhập ghi chú"
              errors={errors?.[name]?.[index]?.note?.message}
            />
          )}
        />

        <div className="grid grid-cols-2 gap-6">
          {/* <Controller
            name="category"
            control={control}
            render={({ field: { onChange, value, ref } }) => (
              <Select
                placeholder="Select Category"
                label="Category"
                name="category"
                onChange={(e) => {
                  setValue(
                    "category",
                    { id: e.value },
                    {
                      shouldValidate: true,
                      shouldDirty: true,
                    }
                  )
                }}
                value={value && productCategories.find((category) => category.value === value.id)}
                options={productCategories}
                errors={errors?.category?.message}
              />
            )}
          /> */}
          {/* <Controller
            name="brand"
            control={control}
            render={({ field: { value } }) => (
              <Select
                placeholder="Select Brand"
                label="Brand"
                name="brand"
                onChange={(e) => {
                  setValue(
                    "brand",
                    { id: e.value },
                    {
                      shouldValidate: true,
                      shouldDirty: true,
                    }
                  )
                }}
                value={value && productBrands.find((brand) => brand.value === value.id)}
                options={productBrands}
                errors={errors?.brand?.message}
              />
            )}
          /> */}
        </div>

        {/* <Controller
          name="shortDescription"
          control={control}
          render={({ field: { onChange, value } }) => (
            <Input
              label="Short Description"
              onChange={onChange}
              value={value}
              name="shortDescription"
              placeholder="Input Short Description"
              errors={errors?.shortDescription?.message}
            />
          )}
        />

        <Controller
          name="benefit"
          control={control}
          render={({ field: { onChange, value } }) => (
            <Textarea
              label="Benefits"
              onChange={onChange}
              value={value}
              name="benefit"
              placeholder="Input Benefits"
              errors={errors?.benefit?.message}
              textareaClassName="h-30"
            />
          )}
        />

        <Controller
          name="descriptions"
          control={control}
          render={({ field: { onChange, value } }) => (
            <Textarea
              label="Descriptions"
              onChange={onChange}
              value={value}
              name="descriptions"
              placeholder="Input Descriptions"
              errors={errors?.descriptions?.message}
              textareaClassName="h-30"
            />
          )}
        />

        <Controller
          name="ingredients"
          control={control}
          render={({ field: { onChange, value } }) => (
            <Textarea
              label="Ingredients"
              onChange={onChange}
              value={value}
              name="ingredients"
              placeholder="Input Ingredients"
              errors={errors?.ingredients?.message}
              textareaClassName="h-30"
            />
          )}
        /> */}

        {/* <div className="">
          <h4 className="font-16 font-bold mb-2">Variants</h4>
          {fields.map((item, index) => (
            <div className="flex space-x-4 mb-4" key={item.id}>
              <Controller
                name={`variants[${index}].size`}
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Input
                    className="flex-1"
                    name={`variants[${index}].size`}
                    onChange={onChange}
                    value={value}
                    placeholder="Input Size"
                    min={0}
                    errors={errors.variants?.[index]?.size?.message}
                  />
                )}
              />
              <Controller
                name={`variants[${index}].price`}
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Input
                    className="flex-1"
                    name={`variants[${index}].price`}
                    onChange={onChange}
                    value={value}
                    placeholder="Price"
                    min={0}
                    errors={errors.variants?.[index]?.price?.message}
                  />
                )}
              />
              <Controller
                name={`variants[${index}].discountPrice`}
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Input
                    className="flex-1"
                    name={`variants[${index}].discountPrice`}
                    onChange={onChange}
                    value={value}
                    placeholder="Discount Price"
                    min={0}
                    errors={errors.variants?.[index]?.discountPrice?.message}
                  />
                )}
              />
              <Controller
                name={`variants[${index}].inventory`}
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Input
                    className="flex-1"
                    name={`variants[${index}].inventory`}
                    onChange={onChange}
                    value={value}
                    placeholder="Inventory"
                    min={0}
                    errors={errors.variants?.[index]?.inventory?.message}
                  />
                )}
              />
              <Controller
                name={`variants[${index}].unit`}
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Input
                    className="flex-1"
                    name={`variants[${index}].unit`}
                    onChange={onChange}
                    value={value}
                    placeholder="Unit"
                    errors={errors.variants?.[index]?.unit?.message}
                  />
                )}
              />
              {fields.length > 1 && (
                <button type="button" onClick={() => remove(index)}>
                  <Icon name="trash" className="fill-red" />
                </button>
              )}
            </div>
          ))}
          <Button
            type="button"
            btnType="text"
            btnSize="auto"
            icon={<Icon name="add-circle" className="fill-primary w-6 h-6" />}
            onClick={() => append({ ...VARIANT_DEFAULT })}
          >
            <span className="text-16 text-primary">Add new variant</span>
          </Button>
        </div> */}

        <div className="flex gap-x-4 mt-10">
          <Button className="fill-primary" type="submit">
            Save
          </Button>
          <Button
            btnType="outline"
            type="reset"
            onClick={(e) => {
              navigate(-1)
            }}
          >
            Cancel
          </Button>
        </div>
      </div>

    </form>
  )
}

export default ProductForm


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