import { useCallback, useEffect, useState } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import Drawer from "components/Drawer";
import Input from "components/Input";
import Button from "components/Button";
import UploadImage from "components/UploadImage";
import { getStrapiMedia } from "utils/media";
import Icon from "components/Icon";

const BannerDrawer = ({ openDrawer, onClose, banner }) => {
  const [editMode, setEditMode] = useState(false);
  const validationSchema = yup.object({
    title: yup.string().required("Title is required"),
  });

  const {
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      title: banner?.name || "",
    },
  });
  const thumbnail = useWatch({ control, name: "thumbnail" });

  useEffect(() => {
    setEditMode(!!banner);
    if (openDrawer && banner) {
      setValue("title", banner?.name);
      setValue("thumbnail", getStrapiMedia(banner));
    }
  }, [banner, openDrawer, setValue]);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [onClose, reset]);

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <Drawer open={openDrawer} onClose={handleClose}>
      <p className="text-18 font-bold">
        {editMode ? "Edit" : "Add New"} Banner
      </p>
      <form className="mt-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-2 mb-6">
          <Controller
            name="title"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Input
                label="Banner Title"
                value={value}
                onChange={onChange}
                inputClassName="bg-gray2"
                name="title"
                placeholder="Input English Title"
                errors={errors?.title?.message}
                showError={errors?.title}
              />
            )}
          />
        </div>
        {thumbnail ? (
          <div className="mt-6 relative w-fit h-fit">
            <button
              type="button"
              className="bg-white rounded-full absolute right-2 top-2"
              onClick={() =>
                setValue("thumbnail", null, {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
            >
              <Icon name="close-circle" className="fill-red" />
            </button>
            <img src={thumbnail} alt="Product Brand" />
          </div>
        ) : (
          <UploadImage
            className="w-full"
            onChange={(image) =>
              setValue("thumbnail", image, {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
          />
        )}

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
    </Drawer>
  );
};

export default BannerDrawer;
