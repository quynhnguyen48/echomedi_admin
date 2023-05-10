import { createSlice } from '@reduxjs/toolkit'

const notificationSlice = createSlice({
  name: 'notification',
  initialState: {
    notifications: [],
  },
  reducers: {
    setNotifications: (state, action) => {
      state.notifications = action.payload
    },
    setNotificationRead: (state, action) => {
      const notificationSelectedId = action.payload
      const pos = state.notifications.findIndex(
        (notification) => notification.id === notificationSelectedId,
      )
      state.notifications[pos].seen = true
    },
    setAllNotificationsRead: (state) => {
      state.notifications = state.notifications.map((notification) => ({
        ...notification,
        seen: true,
      }))
    },
  },
})

export const {
  reducer: notificationReducer,
  actions: { setNotifications, setNotificationRead, setAllNotificationsRead },
} = notificationSlice
