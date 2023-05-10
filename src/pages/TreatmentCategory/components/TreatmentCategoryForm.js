import { useCallback, useEffect, useState } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import Drawer from "components/Drawer";
import Input from "components/Input";
import Button from "components/Button";
import Icon from "components/Icon";
import ChooseAssetsFromLibraryDrawer from "components/ChooseAssetsFromLibraryDrawer";
import { convertToKebabCase } from "utils/string";
import { getStrapiMedia } from "utils/media";

const TreatmentCategoryForm = ({ openDrawer, onClose, onFinish, category }) => {
  const [
    visibleChooseAssetsFromLibraryDrawer,
    setVisibleChooseAssetsFromLibraryDrawer,
  ] = useState(false);
  const validationSchema = yup.object({
    title: yup.object({
      en: yup.string().required("English title is required"),
      vi: yup.string().required("Vietnamese title is required"),
    }),
    slug: yup.string().required("Slug is required"),
    image: yup.object().nullable(),
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    reset,
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      title: {
        en: category?.title?.en || "",
        vi: category?.title?.vi || "",
      },
      slug: category?.slug || "",
      image: category?.image || null,
    },
  });
  const categoryTitleEn = useWatch({ control: control, name: "title.en" });

  useEffect(() => {
    if (categoryTitleEn !== category?.title?.en) {
      setValue("slug", convertToKebabCase(categoryTitleEn));
    }
  }, [category?.title?.en, categoryTitleEn, setValue]);

  useEffect(() => {
    if (openDrawer) {
      setValue("title.en", category?.title?.en);
      setValue("title.vi", category?.title?.vi);
      setValue("slug", category?.slug);
      setValue("image", category?.image);
    }
  }, [
    category?.image,
    category?.slug,
    category?.title?.en,
    category?.title?.vi,
    openDrawer,
    setValue,
  ]);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [onClose, reset]);

  const handleAssetsSelected = (asset) => {
    setValue("image", asset, { shouldValidate: true, shouldDirty: true });
  };

  const onSubmit = (formData) => {
    onFinish(formData);
  };

  return (
    <Drawer open={openDrawer} onClose={handleClose}>
      <p className="text-18 font-bold">
        {category ? `Edit ` : `Create New `} Treatment Category
      </p>
      <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <Controller
            name="title.en"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Input
                inputClassName="bg-gray2"
                value={value}
                onChange={onChange}
                name="title.en"
                label="Category Title"
                placeholder="Category title (en)"
                errors={errors?.title?.en?.message}
              />
            )}
          />
          <Controller
            name="title.vi"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Input
                inputClassName="bg-gray2"
                value={value}
                onChange={onChange}
                name="title.vi"
                placeholder="Category title (vi)"
                errors={errors?.title?.vi?.message}
              />
            )}
          />
        </div>
        <Controller
          name="slug"
          control={control}
          render={({ field: { onChange, value } }) => (
            <Input
              inputClassName="bg-gray2"
              value={value}
              onChange={onChange}
              name="slug"
              label="Category Slug"
              placeholder="Category Slug"
              errors={errors?.slug?.message}
            />
          )}
        />
        <Controller
          name="image"
          control={control}
          render={({ field: { value } }) =>
            !!value?.id ? (
              <div className="w-fit relative bg-media flex justify-center p-4">
                <button
                  className="absolute z-10 top-2 right-2"
                  onClick={() => setValue("image", null)}
                >
                  <Icon
                    name="close-circle"
                    className="fill-red bg-white rounded-full"
                  />
                </button>
                <img src={getStrapiMedia(value)} alt="Area" />
              </div>
            ) : (
              <div>
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-xl bg-background w-40 h-40"
                  onClick={() => setVisibleChooseAssetsFromLibraryDrawer(true)}
                >
                  <Icon name="gallery" className="fill-gray w-6 h-6" />
                </button>
              </div>
            )
          }
        />
        <div className="flex items-center justify-between gap-x-4 mt-10">
          <div className="flex gap-x-4">
            <Button className="fill-primary" type="submit">
              Save
            </Button>
            <Button btnType="outline" type="button" onClick={handleClose}>
              Cancel
            </Button>
          </div>
        </div>
      </form>

      <ChooseAssetsFromLibraryDrawer
        openDrawer={visibleChooseAssetsFromLibraryDrawer}
        onClose={() => setVisibleChooseAssetsFromLibraryDrawer(false)}
        onFinish={handleAssetsSelected}
      />
    </Drawer>
  );
};

export default TreatmentCategoryForm;
