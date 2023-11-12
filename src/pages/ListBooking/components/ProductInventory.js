import orderBy from "lodash/orderBy"
import sumBy from "lodash/sumBy"
import { useCallback, useEffect, useState } from "react"
import { Controller, useFieldArray, useForm } from "react-hook-form"
import { toast } from "react-toastify"

import Button from "components/Button"
import DataItem from "components/DataItem"
import Drawer from "components/Drawer"
import Input from "components/Input"
import { addProductInventory, getProductById } from "services/api/products"
import { formatDate } from "utils/dateTime"
import { getErrorMessage } from "utils/error"
import { formatStrapiArr, formatStrapiObj } from "utils/strapi"

const INVENTORY_TYPE = {
  IMPORT: "import",
  EXPORT: "export",
}

const ProductInventory = ({
  openDrawer,
  onClose,
  productId,
  inventory = 0,
  inventoryHistories,
  onUpdate,
  variants,
}) => {
  const [loading, setLoading] = useState(false)

  const { control, reset, handleSubmit } = useForm()

  const { fields } = useFieldArray({ name: "variants", control })

  const onSubmit = useCallback(
    async (data) => {
      const importAmount = sumBy(data?.variants, (variant) => parseInt(variant.importAmount))
      const exportAmount = sumBy(data?.variants, (variant) => parseInt(variant.exportAmount))

      try {
        setLoading(true)
        // add import inventory
        if (importAmount > 0) {
          await addProductInventory({
            product: {
              id: productId,
            },
            variants: data?.variants?.map((variant) => ({
              size: variant?.size,
              unit: variant?.unit,
              inventory: parseInt(variant?.importAmount),
            })),
            type: INVENTORY_TYPE.IMPORT,
          })
        }
        // add export inventory
        if (exportAmount > 0) {
          await addProductInventory({
            product: {
              id: productId,
            },
            variants: data?.variants?.map((variant) => ({
              size: variant?.size,
              unit: variant?.unit,
              inventory: parseInt(variant?.exportAmount),
            })),
            type: INVENTORY_TYPE.EXPORT,
          })
        }
        // update total inventory of product
        const res = await getProductById(productId)
        const productData = formatStrapiObj(res?.data)
        onUpdate({
          ...productData,
          images: formatStrapiArr(productData?.images),
          brand: formatStrapiObj(productData?.brand),
          category: formatStrapiObj(productData?.category),
          inventory_histories: formatStrapiArr(productData?.inventory_histories),
        })
        toast.success("Updated inventory successfully")
        reset()
        onClose()
      } catch (error) {
        toast.error(getErrorMessage(error))
      } finally {
        setLoading(false)
      }
    },
    [onClose, onUpdate, productId, reset]
  )

  useEffect(() => {
    if (variants?.length) {
      reset({
        variants: variants?.map((variant) => ({
          size: variant?.size,
          unit: variant?.unit,
          sizeName: `${variant?.size}${variant?.unit}`,
          importAmount: 0,
          exportAmount: 0,
        })),
      })
    } else {
      reset({ variants: [] })
    }
  }, [reset, variants])

  return (
    <Drawer open={openDrawer} onClose={onClose}>
      <DataItem icon="bag" title="Inventory" value={inventory} />
      <form className="mt-6" onSubmit={handleSubmit((data) => onSubmit(data))}>
        <div className="space-y-3">
          {fields.map((field, index) => (
            <div className="grid grid-cols-3 grid-flow-row gap-x-4" key={field.id}>
              <Controller
                name={`variants[${index}].sizeName`}
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Input
                    disabled
                    inputClassName="bg-gray2"
                    name={`variants[${index}].sizeName`}
                    label="Size"
                    hideLabel={index > 0}
                    value={value}
                    onChange={onChange}
                  />
                )}
              />
              <Controller
                name={`variants[${index}].importAmount`}
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Input
                    inputClassName="bg-gray2"
                    name={`variants[${index}].importAmount`}
                    label="Import Quantity"
                    hideLabel={index > 0}
                    type="number"
                    placeholder="Enter Quantity"
                    value={value}
                    min={0}
                    onChange={onChange}
                  />
                )}
              />
              <Controller
                name={`variants[${index}].exportAmount`}
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Input
                    inputClassName="bg-gray2"
                    name={`variants[${index}].exportAmount`}
                    label="Export Quantity"
                    hideLabel={index > 0}
                    type="number"
                    placeholder="Enter Quantity"
                    value={value}
                    min={0}
                    onChange={onChange}
                  />
                )}
              />
            </div>
          ))}
        </div>

        <div className="flex gap-x-4 mt-8">
          <Button type="submit" loading={loading}>
            Save
          </Button>
          <Button
            btnType="outline"
            type="button"
            onClick={() => {
              reset()
              onClose()
            }}
          >
            Cancel
          </Button>
        </div>
      </form>
      <div className="mt-8">
        <p className="font-bold text-18">Import & Export History</p>
        <div className="mt-6 space-y-4">
          {Array.isArray(inventoryHistories) &&
            orderBy(inventoryHistories, "createdAt", "desc")?.map((item) => {
              return (
                <div key={item?.id} className="rounded-xl bg-primary/10 p-4">
                  <p className="text-primary font-bold">
                    {item?.type === INVENTORY_TYPE.IMPORT ? "Import" : "Export"}
                  </p>
                  <p className="text-secondary/[0.56] mt-2">
                    {formatDate(item?.createdAt, "DD MMMM, YYYY [|] HH:mm")}
                  </p>
                  <div className="mt-4 flex gap-x-6">
                    {item?.variants?.map((variant) => (
                      <p>
                        {`${variant?.size}${variant?.unit} | `}
                        <span className="font-bold">{variant?.inventory}</span>
                      </p>
                    ))}
                  </div>
                </div>
              )
            })}
        </div>
      </div>
    </Drawer>
  )
}

export default ProductInventory
