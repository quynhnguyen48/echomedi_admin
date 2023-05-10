import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";
import classNames from "classnames"

import DataItem from "components/DataItem";
import Button from "components/Button";
import Icon from "components/Icon";
import Tag from "components/Tag"
import { formatDate } from "utils/dateTime"
import { getStrapiMedia } from "utils/media"
import { BRAND_STATUS } from "constants/Brand"
import BlogContentDrawer from "./Components/BlogContentDrawer"

const BlogDetail = ({ data, onTogglePublish }) => {
  const navigate = useNavigate();
  const [visibleBlogContentDrawer, setVisibleBlogContentDrawer] = useState(false)
  const [blogData, setBlogData] = useState(null)

  useEffect(() => {
    setBlogData(data)
  }, [data])

  return (
    <div className="mt-10 w-full pb-6">
      <div className="flex items-center">
        <div className="flex items-center flex-1 gap-x-4">
          <div className="flex items-center justify-center w-27.5 h-27.5 rounded-full bg-primary">
            <Icon name="stickynote" className="w-14 h-14 fill-white" />
          </div>
          <div className="flex-1">
            <p className="text-24 font-bold">{blogData?.code}</p>
            <p className="text-18 mb-4 mt-1 pr-4">{blogData?.title?.en}</p>
            <Tag
              className={classNames({
                "bg-red": !blogData?.publishedAt,
                "bg-green": blogData?.publishedAt,
              })}
              name={
                blogData?.publishedAt
                  ? BRAND_STATUS.PUBLISHED
                  : BRAND_STATUS.UNPUBLISHED
              }
            />
          </div>
        </div>
        <div className="flex gap-x-2">
          <Button
            btnSize="auto"
            className="w-10 h-10"
            shape="circle"
            onClick={() => navigate(`/blogs/${blogData?.id}/edit`)}
          >
            <Icon name="edit" />
          </Button>
          <Button
            btnSize="auto"
            className={`w-10 h-10 ${blogData?.publishedAt ? 'bg-red' : 'bg-green'}`}
            shape="circle"
            onClick={onTogglePublish}
          >
            <Icon name="slash" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-2 grid-flow-row gap-y-20 mt-12">
        <DataItem icon="key" title="Blog ID" value={blogData?.code} />
        <DataItem
          icon="calendar"
          title="Created Date"
          value={formatDate(blogData?.createdAt)}
        />
        <DataItem
          icon="bubble"
          title="Blog Category"
          value={
            data.categories.map(c => <span className="block">{c.name}</span>)
          }
        />
        <DataItem
          icon="menu-board"
          title="Blog Content"
          footer={
            <Button className="mt-2" onClick={() => setVisibleBlogContentDrawer(true)}>View Detail</Button>
          }
        />
        <DataItem
          icon="gallery"
          title="Blog Thumbnail"
          value={<img className="rounded-lg mt-2" src={getStrapiMedia(blogData?.thumbnail)} alt="Thumbnail"/>}
        />
      </div>

      <BlogContentDrawer
        openDrawer={visibleBlogContentDrawer}
        onClose={() => setVisibleBlogContentDrawer(false)}
        blog={data}
      />
    </div>
  );
};

export default BlogDetail;
