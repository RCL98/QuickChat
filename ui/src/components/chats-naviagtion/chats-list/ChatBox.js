import React from "react";

import Menu from "@mui/material/Menu";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import GroupsIcon from "@mui/icons-material/Groups";

import { useSelector } from "react-redux";

import { WsClientContext } from "../../../app/WsClientContext";
import { CONVERSATION } from "../../../app/constants";

export default function ChatBoxItem(props) {
  const [contextMenu, setContextMenu] = React.useState(null);
  const sessionId = useSelector((state) => state.profile.sessionId);
  const wsClient = React.useContext(WsClientContext);

  const handleContextMenu = (event) => {
    console.log(event.target);
    event.preventDefault();
    setContextMenu(
      contextMenu === null
        ? {
            mouseX: event.clientX - 2,
            mouseY: event.clientY - 4,
          }
        : // repeated contextmenu when it is already open closes it with Chrome 84 on Ubuntu
          // Other native context menus might behave different.
          // With this behavior we prevent contextmenu from the backdrop to re-locale existing context menus.
          null
    );
  };

  const handleCloseMenu = () => setContextMenu(null);

  const handleMenuChangeChatName = (event) => {
    setContextMenu(null);
    props.setChatName(props.chat.name);
    props.setChosenChat(props.chat);
    props.dialog.setter(true);
  };

  const handleClickedItem = async (chatId, type) => {
    console.log(chatId, type);
    if (type === CONVERSATION) wsClient.send(`/conversations/get/${chatId}/user/${sessionId}`, {}, {});
    else wsClient.send(`/groups/get/${chatId}/user/${sessionId}`, {}, {});
  };

  return (
    <ListItem disablePadding onContextMenu={handleContextMenu}>
      <ListItemButton role={undefined} dense onClick={() => handleClickedItem(props.chat.id, props.chat.type)}>
        <ListItemAvatar>
          <Avatar alt="User Profile Pic">
            {props.chat.type === CONVERSATION ? <AccountCircleIcon /> : <GroupsIcon />}
          </Avatar>
        </ListItemAvatar>
        <ListItemText id={props.labelId} primary={<Typography variant="h5"> {props.chat.name} </Typography>} />

        <Menu
          open={contextMenu !== null}
          onClose={handleCloseMenu}
          anchorReference="anchorPosition"
          anchorPosition={contextMenu !== null ? { top: contextMenu.mouseY, left: contextMenu.mouseX } : undefined}
        >
          <MenuItem onClick={handleMenuChangeChatName}>
            {props.chat.type === CONVERSATION
              ? `Change conversation's ${props.chat.name}`
              : `Change group's ${props.chat.name}`}
          </MenuItem>
        </Menu>
      </ListItemButton>
    </ListItem>
  );
}
