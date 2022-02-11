import { createSlice } from "@reduxjs/toolkit";

const initialState = [];

const chatsSlice = createSlice({
  name: "chats",
  initialState,
  reducers: {
    chatAdded(state, action) {
      state.push({ ...action.payload, notifications: 0, lastMessage: null });
    },
    chatDeleted(state, action) {
      return state.filter((obj) => {
        return obj.id !== action.payload.id;
      });
    },
    chatNewNotification(state, action) {
      return state.map((obj) =>
        obj.id === action.payload.chatId
          ? { ...obj, notifications: obj.notifications + 1, lastMessage: action.payload.message }
          : obj
      );
    },
    chatResetNotifications(state, action) {
      return state.map((obj) => (obj.id === action.payload.chatId ? { ...obj, notifications: 0 } : obj));
    },
    chatUpdateLastMessage(state, action) {
      console.log(action.payload);
      if (action.payload.hasOwnProperty("message")) {
        return state.map((chat) =>
          chat.id === action.payload.chatId ? { ...chat, lastMessage: action.payload.message } : chat
        );
      } else {
        return state.map((chat) =>
          chat.lastMessage.authorId === action.payload.id
            ? { ...chat, lastMessage: { ...chat.lastMessage, authorName: action.payload.name } }
            : chat
        );
      }
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
  chatUpdateLastMessage,
  chatNameUpdated,
  chatPhotoUpdated,
} = chatsSlice.actions;

export default chatsSlice.reducer;
