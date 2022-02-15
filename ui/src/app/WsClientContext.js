import React, { createContext, useState, useEffect } from "react";

import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";

import store from "./store";
import { sessionIdChanged, userIdChanged } from "../reducers/profileSlice";

import * as constants from "./constants";
import LogInDialog from "./LogInDialog";

import axios from "axios";
import connectWebSocketsServer from "./ConnectWebSocketsServer";

// create context
const WsClientContext = createContext();

const WsClientContextProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [openLoginDialog, setOpenLoginDialog] = useState(false);
  const [wsClient, setWsClient] = useState(null);
  const [wsDesktopClient, setWsDesktopClient] = useState(null);

  const createNewTemporaryUser = () => {
    axios
      .post(constants.serverHost + "/user/create", {
        name: store.getState().profile.username,
        timestamp: Date.now(),
      })
      .then(function (response) {
        const sessionId = response.data.sessionId;
        store.dispatch(sessionIdChanged(sessionId));
        store.dispatch(userIdChanged(response.data.id));
        connectWebSocketsServer(sessionId, setWsClient, setIsConnected);
      })
      .catch((error) => console.error(error));
  };

  useEffect(() => {
    axios
      .get(constants.desktopApp + "/is-open")
      .then(function (response) {
        if (response.data === "I'm here") {
          console.log("Desktop app is on!");
          setOpenLoginDialog(true);
        }
      })
      .catch((error) => {
        console.error(error);
        createNewTemporaryUser();
      });
  }, []);

  const whatToRender = () => {
    if (isConnected) {
      // the Provider gives access to the context to its children
      return (
        <WsClientContext.Provider
          value={{
            wsClient: wsClient,
            wsDesktopClient: wsDesktopClient,
            setOpenLoginDialog: setOpenLoginDialog,
          }}
        >
          {children}
        </WsClientContext.Provider>
      );
    }
    return (
      <div
        style={{
          display: "flex",
          top: "50%",
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Stack>
          <h1>QuickChat Client is loading</h1>
          <div style={{ justifyContent: "center", alignItems: "center", display: "flex" }}>
            <CircularProgress size={60} />
          </div>
        </Stack>
      </div>
    );
  };

  return (
    <div id="context-div" style={{ width: "100%", height: "100%" }}>
      {whatToRender()}
      <LogInDialog
        open={{ value: openLoginDialog, setter: setOpenLoginDialog }}
        wsClient={wsClient}
        setWsClient={setWsClient}
        setWsDesktopClient={setWsDesktopClient}
        setIsConnected={setIsConnected}
      />
    </div>
  );
};

export { WsClientContext, WsClientContextProvider };
