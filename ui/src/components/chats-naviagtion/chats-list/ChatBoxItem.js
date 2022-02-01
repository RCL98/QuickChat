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
import Badge from "@mui/material/Badge";
import MailIcon from "@mui/icons-material/Mail";
import GroupsIcon from "@mui/icons-material/Groups";
import { makeStyles } from "@mui/styles";

import { useDispatch, useSelector } from "react-redux";

import { WsClientContext } from "../../../app/WsClientContext";
import { CONVERSATION } from "../../../app/constants";

import { chatResetNotifications } from "../../../reducers/chatsSlice";

const chatBoxStyles = makeStyles((theme) => ({
  chatBox: {
    borderRadius: "20px",
    borderStyle: "outset",
  },
}));

export default function ChatBoxItem(props) {
  const [contextMenu, setContextMenu] = React.useState(null);
  const sessionId = useSelector((state) => state.profile.sessionId);
  const wsClient = React.useContext(WsClientContext);
  const classes = chatBoxStyles();

  const dispatch = useDispatch();

  const handleContextMenu = (event) => {
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
    props.setChosenChat(props.chat);
    props.dialogName.setter(true);
  };

  const handleMenuChangeGroupPhoto = (event) => {
    setContextMenu(null);
    props.setChosenChat(props.chat);
    props.dialogPhoto.setter(true);
  };

  const handleClickedItem = async (chatId, type) => {
    console.log(chatId, type);
    dispatch(chatResetNotifications({ chatId }));
    if (type === CONVERSATION) wsClient.send(`/conversations/get/${chatId}/user/${sessionId}`, {}, {});
    else wsClient.send(`/groups/get/${chatId}/user/${sessionId}`, {}, {});
  };

  return (
    <ListItem
      disablePadding
      onContextMenu={handleContextMenu}
      className={classes.chatBox}
      secondaryAction={
        props.chat.notifications !== 0 ? (
          <Badge badgeContent={props.chat.notifications} color="success">
            <MailIcon color="action" fontSize="small" />
          </Badge>
        ) : null
      }
    >
      <ListItemButton role={undefined} dense onClick={() => handleClickedItem(props.chat.id, props.chat.type)}>
        <ListItemAvatar>
          <Avatar alt="User Profile Pic" src={props.chat?.photo}>
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
              ? `Change conversation's ${props.chat.name} name`
              : `Change group's ${props.chat.name} name`}
          </MenuItem>
          {props.chat.type !== CONVERSATION ? (
            <MenuItem onClick={handleMenuChangeGroupPhoto}>{`Change group's ${props.chat.name} photo`}</MenuItem>
          ) : null}
        </Menu>
      </ListItemButton>
    </ListItem>
  );
}
