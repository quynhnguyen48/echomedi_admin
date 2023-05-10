import classNames from "classnames";
import { useCallback, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

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

const Orders = () => {
  const dispatch = useDispatch();

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
            filters = {
              $or: [
                {
                  user: {
                    $or: [
                      { code: { $containsi: searchKey } },
                      { firstName: { $containsi: searchKey } },
                      { lastName: { $containsi: searchKey } },
                      { email: { $containsi: searchKey } },
                    ],
                  },
                },
                { code: { $containsi: searchKey } },
              ],
            };
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
        } finally {
          setLoading(false);
        }
      }
    },
    [searchKey]
  );

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
          return oldData;
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
      setData((oldData) => {
        const pos = oldData.findIndex((t) => t.id === detailData?.id);
        if (pos > -1) {
          oldData.splice(pos, 1);
        }
        return oldData;
      });
      setDetailData(null);
      toast.success(`Order deleted successfully!`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }, [detailData?.id]);

  return (
    <Page title="Quản lý đơn hàng">
      <div className="w-full flex items-center gap-x-9">
        <SearchInput
          placeholder="Search by Order ID / Customer"
          className="flex-1"
          onSearch={(value) => {
            dispatch(resetPageIndex());
            setSearchKey(value);
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
