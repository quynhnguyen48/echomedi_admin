import { useCallback, useEffect, useState } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import Drawer from "components/Drawer";
import Input from "components/Input";
import Button from "components/Button";
import Icon from "components/Icon";
import ChooseAssetsFromLibraryDrawer from "components/ChooseAssetsFromLibraryDrawer";
import { convertToKebabCase } from "utils/string";
import { getStrapiMedia } from "utils/media";

const ProductBrandForm = ({
	openDrawer,
	onClose,
	onUpsertProductBrand,
	onTogglePublish,
	brand,
}) => {
	const [visibleChooseAssetsFromLibraryDrawer, setVisibleChooseAssetsFromLibraryDrawer] =
		useState(false);
	const [editMode, setEditMode] = useState(!!brand);
	const validationSchema = yup.object({
		name: yup.string().required("Brand name is required"),
		slug: yup.string().required("Slug is required"),
		logo: yup.object().nullable(),
	});

	const {
		handleSubmit,
		control,
		setValue,
		reset,
		formState: { errors },
	} = useForm({
		resolver: yupResolver(validationSchema),
		defaultValues: {
			name: brand?.name || "",
			slug: brand?.slug || "",
			logo: brand?.logo || null,
		},
	});

	const brandTitle = useWatch({ control: control, name: "name" });

	useEffect(() => {
		if (brandTitle !== brand?.title?.en) {
			setValue("slug", convertToKebabCase(brandTitle));
		}
	}, [brand?.title, brandTitle, setValue]);

	useEffect(() => {
		setEditMode(!!brand);
		if (!!brand) {
			setValue("name", brand?.name);
			setValue("slug", brand?.slug);
			setValue("logo", brand?.logo);
		}
	}, [brand, setValue]);

	const handleClose = useCallback(() => {
		reset();
		onClose();
	}, [onClose, reset]);

	const handleAssetsSelected = (asset) => {
		setValue("logo", asset, { shouldValidate: true, shouldDirty: true });
	};

	const onSubmit = (formData) => {
		onUpsertProductBrand(formData);
	};

	return (
		<Drawer open={openDrawer} onClose={handleClose}>
			<p className="text-18 font-bold">{editMode ? "Edit" : "Create New"} Product Brand</p>
			<form className="mt-6" onSubmit={handleSubmit(onSubmit)}>
				<div className="space-y-6">
					<Controller
						name="name"
						control={control}
						render={({ field: { onChange, value } }) => (
							<Input
								inputClassName="bg-gray2"
								value={value}
								onChange={onChange}
								name="name"
								label="Brand Title"
								placeholder="Brand title"
								errors={errors?.name?.message}
							/>
						)}
					/>
					<Controller
						name="slug"
						control={control}
						render={({ field: { onChange, value } }) => (
							<Input
								inputClassName="bg-gray2"
								value={value}
								onChange={onChange}
								name="slug"
								label="Brand Slug"
								placeholder="Brand slug"
								errors={errors?.slug?.message}
							/>
						)}
					/>
					<Controller
						name="logo"
						control={control}
						render={({ field: { value } }) =>
							!!value?.id ? (
								<div className="w-fit relative bg-media flex justify-center p-4 mt-6">
									<button
										className="absolute z-10 top-2 right-2"
										onClick={() => setValue("logo", null)}
									>
										<Icon name="close-circle" className="fill-red bg-white rounded-full" />
									</button>
									<img src={getStrapiMedia(value)} alt="Brand" />
								</div>
							) : (
								<div className="mt-6">
									<button
										type="button"
										className="inline-flex items-center justify-center rounded-xl bg-background w-40 h-40"
										onClick={() => setVisibleChooseAssetsFromLibraryDrawer(true)}
									>
										<Icon name="gallery" className="fill-gray w-6 h-6" />
									</button>
									{errors?.logo && (
										<p className="text-12 text-error mt-1">{errors?.logo?.message}</p>
									)}
								</div>
							)
						}
					/>
				</div>
				<div className="flex items-center justify-between gap-x-4 mt-10">
					<div className="flex gap-x-4">
						<Button className="fill-primary" type="submit">
							Save
						</Button>
						<Button btnType="outline" type="button" onClick={handleClose}>
							Cancel
						</Button>
					</div>
					<Button
						type="button"
						btnType="outline"
						className={`border-${brand?.publishedAt ? "red" : "primary"} text-${
							brand?.publishedAt ? "red" : "primary"
						}`}
						onClick={onTogglePublish}
					>
						{brand?.publishedAt ? "Unpublish" : "Publish"}
					</Button>
				</div>
			</form>

			<ChooseAssetsFromLibraryDrawer
				openDrawer={visibleChooseAssetsFromLibraryDrawer}
				onClose={() => setVisibleChooseAssetsFromLibraryDrawer(false)}
				onFinish={handleAssetsSelected}
			/>
		</Drawer>
	);
};

export default ProductBrandForm;
