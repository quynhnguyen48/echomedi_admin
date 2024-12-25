import classNames from "classnames";
import { useCallback, useRef, useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import Select from "components/Select";
import Button from "components/Button";
import Icon from "components/Icon";
import Page from "components/Page";
import SearchInput from "components/SearchInput";
import { deleteOrder, getListOrders, updateOrder } from "services/api/orders";
import { resetPageIndex } from "slice/tableSlice";
import { getErrorMessage } from "utils/error";
import { formatStrapiArr, formatStrapiObj } from "utils/strapi";
import OrdersTable from "./components/OrdersTable";
import OrderDetail from "./OrderDetail";
import { ORDER_STATUS } from "constants/Order";

const Orders = () => {
  const dispatch = useDispatch();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [detailData, setDetailData] = useState();
  const [searchKey, setSearchKey] = useState();
  const [selectedStatus, setSelectedStatus] = useState(ORDER_STATUS.ALL);
  const fetchIdRef = useRef(0);

  const fetchData = useCallback(
    async ({ pageSize, pageIndex }) => {
      const fetchId = ++fetchIdRef.current;

      if (fetchId === fetchIdRef.current) {
        try {
          setLoading(true);
          let filters = {};
          if (searchKey?.length) {
            filters = {};
            filters.$or = [
              { code: { $containsi: searchKey } },
              { paymentMethod: { $containsi: searchKey } },
            ];
          }
          
          
          if (selectedStatus !== ORDER_STATUS.ALL) {
            filters.status = selectedStatus;
          }
          const res = await getListOrders(
            {
              pageSize: 10,
              page: pageIndex + 1,
            },
            filters
          );
          if (res.data) {
            const listOrders = formatStrapiArr(res.data);
            setData(
              listOrders?.map((order) => ({
                ...order,
                user: formatStrapiObj(order.user),
              }))
            );
            setPageCount(res?.data?.meta?.pagination?.pageCount);
          }
        } catch (error) {
          // toast.error("Lỗi khi lấy dữ liệu đơn hàng");
        } finally {
          setLoading(false);
        }
      }
    },
    [searchKey, selectedStatus]
  );

  useEffect(() => {
    dispatch(resetPageIndex());
    fetchData({ pageSize: 10, pageIndex: 0 });
  }, [searchKey, selectedStatus, dispatch, fetchData]);
  const updateStatus = useCallback(
    async (status) => {
      try {
        await updateOrder(detailData?.id, {
          status,
        });
        setDetailData((oldDetailData) => ({
          ...oldDetailData,
          status,
        }));
        setData((oldData) => {
          const pos = oldData.findIndex((t) => t.id === detailData?.id);
          if (pos > -1) {
            oldData[pos].status = status;
          }
          return [...oldData];
        });
        toast.success(`Order status updated successfully!`);
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    },
    [detailData?.id]
  );

  const handleDeleteOrder = useCallback(async () => {
    try {
      await deleteOrder(detailData?.id);
      setData((oldData) => oldData.filter((order) => order.id !== detailData?.id));
      setDetailData(null);
      toast.success(`Order deleted successfully!`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }, [detailData?.id]);

  const orderStatusOptions = Object.entries(ORDER_STATUS).map(([key, value]) => ({
    label: key.charAt(0).toUpperCase() + key.slice(1).toLowerCase(),
    value: value,
  }));

  console.log("data", data);
  return (
    <Page title="Quản lý đơn hàng">
      <div className="w-full grid grid-cols-3 sm:grid-cols-1 items-center gap-4 mb-6">
        <SearchInput
          placeholder="Search by order ID / Phương thức thanh toán"
          className="flex-1"
          onSearch={(value) => {
            dispatch(resetPageIndex());
            setSearchKey(value);
          }}
        />
       <Select
          placeholder="Select Order Status"
          label=""
          wrapperClassName="w-[400px]"
          name="order_status"
          options={orderStatusOptions} 
          value={orderStatusOptions.find((status) => status.value === selectedStatus)}
          onChange={(selectedOption) => {
            setSelectedStatus(selectedOption?.value); 
          }}
        />
        <Button
          icon={<Icon name="add-circle" className="fill-white" />}
          disabled
        >
          Create New Order
        </Button>
      </div>
      <div
        className={classNames({
          "w-full": !detailData,
          "flex gap-x-6": detailData,
        })}
      >
        <OrdersTable
          data={data}
          loading={loading}
          pageCount={pageCount}
          activeRow={detailData}
          fetchData={fetchData}
          onClickRow={setDetailData}
        />
        {detailData && (
          <OrderDetail
            data={detailData}
            onUpdateStatus={updateStatus}
            onDelete={handleDeleteOrder}
          />
        )}
      </div>
    </Page>
  );
};

export default Orders;
