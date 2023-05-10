import { createSlice } from '@reduxjs/toolkit'

const orderSlice = createSlice({
  name: 'order',
  initialState: {
    products: [],
    deliveryInformation: {},
    paymentMethod: {},
    orderCode: null,
    shippingFee: 0,
    billing: {
      subTotal: 0,
      promotion: 0,
      fee: 0,
      tax: 0,
      total: 0,
    },
  },
  reducers: {
    resetOrder: (state) => {
      state.products = []
      state.paymentMethod = {}
      state.orderCode = null
      state.billing = {
        subTotal: 0,
        promotion: 0,
        fee: 0,
        tax: 0,
        total: 0,
      }
    },
    setShippingFee: (state, action) => {
      state.shippingFee = action.payload
    },
    addProduct: (state, action) => {
      const product = action.payload
      state.products.push(product)
    },
    removeProduct: (state, action) => {
      const product = action.payload
      state.products = state.products.filter((p) => p.id !== product.id)
    },
    removeAllProducts: (state) => {
      state.products = []
    },
    updateProduct: (state, action) => {
      const product = action.payload
      const pos = state.products.findIndex((p) => p.id === product.id)
      state.products[pos] = product
    },
    setDeliveryInformation: (state, action) => {
      state.deliveryInformation = action.payload
    },
    setPaymentMethod: (state, action) => {
      state.paymentMethod = action.payload
    },
    setOrderCode: (state, action) => {
      state.orderCode = action.payload
    },
    setOrderBilling: (state, action) => {
      state.billing = action.payload
    },
  },
})

export const {
  reducer: orderReducer,
  actions: {
    resetOrder,
    setShippingFee,
    addProduct,
    removeProduct,
    removeAllProducts,
    updateProduct,
    setDeliveryInformation,
    setPaymentMethod,
    setOrderCode,
    setOrderBilling,
  },
} = orderSlice
