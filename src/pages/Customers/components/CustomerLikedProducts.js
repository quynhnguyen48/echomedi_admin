import { useEffect, useState } from "react";

import DataItem from "components/DataItem";
import Drawer from "components/Drawer";
import Price from "components/Price";
import { getListProducts } from "services/api/products";
import { getStrapiMedia } from "utils/media";
import { formatStrapiArr } from "utils/strapi";

const CustomerLikedProducts = ({ openDrawer, onClose, productIds = [] }) => {
	const [products, setProducts] = useState([]);

	useEffect(() => {
		(async () => {
			try {
				const res = await getListProducts({ pageSize: 1000 }, { id: { $in: productIds } });
				if (res.data) {
					let productList = formatStrapiArr(res.data);
					productList =
						Array.isArray(productList) &&
						productList?.map((product) => ({
							...product,
							images: formatStrapiArr(product?.images),
						}));
					setProducts(productList);
				}
			} catch (error) {
			} finally {
			}
		})();
	}, [productIds]);

	return (
		<Drawer open={openDrawer} onClose={onClose}>
			<DataItem icon="like" title="Liked Products" value={`${products?.length || 0} Products`} />
			<div className="mt-8 grid grid-cols-3 gap-x-4 gap-y-6">
				{Array.isArray(products) &&
					products?.map((product) => (
						<div key={product?.id}>
							<img
								className="w-full h-45 object-cover rounded-xl bg-primary"
								src={product?.images?.[0] && getStrapiMedia(product?.images?.[0])}
								alt={product?.title}
							/>
							<p className="text-16 font-bold mt-4">{product?.title || ""}</p>
							<Price
								className="text-14 mt-1"
								price={product?.variants?.[0]?.discountPrice || product?.variants?.[0]?.price}
							/>
						</div>
					))}
			</div>
		</Drawer>
	);
};

export default CustomerLikedProducts;
