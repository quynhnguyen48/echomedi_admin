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

const TreatmentForm = ({ data }) => {
  const navigate = useNavigate()
  const [visibleChooseAssetsFromLibraryDrawer, setVisibleChooseAssetsFromLibraryDrawer] =
    useState(false)
  const [imageType, setImageType] = useState(null)
  const [step, setStep] = useState(null)
  const [timeSlots, setTimeSlots] = useState([])
  const [treatmentCategories, setTreatmentCategories] = useState([])

  const validationSchema = yup.object({
    code: yup.string(),
    categories: yup.array().min(1, "Categories is required"),
    name: yup.string().required("Treatment name is required"),
    slug: yup.string().required("Treatment slug is required"),
    title: yup.object({
      en: yup.string().required("Treatment Title English is required"),
      vi: yup.string().required("Treatment Title Vietnamese is required"),
    }),
    background: yup.object().required("Background image is required").nullable(),
    thumbnail: yup.object().required("Thumbnail image is required").nullable(),
    unit: yup.string().required("Treatment unit is required"),
    price: yup.string().required("Treatment price is required"),
    isSpecial: yup.boolean(),
    isHighTechnology: yup.boolean(),
    haveAreasTreatment: yup.boolean(),
    treatmentAreaDescription: yup.object().shape({
      en: yup.string(),
      vi: yup.string(),
    }),
    highlight: yup.object({
      en: yup.string().required("Highlight Content English is required"),
      vi: yup.string().required("Highlight Content Vietnamese is required"),
    }),
    procedure: yup.array().of(
      yup.object().shape({
        image: yup.object().nullable(),
        en: yup.string(),
        vi: yup.string(),
      })
    ),
    timeSession: yup.object({
      date: yup.array().min(1, "Date is required"),
      time: yup.array(),
    }),
    dayTime: yup.object({
      start: yup.string().required("Day time start is required"),
      end: yup.string().required("Day time end is required"),
    }),
    nightTime: yup.object({
      start: yup.string().required("Night time start is required"),
      end: yup.string().required("Night time end is required"),
    }),
    interval: yup.string().required("Interval is required"),
    results: yup.array().of(
      yup.object().shape({
        title: yup.object({
          en: yup.string(),
          vi: yup.string(),
        }),
        images: yup.array(),
      })
    ),
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
    ;(async () => {
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
      } catch (error) {}
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

  const onSubmit = async (formData) => {
    try {
      const payload = {
        ...formData,
        dayTime: `${formData?.dayTime?.start}-${formData?.dayTime?.end}`,
        nightTime: `${formData?.nightTime?.start}-${formData?.nightTime?.end}`,
        price: Number(formData?.price),
        procedure: formData?.procedure.filter((item) => !!item.en),
      }

      if (!!data?.id) {
        await updateTreatment(data.id, payload)
        toast.success("Update the treatment successfully")
      } else {
        await createNewTreatment(payload)
        toast.success("Create new treatment successfully")
      }
      navigate(-1)
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
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
          <div className="grid grid-cols-2 gap-6">
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
          </div>
          <div className="grid grid-cols-2 gap-6">
            <Controller
              name="name"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Input
                  onChange={onChange}
                  value={value}
                  name="name"
                  label="Treatment Name"
                  placeholder={"Input Treatment Name"}
                  errors={errors?.name?.message}
                />
              )}
            />
            <Controller
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
            />
          </div>
          <div className="space-y-4">
            <Controller
              name="title.en"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Treatment Title"
                  name="title.en"
                  value={value}
                  onChange={onChange}
                  placeholder="Input Treatment Title English"
                  errors={errors?.title?.en?.message}
                />
              )}
            />
            <Controller
              name="title.vi"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Input
                  onChange={onChange}
                  value={value}
                  name="title.vi"
                  placeholder="Input Treatment Title Vietnamese"
                  errors={errors?.title?.vi?.message}
                />
              )}
            />
          </div>
          <div className="grid grid-cols-2 gap-x-4">
            <div>
              <h4 className="font-bold text-16 mb-2">Background</h4>
              <Controller
                name="background"
                control={control}
                render={({ field: { value } }) =>
                  value ? (
                    <div className="w-80 relative">
                      <button
                        className="absolute z-10 top-2 right-2"
                        onClick={() => setValue("background", null)}
                      >
                        <Icon name="close-circle" className="fill-red bg-white rounded-full" />
                      </button>
                      <img src={getStrapiMedia(value)} alt="Area" />
                    </div>
                  ) : (
                    <div>
                      <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-xl bg-background w-40 h-40"
                        onClick={() => {
                          setVisibleChooseAssetsFromLibraryDrawer(true)
                          setImageType("background")
                        }}
                      >
                        <Icon name="gallery" className="fill-gray w-6 h-6" />
                      </button>
                      {errors.background && (
                        <p className="text-12 text-error mt-1">{errors.background?.message}</p>
                      )}
                    </div>
                  )
                }
              />
            </div>
            <div>
              <h4 className="font-bold text-16 mb-2">Thumbnail</h4>
              <Controller
                name="thumbnail"
                control={control}
                render={({ field: { value } }) =>
                  value ? (
                    <div className="w-80 relative">
                      <button
                        className="absolute z-10 top-2 right-2"
                        onClick={() => setValue("thumbnail", null)}
                      >
                        <Icon name="close-circle" className="fill-red bg-white rounded-full" />
                      </button>
                      <img src={getStrapiMedia(value)} alt="Area" />
                    </div>
                  ) : (
                    <div>
                      <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-xl bg-background w-40 h-40"
                        onClick={() => {
                          setVisibleChooseAssetsFromLibraryDrawer(true)
                          setImageType("thumbnail")
                        }}
                      >
                        <Icon name="gallery" className="fill-gray w-6 h-6" />
                      </button>
                      {errors.thumbnail && (
                        <p className="text-12 text-error mt-1">{errors.thumbnail?.message}</p>
                      )}
                    </div>
                  )
                }
              />
            </div>
          </div>
          <div className="space-y-4">
            <Controller
              name="unit"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Treatment Price"
                  name="unit"
                  onChange={onChange}
                  value={value}
                  placeholder="Input Treatment Unit"
                  errors={errors?.unit?.message}
                />
              )}
            />
            <Controller
              name="price"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Input
                  onChange={onChange}
                  value={value}
                  name="price"
                  placeholder="Input Treatment Price"
                  errors={errors?.price?.message}
                />
              )}
            />
          </div>
          <div className="space-y-2 col-span-2">
            <label className="font-16 font-bold">Utilities</label>
            <div className="grid grid-cols-3 gap-x-6 space-x-4">
              <Controller
                name="isSpecial"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <button
                    type="button"
                    className="bg-white flex px-6 py-4 rounded-lg"
                    onClick={() => setValue("isSpecial", !value)}
                  >
                    <Icon
                      name={value ? "check" : "uncheck"}
                      className={value ? "fill-primary" : "fill-uncheck"}
                    />
                    <span className="ml-4 font-16">is Special</span>
                  </button>
                )}
              />
              <Controller
                name="isHighTechnology"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <button
                    type="button"
                    className="bg-white flex px-6 py-4 rounded-lg"
                    onClick={() => setValue("isHighTechnology", !value)}
                  >
                    <Icon
                      name={value ? "check" : "uncheck"}
                      className={value ? "fill-primary" : "fill-uncheck"}
                    />
                    <span className="ml-4 font-16">is High Technology</span>
                  </button>
                )}
              />
              <Controller
                name="haveAreasTreatment"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <button
                    type="button"
                    className="bg-white flex px-6 py-4 rounded-lg"
                    onClick={() =>
                      setValue("haveAreasTreatment", !value, {
                        shouldValidate: true,
                        shouldDirty: true,
                      })
                    }
                  >
                    <Icon
                      name={value ? "check" : "uncheck"}
                      className={value ? "fill-primary" : "fill-uncheck"}
                    />
                    <span className="ml-4 font-16">have Areas Treatment</span>
                  </button>
                )}
              />
            </div>
          </div>
          {getValues("haveAreasTreatment") && (
            <div>
              <h4 className="font-bold text-16 mb-2">Area Image</h4>
              <Controller
                name="areaImage"
                control={control}
                render={({ field: { value } }) =>
                  value ? (
                    <div className="w-80 relative">
                      <button
                        className="absolute z-10 top-2 right-2"
                        onClick={() => setValue("areaImage", null)}
                      >
                        <Icon name="close-circle" className="fill-red bg-white rounded-full" />
                      </button>
                      <img src={getStrapiMedia(value)} alt="Area" />
                    </div>
                  ) : (
                    <div>
                      <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-xl bg-background w-40 h-40"
                        onClick={() => {
                          setVisibleChooseAssetsFromLibraryDrawer(true)
                          setImageType("areas")
                        }}
                      >
                        <Icon name="gallery" className="fill-gray w-6 h-6" />
                      </button>
                      {errors.areaImage && (
                        <p className="text-12 text-error mt-1">{errors.areaImage?.message}</p>
                      )}
                    </div>
                  )
                }
              />
              <div className="mt-6 space-y-2">
                <h4 className="font-bold text-16 mb-2">Area Description</h4>
                <Controller
                  name="treatmentAreaDescription.en"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <MDEditor
                      height={200}
                      textareaProps={{
                        placeholder: "Input English",
                        name: "treatmentAreaDescription.en",
                      }}
                      preview="edit"
                      value={value}
                      onChange={onChange}
                    />
                  )}
                />
                {errors?.treatmentAreaDescription?.en && (
                  <p className="text-12 text-error">
                    {errors?.treatmentAreaDescription?.en?.message}
                  </p>
                )}
                <Controller
                  name="treatmentAreaDescription.vi"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <MDEditor
                      height={200}
                      textareaProps={{
                        placeholder: "Input Vietnamese",
                        name: "treatmentAreaDescription.vi",
                      }}
                      preview="edit"
                      value={value}
                      onChange={onChange}
                    />
                  )}
                />
                {errors?.treatmentAreaDescription?.vi && (
                  <p className="text-12 text-error">
                    {errors?.treatmentAreaDescription?.vi?.message}
                  </p>
                )}
              </div>
            </div>
          )}
          <div className="space-y-2">
            <h4 className="font-16 font-bold">Highlight</h4>
            <Controller
              name="highlight.en"
              control={control}
              render={({ field: { onChange, value } }) => (
                <MDEditor
                  height={200}
                  textareaProps={{
                    placeholder: "Input English Highlight",
                    name: "highlight.en",
                  }}
                  preview="edit"
                  value={value}
                  onChange={onChange}
                />
              )}
            />
            {errors?.highlight?.en && (
              <p className="text-12 text-error">{errors?.highlight?.en?.message}</p>
            )}
            <Controller
              name="highlight.vi"
              control={control}
              render={({ field: { onChange, value } }) => (
                <MDEditor
                  height={200}
                  textareaProps={{
                    placeholder: "Input Vietnamese Highlight",
                    name: "highlight.vi",
                  }}
                  preview="edit"
                  value={value}
                  onChange={onChange}
                />
              )}
            />
            {errors?.highlight?.vi && (
              <p className="text-12 text-error">{errors?.highlight?.vi?.message}</p>
            )}
          </div>
          <div className="space-y-2 col-span-2">
            <label className="font-16 font-bold">Procedure</label>
            <div className="grid grid-cols-2 gap-6">
              {procedureFields.map((item, index) => (
                <div key={index} className="space-y-4">
                  <Controller
                    name={`procedure[${index}]image`}
                    {...register(`procedure[${index}].image`)}
                    control={control}
                    render={({ field: { value } }) =>
                      value ? (
                        <div className="w-full h-40 relative flex justify-center bg-media">
                          <button
                            type="button"
                            className="absolute z-10 top-2 right-2"
                            onClick={() =>
                              setValue(`procedure[${index}].image`, null, {
                                shouldValidate: true,
                              })
                            }
                          >
                            <Icon name="close-circle" className="fill-red bg-white rounded-full" />
                          </button>
                          <img src={getStrapiMedia(value)} alt="Area" className="h-full w-auto" />
                        </div>
                      ) : (
                        <div>
                          <button
                            type="button"
                            className="inline-flex items-center justify-center rounded-xl bg-background w-40 h-40"
                            onClick={() => {
                              setVisibleChooseAssetsFromLibraryDrawer(true)
                              setImageType("procedure")
                              setStep(index)
                            }}
                          >
                            <Icon name="gallery" className="fill-gray w-6 h-6" />
                          </button>
                          {errors.procedure?.[index]?.image && (
                            <p className="text-12 text-error mt-1">
                              {errors.procedure?.[index]?.image?.message}
                            </p>
                          )}
                        </div>
                      )
                    }
                  />

                  <Controller
                    name={`procedure[${index}]en`}
                    {...register(`procedure.${index}.en`)}
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <Input
                        name={`procedure[${index}]en`}
                        onChange={onChange}
                        value={value}
                        placeholder={`Step ${index + 1} Content English`}
                        errors={errors?.procedure?.[index]?.en?.message}
                      />
                    )}
                  />

                  <Controller
                    name={`procedure[${index}]vi`}
                    {...register(`procedure.${index}.vi`)}
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <Input
                        name={`procedure[${index}]vi`}
                        onChange={onChange}
                        value={value}
                        placeholder={`Step ${index + 1} Content Vietnamese`}
                        errors={errors?.procedure?.[index]?.vi?.message}
                      />
                    )}
                  />
                  {procedureFields.length > 1 && (
                    <Button
                      type="button"
                      btnType="outline"
                      className="text-red border-red"
                      onClick={() => procedureRemove(index)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <Button
              type="button"
              className="!mt-4"
              icon={<Icon name="add-circle" className="fill-white" />}
              onClick={() => procedureAppend(PROCEDURE_ITEM_DEFAULT)}
            >
              Add new procedure
            </Button>
          </div>

          <div>
            <h4 className="font-16 font-bold mb-2">Time Session</h4>
            <div className="mb-4">
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                <Controller
                  name="timeSession.date"
                  control={control}
                  render={({ field: { value } }) =>
                    keys(WEEK_DAYS).map((item) => {
                      const isSelected = value?.includes(item)
                      const toggleItem = (i) => {
                        const newValue = cloneDeep(value)
                        const pos = newValue?.findIndex((v) => v === i)
                        pos === -1 ? newValue?.push(i) : newValue?.splice(pos, 1)
                        setValue("timeSession.date", newValue, {
                          shouldValidate: true,
                        })
                      }

                      return (
                        <Button
                          type="button"
                          key={item}
                          className={classNames("h-14 px-6 text-16", {
                            "bg-darkPrimary text-white font-bold": isSelected,
                            "bg-white text-secondary font-normal": !isSelected,
                          })}
                          onClick={() => toggleItem(item)}
                        >
                          {WEEK_DAYS[item]}
                        </Button>
                      )
                    })
                  }
                />
              </div>
              {errors.timeSession?.date && (
                <p className="text-12 text-error mt-1">{errors.timeSession?.date?.message}</p>
              )}
            </div>

            <div className="grid grid-cols-[1fr_1fr_200px_200px] gap-4">
              <div>
                <div className="flex items-center bg-white h-14 rounded-lg px-6">
                  <b className="whitespace-nowrap">Day Time</b>
                  <Controller
                    name="dayTime.start"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <Input type="time" name="dayTime.start" onChange={onChange} value={value} />
                    )}
                  />
                  <span>-</span>
                  <Controller
                    name="dayTime.end"
                    control={control}
                    render={({ field: { onChange, value } }) => {
                      return (
                        <Input type="time" name="dayTime.end" onChange={onChange} value={value} />
                      )
                    }}
                  />
                </div>
                {(errors?.dayTime?.start || errors?.dayTime?.end) && (
                  <p className="text-12 text-error mt-1">Day Time is required</p>
                )}
              </div>
              <div>
                <div className="flex items-center bg-white h-14 rounded-lg px-6">
                  <b className="whitespace-nowrap">Night Time</b>
                  <Controller
                    name="nightTime.start"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <Input type="time" name="nightTime.start" onChange={onChange} value={value} />
                    )}
                  />
                  <span>-</span>
                  <Controller
                    name="nightTime.end"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <Input type="time" name="nightTime.end" onChange={onChange} value={value} />
                    )}
                  />
                </div>
                {(errors?.nightTime?.start || errors?.nightTime?.end) && (
                  <p className="text-12 text-error mt-1">Night Time is required</p>
                )}
              </div>
              <Controller
                name="interval"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Input
                    type="time"
                    name="interval"
                    onChange={onChange}
                    value={value}
                    placeholder="Input Interval"
                    errors={errors?.interval?.message}
                  />
                )}
              />
              <Button type="button" className="h-14" onClick={() => generateTimeSlots()}>
                Generate time slot
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              <Controller
                name="timeSession.time"
                control={control}
                render={({ field: { value } }) =>
                  timeSlots.map((item) => {
                    const isSelected = value?.includes(item)
                    const toggleItem = (i) => {
                      const newValue = cloneDeep(value)
                      const pos = newValue?.findIndex((v) => v === i)
                      pos === -1 ? newValue?.push(i) : newValue?.splice(pos, 1)
                      setValue("timeSession.time", newValue, {
                        shouldValidate: true,
                      })
                    }

                    return (
                      <Button
                        type="button"
                        key={item}
                        className={classNames("h-14 px-6 text-16", {
                          "bg-darkPrimary text-white font-bold": isSelected,
                          "bg-white text-secondary font-normal": !isSelected,
                        })}
                        onClick={() => toggleItem(item)}
                      >
                        {item}
                      </Button>
                    )
                  })
                }
              />
            </div>
          </div>

          <div className="mt-4">
            <h4 className="font-16 font-bold mb-2">Results</h4>
            <div className="space-y-4">
              {resultsFields?.map((item, index) => (
                <div key={index} className="space-y-4">
                  <Controller
                    name={`results[${index}]title.en`}
                    {...register(`results.${index}.title.en`)}
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <Input
                        name={`results[${index}]title.en`}
                        onChange={onChange}
                        value={value}
                        placeholder={`Title ${index + 1} English`}
                        errors={errors?.results?.[index]?.title?.en?.message}
                      />
                    )}
                  />
                  <Controller
                    name={`results[${index}]title.vi`}
                    {...register(`results.${index}.title.vi`)}
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <Input
                        name={`results[${index}]title.vi`}
                        onChange={onChange}
                        value={value}
                        placeholder={`Title ${index + 1} Vietnamese`}
                        errors={errors?.results?.[index]?.title?.vi?.message}
                      />
                    )}
                  />
                  <Controller
                    name={`results[${index}]images`}
                    {...register(`results[${index}].images`)}
                    control={control}
                    render={({ field: { value } }) =>
                      !!value?.length ? (
                        <div className="grid grid-cols-4 gap-4">
                          {value.map((item) => (
                            <div
                              className="w-full h-40 relative flex justify-center bg-media"
                              key={item.id}
                            >
                              <button
                                type="button"
                                className="absolute z-10 top-2 right-2"
                                onClick={() => removeImageItemResults(value, index, item)}
                              >
                                <Icon
                                  name="close-circle"
                                  className="fill-red bg-white rounded-full"
                                />
                              </button>
                              <img
                                src={getStrapiMedia(item)}
                                alt="Area"
                                className="h-full w-auto"
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div>
                          <button
                            type="button"
                            className="inline-flex items-center justify-center rounded-xl bg-background w-40 h-40"
                            onClick={() => {
                              setVisibleChooseAssetsFromLibraryDrawer(true)
                              setImageType("results")
                              setStep(index)
                            }}
                          >
                            <button
                              type="button"
                              className="absolute z-10 top-2 right-2"
                              onClick={() =>
                                setValue(`results[${index}].images`, [], {
                                  shouldValidate: true,
                                })
                              }
                            >
                              <Icon
                                name="close-circle"
                                className="fill-red bg-white rounded-full"
                              />
                            </button>
                            <img
                              src={getStrapiMedia(item)}
                              alt="Result"
                              className="h-full w-auto"
                            />
                          </button>
                        </div>
                      )
                    }
                  />
                  <Button
                    type="button"
                    btnType="outline"
                    className="text-red border-red"
                    onClick={() => resultsRemove(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
            <Button
              type="button"
              className="!mt-4"
              icon={<Icon name="add-circle" className="fill-white" />}
              onClick={() => resultsAppend(RESULTS_ITEM_DEFAULT)}
            >
              Add new result
            </Button>
          </div>
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

export default TreatmentForm
