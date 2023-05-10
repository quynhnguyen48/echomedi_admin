import { createSlice } from '@reduxjs/toolkit'

const treatmentsSlice = createSlice({
  name: 'treatments',
  initialState: {
    treatments: [],
  },
  reducers: {
    setTreatments: (state, action) => {
      state.treatments = action.payload
    },
  },
})

export const {
  reducer: treatmentsReducer,
  actions: { setTreatments },
} = treatmentsSlice
