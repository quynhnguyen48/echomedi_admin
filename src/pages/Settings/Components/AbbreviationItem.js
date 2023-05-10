import { Controller, useFieldArray } from "react-hook-form"

import Input from "components/Input"
import Button from "components/Button"
import Icon from "components/Icon"

const AbbreviationItem = ({ index, control, className }) => {
  const { fields, remove, append } = useFieldArray({
    control,
    name: `abbreviation.${index}.data`,
  })

  const handleAddNewItem = () => {
    append({
      value: "",
      searchBy: "",
    })
  }

  return (
    <div className={`space-y-4 pr-4 ${className}`}>
      {fields?.map((item, itemIndex) => (
        <div key={item.id} className="flex items-end space-x-2">
          <div className="flex-1 grid grid-cols-3 gap-x-4">
            <Controller
              name={`abbreviation.${index}.data.${itemIndex}.searchBy`}
              control={control}
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Từ viết tắt"
                  name={`abbreviation.${index}.data.${itemIndex}.searchBy`}
                  value={value}
                  onChange={onChange}
                />
              )}
            />
            <Controller
              name={`abbreviation.${index}.data.${itemIndex}.value`}
              control={control}
              render={({ field: { onChange, value } }) => (
                <Input
                  className="col-span-2"
                  label="Giá trị"
                  name={`abbreviation.${index}.data.${itemIndex}.value`}
                  value={value}
                  onChange={onChange}
                />
              )}
            />
          </div>
          <button type="button" className="mb-4" onClick={() => remove(itemIndex)}>
            <Icon name="trash" className="fill-red" />
          </button>
        </div>
      ))}
      <div className="pt-4 mt-6 border-primary border-t-1 flex justify-center">
        <Button
          type="button"
          btnType="text"
          icon={<Icon name="add-circle" className="fill-darkPrimary" />}
          className="font-normal text-darkPrimary"
          onClick={handleAddNewItem}
        >
          Thêm từ mới
        </Button>
      </div>
    </div>
  )
}

export default AbbreviationItem
