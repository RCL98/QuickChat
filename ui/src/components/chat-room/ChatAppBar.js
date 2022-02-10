import React from "react";

import { useSelector } from "react-redux";

import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import GroupsIcon from "@mui/icons-material/Groups";

import { CONVERSATION } from "../../app/constants";

export default function ChatAppBar() {
  const profile = useSelector((state) => state.profile);
  const users = useSelector((state) => state.users).filter((user) => user.id !== profile.userId);
  let chat = useSelector((state) => state.chats.find((_chat) => _chat.id === profile.currentChatId));
  if (chat === undefined) chat = { name: "You" };

  const whoIsWriting = (a, b) => {
    if (a.isWriting === b.isWriting) return 0;
    return a.isWriting ? -1 : 1;
  };

  const renderUsersGroup = () => {
    if (users.length === 0) {
      return <Typography variant="body1"> There is nobody else in the group </Typography>;
    }
    if (users.length <= 3) {
      return (
        <Typography variant="body1">
          {users.map((user) => (user.isWriting ? `${user.name} is typing` : user.name)).join(", ")}
        </Typography>
      );
    }
    return (
      <Typography variant="body1">
        {users
          .sort((a, b) => whoIsWriting(a, b))
          .slice(0, 3)
          .map((user) => (user.isWriting ? `${user.name} is typing` : user.name))
          .join(", ") + ", ..."}
      </Typography>
    );
  };

  const renderUsersConv = () => {
    if (users.length === 0) return <Typography variant="body1"> The other user left the conversation </Typography>;
    if (users[0].isWriting) return <Typography variant="body1">{`${users[0].name} is typing`}</Typography>;
    return null;
  };

  const renderUsers = () => {
    return chat.type === CONVERSATION ? renderUsersConv() : renderUsersGroup();
  };

  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{
        // backgroundColor: "info.main",
        margin: 0,
        height: "100%",
        justifyContent: "left",
        alignItems: "center",
        paddingLeft: "2%",
      }}
    >
      <Avatar alt="Chat Photo" src={chat.photo}>
        {chat.type === CONVERSATION ? <AccountCircleIcon /> : <GroupsIcon />}
      </Avatar>
      <Stack direction="column">
        <Typography variant="h5">{chat.name}</Typography>
        {renderUsers()}
      </Stack>
    </Stack>
  );
}
