import React, { createContext, useState, useEffect } from "react";

import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";

import store from "./store";
import { updateMessagesList, messageAdded } from "../reducers/messagesSlice";
import {
  usersListUpdated,
  userAdded,
  userDeleted,
  usernameUpdated,
  currentyWritingUpdated,
} from "../reducers/usersSlice";
import {
  chatAdded,
  chatDeleted,
  chatNameUpdated,
  chatNewNotification,
  chatPhotoUpdated,
  chatUpdateLastMessage,
} from "../reducers/chatsSlice";
import { currentChatChanged, sessionIdChanged, userIdChanged } from "../reducers/profileSlice";

import * as constants from "./constants";
import getUsersAvatars from "./getUsersAvatars";

import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import { Buffer } from "buffer";
import axios from "axios";

// create context
const WsClientContext = createContext();

const messageFilter = async (message) => {
  // called when the client receives a STOMP message from the server
  if (message.body) {
    const generalMessage = JSON.parse(message.body);
    switch (generalMessage.messageType) {
      case constants.MESSAGE:
        store.dispatch(messageAdded(generalMessage.content));
        store.dispatch(
          chatUpdateLastMessage({
            chatId: store.getState().profile.currentChatId,
            message: generalMessage.content,
          })
        );
        break;

      case constants.NOTIFICATION:
        store.dispatch(chatNewNotification(generalMessage.content));
        break;

      case constants.NEW_CHAT:
        if (generalMessage.content.type === constants.CONVERSATION) {
          axios
            .get(constants.serverHost + `/photos/get/${generalMessage.content.partnerId}`, {
              responseType: "arraybuffer",
            })
            .then((response) => {
              generalMessage.content.photo =
                "data:image/jpeg;base64," + Buffer.from(response.data, "binary").toString("base64");
              store.dispatch(chatAdded(generalMessage.content));
            })
            .catch((error) => console.error(error));
        } else {
          store.dispatch(chatAdded(generalMessage.content));
        }
        break;

      case constants.UPDATE_GROUP_NAME:
        store.dispatch(chatNameUpdated(generalMessage.content));
        break;

      case constants.UPDATE_GROUP_PHOTO:
        axios
          .get(constants.serverHost + `/photos/group/get/${generalMessage.content}`, {
            responseType: "arraybuffer",
          })
          .then((response) => {
            store.dispatch(
              chatPhotoUpdated({
                id: generalMessage.content,
                photo: "data:image/jpeg;base64," + Buffer.from(response.data, "binary").toString("base64"),
              })
            );
          })
          .catch((error) => console.error(error));
        break;

      case constants.UPDATE_USER_PHOTO:
        axios
          .get(constants.serverHost + `/photos/get/${generalMessage.content.userId}`, {
            responseType: "arraybuffer",
          })
          .then((response) => {
            store.dispatch(
              chatPhotoUpdated({
                id: generalMessage.content.convId,
                photo: "data:image/jpeg;base64," + Buffer.from(response.data, "binary").toString("base64"),
              })
            );
          })
          .catch((error) => console.error(error));
        break;

      case constants.REQUESTED_CHAT:
        store.dispatch(updateMessagesList([]));
        const users = await getUsersAvatars(generalMessage.content.users);
        store.dispatch(usersListUpdated(users));
        store.dispatch(updateMessagesList(generalMessage.content.messages));
        store.dispatch(currentChatChanged({ id: generalMessage.content.id, type: generalMessage.content.type }));
        break;

      case constants.ADD_USER_CHAT:
        store.dispatch(userAdded(generalMessage.content.user));
        break;

      case constants.DELETE_USER_CHAT:
        store.dispatch(userDeleted(generalMessage.content.user));
        break;

      case constants.PUSHED_USER_OUT:
        if (store.getState().profile.currentChatId === generalMessage.content.id) {
          store.dispatch(usersListUpdated([]));
          store.dispatch(updateMessagesList([]));
          store.dispatch(currentChatChanged({ id: null, type: constants.GROUP }));
        }
        store.dispatch(chatDeleted(generalMessage.content));
        alert(`You were pushet out of group ${generalMessage.content.name}`);
        break;

      case constants.UPDATE_CHAT_USER:
        store.dispatch(usernameUpdated(generalMessage.content));
        store.dispatch(chatUpdateLastMessage(generalMessage.content));
        break;

      case constants.UPDATE_WHO_IS_WRITING:
        store.dispatch(currentyWritingUpdated(generalMessage.content));
        break;

      default:
        console.log(`MESSAGE TYPE NOT RECOGNIZED: ${generalMessage.messageType}`);
        break;
    }
  } else {
    console.log("GOT EMPTY MESSAGE!");
  }
};

const WsClientContextProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [wsClient, setWsClient] = useState(null);

  useEffect(() => {
    console.log("Start");
    axios
      .post(constants.serverHost + "/user/create", {
        name: store.getState().profile.username,
        timestamp: Date.now(),
      })
      .then(function (response) {
        const sessionId = response.data.sessionId;
        const userId = response.data.id;

        const ws = new SockJS(`${constants.serverHost}/ws-quick?sessionId=${sessionId}`);
        const client = Stomp.over(ws);

        const connectCallback = function () {
          store.dispatch(sessionIdChanged(sessionId));
          store.dispatch(userIdChanged(userId));
          setIsConnected(true);
          setWsClient(client);
          client.subscribe(`/user/${sessionId}/usertell`, messageFilter);
        };

        const errorCallback = function (error) {
          console.log(error);
        };

        client.connect({}, connectCallback, errorCallback);
      })
      .catch((error) => console.error(error));
  }, []);

  const whatToRender = () => {
    if (isConnected) {
      // the Provider gives access to the context to its children
      return <WsClientContext.Provider value={wsClient}>{children}</WsClientContext.Provider>;
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

  return whatToRender();
};

export { WsClientContext, WsClientContextProvider };
