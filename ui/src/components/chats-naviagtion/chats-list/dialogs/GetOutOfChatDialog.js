import React from "react";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { Button, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import { useSelector, useDispatch } from "react-redux";

import DraggablePaperComponent from "../../../../app/DraggablePaperComponent";
import { GROUP } from "../../../../app/constants";
import { WsClientContext } from "../../../../app/WsClientContext";

import { currentChatChanged } from "../../../../reducers/profileSlice";
import { chatDeleted } from "../../../../reducers/chatsSlice";
import { updateMessagesList } from "../../../../reducers/messagesSlice";
import { usersListUpdated } from "../../../../reducers/usersSlice";

export default function GetOutOfChatDialog(props) {
  const wsClient = React.useContext(WsClientContext).wsClient;

  const currentChatId = useSelector((state) => state.profile.currentChatId);

  const dispatch = useDispatch();

  const handleGetOut = () => {
    if (wsClient) {
      wsClient.send(
        props.chat.type === GROUP ? `/groups/get-out/${props.chat.id}` : `/conversations/get-out/${props.chat.id}`
      );
      if (currentChatId === props.chat.id) {
        dispatch(updateMessagesList([]));
        dispatch(usersListUpdated([]));
        dispatch(chatDeleted({ id: props.chat.id }));
        dispatch(currentChatChanged({ id: null, type: GROUP }));
      }
    }
    props.open.setter(false);
  };

  const handleClose = () => {
    props.open.setter(false);
  };

  return (
    <div style={{ overflowY: "hidden", height: "min-content" }}>
      <Dialog
        open={props.open.value}
        onClose={handleClose}
        id="get-out-chat-dialog"
        PaperComponent={DraggablePaperComponent}
        sx={{ overflowY: "hidden", height: "100%" }}
      >
        <DialogTitle style={{ cursor: "move" }} id="draggable-add-new-users-dialog-title">
          Confirmation
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent id="add-new-users-dialog-context" sx={{ overflow: "hidden", height: "100%" }}>
          <DialogContentText>Are you sure you want to get out of this chat?</DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleGetOut}>Yes</Button>
          <Button onClick={handleClose}>No</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
