import classNames from "classnames";
import cloneDeep from "lodash/cloneDeep";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

import Avatar from "components/Avatar";
import Button from "components/Button";
import Icon from "components/Icon";
import Tag from "components/Tag";
import { BRAND_STATUS } from "constants/Brand";
import {
  createProductBrand,
  deleteProductBrand,
  getProductBrands,
  updateProductBrand,
} from "services/api/products";
import { getErrorMessage } from "utils/error";
import { getStrapiMedia } from "utils/media";
import { formatStrapiArr, formatStrapiObj } from "utils/strapi";
import ProductBrandForm from "./ProductBrandForm";

const ProductBrands = () => {
  const [productBrandData, setProductBrandData] = useState();
  const [showProductBrandDrawer, setShowProductBrandDrawer] = useState(false);
  const [productBrands, setProductBrands] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await getProductBrands("preview");
        if (res.data) {
          const brands = formatStrapiArr(res.data);
          setProductBrands(
            brands?.map((brand) => ({
              ...brand,
              logo: formatStrapiObj(brand.logo),
            }))
          );
        }
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    })();
  }, []);

  const upsertProductBrand = useCallback(
    async (formData, isTogglePublish = false) => {
      try {
        let res;
        if (!!productBrandData?.id) {
          res = await updateProductBrand(productBrandData.id, formData);
          if (isTogglePublish) {
            toast.success(
              `Product Brand ${
                !!productBrandData?.publishedAt ? "unpublished" : "published"
              } successfully!`
            );
          } else {
            toast.success("Product Brand updated successfully!");
          }
        } else {
          res = await createProductBrand(formData);
          toast.success("Product Brand created successfully!");
        }
        let updatedData = formatStrapiObj(res.data);
        updatedData = {
          ...updatedData,
          logo: formatStrapiObj(updatedData.logo),
        };

        setProductBrands((oldBrands) => {
          let newCategories = cloneDeep(oldBrands);
          const pos = newCategories.findIndex((c) => c.id === updatedData.id);
          if (pos > -1) {
            newCategories[pos] = updatedData;
          } else {
            newCategories.push(updatedData);
          }
          return newCategories;
        });
        setShowProductBrandDrawer(false);
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    },
    [productBrandData?.id, productBrandData?.publishedAt]
  );

  const handleDeleteBrand = useCallback(async (brand) => {
    try {
      await deleteProductBrand(brand.id);
      setProductBrands((oldBrands) => {
        let newCategories = cloneDeep(oldBrands);
        const pos = newCategories.findIndex((c) => c.id === brand.id);
        if (pos > -1) {
          newCategories.splice(pos, 1);
        }
        return newCategories;
      });
      toast.success("Product Brand removed successfully!");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }, []);

  const togglePublish = useCallback(async () => {
    await upsertProductBrand(
      {
        publishedAt: !!productBrandData?.publishedAt
          ? null
          : new Date().toISOString(),
      },
      true
    );
  }, [productBrandData?.publishedAt, upsertProductBrand]);

  return (
    <div className="relative">
      <p className="font-bold">Product Brands</p>
      <p className="text-32 mt-10">
        <span className="text-primary font-bold">
          {productBrands?.length || 0}
        </span>{" "}
        Brands
      </p>
      <div
        className="mt-6 pb-6 space-y-4 overflow-y-auto"
        style={{ height: "calc(100vh - 335px)" }}
      >
        {productBrands?.map((brand) => (
          <div
            key={brand?.id}
            className="p-4 flex justify-between rounded-xl bg-primary/10 relative"
          >
            <div className="flex space-x-4">
              <Avatar
                size={48}
                src={brand?.logo && getStrapiMedia(brand?.logo)}
                name={brand?.name}
              />
              <div>
                <p className="font-bold">{brand?.name}</p>
                <p className="text-12 mt-1">{brand?.slug}</p>
                <Tag
                  name={
                    brand?.publishedAt
                      ? BRAND_STATUS.PUBLISHED
                      : BRAND_STATUS.UNPUBLISHED
                  }
                  className={classNames("rounded-lg mt-3", {
                    "bg-green": brand?.publishedAt,
                    "bg-red": !brand?.publishedAt,
                  })}
                />
              </div>
            </div>
            <div className="absolute right-4 top-4 space-y-2">
              <Button
                type="button"
                btnSize="auto"
                className="bg-red w-10 h-10"
                shape="circle"
                onClick={() => handleDeleteBrand(brand)}
              >
                <Icon name="trash" className="fill-white" />
              </Button>
              <Button
                type="button"
                btnSize="auto"
                className="bg-primary w-10 h-10"
                shape="circle"
                onClick={() => {
                  setProductBrandData(brand);
                  setShowProductBrandDrawer(true);
                }}
              >
                <Icon name="edit" className="fill-white" />
              </Button>
            </div>
          </div>
        ))}
      </div>
      <div className="sticky bottom-0 bg-white border-t-1 py-6 border-primary/30 text-center">
        <Button
          btnType="text"
          btnSize="auto"
          icon={<Icon name="add-circle" className="fill-primary w-6 h-6" />}
          onClick={() => {
            setProductBrandData(null);
            setShowProductBrandDrawer(true);
          }}
        >
          <span className="text-16 text-green2">Add new Brand</span>
        </Button>
      </div>
      <ProductBrandForm
        brand={productBrandData}
        openDrawer={showProductBrandDrawer}
        onClose={() => {
          setProductBrandData(null);
          setShowProductBrandDrawer(false);
        }}
        onUpsertProductBrand={upsertProductBrand}
        onTogglePublish={togglePublish}
      />
    </div>
  );
};

export default ProductBrands;
