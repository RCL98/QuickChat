import { createSlice } from "@reduxjs/toolkit";

const initialState = [];

const messagesSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    updateMessagesList(state, action) {
      return action.payload;
    },
    messageAdded(state, action) {
      state.push(action.payload);
    },
  },
});

export const { updateMessagesList, messageAdded } = messagesSlice.actions;

export default messagesSlice.reducer;
