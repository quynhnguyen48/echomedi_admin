import qs from "qs";
import dayjs from "dayjs";

import axios from "../axios";
import { NEW_RANGES } from "constants/Dashboard";
import { ORDER_STATUS } from "constants/Order";

export const getOrderDetail = (data) => {
  return axios.get('/orders/getOrderDetail/' + data.id);
}

export const createNewOrder = (data) => {
  return axios.post("/orders", {
    data,
  });
};

export const getListOrders = (pagination, filters) => {
  const query = qs.stringify({
    filters,
    populate: ['users_permissions_user', 'users_permissions_user.patient'],
    sort: ["createdAt:DESC"],
    pagination,
  });

  return axios.get(`/orders?${query}`);
};

export const updateOrder = (id, data) => {
  return axios.put(`/orders/${id}`, {
    data,
  });
};

export const deleteOrder = (id) => {
  return axios.delete(`/orders/${id}`);
};

export const countNewOrders = () => {
  return axios.post(`/orders/count`, {
    query: {
      createdAt: {
        $gte: dayjs().subtract(1, "days").startOf("day").toISOString(),
      },
      status: {
        $in: [ORDER_STATUS.COMPLETED]
      }
    },
  });
};
