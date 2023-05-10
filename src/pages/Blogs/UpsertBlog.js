import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Page from "components/Page";
import BlogForm from "./Components/BlogForm";
import { formatStrapiArr, formatStrapiObj } from "utils/strapi";
import { getBlogById } from "services/api/blogs";

const UpsertBlog = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const [editMode, setEditMode] = useState(!!id);
	const [blogData, setBlogData] = useState(null);

	useEffect(() => {
		(async () => {
			try {
				if (id) {
					setEditMode(true);
					const res = await getBlogById(id);
					if (res.data) {
						const blog = formatStrapiObj(res.data);
						if (blog) {
							setBlogData({
								...blog,
								categories: formatStrapiArr(blog?.categories),
								thumbnail: formatStrapiObj(blog?.thumbnail),
							});
						} else {
							navigate("/blogs");
						}
					}
				}
			} catch (error) {
			} finally {
			}
		})();
	}, [id, navigate]);

	return (
		<Page title="Blog Management" parentUrl="/blogs">
			<p className="text-16 mb-4 font-bold">{editMode ? "Edit" : "Create New"} Blog</p>
			{editMode ? blogData && <BlogForm data={blogData} /> : <BlogForm />}
		</Page>
	);
};

export default UpsertBlog;
