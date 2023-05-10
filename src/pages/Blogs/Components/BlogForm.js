import { useEffect, useState } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import MDEditor from "@uiw/react-md-editor"
import * as yup from "yup"
import { yupResolver } from "@hookform/resolvers/yup"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"

import Input from "components/Input"
import Select from "components/Select"
import Button from "components/Button"
import Icon from "components/Icon"
import ChooseAssetsFromLibraryDrawer from "components/ChooseAssetsFromLibraryDrawer"
import { getStrapiMedia } from "utils/media"
import { convertToKebabCase } from "utils/string"
import { formatStrapiArr } from "utils/strapi"
import { getBlogCategories } from "services/api/blogCategories"
import { createBlog, updateBlog } from "services/api/blogs"

const BlogForm = ({ data }) => {
  const navigate = useNavigate();
  const [blogCategories, setBlogCategories] = useState([])
  const [visibleChooseAssetsFromLibraryDrawer, setVisibleChooseAssetsFromLibraryDrawer] = useState(false)

  const validationSchema = yup.object({
    code: yup.string(),
    categories: yup.array().min(1, "Category is required").nullable(),
    title: yup.object({
      en: yup.string().required("Product Title English is required"),
      vi: yup.string().required("Product Title Vietnamese is required"),
    }),
    content: yup.object({
      en: yup.string().required("Product Content English is required"),
      vi: yup.string().required("Product Content Vietnamese is required"),
    }),
    thumbnail: yup.object().required("Product Thumbnail is required").nullable(),
  });

  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      code: data?.code,
      slug: data?.slug || "",
      categories: data?.categories || null,
      title: {
        en: data?.title?.en || "",
        vi: data?.title?.vi || "",
      },
      content: {
        en: data?.content?.en || "",
        vi: data?.content?.vi || "",
      },
      thumbnail: data?.thumbnail || null,
    },
  });

  const blogTitle = useWatch({ control: control, name: "title.en" });

  useEffect(() => {
    if (blogTitle !== data?.title?.en) {
      setValue("slug", convertToKebabCase(blogTitle));
    }
  }, [blogTitle, data?.title?.en, setValue]);

  useEffect(() => {
    (async () => {
      try {
        const res = await getBlogCategories();
        if (res.data) {
          const categories = formatStrapiArr(res.data);
          setBlogCategories(
            categories.map((category) => ({
              value: category.id,
              label: category.name,
            }))
          );
        }
      } catch (error) {}
    })();
  }, []);

  const onSubmit = async (formData) => {
    if (!!data?.id) {
      await updateBlog(data?.id, formData)
      toast.success("Blog updated successfully");
    } else {
      await createBlog(formData)
      toast.success("Blog created successfully");
    }
    navigate(-1)
  };

  return (
    <div className="flex flex-row">
      <div className="bg-form rounded-2xl p-6 space-y-6 flex-1">
        <div className="grid grid-cols-2 gap-6">
          <Controller
            name="code"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Input
                label="Blog ID"
                onChange={onChange}
                value={value}
                name="code"
                placeholder="Blog ID"
                disabled
              />
            )}
          />
          <Controller
            isMulti
            name="categories"
            control={control}
            render={({ field: { value, ref } }) => (
              <Select
                isMulti
                placeholder="Select Category"
                label="Category"
                name="categories"
                onChange={(e) => {
                  setValue("categories",
                    e.map((i) => ({
                      id: i.value,
                    })),
                    { shouldValidate: true, shouldDirty: true});
                }}
                value={
                  value &&
                  blogCategories.filter((c) =>
                    value.some((v) => v.id === c.value)
                  )
                }
                options={blogCategories}
                errors={errors?.categories?.message}
              />
            )}
          />
        </div>

        <div className="space-y-2">
          <Controller
            name="title.en"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Input
                label="Blog Title"
                onChange={onChange}
                value={value}
                name="title.en"
                placeholder="Input English Title"
                errors={errors?.title?.en?.message}
              />
            )}
          />
          <Controller
            name="title.vi"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Input
                onChange={onChange}
                value={value}
                name="title.vi"
                placeholder="Input Vietnamese Title"
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
              onChange={onChange}
              value={value}
              name="slug"
              placeholder="Input Slug"
              errors={errors?.slug?.message}
            />
          )}
        />

        <div className="space-y-2">
          <h4 className="font-16 font-bold">Blog Content</h4>
          <Controller
            name="content.en"
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
          {errors?.content?.en && (
            <p className="text-12 text-error">
              {errors?.content?.en?.message}
            </p>
          )}
          <Controller
            name="content.vi"
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
          {errors?.content?.vi && (
            <p className="text-12 text-error">
              {errors?.content?.vi?.message}
            </p>
          )}
        </div>

        <div className="flex gap-x-4 mt-10">
          <Button
            className="fill-primary"
            onClick={handleSubmit((data) => onSubmit(data))}
          >
            Save
          </Button>
          <Button
            btnType="outline"
            type="reset"
            onClick={(e) => navigate("/blogs")}
          >
            Cancel
          </Button>
        </div>
      </div>

      <div className="bg-rightContent rounded-lg p-6 ml-6 w-rightContent">
        <h4 className="font-16 font-bold">Blog Thumbnail</h4>
        <div className="mt-6">
          <Controller
            name="thumbnail"
            control={control}
            render={({ field: { onChange, value } }) => (
              value ?
                <div className="relative w-fit h-fit">
                  <button
                    type="button"
                    className="bg-white rounded-full absolute right-2 top-2"
                    onClick={() => setValue('thumbnail', null, { shouldValidate: true, shouldDirty: true})}
                  >
                    <Icon name="close-circle" className="fill-red"/>
                  </button>
                  <img src={getStrapiMedia(value)} alt="Blog Thumbnail"/>
                </div>
                :
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-xl bg-background w-40 h-40"
                  onClick={() => setVisibleChooseAssetsFromLibraryDrawer(true)}
                >
                  <Icon name="gallery" className="fill-gray w-6 h-6" />
                </button>
            )}
          />
          {
            errors?.thumbnail && <p className="text-12 text-error mt-1">{errors?.thumbnail?.message}</p>
          }
        </div>
      </div>

      <ChooseAssetsFromLibraryDrawer
        openDrawer={visibleChooseAssetsFromLibraryDrawer}
        onClose={() => setVisibleChooseAssetsFromLibraryDrawer(false)}
        onFinish={(asset) => setValue('thumbnail', asset, { shouldValidate: true, shouldDirty: true})}
      />
    </div>
  )
}

export default BlogForm
