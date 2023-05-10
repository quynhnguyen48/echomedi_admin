import { useEffect, useState } from "react";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import Page from "components/Page";
import Input from "components/Input";
import Button from "components/Button";
import { getSettings, updateSettings } from "services/api/settings";
import { formatStrapiObj } from "utils/strapi";
import { getErrorMessage } from "utils/error";

const StaffInterestSetting = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const validationSchema = yup.object({
    bodyInterestMoney: yup.number(),
    skinInterestMoney: yup.number(),
    slimInterestMoney: yup.number(),
  });

  const { control, setValue, handleSubmit } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      bodyInterestMoney: 0,
      skinInterestMoney: 0,
      slimInterestMoney: 0,
    },
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await getSettings();
        if (res.data) {
          const settingsFormatted = formatStrapiObj(res.data);
          setValue("bodyInterestMoney", settingsFormatted?.bodyInterestMoney);
          setValue("skinInterestMoney", settingsFormatted?.skinInterestMoney);
          setValue("slimInterestMoney", settingsFormatted?.slimInterestMoney);
        }
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    })();
  }, [setValue]);

  const onSubmit = async (formData) => {
    try {
      setLoading(true);
      await updateSettings(formData);
      toast.success("Saved successfully!");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page title="Staff Interest" parentUrl="/settings">
      <div className="flex flex-col h-full">
        <p className="text-16 font-bold">Interest Money</p>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-form mt-4 rounded-t-2xl p-6 overflow-y-auto flex-1 space-y-4"
        >
          <Controller
            name="bodyInterestMoney"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Input
                label="Body Treatment"
                name="bodyInterestMoney"
                type="number"
                value={value}
                onChange={onChange}
              />
            )}
          />
          <Controller
            name="skinInterestMoney"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Input
                label="Skin Treatment"
                name="skinInterestMoney"
                type="number"
                value={value}
                onChange={onChange}
              />
            )}
          />
          <Controller
            name="slimInterestMoney"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Input
                label="Slim Treatment"
                name="slimInterestMoney"
                type="number"
                value={value}
                onChange={onChange}
              />
            )}
          />

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
  );
};

export default StaffInterestSetting;
