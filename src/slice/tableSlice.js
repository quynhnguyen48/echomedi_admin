import { createSlice } from "@reduxjs/toolkit";

const tableSlice = createSlice({
  name: "table",
  initialState: {
    isResetPageIndex: null,
  },
  reducers: {
    resetPageIndex: (state, action) => {
      state.isResetPageIndex = new Date();
    },
  },
});

export const {
  reducer: tableReducer,
  actions: { resetPageIndex },
} = tableSlice;
