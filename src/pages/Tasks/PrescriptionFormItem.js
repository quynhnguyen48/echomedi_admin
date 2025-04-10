import React, { useState, useEffect } from "react"
import { Controller } from "react-hook-form"

import Input from "components/Input"
import Select from "components/Select"
import { getListDrugs } from "services/api/drug"
import { formatStrapiArr, formatStrapiObj } from "utils/strapi"
import Icon from "components/Icon"
import { getValue } from "@testing-library/user-event/dist/utils"

function removeVietnameseTones(str) {
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a")
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e")
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i")
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o")
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u")
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y")
  str = str.replace(/đ/g, "d")
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A")
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E")
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I")
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O")
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U")
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y")
  str = str.replace(/Đ/g, "D")
  // Some system encode vietnamese combining accent as individual utf-8 characters
  // Một vài bộ encode coi các dấu mũ, dấu chữ như một kí tự riêng biệt nên thêm hai dòng này
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, "") // ̀ ́ ̃ ̉ ̣  huyền, sắc, ngã, hỏi, nặng
  str = str.replace(/\u02C6|\u0306|\u031B/g, "") // ˆ ̆ ̛  Â, Ê, Ă, Ơ, Ư
  // Remove extra spaces
  // Bỏ các khoảng trắng liền nhau
  str = str.replace(/ + /g, " ")
  str = str.trim()
  // Remove punctuations
  // Bỏ dấu câu, kí tự đặc biệt
  str = str.replace(
    /!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g,
    " "
  )
  return str
}

const PrescriptionFormItem = ({
  index,
  item,
  control,
  setValue,
  getValues,
  errors,
  handleUpdateAmount,
  remove,
  allDrugs,
}) => {
  const [listDrugs, setListDrugs] = useState(allDrugs)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setListDrugs(allDrugs)
    setLoading(false)
  }, [allDrugs])

  const handleSearchDrugs = (filter) => {
    const drugs = allDrugs.filter(d => d.label?.toLowerCase().includes(filter));
    setListDrugs(
      drugs
        ?.map((product) => ({
          ...product,
        }))
        ?.map((item) => ({ ...item, value: item.id, label: item.label, unit: item.unit }))
    )
    
  }

  return (
    <div className="flex flex-col gap-2" key={item.id}>
      <div className="grid grid-cols-10 gap-4">
        <Controller
          name={`medical_services[${index}]`}
          control={control}
          render={({ field: { onChange, value, ref } }) => (
            <Select
              isLoading={loading}
              className="rounded-lg"
              wrapperClassName="col-span-7"
              placeholder="Tên dịch vụ"
              label={index >= 1 ? "" : "Tên dịch vụ"}
              name={`medical_services[${index}]`}
              filterOption={() => true}
              onChange={(e) => {
                setValue(`medical_services[${index}]`, e, {
                  shouldValidate: true,
                  shouldDirty: true,
                })
                setValue(`medical_services[${index}].unit`, e.unit, {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }}
              value={value}
              onInputChange={handleSearchDrugs}
              options={listDrugs}
              errors={errors.Drugs?.[index]?.drug?.message}
            />
          )}
        />
        <div className="col-span-1 flex gap-2 justify-between">
        {/* <Controller
          name={`medical_services[${index}].morningAmount`}
          control={control}
          render={({ field: { onChange, value } }) => (
            <Input
              type="text"
              inputClassName="w-16"
              name={`medical_services[${index}].morningAmount`}
              onChange={(e) => {
                onChange(e)
                handleUpdateAmount()
              }}
              value={value}
              label={index >= 1 ? "" : "Sáng"}
              placeholder="Nhập Số lượng"
              min={0}
              errors={errors.Drugs?.[index]?.morningAmount?.message}
            />
          )}
        />
        <Controller
          name={`medical_services[${index}].noonAmount`}
          control={control}
          render={({ field: { onChange, value } }) => (
            <Input
              type="text"
              inputClassName="flex-1 w-16"
              name={`medical_services[${index}].noonAmount`}
              onChange={(e) => {
                onChange(e)
                handleUpdateAmount()
              }}
              value={value}
              label={index >= 1 ? "" : "Trưa"}
              placeholder="Nhập Số lượng"
              min={0}
              errors={errors.Drugs?.[index]?.noonAmount?.message}
            />
          )}
        />
        <Controller
          name={`medical_services[${index}].afternoonAmount`}
          control={control}
          render={({ field: { onChange, value } }) => (
            <Input
              type="text"
              inputClassName="flex-1 w-16"
              name={`medical_services[${index}].afternoonAmount`}
              onChange={(e) => {
                onChange(e)
                handleUpdateAmount()
              }}
              value={value}
              label={index >= 1 ? "" : "Chiều"}
              placeholder="Nhập Số lượng"
              min={0}
              errors={errors.Drugs?.[index]?.afternoonAmount?.message}
            />
          )}
        />
        <Controller
          name={`medical_services[${index}].eveningAmount`}
          control={control}
          render={({ field: { onChange, value } }) => (
            <Input
              type="text"
              inputClassName="flex-1 w-16"
              name={`medical_services[${index}].eveningAmount`}
              onChange={(e) => {
                onChange(e)
                handleUpdateAmount()
              }}
              value={value}
              label={index >= 1 ? "" : "Tối"}
              placeholder="Nhập Số lượng"
              min={0}
              errors={errors.Drugs?.[index]?.eveningAmount?.message}
            />
          )}
        />
        
        <Controller
          name={`medical_services[${index}].numberOfDays`}
          control={control}
          render={({ field: { onChange, value } }) => (
            <Input
              type="text"
              inputClassName="flex-1 w-16"
              name={`medical_services[${index}].numberOfDays`}
              onChange={(e) => {
                onChange(e)
                handleUpdateAmount()
              }}
              value={value}
              label={index >= 1 ? "" : "Số ngày"}
              placeholder="Nhập Số ngày"
              min={0}
              errors={errors.Drugs?.[index]?.numberOfDays?.message}
            />
          )}
        />
        <Controller
          name={`medical_services[${index}].amount`}
          control={control}
          render={({ field: { onChange, value } }) => (
            <Input
              type="number"
              inputClassName="flex-1 w-16"
              name={`medical_services[${index}].amount`}
              onChange={onChange}
              value={value}
              label={index >= 1 ? "" : "Số lượng"}
              placeholder="Nhập Số lượng"
              min={0}
              errors={errors.Drugs?.[index]?.amount?.message}
            />
          )}
        />
        <Controller
          name={`medical_services[${index}].unit`}
          control={control}
          render={({ field: { onChange, value } }) => (
            <Input
            inputClassName="flex-1 w-24"
              name={`medical_services[${index}].unit`}
              onChange={onChange}
              value={value}
              label={index >= 1 ? "" : "Đơn vị"}
              placeholder="Viên, hộp, chai,..."
              errors={errors.Drugs?.[index]?.unit?.message}
            />
          )}
        /> */}
        </div>
        <div className="col-span-2 flex items-end gap-x-2">
          {/* <Controller
            name={`medical_services[${index}].usage`}
            control={control}
            render={({ field: { onChange, value } }) => (
              <Input
                className="flex-1"
                inputClassName=""
                name={`medical_services[${index}].usage`}
                onChange={onChange}
                value={value}
                label={index >= 1 ? "" : "Cách dùng"}
                placeholder="Nhập cách dùng"
                errors={errors.Drugs?.[index]?.usage?.message}
              />
            )}
          /> */}
          <button type="button" className="mb-4" onClick={() => remove(index)}>
            <Icon name="trash" className="fill-red" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default PrescriptionFormItem
