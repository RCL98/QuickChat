import React from "react";

import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";

import { CONVERSATION } from "../../../app/constants";

export default function ChatBox(props) {
  const [contextMenu, setContextMenu] = React.useState(null);

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

  return (
    <div onContextMenu={handleContextMenu}>
      <Typography variant="h5"> {props.chat.name} </Typography>
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
    </div>
  );
}
