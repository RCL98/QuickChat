import React from "react";

import Menu from "@mui/material/Menu";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import ListItemButton from "@mui/material/ListItemButton";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction";
import GroupsIcon from "@mui/icons-material/Groups";

import { useDispatch, useSelector } from "react-redux";

import { WsClientContext } from "../../../app/WsClientContext";

import { chatResetNotifications } from "../../../reducers/chatsSlice";

export default function GroupBoxItem(props) {
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
    props.dialogAddUsers.setter(true);
  };

  const handleMenuGetOut = () => {
    setContextMenu(null);
    props.setChosenChat(props.chat);
    props.dialogGetOut.setter(true);
  };

  const handleMenuPushOut = () => {
    setContextMenu(null);
    props.setChosenChat(props.chat);
    props.dialogPushOut.setter(true);
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
    wsClient.send(`/groups/get/${chatId}/user/${profile.sessionId}`, {}, {});
  };

  const getAnchorPosition = () => {
    if (contextMenu !== null) return { top: contextMenu.mouseY, left: contextMenu.mouseX };
    return undefined;
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
          <GroupsIcon />
        </Avatar>
      </ListItemAvatar>
      <Stack sx={{ width: "75%", whiteSpace: "nowrap" }}>
        <Typography variant="h6"> {props.chat.name} </Typography>
        {(() => {
          if (props.chat.lastMessage) {
            return (
              <Stack direction="row" spacing={1} sx={{ textOverflow: "ellipsis", width: "90%", overflow: "hidden" }}>
                <Typography
                  sx={{ display: "inline", width: "fit-content" }}
                  component="span"
                  variant="subtitle1"
                  color="text.primary"
                >
                  {profile.userId !== props.chat.lastMessage.authorId ? props.chat.lastMessage.authorName + ":" : "Me:"}
                </Typography>
                <Typography
                  component="span"
                  variant="subtitle1"
                  color="text.primary"
                  sx={{ width: "fit-content", textOverflow: "ellipsis", overflow: "hidden" }}
                >
                  {props.chat.lastMessage.content}
                </Typography>
              </Stack>
            );
          } else {
            return (
              <Typography sx={{ display: "inline" }} component="span" variant="body2" color="text.primary">
                There are currently no messages in this group.
              </Typography>
            );
          }
        })()}
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
        anchorPosition={getAnchorPosition()}
      >
        <MenuItem onClick={handleMenuGetOut}>Get out of this group</MenuItem>
        <MenuItem onClick={handleMenuAddUsers}>Add new users to group</MenuItem>
        <MenuItem onClick={handleMenuPushOut}>Delete users from group</MenuItem>
        <MenuItem onClick={handleMenuChangeChatName}>Change group's name</MenuItem>
        <MenuItem onClick={handleMenuChangeGroupPhoto}>Change group's photo</MenuItem>
      </Menu>
    </ListItemButton>
  );
}
