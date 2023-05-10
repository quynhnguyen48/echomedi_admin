import { yupResolver } from "@hookform/resolvers/yup"
import React, { useEffect, useState } from "react"
import { Controller, useFieldArray, useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import * as yup from "yup"

import Button from "components/Button"
import Input from "components/Input"
import Page from "components/Page"
import Icon from "components/Icon"
import { getDiscountSettings, updateDiscountSettings } from "services/api/settings"
import { toast } from "react-toastify"
import { getErrorMessage } from "utils/error"
import { formatStrapiObj } from "utils/strapi"

const DiscountSetting = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const validationSchema = yup.object({})

  const { control, handleSubmit, reset } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      reasons: [],
    },
  })

  const onSubmit = async ({ reasons }) => {
    try {
      setLoading(true)
      await updateDiscountSettings({ reasons })
      toast.success("Lưu thành công")
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  const { append, remove, fields } = useFieldArray({
    control,
    name: "reasons",
  })

  const handleAddNewItem = () => {
    append({
      value: "",
      searchBy: "",
    })
  }

  useEffect(() => {
    ;(async () => {
      try {
        const res = await getDiscountSettings()
        const { reasons } = formatStrapiObj(res.data)
        if (Array.isArray(reasons) && reasons?.length) {
          reset({ reasons })
        } else {
          reset({ reasons: [{ value: "", searchBy: "" }] })
        }
      } catch (error) {}
    })()
  }, [reset])

  return (
    <Page title="Lý do giảm giá" parentUrl="/settings">
      <div className="flex flex-col h-full">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-form mt-4 rounded-t-2xl p-6 overflow-y-auto flex-1"
        >
          <div className="max-h-settingContent overflow-auto space-y-4">
            {fields?.map((item, index) => {
              return (
                <div key={item.id} className="flex items-end space-x-2">
                  <div className="flex-1 grid grid-cols-3 gap-x-4">
                    <Controller
                      name={`reasons.${index}.searchBy`}
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <Input
                          label={index === 0 ? "Từ viết tắt" : ""}
                          placeholder="Nhập từ viết tắt"
                          name={`reasons.${index}.searchBy`}
                          value={value}
                          onChange={onChange}
                        />
                      )}
                    />
                    <Controller
                      name={`reasons.${index}.value`}
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <Input
                          className="col-span-2"
                          label={index === 0 ? "Lý do giảm giá" : ""}
                          name={`reasons.${index}.value`}
                          placeholder="Nhập lý do giảm giá"
                          value={value}
                          onChange={onChange}
                        />
                      )}
                    />
                  </div>
                  <button type="button" className="mb-4" onClick={() => remove(index)}>
                    <Icon name="trash" className="fill-red" />
                  </button>
                </div>
              )
            })}
            <div className="pt-4 mt-6 border-primary border-t-1 flex justify-center">
              <Button
                type="button"
                btnType="text"
                icon={<Icon name="add-circle" className="fill-darkPrimary" />}
                className="font-normal text-darkPrimary"
                onClick={handleAddNewItem}
              >
                Thêm lý do giảm giá
              </Button>
            </div>
          </div>
          <div className="flex space-x-4 mt-10">
            <Button className="fill-primary" type="submit" loading={loading}>
              Lưu
            </Button>
            <Button btnType="outline" type="button" onClick={() => navigate(-1)}>
              Huỷ
            </Button>
          </div>
        </form>
      </div>
    </Page>
  )
}

export default DiscountSetting
