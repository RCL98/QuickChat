import React from "react";

import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import { makeStyles } from "@mui/styles";

import { useSelector } from "react-redux";

import ChangeGroupPhotoDialog from "./dialogs/ChangeGroupPhotoDialog";
import ChangeChatNameDialog from "./dialogs/ChangeChatNameDialog";
import AddNewUsersDialog from "./dialogs/AddNewUsersDialog";
import GetOutOfChatDialog from "./dialogs/GetOutOfChatDialog";
import PushUsersOutDialog from "./dialogs/PushUsersOutDialog";
import ConvBoxItem from "./ConvBoxItem";
import GroupBoxItem from "./GroupBoxItem";

import { CONVERSATION } from "../../../app/constants";

const chatsListStyles = makeStyles((theme) => {
  return {
    chatList: {
      overflowY: "auto",
      overflowX: "hidden",
      paddingRight: "1%",
      scrollbarColor: "#6b6b6b #2b2b2b",
      "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
        width: "10px",
        background: "transparent",
      },
      "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
        borderRadius: 8,
        backgroundColor: "#6b6b6b",
        minHeight: 24,
      },
      "&::-webkit-scrollbar-thumb:focus, & *::-webkit-scrollbar-thumb:focus": {
        backgroundColor: "#959595",
      },
      "&::-webkit-scrollbar-thumb:active, & *::-webkit-scrollbar-thumb:active": {
        backgroundColor: "#959595",
      },
      "&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover": {
        backgroundColor: "#959595",
      },
      "&::-webkit-scrollbar-corner, & *::-webkit-scrollbar-corner": {
        backgroundColor: "#2b2b2b",
      },
    },
  };
});

export default function ChatsList(props) {
  const [openNameDialog, setOpenNameDialog] = React.useState(false);
  const [openPhotoDialog, setOpenPhotoDialog] = React.useState(false);
  const [openAddUsersDialog, setOpenAddUsersDialog] = React.useState(false);
  const [openGetOutDialog, setOpenGetOutDialog] = React.useState(false);
  const [openPushOutDialog, setOpenPushOutDialog] = React.useState(false);
  const [chosenChat, setChosenChat] = React.useState(null);

  const chats = useSelector((state) => state.chats);

  const classes = chatsListStyles();

  const renderProperChat = (_chat, _labelId) => {
    if (_chat.type === CONVERSATION) {
      return (
        <ConvBoxItem
          chat={_chat}
          labelId={_labelId}
          dialogName={{ value: openNameDialog, setter: setOpenNameDialog }}
          dialogGetOut={{ value: openGetOutDialog, setter: setOpenGetOutDialog }}
        />
      );
    }
    return (
      <GroupBoxItem
        chat={_chat}
        labelId={_labelId}
        dialogName={{ value: openNameDialog, setter: setOpenNameDialog }}
        dialogPhoto={{ value: openPhotoDialog, setter: setOpenPhotoDialog }}
        dialogAddUsers={{ value: openAddUsersDialog, setter: setOpenAddUsersDialog }}
        dialogGetOut={{ value: openGetOutDialog, setter: setOpenGetOutDialog }}
        dialogPushOut={{ value: openPushOutDialog, setter: setOpenPushOutDialog }}
        setChosenChat={setChosenChat}
      />
    );
  };

  const renderChatsList = () => {
    let renderedChats = chats;
    if (props.filterText !== "") {
      let reg = new RegExp("\\w*" + props.filterText + "\\w*");
      renderedChats = renderedChats.filter((chat) => reg.test(chat.name));
    }

    return (
      <div className={classes.chatList}>
        <List sx={{ width: "100%", maxWidth: "100%", bgcolor: "background.paper" }}>
          {renderedChats.map((chat, index) => {
            const labelId = `chat-list-label-${index}`;
            return (
              <div key={chat.id} style={{ width: "100%", maxWidth: "100%", bgcolor: "background.paper" }}>
                {renderProperChat(chat, labelId)}
                <Divider variant="inset" component="li" />
              </div>
            );
          })}
        </List>
        <ChangeChatNameDialog chat={chosenChat} open={{ value: openNameDialog, setter: setOpenNameDialog }} />
        <ChangeGroupPhotoDialog chat={chosenChat} open={{ value: openPhotoDialog, setter: setOpenPhotoDialog }} />
        <AddNewUsersDialog chat={chosenChat} open={{ value: openAddUsersDialog, setter: setOpenAddUsersDialog }} />
        <GetOutOfChatDialog chat={chosenChat} open={{ value: openGetOutDialog, setter: setOpenGetOutDialog }} />
        <PushUsersOutDialog chat={chosenChat} open={{ value: openPushOutDialog, setter: setOpenPushOutDialog }} />
      </div>
    );
  };

  return renderChatsList();
}
