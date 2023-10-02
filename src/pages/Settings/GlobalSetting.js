import { yupResolver } from "@hookform/resolvers/yup"
import { useEffect, useState } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import * as yup from "yup"
import { useSelector } from "react-redux"
import reduce from "lodash/reduce"
import classNames from "classnames"

import Button from "components/Button"
import Page from "components/Page"
import AbbreviationItem from "./Components/AbbreviationItem"
import axios from "../../services/axios"
import { toast } from "react-toastify"

const translate = (t) => {
  switch (t) {
    case "discount":
      return "Khuyến mãi"
    case "inquiry":
      return "Bệnh sử"
    case "premise":
      return "Tiền căn";
    case "examination":
      return "Khám cơ quan"
    case "general_examination":
      return "Khám tổng quát";
    case "main_diagnose":
      return "Bệnh chính";
    case "other_diagnose":
      return "Bệnh kèm theo";
    case "diagnose":
      return "Chẩn đoán"
    case "treatment_regimen":
      return "Hướng điều trị"
    case "past_medical_history":
      return "Tiền sử"
    case "discount_reason":
      return "Lý do giảm giá"
  }
}

const ShippingSetting = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const currentUser = useSelector((state) => state.user.currentUser)
  const [itemSelected, setItemSelected] = useState(0)
  const validationSchema = yup.object({})

  const { control, handleSubmit, reset } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      abbreviation: [],
    },
  })

  const { append, remove, fields } = useFieldArray({
    control,
    name: "abbreviation",
  })

  const onSubmit = async ({ abbreviation }) => {
    const payload = reduce(
      abbreviation,
      (res, item) => {
        return {
          ...res,
          [item.name]: item.data,
        }
      },
      {}
    )
    setLoading(true)
    axios
      .put("/global-setting", {data: {data: payload}}
      )
      .then((response) => {
        toast.success("Lưu thành công")
      })
      .catch(() => {
        toast.error("Có lỗi xảy ra")
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    const id = toast.loading("Đang tải dữ liệu các dịch vụ");
    axios.get("/global-setting")
      .then(response => {
        console.log('response', response.data.data.attributes.data)
        reset({
          abbreviation: reduce(
            response.data.data.attributes.data,
            (res, val, key) => {
              return [
                ...res,
                {
                  name: key,
                  data: val,
                },
              ]
            },
            []
          ),
        })
      }).finally(() => {
        toast.dismiss(id);
      });
    // if (currentUser?.abbreviation) {
    //   reset({
    //     abbreviation: reduce(
    //       currentUser?.abbreviation,
    //       (res, val, key) => {
    //         return [
    //           ...res,
    //           {
    //             name: key,
    //             data: val,
    //           },
    //         ]
    //       },
    //       []
    //     ),
    //   })
    // }
  }, [])

  return (
    <Page title="Quản lý viết tắt" parentUrl="/settings">
      <div className="flex flex-col h-full">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-form mt-4 rounded-t-2xl p-6 overflow-y-auto flex-1"
        >
          <div className="grid grid-cols-3 gap-x-6">
            <div className="space-y-4 col-span-1">
              {fields?.map((item, index) => {
                const isSelected = itemSelected === index

                return (
                  <div key={item.id} className="relative">
                    <button
                      type="button"
                      className={classNames("h-14 px-6 w-full rounded-lg text-left", {
                        "bg-primary font-bold text-white": isSelected,
                        "bg-white font-normal text-secondary": !isSelected,
                      })}
                      onClick={() => setItemSelected(index)}
                    >
                      <span>{translate(item.name)}</span>
                    </button>
                  </div>
                )
              })}
              <div className="flex space-x-4 mt-10">
                <Button className="fill-primary" type="submit" loading={loading}>
                  Lưu
                </Button>
                <Button btnType="outline" type="button" onClick={() => navigate(-1)}>
                  Huỷ
                </Button>
              </div>
            </div>
            <div className="col-span-2 max-h-settingContent overflow-auto">
              {fields?.map((item, index) => {
                const isSelected = itemSelected === index
                return (
                  <AbbreviationItem
                    key={item.id}
                    index={index}
                    control={control}
                    className={isSelected ? "" : "hidden"}
                  />
                )
              })}
            </div>
          </div>
        </form>
      </div>
    </Page>
  )
}

export default ShippingSetting
