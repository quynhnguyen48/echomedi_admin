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
  const [product, setProduct] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await getOrderDetail({ id: orderIdSelected });
        if (res.data) {
          setProduct(res.data.product.products);
          let productFormatted = res.data?.product?.cart?.cart_lines;
          setProductList(productFormatted);
        }
      } catch (error) {
      } finally {
      }
    })();
  }, [orderIdSelected])

  return (
    <Drawer open={openDrawer} onClose={onClose}>
      <DataItem
        icon="3dcube"
        title="Product"
        value={`${productList?.length} Products`}
      />
      <div className="mt-8 space-y-2">
        {/* {JSON.stringify(product)} */}
        {Array.isArray(productList) &&
          productList?.map((p) => {
            const product = p.product ?? p.service;
            return (
              <div key={product?.id} className="flex gap-x-4">
                <div className="flex flex-col space-y-2">
                  <span className="text-18 font-bold">
                    {product?.code}
                  </span>
                  <span className="text-18 font-primary">
                    {product?.label }
                  </span>
                  <Price
                    className="text-18"
                    price={product?.price || 0}
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
