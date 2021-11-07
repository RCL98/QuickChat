import { createSlice } from "@reduxjs/toolkit";

const initialState = [];

const chatsSlice = createSlice({
  name: "chats",
  initialState,
  reducers: {
    chatAdded(state, action) {
      state.push(action.payload);
    },
    chatDeleted(state, action) {
      return state.filter((obj) => {
        return obj.id !== action.payload.id;
      });
    },
    chatNameUpdated(state, action) {
      return state.map((obj) => (obj.id === action.payload.id ? { ...obj, name: action.payload.name } : obj));
    },
    chatPhotoUpdated(state, action) {
      console.log(action);
      return state.map((obj) => (obj.id === action.payload.id ? { ...obj, photo: action.payload.photo } : obj));
    },
  },
});

export const { chatAdded, chatDeleted, chatNameUpdated, chatPhotoUpdated } = chatsSlice.actions;

export default chatsSlice.reducer;
