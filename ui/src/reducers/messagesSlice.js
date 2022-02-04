import { createSlice } from "@reduxjs/toolkit";

const initialState = [];

const messagesSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    clearMessageList(_state, _action) {
      return [];
    },
    updateMessagesList(state, action) {
      return action.payload;
    },
    messageAdded(state, action) {
      state.push(action.payload);
    },
  },
});

export const { updateMessagesList, messageAdded, clearMessageList } = messagesSlice.actions;

export default messagesSlice.reducer;
