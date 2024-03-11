import classNames from "classnames"
import dayjs from "dayjs"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { getStrapiMedia } from "utils/media"
import sumBy from "lodash/sumBy"

import Button from "components/Button"
import DataItem from "components/DataItem"
import Icon from "components/Icon"
import Tag from "components/Tag"
import { BRAND_STATUS } from "constants/Brand"
import ProductDescription from "./components/ProductDescription"
import ProductImages from "./components/ProductImages"
import ProductInventory from "./components/ProductInventory"
import ProductVariants from "./components/ProductVariants"

const ProductDetail = ({ data, onTogglePublish, onUpdateProduct }) => {
  const navigate = useNavigate()
  const [openProductDescriptionDrawer, setOpenProductDescriptionDrawer] = useState(false)
  const [openProductImagesDrawer, setOpenProductImagesDrawer] = useState(false)
  const [openProductVariantsDrawer, setOpenProductVariantsDrawer] = useState(false)
  const [openProductInventoryDrawer, setOpenProductInventoryDrawer] = useState(false)

  console.log('data', data)

  return (
    <div className="my-10 w-full">
      <div className="flex items-center gap-x-2">
        <div className="flex items-center flex-1 gap-x-4">
          <div className="w-30">
            <img src={getStrapiMedia(data?.image?.data?.attributes.formats.thumbnail)} alt="Product" />
          </div>
          <div className="flex-1">
            <p className="text-24 font-bold">{data?.code}</p>
            <p className="text-18 break-all">{data?.name}</p>
            <Tag
              className={classNames("mt-4 rounded-lg", {
                "bg-red": !data.publishedAt,
                "bg-green": data.publishedAt,
              })}
              name={data.publishedAt ? BRAND_STATUS.PUBLISHED : BRAND_STATUS.UNPUBLISHED}
            />
          </div>
        </div>
        <div className="flex gap-x-2">
          <Button
            btnSize="auto"
            className="w-10 h-10"
            shape="circle"
            onClick={() => navigate(`/products/${data?.slug}/edit`)}
          >
            <Icon name="edit" />
          </Button>
          <Button
            btnSize="auto"
            className={`w-10 h-10 ${data?.publishedAt ? "bg-red" : "bg-green"}`}
            shape="circle"
            onClick={onTogglePublish}
          >
            <Icon name="slash" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-2 grid-flow-row gap-y-2 mt-12">
        <div className="my-4 col-span-2">
          <div className="flex flex-row align-center">
            <span className="font-bold mt-1">Danh sách thuốc:</span>
          </div>
          <ol style={{ listStyleType: "decimal", marginLeft: "30px" }}>
            {Array.isArray(data?.medicines?.data) && data?.medicines?.data?.map(item => <li>{item.attributes.label}</li>)}
          </ol>
        </div>
        <DataItem icon="key" title="Product ID" value={data?.code} />
        <DataItem
          icon="sidebar/check-in-active"
          title="Created Date"
          value={dayjs(data?.createdAt).format("DD MMMM, YYYY")}
        />

        <DataItem icon="3dcube" title="Product Title" value={data?.title} />

        <DataItem
          icon="menu-board"
          title="Product Description"
          valueClassName="truncate overflow-hidden"
          value={data?.shortDescription}
          footer={
            <Button
              className="mt-2"
              btnSize="small"
              onClick={() => setOpenProductDescriptionDrawer(true)}
            >
              View Detail
            </Button>
          }
        />
        <DataItem
          icon="gallery"
          title="Product Images"
          value={`${data?.images?.length} image(s)`}
          footer={
            <Button
              className="mt-2"
              btnSize="small"
              onClick={() => setOpenProductImagesDrawer(true)}
            >
              View Detail
            </Button>
          }
        />

        <DataItem
          icon="3d-square"
          title="Variants & Price"
          value={`${data?.variants?.length} variants`}
          valueClassName="capitalize"
          footer={
            <Button
              btnSize="small"
              className="mt-2"
              onClick={() => setOpenProductVariantsDrawer(true)}
            >
              View Detail
            </Button>
          }
        />

        <DataItem
          icon="bag"
          title="Inventory"
          value={sumBy(data?.variants, (variant) => parseInt(variant.inventory))}
          footer={
            <Button
              className="mt-2"
              btnSize="small"
              onClick={() => setOpenProductInventoryDrawer(true)}
            >
              View Detail
            </Button>
          }
        />
        <DataItem
          icon="tag-right"
          title="Category & Brand"
          value={
            <div>
              <p>{data?.category?.name}</p>
              <p>{data?.brand?.name}</p>
            </div>
          }
          valueClassName="capitalize"
        />
      </div>

      <ProductImages
        images={data?.images}
        openDrawer={openProductImagesDrawer}
        onClose={() => setOpenProductImagesDrawer(false)}
      />
      <ProductVariants
        variants={data?.variants}
        openDrawer={openProductVariantsDrawer}
        onClose={() => setOpenProductVariantsDrawer(false)}
      />
      <ProductDescription
        detail={data}
        openDrawer={openProductDescriptionDrawer}
        onClose={() => setOpenProductDescriptionDrawer(false)}
      />
      <ProductInventory
        productId={data?.id}
        variants={data?.variants}
        inventory={sumBy(data?.variants, (variant) => parseInt(variant.inventory))}
        inventoryHistories={data?.inventory_histories}
        onUpdate={onUpdateProduct}
        openDrawer={openProductInventoryDrawer}
        onClose={() => setOpenProductInventoryDrawer(false)}
      />
    </div>
  )
}

export default ProductDetail
