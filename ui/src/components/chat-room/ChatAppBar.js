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
  let chat = useSelector((state) => state.chats.find((chat) => chat.id === profile.currentChat));
  if (chat === undefined) chat = { name: "You" };

  const renderUsers = () => {
    if (chat.type !== CONVERSATION)
      if (users.length <= 3)
        return (
          <Typography variant="body1">
            {users.map((user) => (user.isWriting ? `${user.name} is typing` : user.name)).join(", ")}
          </Typography>
        );
      else {
        console.log(users.sort((a, b) => (a.isWriting === b.isWriting ? 0 : a.isWriting ? -1 : 1)));
        return (
          <Typography variant="body1">
            {users
              .sort((a, b) => (a.isWriting === b.isWriting ? 0 : a.isWriting ? -1 : 1))
              .slice(0, 3)
              .map((user) => (user.isWriting ? `${user.name} is typing` : user.name))
              .join(", ") + ", ..."}
          </Typography>
        );
      }
    else if (users[0].isWriting) return <Typography variant="body1">{`${users[0].name} is typing`}</Typography>;
    return null;
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
      <Avatar alt="Profile Pic">{chat.type === CONVERSATION ? <AccountCircleIcon /> : <GroupsIcon />}</Avatar>
      <Stack direction="column">
        <Typography variant="h5">{chat.name}</Typography>
        {renderUsers()}
      </Stack>
    </Stack>
  );
}
