import classNames from "classnames";
import { useCallback, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import Button from "components/Button";
import Icon from "components/Icon";
import Page from "components/Page";
import SearchInput from "components/SearchInput";
import { getBlogs, updateBlog } from "services/api/blogs";
import { resetPageIndex } from "slice/tableSlice";
import { getErrorMessage } from "utils/error";
import { formatStrapiArr, formatStrapiObj } from "utils/strapi";
import BlogDetail from "./BlogDetail";
import BlogTable from "./Components/BlogTable";

const Blogs = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [detailData, setDetailData] = useState();
  const [searchKey, setSearchKey] = useState();
  const fetchIdRef = useRef(0);

  const fetchData = useCallback(
    async ({ pageSize, pageIndex }) => {
      const fetchId = ++fetchIdRef.current;

      if (fetchId === fetchIdRef.current) {
        try {
          setLoading(true);
          let filters = {};
          if (searchKey?.length) {
            setDetailData(null);
            filters = {
              $or: [
                {
                  code: { $containsi: searchKey },
                },
                {
                  title: {
                    $or: [
                      {
                        en: { $containsi: searchKey },
                      },
                      {
                        vi: { $containsi: searchKey },
                      },
                    ],
                  },
                },
              ],
            };
          }
          const res = await getBlogs(
            {
              pageSize: 10,
              page: pageIndex + 1,
            },
            filters
          );
          if (res.data) {
            const listBlogs = formatStrapiArr(res.data);
            setData(
              listBlogs?.map((blog) => ({
                ...blog,
                categories: formatStrapiArr(blog?.categories),
                thumbnail: formatStrapiObj(blog?.thumbnail),
              }))
            );

            setPageCount(res?.data?.meta?.pagination?.pageCount);
          }
        } catch (error) {
        } finally {
          setLoading(false);
        }
      }
    },
    [searchKey]
  );

  const togglePublish = useCallback(async () => {
    try {
      const res = await updateBlog(detailData?.id, {
        publishedAt: !!detailData?.publishedAt
          ? null
          : new Date().toISOString(),
      });
      let updatedData = formatStrapiObj(res.data);
      setDetailData((oldDetailData) => ({
        ...oldDetailData,
        publishedAt: updatedData?.publishedAt,
      }));
      setData((oldData) => {
        const pos = oldData.findIndex((t) => t.id === detailData?.id);
        if (pos > -1) {
          oldData[pos].publishedAt = updatedData?.publishedAt;
        }
        return oldData;
      });
      toast.success(
        `Blog ${
          !!detailData?.publishedAt ? "unpublished" : "published"
        } successfully!`
      );
    } catch (error) {
      // toast.error(getErrorMessage(error));
    }
  }, [detailData?.id, detailData?.publishedAt]);

  return (
    <Page title="Blog Management">
      <div className="w-full flex items-center gap-x-9">
        <SearchInput
          placeholder="Search by Blog ID / Title"
          className="flex-1"
          onSearch={(value) => {
            dispatch(resetPageIndex());
            setSearchKey(value);
          }}
        />
        <Button
          icon={<Icon name="add-circle" className="fill-white" />}
          onClick={() => navigate("/blogs/create")}
        >
          Create New Blog
        </Button>
      </div>
      <div
        className={classNames({
          "w-full": !detailData,
          "flex gap-x-6": detailData,
        })}
      >
        <BlogTable
          data={data}
          loading={loading}
          pageCount={pageCount}
          activeRow={detailData}
          fetchData={fetchData}
          onClickRow={setDetailData}
        />
        {detailData && (
          <BlogDetail data={detailData} onTogglePublish={togglePublish} />
        )}
      </div>
    </Page>
  );
};

export default Blogs;
