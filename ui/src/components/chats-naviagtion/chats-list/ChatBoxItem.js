import React from "react";

import Menu from "@mui/material/Menu";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import ListItemButton from "@mui/material/ListItemButton";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import Badge from "@mui/material/Badge";
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction";
import GroupsIcon from "@mui/icons-material/Groups";

import { useDispatch, useSelector } from "react-redux";

import { WsClientContext } from "../../../app/WsClientContext";
import { CONVERSATION } from "../../../app/constants";

import { chatResetNotifications } from "../../../reducers/chatsSlice";

export default function ChatBoxItem(props) {
  const [contextMenu, setContextMenu] = React.useState(null);

  const profile = useSelector((state) => state.profile);

  const wsClient = React.useContext(WsClientContext);

  const dispatch = useDispatch();

  const handleContextMenu = (event) => {
    event.preventDefault();
    setContextMenu(
      contextMenu === null
        ? {
            mouseX: event.clientX - 2,
            mouseY: event.clientY - 4,
          }
        : null
    );
  };

  const handleCloseMenu = () => setContextMenu(null);

  const handleMenuAddUsers = (event) => {
    setContextMenu(null);
    props.setChosenChat(props.chat);
    console.log(props.dialogAddUsers.value);
    props.dialogAddUsers.setter(true);
  };

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
    dispatch(chatResetNotifications({ chatId }));
    if (type === CONVERSATION) wsClient.send(`/conversations/get/${chatId}/user/${profile.sessionId}`, {}, {});
    else wsClient.send(`/groups/get/${chatId}/user/${profile.sessionId}`, {}, {});
  };

  return (
    <ListItemButton
      role={undefined}
      dense
      onContextMenu={handleContextMenu}
      selected={profile.currentChatId === props.chat.id}
      onClick={() => handleClickedItem(props.chat.id, props.chat.type)}
      alignItems="flex-start"
    >
      <ListItemAvatar>
        <Avatar alt="User Profile Pic" src={props.chat?.photo}>
          {props.chat.type === CONVERSATION ? <AccountCircleIcon /> : <GroupsIcon />}
        </Avatar>
      </ListItemAvatar>
      <Stack sx={{ width: "75%" }}>
        <Typography variant="h6"> {props.chat.name} </Typography>
        {props.chat.lastMessage ? (
          <Stack direction="row" spacing={1} sx={{ textOverflow: "ellipsis", width: "90%", overflow: "hidden" }}>
            {props.chat.type !== CONVERSATION ? (
              <Typography
                sx={{ display: "inline", width: "fit-content" }}
                component="span"
                variant="subtitle1"
                color="text.primary"
              >
                {profile.userId !== props.chat.lastMessage.authorId ? props.chat.lastMessage.authorName + ":" : "Me:"}
              </Typography>
            ) : null}
            <Typography
              component="span"
              variant="subtitle1"
              color="text.primary"
              sx={{ width: "fit-content", textOverflow: "ellipsis", overflow: "hidden" }}
            >
              {props.chat.lastMessage.content}
            </Typography>{" "}
          </Stack>
        ) : (
          <Typography sx={{ display: "inline" }} component="span" variant="body2" color="text.primary">
            {`There are currently no messages in this ${props.chat.type === CONVERSATION ? "conversation" : "group"}.`}
          </Typography>
        )}
      </Stack>

      <ListItemSecondaryAction>
        <Stack spacing={1} sx={{ alignItems: "center", justifyContent: "center" }}>
          <div>
            {props.chat.notifications !== 0 ? (
              <Box id="notifications" sx={{ height: "28px" }}>
                <Badge badgeContent={props.chat.notifications} color="success">
                  {/* <MailIcon color="action" fontSize="small" /> */}
                </Badge>
              </Box>
            ) : (
              <Box id="notifications" sx={{ height: "28px" }}>
                {" "}
              </Box>
            )}
          </div>
          <div>
            {props.chat.lastMessage ? (
              <Typography variant="body2">
                {new Date(props.chat.lastMessage.createdAt).toTimeString().substring(0, 5)}
              </Typography>
            ) : null}
          </div>
        </Stack>
      </ListItemSecondaryAction>

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
        {props.chat.type !== CONVERSATION ? (
          <MenuItem onClick={handleMenuAddUsers}>Add new user to chat</MenuItem>
        ) : null}
      </Menu>
    </ListItemButton>
  );
}
