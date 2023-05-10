import { combineReducers } from "redux";
import { userReducer } from "slice/userSlice";
import { orderReducer } from "slice/orderSlice";
import { treatmentsReducer } from "slice/treatmentsSlice";
import { createBookingReducer } from "slice/createBookingSlice";
import { productReducer } from "slice/productSlice";
import { notificationReducer } from "slice/notificationSlice";
import { languageReducer } from "slice/languageSlice";
import { tableReducer } from "slice/tableSlice";

export default combineReducers({
  user: userReducer,
  order: orderReducer,
  treatment: treatmentsReducer,
  createBooking: createBookingReducer,
  product: productReducer,
  notification: notificationReducer,
  language: languageReducer,
  table: tableReducer,
});
