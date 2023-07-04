import classNames from "classnames";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify"
import cloneDeep from "lodash/cloneDeep"

import Button from "components/Button";
import Icon from "components/Icon";
import Page from "components/Page";
import SearchInput from "components/SearchInput";
import { getListUsers, updateUser } from "services/api/users"
import { resetPageIndex } from "slice/tableSlice";
import { getErrorMessage } from "utils/error"
import CustomerAnalytics from "./components/CustomerAnalytics";
import CustomersTable from "./components/CustomersTable";
import CustomerDetail from "./CustomerDetail";

const Customers = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [data, setData] = useState([]);
  const [listUsers, setListUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [detailData, setDetailData] = useState();
  const [searchKey, setSearchKey] = useState();
  const fetchIdRef = useRef(0);

  const fetchData = useCallback(
    ({ pageSize, pageIndex }) => {
      const fetchId = ++fetchIdRef.current;
      setLoading(true);
      const key = new RegExp(searchKey, "i");
      const users = searchKey?.length
        ? listUsers?.filter(
            (user) =>
              `${user?.firstName} ${user?.lastName}`.search(key) > -1 ||
              user?.code?.search(key) > -1 ||
              user?.email?.search(key) > -1 ||
              user?.phone?.search(key) > -1
          )
        : listUsers;
      if (users && fetchId === fetchIdRef.current) {
        const startRow = pageSize * pageIndex;
        const endRow = startRow + pageSize;
        setData(users.slice(startRow, endRow));
        setPageCount(Math.ceil(users.length / pageSize));
        setLoading(false);
      }
    },
    [listUsers, searchKey]
  );

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await getListUsers();
        if (res.data) {
          setListUsers(res.data);
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggleStatus = useCallback(async () => {
    try {
      const res = await updateUser(detailData?.id, {
        blocked: !detailData?.blocked
      })
     if (res?.data) {
       setDetailData(oldDetailData => ({
         ...oldDetailData,
         blocked: res.data.blocked
       }))
       setData(oldData => {
         const newData = cloneDeep(oldData)
         const pos = newData.findIndex(user => user.id === detailData?.id)
         newData[pos].blocked = res.data.blocked
         return newData
       })
       toast.success(`Customer ${res.data.blocked ? 'blocked' : 'unblocked'} successfully!`)
     }
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }, [detailData?.blocked, detailData?.id])

  return (
    <Page
      title="Quản lý khách hàng"
      rightContent={detailData && <CustomerAnalytics data={detailData} />}
      rightContentClassName="pt-30"
    >
      <div className="w-full flex items-center gap-x-9">
        <SearchInput
          placeholder="Search by ID / name / email / phone number"
          className="flex-1"
          onSearch={(value) => {
            dispatch(resetPageIndex());
            setSearchKey(value);
          }}
        />
        <Button
          icon={<Icon name="add-circle" className="fill-white" />}
          onClick={() => {
            navigate("/customers/create");
          }}
        >
          Tạo khách hàng mới
        </Button>
      </div>
      <div
        className={classNames({
          "w-full": !detailData,
          "sm:block flex gap-x-6": detailData,
        })}
      >
        <CustomersTable
          data={data}
          loading={loading}
          pageCount={pageCount}
          activeRow={detailData}
          fetchData={fetchData}
          onClickRow={setDetailData}
        />
        {detailData && <CustomerDetail data={detailData} onToggleStatus={toggleStatus}/>}
      </div>
    </Page>
  );
};

export default Customers;
