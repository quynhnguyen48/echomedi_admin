import { useEffect, useState } from "react"
import MDEditor from "@uiw/react-md-editor";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify"
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import Page from "components/Page";
import Button from "components/Button";
import { formatStrapiObj } from "utils/strapi"
import { getErrorMessage } from "utils/error"
import { getPrivacyContent, updatePrivacyContent } from "services/api/singleTypes"

const Privacy = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false)

  const validationSchema = yup.object({
    en: yup.string().required("English content is required"),
    vi: yup.string().required("Vietnamese content is required"),
  });

  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      en: "",
      vi: "",
    },
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await getPrivacyContent();
        if (res.data) {
          const privactFormatted = formatStrapiObj(res.data)
          setValue('en', privactFormatted?.en, { shouldDirty: true })
          setValue('vi', privactFormatted?.vi, { shouldDirty: true })
        }
      } catch (error) {
        toast.error(getErrorMessage(error))
      }
    })();
  }, [setValue])

  const onSubmit = async (formData) => {
    try {
      setLoading(true)
      await updatePrivacyContent(formData)
      toast.success('Privacy content updated successfully!')
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  };

  return (
    <Page title="Privacy">
      <p className="font-bold">Privacy Page</p>
      <div className="w-full h-full mt-4 bg-form rounded-2xl space-y-6 ">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="h-full space-y-2 px-6">
            <h4 className="font-16 font-bold pt-6"> Content</h4>
            <Controller
              name="en"
              control={control}
              render={({ field: { onChange, value } }) => (
                <MDEditor
                  height={400}
                  textareaProps={{
                    placeholder: "Input English Content",
                  }}
                  preview="edit"
                  value={value}
                  onChange={onChange}
                />
              )}
            />
            {errors?.en && (
              <p className="text-12 text-error">
                {errors?.en?.message}
              </p>
            )}
            <Controller
              name="vi"
              control={control}
              render={({ field: { onChange, value } }) => (
                <MDEditor
                  height={400}
                  textareaProps={{
                    placeholder: "Input Vietnamese Content",
                  }}
                  preview="edit"
                  value={value}
                  onChange={onChange}
                />
              )}
            />
            {errors?.vi && (
              <p className="text-12 text-error">
                {errors?.vi?.message}
              </p>
            )}
          </div>
          <div className="flex gap-x-4 p-5">
            <Button className="fill-primary" type="submit" loading={loading}>
              Save
            </Button>
            <Button
              btnType="outline"
              type="reset"
              onClick={(e) => {
                navigate(-1);
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </Page>
  );
};

export default Privacy;
