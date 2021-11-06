import React from "react";

import List from "@mui/material/List";

import { useSelector } from "react-redux";

import ChatBoxItem from "./ChatBoxItem";
import ChatChangeDetailsDialog from "./ChatChangeDetailsDialog";

export default function ChatsList(props) {
  const [openDialog, setOpenDialog] = React.useState(false);

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
              <ChatBoxItem
                key={chat.id}
                chat={chat}
                labelId={labelId}
                dialog={{ value: openDialog, setter: setOpenDialog }}
                setChosenChat={setChosenChat}
              />
            );
          })}
        </List>
        <ChatChangeDetailsDialog chat={chosenChat} open={{ value: openDialog, setter: setOpenDialog }} />
      </div>
    );
  };

  return renderChatsList();
}
