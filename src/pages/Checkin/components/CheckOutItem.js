import { useMemo } from "react";
import dayjs from "dayjs";

import Tag from "components/Tag";
import { getStrapiMedia } from "utils/media";
import Avatar from "components/Avatar";

const CheckoutItem = ({ item, selectCheckout }) => {
	const personName = useMemo(
		() =>
			item?.user ? `${item?.user?.firstName} ${item?.user?.lastName}` : item?.metadata?.personName,
		[item?.metadata?.personName, item?.user]
	);

	return (
		<div
			className="cursor-pointer gap-x-4 p-4 rounded-xl flex bg-primary/10"
			onClick={() => selectCheckout(item)}
		>
			<Avatar
				className="rounded-full object-cover h-12 w-12"
				src={
					item?.user?.avatar
						? getStrapiMedia({ url: item?.user?.avatar })
						: item?.metadata?.detected_image_url
				}
				name={personName}
			/>
			<div className="flex flex-col">
				<span className="font-bold">{personName}</span>
				<span className="text-12 font-bold mt-2">{item?.user?.phone}</span>
				<div className="flex items-center mt-3">
					<Tag name="Checked out" className="!rounded-lg bg-gray4 font-bold" />
					<span className="ml-4 text-14 font-bold">{dayjs(item?.createdAt).format("HH:mm")}</span>
				</div>
			</div>
		</div>
	);
};

export default CheckoutItem;
