import { yupResolver } from "@hookform/resolvers/yup/dist/yup";
import { useCallback, useEffect, useState } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import * as yup from "yup";

import Button from "components/Button";
import ChooseAssetsFromLibraryDrawer from "components/ChooseAssetsFromLibraryDrawer";
import Icon from "components/Icon";
import Input from "components/Input";
import Select from "components/Select";
import {
  createTreatmentHistory,
  updateTreatmentHistory,
} from "services/api/treatementHistory";
import { getTreatments } from "services/api/treatment";
import { getListUsers } from "services/api/users";
import { getErrorMessage } from "utils/error";
import { getStrapiMedia } from "utils/media";
import { formatStrapiArr } from "utils/strapi";

const TREATMENT_HISTORY_DEFAULT = {
  title: "",
  images: [],
  note: "",
};

const TreatmentHistoryForm = ({ data }) => {
  const navigate = useNavigate();
  const [
    visibleChooseAssetsFromLibraryDrawer,
    setVisibleChooseAssetsFromLibraryDrawer,
  ] = useState(false);
  const [stepIndex, setStepIndex] = useState(null);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingTreatments, setLoadingTreatments] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [disableAddStepBtn, setDisableAddStepBtn] = useState(false);

  const validationSchema = yup.object({
    code: yup.string(),
    user: yup.object().required("Customer is required").nullable(),
    treatment: yup.object().required("Treatment is required").nullable(),
    progressTimes: yup
      .string()
      .trim()
      .matches(/^[0-9]*$/, "Progress times is not in correct format")
      .required("Progress times is required"),
    history: yup.array().of(
      yup.object().shape({
        title: yup.string().required("Title is required"),
        images: yup.array(),
        note: yup.string().required("Note is required"),
      })
    ),
  });

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
      user: data?.user || null,
      treatment: data?.treatment || null,
      progressTimes: data?.progressTimes || null,
      history: data?.history || null,
    },
  });

  const { fields, append, remove } = useFieldArray({
    name: "history",
    control,
  });
  const progressTimes = useWatch({ control: control, name: "progressTimes" });
  const history = useWatch({ control: control, name: "history" });

  useEffect(() => {
    (async () => {
      setLoadingTreatments(true);
      const treatmentsRes = await getTreatments();
      let treatmentFormatted = formatStrapiArr(treatmentsRes.data);
      treatmentFormatted = treatmentFormatted.map((treatment) => ({
        value: treatment.id,
        label: treatment.name,
      }));
      setTreatments(treatmentFormatted);
      setLoadingTreatments(false);
    })();
  }, []);

  useEffect(() => {
    setDisableAddStepBtn(
      !progressTimes || history?.length === Number(progressTimes)
    );
  }, [history?.length, progressTimes]);

  const handleSearchCustomer = useCallback((value) => {
    if (!value) return;
    setLoadingCustomers(true);
    getListUsers(
      { pageSize: 1000 },
      {
        $or: [
          { firstName: { $containsi: value } },
          { lastName: { $containsi: value } },
          { code: { $containsi: value } },
        ],
      }
    )
      .then((res) => {
        if (res.data) {
          setCustomers(
            res.data?.map((customer) => ({
              value: customer?.id,
              label: `${customer?.firstName} ${customer?.lastName} (${customer?.code})`,
            }))
          );
        }
        setLoadingCustomers(false);
      })
      .catch(() => {
        setLoadingCustomers(false);
      });
  }, []);

  useEffect(() => {
    if (!!data) {
      handleSearchCustomer(data?.user?.code);
    }
  }, [data, handleSearchCustomer]);

  const handleAssetsSelected = (assets) => {
    const currentAssets = getValues(`history[${stepIndex}]images`);
    setValue(`history[${stepIndex}].images`, [...currentAssets, ...assets], {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const removeImageItem = (images, index, imageSelected) => {
    const imagePos = images.findIndex((i) => i.id === imageSelected.id);
    const newImages = images;
    imagePos === -1
      ? newImages.push(imageSelected)
      : newImages.splice(imagePos, 1);
    setValue(`history[${index}].images`, newImages, { shouldValidate: true });
  };

  const onSubmit = async (formData) => {
    try {
      if (data?.id) {
        await updateTreatmentHistory(data?.id, formData);
        toast.success("Treatment history updated successfully");
      } else {
        await createTreatmentHistory(formData);
        toast.success("Treatment history created successfully");
      }
      navigate(-1);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-row">
        <div className="bg-form rounded-2xl p-6 space-y-6 flex-1">
          <div className="grid grid-cols-2 gap-6">
            <Controller
              name="code"
              control={control}
              render={({ field: { value } }) => (
                <Input
                  label="Treatment History ID"
                  value={value}
                  name="treatmentHistoryId"
                  placeholder="Treatment History ID"
                  disabled
                />
              )}
            />
            <Controller
              name="user"
              control={control}
              render={({ field: { value } }) => (
                <Select
                  placeholder="Search Customer"
                  label="Customer"
                  name="user"
                  onInputChange={handleSearchCustomer}
                  onChange={(e) => {
                    setValue(
                      "user",
                      { id: e.value },
                      { shouldValidate: true, shouldDirty: true }
                    );
                  }}
                  value={
                    value &&
                    customers.find((customer) => customer.value === value.id)
                  }
                  options={customers}
                  isLoading={loadingCustomers}
                  errors={errors?.user?.message}
                />
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <Controller
              name="treatment"
              control={control}
              render={({ field: { value, ref } }) => (
                <Select
                  isDisabled={loadingTreatments}
                  isLoading={loadingTreatments}
                  placeholder="Select Treatment"
                  label="Treatment"
                  name="treatment"
                  onChange={(e) => {
                    setValue(
                      "treatment",
                      { id: e.value },
                      { shouldValidate: true, shouldDirty: true }
                    );
                  }}
                  value={
                    value &&
                    treatments.find((treatment) => treatment.value === value.id)
                  }
                  options={treatments}
                  errors={errors?.treatment?.message}
                />
              )}
            />
            <Controller
              name="progressTimes"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Progress Times"
                  onChange={onChange}
                  value={value}
                  name="progressTimes"
                  placeholder="Input Progress Times"
                  errors={errors?.progressTimes?.message}
                />
              )}
            />
          </div>

          <div className="flex gap-x-4 mt-10">
            <Button className="fill-primary" type="submit">
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
        </div>

        <div className="bg-rightContent rounded-lg p-6 ml-6 w-rightContent">
          <div>
            {fields?.map((item, index) => (
              <section
                key={item.id}
                className="border-b-1 border-primary mb-4 pb-4 relative"
              >
                <button
                  type="button"
                  className="absolute top-1 right-1 z-10 bg-white rounded-full"
                  onClick={() => remove(index)}
                >
                  <Icon name="trash" className="w-5 h-5 fill-red" />
                </button>
                <Controller
                  name={`history[${index}]title`}
                  {...register(`history.${index}.title`)}
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <Input
                      name={`history[${index}]title`}
                      label="Progress Title"
                      placeholder="Input Title"
                      onChange={onChange}
                      value={value}
                      errors={errors.history?.[index]?.title?.message}
                    />
                  )}
                />
                <Controller
                  name={`history[${index}]images`}
                  {...register(`history[${index}].images`)}
                  control={control}
                  render={({ field: { value } }) =>
                    !!value.length && (
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        {value.map((image) => (
                          <div className="overflow-hidden w-full relative flex justify-center bg-media rounded-lg">
                            <button
                              type="button"
                              className="absolute z-10 top-1 right-1"
                              onClick={() =>
                                removeImageItem(value, index, image)
                              }
                            >
                              <Icon
                                name="close-circle"
                                className="fill-red bg-white rounded-full"
                              />
                            </button>
                            <img
                              src={getStrapiMedia(image)}
                              alt="Area"
                              className="h-full w-auto"
                            />
                          </div>
                        ))}
                      </div>
                    )
                  }
                />
                <div className="my-4">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-xl bg-background w-full h-40"
                    onClick={() => {
                      setVisibleChooseAssetsFromLibraryDrawer(true);
                      setStepIndex(index);
                    }}
                  >
                    <Icon name="gallery" className="fill-gray w-6 h-6" />
                  </button>
                  {errors.history?.[index]?.images && (
                    <p className="text-12 text-error mt-1">
                      {errors.history?.[index]?.images?.message}
                    </p>
                  )}
                </div>
                <Controller
                  name={`history[${index}]note`}
                  {...register(`history.${index}.note`)}
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <Input
                      name={`history[${index}]note`}
                      onChange={onChange}
                      value={value}
                      label="Note"
                      placeholder="Input Note"
                      errors={errors.history?.[index]?.note?.message}
                    />
                  )}
                />
              </section>
            ))}
            {errors?.history && (
              <p className="text-12 text-error text-center mb-2">
                {errors?.history.message}
              </p>
            )}
          </div>
          <div className="flex justify-center pt-2">
            <Button
              disabled={disableAddStepBtn}
              type="button"
              btnType="text"
              btnSize="auto"
              icon={<Icon name="add-circle" className="fill-primary w-6 h-6" />}
              onClick={() => append(TREATMENT_HISTORY_DEFAULT)}
            >
              <span className="text-16 text-primary">Add new step</span>
            </Button>
          </div>
        </div>
      </form>

      <ChooseAssetsFromLibraryDrawer
        openDrawer={visibleChooseAssetsFromLibraryDrawer}
        onClose={() => setVisibleChooseAssetsFromLibraryDrawer(false)}
        multiple
        onFinish={handleAssetsSelected}
      />
    </>
  );
};

export default TreatmentHistoryForm;
