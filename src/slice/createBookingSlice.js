import { createSlice } from '@reduxjs/toolkit'

const createBookingSlice = createSlice({
  name: 'createBooking',
  initialState: {
    service: {},
    dateTime: {
      date: null,
      time: {},
    },
    isCallBeforeSchedule: false,
    note: null,
    timeSessions: [],
  },
  reducers: {
    resetBooking: (state) => {
      state.service = {}
      state.dateTime = {
        date: null,
        time: {},
      }
      state.isCallBeforeSchedule = false
      state.note = null
    },
    setBookingService: (state, action) => {
      state.service = action.payload
    },
    setBookingDateTime: (state, action) => {
      state.dateTime = action.payload
    },
    setCallBeforeSchedule: (state, action) => {
      state.setCallBeforeSchedule = action.payload
    },
    setBookingNote: (state, action) => {
      state.note = action.payload
    },
    setTimeSessions: (state, action) => {
      state.timeSessions = action.payload
    },
  },
})

export const {
  reducer: createBookingReducer,
  actions: {
    resetBooking,
    setBookingService,
    setBookingDateTime,
    setCallBeforeSchedule,
    setBookingNote,
    setTimeSessions,
  },
} = createBookingSlice
