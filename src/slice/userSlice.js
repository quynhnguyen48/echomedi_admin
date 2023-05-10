import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    currentUser: null,
    avatar: null,
    deliveryBook: {
      province: null,
      district: null,
      ward: null,
      address: "",
    },
    appointmentToday: null,
    savedBlogs: [],
    likedProducts: [],
    likedServices: [],
    bookings: [],
    transactions: [],
    activeCards: [],
    archivedCards: [],
    staffRoles: [],
  },
  reducers: {
    setDeliveryBook: (state, action) => {
      state.deliveryBook = action.payload;
    },
    setAppointmentToday: (state, action) => {
      state.appointmentToday = action.payload;
    },
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
      state.likedProducts = action.payload?.productWishlist || [];
      state.likedServices = action.payload?.serviceWishlist || [];
      state.savedBlogs = action.payload?.savedBlog || [];
      state.avatar = action.payload?.avatar;
    },
    setAvatar: (state, action) => {
      state.avatar = action.payload;
    },
    setBookings: (state, action) => {
      state.bookings = action.payload || [];
    },
    setTransactions: (state, action) => {
      state.transactions = action.payload || [];
    },
    setActiveCards: (state, action) => {
      state.activeCards = action.payload || [];
    },
    setArchivedCards: (state, action) => {
      state.archivedCards = action.payload || [];
    },
    setStaffRoles: (state, action) => {
      state.staffRoles = action.payload || [];
    },
  },
});

export const {
  reducer: userReducer,
  actions: {
    setLoggedIn,
    setDeliveryBook,
    setAppointmentToday,
    setCurrentUser,
    setAvatar,
    setBookings,
    setTransactions,
    setActiveCards,
    setArchivedCards,
    setStaffRoles,
  },
} = userSlice;
