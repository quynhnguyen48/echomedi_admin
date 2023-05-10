import { useEffect, useState } from "react"
import { yupResolver } from "@hookform/resolvers/yup"
import { Controller, useFieldArray, useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import * as yup from "yup"
import { toast } from "react-toastify"

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
    code: yup.string(),
    title: yup.string().required("Product Title is required"),
    category: yup.object().required("Product Category is required").nullable(),
    brand: yup.object().required("Product Brand is required").nullable(),
    shortDescription: yup.string().required("Product Sort Description is required"),
    ingredients: yup.string().required("Product Ingredients is required"),
    benefit: yup.string().required("Product Benefits is required"),
    descriptions: yup.string().required("Product Descriptions is required"),
    variants: yup.array().of(
      yup.object().shape({
        size: yup
          .string()
          .trim()
          .matches(/^[0-9]*$/, "Size is not in correct format")
          .required("Size is required"),
        price: yup
          .string()
          .trim()
          .matches(/^[0-9]*$/, "Price is not in correct format")
          .required("Price is required"),
        discountPrice: yup
          .string()
          .trim()
          .matches(/^[0-9]*$/, "Discount Price is not in correct format")
          .required("Discount Price is required"),
        inventory: yup
          .string()
          .trim()
          .matches(/^[0-9]*$/, "Inventory is not in correct format")
          .required("Inventory is required"),
        unit: yup.string().required("Unit is required"),
      })
    ),
    images: yup.array().min(1, "Images is required").nullable(),
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
      title: data?.title || "",
      category: data?.category || null,
      brand: data?.brand || null,
      shortDescription: data?.shortDescription || "",
      benefit: data?.benefit || "",
      descriptions: data?.descriptions || "",
      ingredients: data?.ingredients || "",
      variants: data?.variants || [VARIANT_DEFAULT],
      images: data?.images || [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  })

  useEffect(() => {
    ;(async () => {
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
      } catch (error) {}
    })()
  }, [])

  useEffect(() => {
    ;(async () => {
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
      } catch (error) {}
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
        <div
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
        </div>

        <Controller
          name="title"
          control={control}
          render={({ field: { onChange, value } }) => (
            <Input
              label="Product Title"
              onChange={onChange}
              value={value}
              name="title"
              placeholder="Input Product Title"
              errors={errors?.title?.message}
            />
          )}
        />

        <div className="grid grid-cols-2 gap-6">
          <Controller
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
          />
          <Controller
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
          />
        </div>

        <Controller
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
        />

        <div className="">
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
        </div>

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

      <div className="bg-rightContent rounded-lg p-6 ml-6 w-rightContent">
        <h4 className="font-16 font-bold mb-2">Product Images</h4>
        <Controller
          name="images"
          control={control}
          render={({ field: { value } }) =>
            !!value.length && (
              <div className="grid grid-cols-2 gap-4">
                {value.map((image) => (
                  <div
                    className="overflow-hidden rounded-lg w-full relative flex justify-center bg-media"
                    key={image.id}
                  >
                    <button
                      type="button"
                      className="absolute z-10 top-1 right-1"
                      onClick={() => removeProductImage(value, image)}
                    >
                      <Icon name="close-circle" className="fill-red bg-white rounded-full" />
                    </button>
                    <img src={getStrapiMedia(image)} alt="Product" className="h-full w-auto" />
                  </div>
                ))}
              </div>
            )
          }
        />
        <div className="my-4">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-xl bg-background w-full h-40"
            onClick={() => {
              setVisibleChooseAssetsFromLibraryDrawer(true)
            }}
          >
            <Icon name="gallery" className="fill-gray w-6 h-6" />
          </button>
          {errors?.images && <p className="text-12 text-error mt-1">{errors?.images?.message}</p>}
        </div>
      </div>

      <ChooseAssetsFromLibraryDrawer
        openDrawer={visibleChooseAssetsFromLibraryDrawer}
        onClose={() => setVisibleChooseAssetsFromLibraryDrawer(false)}
        multiple
        onFinish={handleAssetsSelected}
      />
    </form>
  )
}

export default ProductForm
