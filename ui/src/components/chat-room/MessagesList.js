import React, { useEffect } from "react";
import MessageBox from "./MessageBox";

import { useSelector } from "react-redux";

import { makeStyles } from "@mui/styles";

const messagesListStyles = makeStyles((theme) => {
  return {
    messagesList: {
      maxHeight: "100%",
      overflowY: "auto",
      padding: "1%",
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
      <div className={classes.box}>
        <div id="last" />
      </div>
    </div>
  );
}
