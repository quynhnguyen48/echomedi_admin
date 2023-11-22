import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Page from "components/Page";
import ProductForm from "./components/ProductForm";
import { getProductById } from "services/api/products";
import { formatStrapiArr, formatStrapiObj } from "utils/strapi";

const UpsertProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [editMode] = useState(!!id);
  const [productData, setProductData] = useState();

  useEffect(() => {
    (async () => {
      if (id) {
        try {
          const res = await getProductById(id);
          if (res.data) {
            const product = formatStrapiObj(res.data);
            setProductData({
              ...product,
              images: formatStrapiArr(product?.images),
              brand: formatStrapiObj(product?.brand),
              category: formatStrapiObj(product?.category),
            });
          }
        } catch (error) {
          navigate("/products");
        } finally {
        }
      }
    })();
  }, [id, navigate]);

  return (
    <Page title="Product Management">
      <p className="text-16 mb-4 font-bold">
        {editMode ? "Edit" : "Create New"} Product
      </p>
      {editMode ? (
        productData && <ProductForm data={productData} />
      ) : (
        <ProductForm />
      )}
    </Page>
  );
};

export default UpsertProduct;
