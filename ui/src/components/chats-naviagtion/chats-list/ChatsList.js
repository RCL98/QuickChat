import React from "react";

import List from "@mui/material/List";
import Divider from "@mui/material/Divider";

import { useSelector } from "react-redux";

import ChatBoxItem from "./ChatBoxItem";
import ChangeGroupPhotoDialog from "./ChangeGroupPhotoDialog";
import ChangeChatNameDialog from "./ChangeChatNameDialog";
import AddNewUserDialog from "./AddNewUserDialog";

export default function ChatsList(props) {
  const [openNameDialog, setOpenNameDialog] = React.useState(false);
  const [openPhotoDialog, setOpenPhotoDialog] = React.useState(false);
  const [openAddUsersDialog, setOpenAddUsersDialog] = React.useState(false);

  const [chosenChat, setChosenChat] = React.useState(null);

  const chats = useSelector((state) => state.chats);

  const renderChatsList = () => {
    let renderedChats = chats;
    if (props.filterText !== "") {
      let reg = new RegExp("\\w*" + props.filterText + "\\w*");
      renderedChats = renderedChats.filter((chat) => reg.test(chat.name));
    }
    return (
      <div>
        <List sx={{ width: "100%", maxWidth: "100%", bgcolor: "background.paper" }}>
          {renderedChats.map((chat, index) => {
            const labelId = `chat-list-label-${index}`;
            return (
              <div key={chat.id}>
                <ChatBoxItem
                  chat={chat}
                  labelId={labelId}
                  dialogName={{ value: openNameDialog, setter: setOpenNameDialog }}
                  dialogPhoto={{ value: openPhotoDialog, setter: setOpenPhotoDialog }}
                  dialogAddUsers={{ value: openAddUsersDialog, setter: setOpenAddUsersDialog }}
                  setChosenChat={setChosenChat}
                />
                <Divider variant="inset" component="li" />
              </div>
            );
          })}
        </List>
        <ChangeChatNameDialog chat={chosenChat} open={{ value: openNameDialog, setter: setOpenNameDialog }} />
        <ChangeGroupPhotoDialog chat={chosenChat} open={{ value: openPhotoDialog, setter: setOpenPhotoDialog }} />
        <AddNewUserDialog chat={chosenChat} open={{ value: openAddUsersDialog, setter: setOpenAddUsersDialog }} />
      </div>
    );
  };

  return renderChatsList();
}
