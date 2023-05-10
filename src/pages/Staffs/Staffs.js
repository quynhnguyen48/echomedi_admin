import classNames from "classnames";
import { useCallback, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import Button from "components/Button";
import Icon from "components/Icon";
import Page from "components/Page";
import SearchInput from "components/SearchInput";
import { getListStaffs, updateStaff } from "services/api/staff";
import { resetPageIndex } from "slice/tableSlice";
import { getErrorMessage } from "utils/error";
import StaffAnalytics from "./Components/StaffAnalytics";
import StaffsTable from "./Components/StaffsTable";
import StaffDetail from "./StaffDetail";

const Staffs = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [detailData, setDetailData] = useState();
  const [searchKey, setSearchKey] = useState(null);
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
                  email: { $containsi: searchKey },
                },
              ],
            };
          }
          const res = await getListStaffs(
            {
              pageSize: 10,
              page: pageIndex + 1,
            },
            filters
          );
          if (res.data) {
            setData(res.data);
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

  const toggleBlockStaff = useCallback(async () => {
    try {
      const res = await updateStaff(detailData?.id, {
        blocked: !detailData?.blocked,
      });
      if (res?.data) {
        setDetailData((oldDetailData) => ({
          ...oldDetailData,
          blocked: res.data.blocked,
        }));
        setData((oldData) => {
          const pos = oldData.findIndex((t) => t.id === detailData?.id);
          if (pos > -1) {
            oldData[pos].blocked = res.data.blocked;
          }
          return oldData;
        });
        toast.success(
          `Staff ${res.data.blocked ? "blocked" : "unblocked"} successfully!`
        );
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }, [detailData?.blocked, detailData?.id]);

  return (
    <Page
      title="Quản lý nhân viên"
      rightContent={detailData && <StaffAnalytics data={detailData} />}
    >
      <div className="w-full flex items-center gap-x-9">
        <SearchInput
          placeholder="Search by Staff ID / Email"
          className="flex-1"
          onSearch={(value) => {
            dispatch(resetPageIndex());
            setSearchKey(value);
          }}
        />
        <Button
          icon={<Icon name="add-circle" className="fill-white" />}
          onClick={() => navigate("/staffs/create")}
        >
          Create New Staff
        </Button>
      </div>
      <div
        className={classNames({
          "w-full": !detailData,
          "flex gap-x-6": detailData,
        })}
      >
        <StaffsTable
          data={data}
          loading={loading}
          pageCount={pageCount}
          activeRow={detailData}
          fetchData={fetchData}
          onClickRow={setDetailData}
        />
        {detailData && (
          <StaffDetail
            data={detailData}
            ontToggleBlockStaff={toggleBlockStaff}
          />
        )}
      </div>
    </Page>
  );
};

export default Staffs;
