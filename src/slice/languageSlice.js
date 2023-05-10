import { createSlice } from '@reduxjs/toolkit'

const languageSlice = createSlice({
  name: 'language',
  initialState: {
    locale: 'en',
  },
  reducers: {
    setLocate: (state, action) => {
      state.locale = action.payload
    },
  },
})

export const {
  reducer: languageReducer,
  actions: { setLocate },
} = languageSlice
