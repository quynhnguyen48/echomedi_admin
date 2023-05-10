import { useCallback, useRef, useState } from "react";
import classNames from "classnames";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux"
import { toast } from "react-toastify"

import Button from "components/Button";
import Icon from "components/Icon";
import Page from "components/Page";
import SearchInput from "components/SearchInput";
import { getTreatments, updateTreatment } from "services/api/treatment"
import { formatStrapiArr, formatStrapiObj } from "utils/strapi";
import { resetPageIndex } from "slice/tableSlice"
import TreatmentsTable from "./Components/TreatmentsTable";
import TreatmentDetail from "./TreatmentDetail";
import TreatmentAnalytics from "./Components/TreatmentAnalytics";
import { getErrorMessage } from "../../utils/error"

const Treatments = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
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
                name: { $containsi: searchKey }
              },
            ],
          };
        }
        const res = await getTreatments({
          pageSize: 10,
          page: pageIndex + 1,
        }, filters);
        if (res.data) {
          const listTreatments = formatStrapiArr(res.data);
          setData(
            listTreatments?.map((treatment) => ({
              ...treatment,
              areaImage: formatStrapiObj(treatment?.areaImage),
              background: formatStrapiObj(treatment?.background),
              thumbnail: formatStrapiObj(treatment?.thumbnail),
              categories: formatStrapiArr(treatment?.categories),
              booking: formatStrapiArr(treatment?.booking),
              transactions: formatStrapiArr(treatment?.transactions),
              treatmentHistories: formatStrapiArr(
                treatment?.treatmentHistories
              ),
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
      const res = await updateTreatment(detailData?.id,
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
      toast.success(`Treatment ${!!detailData?.publishedAt ? 'unpublished' : 'published'} successfully!`)
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }, [detailData?.id, detailData?.publishedAt])

  return (
    <Page
      title="Treatment Management"
      rightContent={detailData && <TreatmentAnalytics data={detailData} />}
    >
      <div className="w-full flex items-center gap-x-9">
        <SearchInput
          placeholder="Search by Treatment ID / Treatment Name"
          className="flex-1"
          onSearch={(value) => {
            dispatch(resetPageIndex());
            setSearchKey(value);
          }}
        />
        <Button
          icon={<Icon name="add-circle" className="fill-white" />}
          onClick={() => {
            navigate("/treatments/create");
          }}
        >
          Create New Treatment
        </Button>
      </div>

      <div
        className={classNames({
          "w-full": !detailData,
          "flex gap-x-6": detailData,
        })}
      >
        <TreatmentsTable
          data={data}
          loading={loading}
          pageCount={pageCount}
          activeRow={detailData}
          fetchData={fetchData}
          onClickRow={setDetailData}
        />
        {detailData && <TreatmentDetail data={detailData} onTogglePublish={togglePublish}/>}
      </div>
    </Page>
  );
};

export default Treatments;
