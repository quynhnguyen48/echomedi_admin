import { createSlice } from '@reduxjs/toolkit'

const productSlice = createSlice({
  name: 'product',
  initialState: {
    filters: {
      price: { code: 'asc', key: 'increase' },
      product: 'all',
    },
  },
  reducers: {
    setProductFilters: (state, action) => {
      state.filters = action.payload
    },
    resetProductFilters: (state, action) => {
      state.filters = {
        price: { code: 'asc', key: 'increase' },
        product: 'all',
      }
    },
  },
})

export const {
  reducer: productReducer,
  actions: { setProductFilters, resetProductFilters },
} = productSlice
