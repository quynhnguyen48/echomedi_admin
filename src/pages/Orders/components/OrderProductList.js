import { useEffect, useState } from "react"

import DataItem from "components/DataItem";
import Drawer from "components/Drawer";
import Price from "components/Price";
import { getStrapiMedia } from "utils/media";
import { getListProducts } from "services/api/products"
import { getOrderDetail } from "services/api/orders"
import { formatStrapiArr } from "utils/strapi"

const OrderProductList = ({ openDrawer, onClose, products = [], orderIdSelected }) => {
  const [productList, setProductList] = useState([])

  useEffect(() => {
    (async () => {
      try {
        const res = await getOrderDetail({id: orderIdSelected});
        if (res.data) {
          let productFormatted = res.data.product.cart.cart_lines;
          setProductList(productFormatted);
        }
      } catch (error) {
      } finally {
      }
    })();
  }, [orderIdSelected])

  return (
    <Drawer open={openDrawer} onClose={onClose}>
      {/* <DataItem
        icon="3dcube"
        title="Product"
        value={`${products?.length} Products`}
      /> */}
      <div className="mt-8 space-y-2">
        {Array.isArray(productList) &&
          productList?.map((p) => {
            const product = p.product ?? p.service;
            return ( 
              <div key={product?.id} className="flex gap-x-4">
                {/* <img
                  className="w-30 h-30 object-cover rounded-xl bg-primary"
                  src={getStrapiMedia(product?.images?.[0])}
                  alt={product?.label}
                /> */}
                <div className="flex flex-col space-y-2">
                  <span className="text-18 font-bold">
                    {product?.code}
                  </span>
                  <span className="text-18 font-primary">
                    {product?.label}
                  </span>
                  {/* <span className="text-18 font-primary">
                    {`Size: ${product?.variant?.size} | Quantity: ${product?.amount}`}
                  </span> */}
                  <Price
                    className="text-18"
                    price={product?.price}
                  />
                </div>
              </div>
            );
          })}
      </div>
    </Drawer>
  );
};

export default OrderProductList;
