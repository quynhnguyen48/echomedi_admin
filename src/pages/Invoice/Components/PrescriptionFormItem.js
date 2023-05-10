import React, { useEffect, useState } from "react"
import { Controller } from "react-hook-form"

import Input from "components/Input"
import Select from "components/Select"
import { getListDrugs } from "services/api/drug"
import { formatStrapiArr, formatStrapiObj } from "utils/strapi"
import Icon from "components/Icon"

const PrescriptionFormItem = ({
  index,
  item,
  control,
  setValue,
  errors,
  handleUpdateAmount,
  remove,
}) => {
  const [listDrugs, setListDrugs] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    handleSearchDrugs();
  }, [] )

  const handleSearchDrugs = () => {
    setLoading(true)
    getListDrugs(
      {
        pageSize: 1000,
        page: 1,
      }
    )
      .then((res) => {
        if (res.data) {
          const listProducts = formatStrapiArr(res.data)
          setListDrugs(
            listProducts
              ?.map((product) => ({
                ...product,
                images: formatStrapiArr(product?.images),
                brand: formatStrapiObj(product?.brand),
                category: formatStrapiObj(product?.category),
                inventory_histories: formatStrapiArr(product?.inventory_histories),
              }))
              ?.map((item) => ({ value: item.id, label: item.label }))
          )
        }
      })
      .catch((err) => {})
      .finally(() => setLoading(false))
  }

  return (
    <div className="flex flex-col gap-2" key={item.id}>
      <div className="grid grid-cols-12 gap-4">
        <Controller
          name={`Drugs[${index}].drug`}
          control={control}
          render={({ field: { onChange, value, ref } }) => (
            <Select
              isLoading={loading}
              className="rounded-lg"
              wrapperClassName="col-span-3"
              placeholder="Tên thuốc"
              label={index >= 1 ? "" : "Tên thuốc"}
              name={`drugs[${index}].drug`}
              filterOption={() => true}
              onChange={(e) => {
                setValue(`Drugs[${index}].drug`, e, {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }}
              value={value}
              // onInputChange={handleSearchDrugs}
              options={listDrugs}
              errors={errors.Drugs?.[index]?.drug?.message}
            />
          )}
        />
        <Controller
          name={`Drugs[${index}].morningAmount`}
          control={control}
          render={({ field: { onChange, value } }) => (
            <Input
              type="number"
              inputClassName="flex-1 "
              name={`Drugs[${index}].morningAmount`}
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
          name={`Drugs[${index}].noonAmount`}
          control={control}
          render={({ field: { onChange, value } }) => (
            <Input
              type="number"
              inputClassName="flex-1 "
              name={`Drugs[${index}].noonAmount`}
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
          name={`Drugs[${index}].afternoonAmount`}
          control={control}
          render={({ field: { onChange, value } }) => (
            <Input
              type="number"
              inputClassName="flex-1 "
              name={`Drugs[${index}].afternoonAmount`}
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
          name={`Drugs[${index}].eveningAmount`}
          control={control}
          render={({ field: { onChange, value } }) => (
            <Input
              type="number"
              inputClassName="flex-1 "
              name={`Drugs[${index}].eveningAmount`}
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
          name={`Drugs[${index}].numberOfDays`}
          control={control}
          render={({ field: { onChange, value } }) => (
            <Input
              type="number"
              inputClassName="flex-1 "
              name={`Drugs[${index}].numberOfDays`}
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
          name={`Drugs[${index}].amount`}
          control={control}
          render={({ field: { onChange, value } }) => (
            <Input
              type="number"
              inputClassName="flex-1 "
              name={`Drugs[${index}].amount`}
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
          name={`Drugs[${index}].unit`}
          control={control}
          render={({ field: { onChange, value } }) => (
            <Input
              inputClassName="flex-1 "
              name={`Drugs[${index}].unit`}
              onChange={onChange}
              value={value}
              label={index >= 1 ? "" : "Đơn vị"}
              placeholder="Viên, hộp, chai,..."
              errors={errors.Drugs?.[index]?.unit?.message}
            />
          )}
        />
        <div className="col-span-2 flex items-end gap-x-2">
          <Controller
            name={`Drugs[${index}].usage`}
            control={control}
            render={({ field: { onChange, value } }) => (
              <Input
                className="flex-1"
                inputClassName=""
                name={`Drugs[${index}].usage`}
                onChange={onChange}
                value={value}
                label={index >= 1 ? "" : "Cách dùng"}
                placeholder="Nhập cách dùng"
                errors={errors.Drugs?.[index]?.usage?.message}
              />
            )}
          />
          <button type="button" className="mb-4" onClick={() => remove(index)}>
            <Icon name="trash" className="fill-red" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default PrescriptionFormItem
