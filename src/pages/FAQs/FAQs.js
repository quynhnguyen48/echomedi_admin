import { useEffect, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { yupResolver } from "@hookform/resolvers/yup/dist/yup";
import Button from "components/Button";
import Icon from "components/Icon";
import Input from "components/Input";
import Page from "components/Page";
import { toast } from "react-toastify";
import * as yup from "yup";
import Textarea from "components/Textarea";
import { getFAQs, updateFAQs } from "services/api/singleTypes";
import { getErrorMessage } from "utils/error";
import { formatStrapiObj } from "utils/strapi";

const FAQs = () => {
	const navigate = useNavigate();
	const [counter, setCounter] = useState(0);

	const validationSchema = yup.object({
		list: yup.array().of(
			yup.object().shape({
				question: yup.object({
					en: yup.string().required("English question is required"),
					vi: yup.string().required("Vietnamese question is required"),
				}),
				answer: yup.object({
					en: yup.string().required("English answer is required"),
					vi: yup.string().required("Vietnamese answer is required"),
				}),
			})
		),
	});

	const {
		handleSubmit,
		control,
		setValue,
		formState: { errors },
	} = useForm({
		resolver: yupResolver(validationSchema),
		defaultValues: {
			list: [],
		},
	});

	const { fields, append, remove } = useFieldArray({
		control,
		name: "list",
	});

	useEffect(() => {
		(async () => {
			try {
				const res = await getFAQs();
				if (res.data) {
					const faqsFormatted = formatStrapiObj(res.data);
					setValue("list", faqsFormatted.list, { shouldDirty: true });
				}
			} catch (error) {
				// toast.error(getErrorMessage(error));
			} finally {
			}
		})();
	}, [setValue]);

	const onSubmit = async (formData) => {
		try {
			await updateFAQs(formData);
			toast.success("FAQs updated successfully!");
		} catch (error) {}
	};

	return (
		<Page title="FaQ">
			<p className="font-bold">FaQ Page</p>
			<div className="w-full mt-4 bg-form rounded-2xl">
				<form onSubmit={handleSubmit(onSubmit)}>
					<div className="h-full">
						{fields.map((item, index) => {
							return (
								<div className="relative" key={item.id}>
									{fields.length > 1 && (
										<Button
											className="absolute bg-red right-6 top-3 h-9"
											onClick={() => remove(index)}
										>
											Remove
										</Button>
									)}
									<div>
										<Controller
											name={`list[${index}].question.en`}
											control={control}
											render={({ field: { onChange, value } }) => (
												<Input
													onChange={onChange}
													value={value}
													className="px-5 pt-6"
													name={`list${index}?.question.en`}
													label={`Question ${index + 1}`}
													placeholder="Input English Question"
													errors={errors?.list?.[index]?.question?.en?.message}
												/>
											)}
										/>
										<Controller
											name={`list[${index}].question.vi`}
											control={control}
											render={({ field: { onChange, value } }) => (
												<Input
													onChange={onChange}
													value={value}
													className="px-5 pt-6"
													name={`list${index}?.question?.vi`}
													placeholder="Input Vietnamese Question"
													errors={errors?.list?.[index]?.question?.vi?.message}
												/>
											)}
										/>
									</div>
									<div>
										<Controller
											name={`list[${index}].answer.en`}
											control={control}
											render={({ field: { onChange, value } }) => (
												<Textarea
													onChange={onChange}
													value={value}
													className="px-5 pt-6"
													textareaClassName="h-[100px]"
													name={`list[${index}].answer.en`}
													label={`Answer ${index + 1}`}
													placeholder="Input English Answer"
													errors={errors?.list?.[index]?.question?.en?.message}
												/>
											)}
										/>
										<Controller
											name={`list[${index}].answer.vi`}
											control={control}
											render={({ field: { onChange, value } }) => (
												<Textarea
													onChange={onChange}
													value={value}
													className="px-5 pt-6"
													textareaClassName="h-[100px]"
													name={`list[${index}].answer.vi`}
													placeholder="Input Vietnamese Answer"
													errors={errors?.list?.[index]?.question?.vi?.message}
												/>
											)}
										/>
									</div>
									<p className="border-b-1 border-primary/30 mt-6" />
								</div>
							);
						})}
					</div>
					<div className="px-5">
						<Button
							type="button"
							className="text-primary flex justify-center w-full mt-2"
							btnSize="auto"
							btnType="text"
							icon={<Icon name="add-circle" className="fill-primary" />}
							onClick={() => {
								setCounter(counter + 1);
								append({ [counter]: counter });
							}}
						>
							Add new FaQ
						</Button>
					</div>

					<div className="flex gap-x-4 p-5">
						<Button className="fill-primary" type="submit">
							Save
						</Button>
						<Button
							btnType="outline"
							type="reset"
							onClick={(e) => {
								navigate(-1);
							}}
						>
							Cancel
						</Button>
					</div>
				</form>
			</div>
		</Page>
	);
};

export default FAQs;
