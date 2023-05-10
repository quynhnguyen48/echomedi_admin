import { useCallback, useEffect, useState } from "react";
import cloneDeep from "lodash/cloneDeep"
import { toast } from "react-toastify"

import Button from "components/Button";
import Icon from "components/Icon";
import Page from "components/Page";
import ProductBrands from "./Components/ProductBrands";
import ProductCategoryForm from "./Components/ProductCategoryForm";
import ProductCategoryItem from "./Components/ProductCategoryItem";
import {
  createProductCategory,
  deleteProductCategory,
  getProductCategories,
  updateProductCategory
} from "services/api/products"
import { formatStrapiArr, formatStrapiObj } from "utils/strapi";
import { getErrorMessage } from "utils/error"
import { updateBlog } from "../../services/api/blogs"

const ProductSettings = () => {
  const [showProductCategoryForm, setShowProductCategoryForm] = useState(false);
  const [productCategoryData, setProductCategoryData] = useState();
  const [productCategories, setProductCategories] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await getProductCategories('preview');
        if (res.data) {
          const categories = formatStrapiArr(res.data);
          setProductCategories(
            categories?.map((category) => ({
              ...category,
              image: formatStrapiObj(category.image),
            }))
          );
        }
      } catch (error) {}
    })();
  }, []);

  const upsertProductCategory = useCallback(async (formData, isTogglePublish) => {
    try {
      let res;
      if (!!productCategoryData?.id) {
        res = await updateProductCategory(productCategoryData.id, formData)
        if (isTogglePublish) {
          toast.success(`Product category ${!!productCategoryData?.publishedAt ? 'unpublished' : 'published'} successfully!`)
        } else {
          toast.success('Product category updated successfully!')
        }
      } else {
        res = await createProductCategory(formData)
        toast.success('Product category created successfully!')
      }
      let updatedData = formatStrapiObj(res.data)
      updatedData = {
        ...updatedData,
        image: formatStrapiObj(updatedData.image)
      }

      setProductCategories((oldCategories) => {
        let newCategories = cloneDeep(oldCategories)
        const pos = newCategories.findIndex(c => c.id === updatedData.id)
        if (pos > -1) {
          newCategories[pos] = updatedData
        } else {
          newCategories.push(updatedData)
        }
        return newCategories
      })
      setShowProductCategoryForm(false)
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }, [productCategoryData?.id])

  const handleDeleteCategory = useCallback(
    async (category) => {
      try {
        await deleteProductCategory(category.id)
        setProductCategories((oldCategories) => {
          let newCategories = cloneDeep(oldCategories)
          const pos = newCategories.findIndex(c => c.id === category.id)
          if (pos > -1) {
            newCategories.splice(pos, 1)
          }
          return newCategories
        })
        toast.success('Product Category removed successfully!')
      } catch (error) {
        toast.error(getErrorMessage(error))
      }
    },
    []
  );

  const togglePublish = useCallback(async () => {
    await upsertProductCategory({
      publishedAt: !!productCategoryData?.publishedAt ? null : (new Date()).toISOString()
    }, true)
  }, [productCategoryData?.publishedAt, upsertProductCategory])

  return (
    <Page
      title="Product Settings"
      rightContent={<ProductBrands />}
      className="!pb-0 overflow-hidden"
      contentClassName="!pb-0"
    >
      <p className="text-16 font-bold">Product Category</p>
      <div
        className="bg-form mt-4 rounded-t-2xl p-6 overflow-y-auto"
        style={{ height: "calc(100vh - 166px)" }}
      >
        <div className="flex items-center justify-between">
          <p className="text-32">
            <span className="text-primary font-bold">
              {productCategories?.length || 0}
            </span>{" "}
            Categories
          </p>
          <Button
            icon={<Icon name="add-circle" className="fill-white" />}
            onClick={() => {
              setProductCategoryData(null);
              setShowProductCategoryForm(true);
            }}
          >
            Add New Category
          </Button>
        </div>
        <div className="mt-6 grid grid-cols-4 grid-flow-row gap-6">
          {productCategories?.map((category) => (
            <ProductCategoryItem
              key={category?.id}
              category={category}
              onEdit={() => {
                setProductCategoryData(category);
                setShowProductCategoryForm(true);
              }}
              onDelete={() => handleDeleteCategory(category)}
            />
          ))}
        </div>
      </div>
      <ProductCategoryForm
        category={productCategoryData}
        openDrawer={showProductCategoryForm}
        onClose={() => {
          setProductCategoryData(null);
          setShowProductCategoryForm(false);
        }}
        onUpsertProductCategory={upsertProductCategory}
        onTogglePublish={togglePublish}
      />
    </Page>
  );
};

export default ProductSettings;
