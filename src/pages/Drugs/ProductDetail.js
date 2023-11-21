import classNames from "classnames"
import dayjs from "dayjs"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { getStrapiMedia } from "utils/media"
import sumBy from "lodash/sumBy"
import { formatDate } from "utils/dateTime"
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

  return (
    <div className="my-10 w-full" id='customer-detail'>
      <div className="flex items-center gap-x-2">
        <div className="flex items-center flex-1 gap-x-4">
          {/* <div className="w-30">
            <img src={getStrapiMedia(data?.images?.[0])} alt="Product" />
          </div> */}
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
        {/* <div className="flex gap-x-2">
          <Button
            btnSize="auto"
            className="w-10 h-10"
            shape="circle"
            onClick={() => navigate(`/products/${data?.id}/edit`)}
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
        </div> */}
      </div>
      <div className="grid grid-cols-2 grid-flow-row gap-y-1 mt-12">
        <DataItem icon="key" title="Product ID" value={data?.code} />


        <DataItem icon="3dcube" title="Tên thuốc" value={data?.label} />


        <DataItem
          icon="3d-square"
          title="Hoạt chất"
          value={data?.ingredient}
          valueClassName="capitalize"
        />

        <DataItem
          icon="bag"
          title="Tồn"
          value={data?.stock + " " + data?.unit}
        />
        <DataItem
          icon="tag-right"
          title="Loại"
          value={
            <div>
              <p>{data?.type}</p>
            </div>
          }
          valueClassName="capitalize"
        />

<DataItem
          icon="calendar"
          title="Lần cuối cập nhật"
          value={
            <div>
              <p>{formatDate(data?.updatedAt)}</p>
            </div>
          }
          valueClassName="capitalize"
        />
      </div>

      {/* <ProductImages
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
      /> */}
    </div>
  )
}

export default ProductDetail
