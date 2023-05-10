import { useCallback, useEffect, useState } from "react"
import { useForm, Controller, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify"

import Drawer from "components/Drawer";
import Input from "components/Input";
import Button from "components/Button";
import { convertToKebabCase } from "utils/string";
import { formatStrapiObj } from "utils/strapi"
import { getErrorMessage } from "utils/error"
import { createBlogCategory, updateBlogCategory } from "services/api/blogCategories"

const UpsertBlogCategoryDrawer = ({ openDrawer, onClose, onFinish, category }) => {
  const [editMode, setEditMode] = useState(false)
  const validationSchema = yup.object({
    name: yup.string().required("Name is required"),
    slug: yup.string().required("Slug is required"),
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
      name: category?.name || "",
      slug: category?.slug || "",
    },
  });

  const categoryTitle = useWatch({ control: control, name: "name" });

  useEffect(() => {
    if (categoryTitle !== category?.name) {
      setValue("slug", convertToKebabCase(categoryTitle));
    }
  }, [category?.title, categoryTitle, setValue]);

  useEffect(() => {
    setEditMode(!!category)
    if (!!category) {
      setValue('name', category?.name)
      setValue('slug', category?.slug)
    }
  }, [category, setValue])

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [onClose, reset]);

  const togglePublish = useCallback(async (category) => {
    try {
      const blogCategoryRes = await updateBlogCategory(category.id, {
        publishedAt: !!category?.publishedAt ? null : (new Date()).toISOString()
      })
      onFinish(formatStrapiObj(blogCategoryRes.data), false)
      toast.success(`Blog category ${!!category?.publishedAt ? 'unpublished' : 'published'} successfully!`)
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }, [onFinish])

  const onSubmit = async (data) => {
    // handle form submission
    if (category?.id) {
      const blogCategoryRes = await updateBlogCategory(category.id, data)
      toast.success('Blog category updated successfully!')
      onFinish(formatStrapiObj(blogCategoryRes.data), false)
    } else {
      const blogCategoryRes = await createBlogCategory(data)
      toast.success('Blog category created successfully!')
      onFinish(formatStrapiObj(blogCategoryRes.data), true)
    }
  };

  return (
    <Drawer open={openDrawer} onClose={handleClose}>
      <p className="text-18 font-bold">{editMode ? 'Edit' : 'Create New'} Blog Category</p>
      <form className="mt-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-2 mb-6">
          <Controller
            name="name"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Input
                label="Blog Category Name"
                value={value}
                onChange={onChange}
                inputClassName="bg-gray2"
                name="name"
                placeholder="Input Category Name"
                errors={errors?.name?.message}
              />
            )}
          />

          <Controller
            name="slug"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Input
                label="Blog Category Slug"
                value={value}
                onChange={onChange}
                inputClassName="bg-gray2"
                name="slug"
                placeholder="Input Category slug"
                errors={errors?.slug?.message}
              />
            )}
          />
        </div>

        <div className="flex items-center justify-between gap-x-4 mt-10">
          <div className="flex gap-x-4">
            <Button className="fill-primary" type="submit">
              Save
            </Button>
            <Button btnType="outline" type="button" onClick={handleClose}>
              Cancel
            </Button>
          </div>
          {
            editMode &&
            <Button
              onClick={() => togglePublish(category)}
              btnType="outline"
              type="button"
              className={`border-${category?.publishedAt ? 'red' : 'primary'} text-${category?.publishedAt ? 'red' : 'primary'}`}
            >
              {category?.publishedAt ? "Unpublish" : "Publish"}
            </Button>
          }
        </div>
      </form>
    </Drawer>
  );
};

export default UpsertBlogCategoryDrawer;
