import React, { useEffect } from "react";
import MessageBox from "./MessageBox";

import { useSelector } from "react-redux";

import Box from "@mui/material/Box";
import { makeStyles } from "@mui/styles";

const messagesListStyles = makeStyles((theme) => {
  return {
    messagesList: {
      maxHeight: "100%",
      overflowY: "auto",
    },
    box: {
      width: "100%",
      display: "inline-block",
      visibility: "hidden",
      height: 0,
      float: "left",
    },
  };
});

export default function MessagesList() {
  const messages = useSelector((state) => state.messages);
  const profile = useSelector((state) => state.profile);

  const [currentChat, setCurrentChat] = React.useState(null);
  const [isDown, setIsDown] = React.useState(true);
  const [currentNumberMessages, setCurrentNumberMessages] = React.useState(messages.length);

  const classes = messagesListStyles();

  const handleScroll = (event) => {
    setIsDown(
      ((event.currentTarget.scrollHeight - event.currentTarget.scrollTop - event.currentTarget.clientHeight) /
        event.currentTarget.scrollHeight) *
        100 <=
        8
    );
  };

  useEffect(() => {
    if (currentChat !== profile.currentChatId) {
      setCurrentChat(profile.currentChatId);
      document.getElementById("last").scrollIntoView(true);
    } else if (
      currentNumberMessages < messages.length &&
      (isDown || messages[messages.length - 1].authorId === profile.userId)
    ) {
      setCurrentNumberMessages(messages.length);
      document.getElementById("last").scrollIntoView(true);
    }
  }, [messages, currentChat, profile, isDown, currentNumberMessages]);

  return (
    <div className={classes.messagesList} onScroll={handleScroll}>
      {messages.map((msg) => (
        <MessageBox
          key={msg.id}
          author={{ id: msg.authorId, name: msg.authorName }}
          content={msg.content}
          createdAt={msg.createdAt}
        />
      ))}
      <Box className={classes.box}>
        <div id="last" />
      </Box>
    </div>
  );
}
