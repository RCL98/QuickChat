import React from "react";
import "./styles/App.css";

import { Provider } from "react-redux";
import store from "./app/store";

import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

import ChatRoom from "./components/chat-room/ChatRoom";
import MyAppBar from "./components/app-bar/MyAppBar";
import ChatNavigation from "./components/chats-naviagtion/ChatNavigation";

import { WsClientContextProvider } from "./app/WsClientContext";

export default function App() {
  const [mode, setMode] = React.useState(useMediaQuery("(prefers-color-scheme: dark)") ? "light" : "dark");

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: mode,
          secondary: {
            main: "#e65100",
          },
        },
        components: {
          MuiAppBar: {
            defaultProps: {
              enableColorOnDark: true,
            },
          },
        },
      }),
    [mode]
  );

  const lightingMode = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Provider store={store}>
        <WsClientContextProvider>
          <MyAppBar lightingMode={lightingMode} />
          <div className="AppContainer">
            <div className="ChatsNavigation">
              <ChatNavigation />
            </div>

            <div className="ChatRoom">
              <ChatRoom />
            </div>
          </div>
        </WsClientContextProvider>
      </Provider>
    </ThemeProvider>
  );
}
