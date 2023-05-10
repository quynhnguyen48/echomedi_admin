import { useEffect, useState } from "react"
import * as yup from "yup"
import { yupResolver } from "@hookform/resolvers/yup"
import { useForm, Controller } from "react-hook-form"
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom"

import Page from "components/Page"
import Input from "components/Input"
import Button from "components/Button"
import { formatPrice } from "utils/number"
import { getSettings, updateSettings } from "services/api/settings"
import { getErrorMessage } from "utils/error"
import { formatStrapiObj } from "utils/strapi"

const ShippingSetting = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const validationSchema = yup.object({
    fee: yup.string()
  });

  const {
    control,
    setValue,
    handleSubmit
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      shippingFee: "0",
    },
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await getSettings();
        if (res.data) {
          const settingsFormatted = formatStrapiObj(res.data);
          setValue('shippingFee', `${formatPrice(Number(settingsFormatted.shippingFee))} đ`)
        }
      } catch (error) {
        toast.error(getErrorMessage(error))
      }
    })();
  }, [setValue])

  const onSubmit = async (formData) => {
    try {
      setLoading(true)
      await updateSettings({
        shippingFee: Number(formData.shippingFee.replace('.', '').replace('đ', '').trim())
      })
      toast.success('Shipping fee updated successfully!')
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Page title="Shipping Management" parentUrl="/settings">
      <div className="flex flex-col h-full">
        <p className="text-16 font-bold">Shipping fee</p>
        <form onSubmit={handleSubmit(onSubmit)} className="bg-form mt-4 rounded-t-2xl p-6 overflow-y-auto flex-1">
          <Controller
            name="shippingFee"
            control={control}
            render={({ field: { onChange, value}}) => (
              <Input
                label="Fix Price"
                name="shippingFee"
                value={value}
                onChange={onChange}
                onFocus={() => setValue('shippingFee', value.replace('.', '').replace('đ', '').trim(), {
                  shouldValidate: true,
                  shouldDirty: true
                })}
                onBlur={() => {
                  setValue('shippingFee', `${formatPrice(Number(value))} đ`, {
                    shouldValidate: true,
                    shouldDirty: true
                  })
                }}
              />
            )} />

          <div className="flex space-x-4 mt-10">
            <Button className="fill-primary" type="submit" loading={loading}>
              Save
            </Button>
            <Button btnType="outline" type="button" onClick={() => navigate(-1)}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </Page>
  )
}

export default ShippingSetting
