import { useCallback, useRef, useState } from "react"
import classNames from "classnames"
import { useNavigate } from "react-router-dom"

import Page from "components/Page";
import SearchInput from "components/SearchInput"
import Button from "components/Button"
import Icon from "components/Icon"
import { formatStrapiArr, formatStrapiObj } from "utils/strapi"
import { getTreatmentHistories, updateTreatmentHistory } from "services/api/treatementHistory"

import TreatmentHistoryTable from "./Components/TreatmentHistoryTable"
import TreatmentHistoryDetail from "./TreatmentHistoryDetail"
import TreatmentHistoryInformation from "./Components/TreatmentHistoryInformation"
import { resetPageIndex } from "../../slice/tableSlice"
import { useDispatch } from "react-redux"
import { toast } from "react-toastify"
import { getErrorMessage } from "../../utils/error"

const TreatmentHistory = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [detailData, setDetailData] = useState();
  const [searchKey, setSearchKey] = useState();
  const fetchIdRef = useRef(0);

  const fetchData = useCallback(async ({ pageSize, pageIndex }) => {
    const fetchId = ++fetchIdRef.current;

    if (fetchId === fetchIdRef.current) {
      try {
        setLoading(true);
        let filters = {};
        if (searchKey?.length) {
          setDetailData(null)
          filters = {
            $or: [
              {
                code: { $containsi: searchKey }
              },
              {
                user: {
                  $or: [
                    {
                      firstName: { $containsi: searchKey },
                    },
                    {
                      lastName: { $containsi: searchKey },
                    },
                    {
                      email: { $containsi: searchKey },
                    }
                  ]
                }
              },
            ],
          };
        }
        const res = await getTreatmentHistories({
          pageSize: 10,
          page: pageIndex + 1,
        }, filters);
        if (res.data) {
          const listTreatmentHistories = formatStrapiArr(res.data);
          setData(
            listTreatmentHistories?.map((history) => ({
              ...history,
              user: formatStrapiObj(history.user),
              treatment: formatStrapiObj(history.treatment),
              history: history.history.map(h => ({
                ...h,
                images: formatStrapiArr(h.images)
              }))
            }))
          );

          setPageCount(res?.data?.meta?.pagination?.pageCount);
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    }
  }, [searchKey]);

  const togglePublish = useCallback(async () => {
    try {
      const res = await updateTreatmentHistory(detailData?.id,
        {
          publishedAt: !!detailData?.publishedAt ? null : (new Date()).toISOString()
        }
      )
      let updatedData = formatStrapiObj(res.data)
      setDetailData((oldDetailData) => ({
        ...oldDetailData,
        publishedAt: updatedData?.publishedAt,
      }))
      setData((oldData) => {
        const pos = oldData.findIndex(t => t.id === detailData?.id)
        if (pos > -1) {
          oldData[pos].publishedAt = updatedData?.publishedAt
        }
        return oldData
      })
      toast.success(`Treatment history ${!!detailData?.publishedAt ? 'unpublished' : 'published'} successfully!`)
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }, [detailData?.id, detailData?.publishedAt])

  return (
    <Page title="Treatment History Management" rightContent={detailData && <TreatmentHistoryInformation data={detailData} /> }>
      <div className="w-full flex items-center gap-x-9">
        <SearchInput
          placeholder="Search by History ID / User / Email"
          className="flex-1"
          onSearch={(value) => {
            dispatch(resetPageIndex());
            setSearchKey(value);
          }}
        />
        <Button
          icon={<Icon name="add-circle" className="fill-white" />}
          onClick={() => {
            navigate("/treatment-history/create");
          }}
        >
          Create New History
        </Button>
      </div>
      <div
        className={classNames({
          "w-full": !detailData,
          "flex gap-x-6": detailData,
        })}
      >
        <TreatmentHistoryTable
          data={data}
          loading={loading}
          pageCount={pageCount}
          activeRow={detailData}
          fetchData={fetchData}
          onClickRow={setDetailData}
        />
        {detailData && <TreatmentHistoryDetail data={detailData} onTogglePublish={togglePublish} />}
      </div>
    </Page>
  )
};

export default TreatmentHistory;
