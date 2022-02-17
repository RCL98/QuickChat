import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  username: "Anonymous_" + Math.floor(100000 + Math.random() * 900000).toString(),
  userId: null,
  currentChatId: null,
  isTemp: true,
  wsDesktopConnectionOn: false,
  currentChatType: null,
  sessionId: null,
  avatar: null,
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    usernameChanged(state, action) {
      return { ...state, username: action.payload };
    },
    userIdChanged(state, action) {
      return { ...state, userId: action.payload };
    },
    currentChatChanged(state, action) {
      return { ...state, currentChatId: action.payload.id, currentChatType: action.payload.type };
    },
    userStatusChanged(state, action) {
      return { ...state, isTemp: action.payload };
    },
    statusOfWsDesktopChanged(state, action) {
      return { ...state, wsDesktopConnectionOn: action.payload };
    },
    sessionIdChanged(state, action) {
      return { ...state, sessionId: action.payload };
    },
    avatarChanged(state, action) {
      return { ...state, avatar: action.payload };
    },
  },
});

export const {
  usernameChanged,
  userIdChanged,
  currentChatChanged,
  sessionIdChanged,
  avatarChanged,
  userStatusChanged,
  statusOfWsDesktopChanged,
} = profileSlice.actions;

export default profileSlice.reducer;
