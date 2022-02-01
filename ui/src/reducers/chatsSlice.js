import { createSlice } from "@reduxjs/toolkit";

const initialState = [];

const chatsSlice = createSlice({
  name: "chats",
  initialState,
  reducers: {
    chatAdded(state, action) {
      state.push({ ...action.payload, notifications: 0 });
    },
    chatDeleted(state, action) {
      return state.filter((obj) => {
        return obj.id !== action.payload.id;
      });
    },
    chatNewNotification(state, action) {
      return state.map((obj) => (obj.id === action.payload ? { ...obj, notifications: obj.notifications + 1 } : obj));
    },
    chatResetNotifications(state, action) {
      return state.map((obj) => (obj.id === action.payload.chatId ? { ...obj, notifications: 0 } : obj));
    },
    chatNameUpdated(state, action) {
      return state.map((obj) => (obj.id === action.payload.id ? { ...obj, name: action.payload.name } : obj));
    },
    chatPhotoUpdated(state, action) {
      return state.map((obj) => (obj.id === action.payload.id ? { ...obj, photo: action.payload.photo } : obj));
    },
  },
});

export const {
  chatAdded,
  chatDeleted,
  chatNewNotification,
  chatResetNotifications,
  chatNameUpdated,
  chatPhotoUpdated,
} = chatsSlice.actions;

export default chatsSlice.reducer;
