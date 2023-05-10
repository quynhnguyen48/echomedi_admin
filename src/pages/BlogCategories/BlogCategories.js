import { useCallback, useEffect, useState } from "react"

import Page from "components/Page";
import Button from "components/Button"
import Icon from "components/Icon"
import BlogCategoryItem from "./Components/BlogCategoryItem"
import UpsertBlogCategoryDrawer from "./Components/UpsertBlogCategoryDrawer"
import { deleteBlogCategory, getBlogCategories } from "../../services/api/blogCategories"
import { formatStrapiArr } from "../../utils/strapi"
import { toast } from "react-toastify"
import { getErrorMessage } from "../../utils/error"

const BlogCategories = () => {
  const [visibleUpsertBlogCategoryDrawer, setVisibleUpsertBlogCategoryDrawer] = useState(false);
  const [blogCategorySelected, setBlogCategorySelected] = useState(null);
  const [blogCategories, setBlogCategories] = useState([]);

  useEffect(() => {
    ;(async () => {
      try {
        const blogCategoriesRes = await getBlogCategories('preview')
        let blogCategoriesFormatted = formatStrapiArr(blogCategoriesRes.data)
        setBlogCategories(blogCategoriesFormatted)
      } catch (error) {
        toast.error(getErrorMessage(error))
      }
    })()
  }, [])

  const handleDeleteCategory = useCallback(
    async (categoryId) => {
      try {
        await deleteBlogCategory(categoryId)
        setBlogCategories(
          blogCategories?.filter((c) => c?.id !== categoryId)
        );
        toast.success('Blog category deleted successfully!')
      } catch (e) {
        console.log(e)
      }
    },
    [blogCategories]
  );

  const upsertBlogCategory = useCallback((category, isCreation) => {
    if (isCreation) {
      setBlogCategories([...blogCategories, category])
    } else {
      const pos = blogCategories.findIndex(c => c.id === category.id)
      if (pos > -1) {
        blogCategories[pos] = category
        setBlogCategories(blogCategories)
      }
    }
    setVisibleUpsertBlogCategoryDrawer(false)
  }, [blogCategories])

  return(
    <Page title="Blog Category Management">
      <p className="text-16 font-bold">Blog Category</p>
      <div
        className="bg-form mt-4 rounded-t-2xl p-6 overflow-y-auto"
        style={{ height: "calc(100vh - 166px)" }}
      >
        <div className="flex items-center justify-between">
          <p className="text-32">
            <span className="text-primary font-bold">
              {blogCategories?.length || 0}
            </span>{" "}
            Categories
          </p>
          <Button
            icon={<Icon name="add-circle" className="fill-white" />}
            onClick={() => {
              setBlogCategorySelected(null);
              setVisibleUpsertBlogCategoryDrawer(true);
            }}
          >
            Add New Category
          </Button>
        </div>
        <div className="mt-6 grid grid-cols-4 grid-flow-row gap-6">
          {blogCategories?.map((category) => (
            <BlogCategoryItem
              key={category?.id}
              category={category}
              onEdit={(category) => {
                setBlogCategorySelected(category);
                setVisibleUpsertBlogCategoryDrawer(true);
              }}
              onDelete={() => handleDeleteCategory(category?.id)}
            />
          ))}
        </div>
      </div>

      <UpsertBlogCategoryDrawer
        category={blogCategorySelected}
        openDrawer={visibleUpsertBlogCategoryDrawer}
        onClose={() => {
          setBlogCategorySelected(null)
          setVisibleUpsertBlogCategoryDrawer(false)
        }}
        onFinish={upsertBlogCategory}
      />
    </Page>
  )
};

export default BlogCategories;
