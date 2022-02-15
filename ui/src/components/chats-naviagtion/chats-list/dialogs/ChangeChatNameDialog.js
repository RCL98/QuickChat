import React from "react";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { Button, InputAdornment, OutlinedInput } from "@mui/material";
import SupervisedUserCircleIcon from "@mui/icons-material/SupervisedUserCircle";

import { useDispatch } from "react-redux";

import { chatNameUpdated } from "../../../../reducers/chatsSlice";

import { WsClientContext } from "../../../../app/WsClientContext";
import { CONVERSATION } from "../../../../app/constants";

import DraggablePaperComponent from "../../../../app/DraggablePaperComponent";

export default function ChangeChatNameDialog(props) {
  const [chatName, setChatName] = React.useState(props.chat?.name);

  const wsClient = React.useContext(WsClientContext).wsClient;

  React.useEffect(() => {
    setChatName(props.chat?.name);
  }, [props.chat]);

  const dispatch = useDispatch();

  const handleChatNameChange = (event) => setChatName(event.target.value);

  const handleAccept = async () => {
    const updatedChat = {
      id: props.chat.id,
      name: chatName,
    };
    wsClient.send(
      props.chat.type === CONVERSATION ? "/conversations/change-name" : "/groups/change-name",
      {},
      JSON.stringify(updatedChat)
    );
    dispatch(chatNameUpdated(updatedChat));
    props.open.setter(false);
  };

  const handleClose = () => props.open.setter(false);

  return (
    <div>
      <Dialog
        id="change-chat-name-dialog"
        open={props.open.value}
        onClose={handleClose}
        PaperComponent={DraggablePaperComponent}
      >
        <DialogTitle style={{ cursor: "move" }} id="draggable-chat-details-dialog-title">
          Chat name
        </DialogTitle>

        <DialogContent id="group-name-dialog-context">
          <DialogContentText>
            {`You can change the ${props.chat?.type === CONVERSATION ? "conversation" : "group"}'s name.`}
          </DialogContentText>
          <OutlinedInput
            margin="dense"
            id="chat-name-input-with-icon-adornment"
            sx={{ height: "15%" }}
            fullWidth
            value={chatName}
            variant="outlined"
            onChange={handleChatNameChange}
            startAdornment={
              <InputAdornment position="start">
                <SupervisedUserCircleIcon fontSize="small" />
              </InputAdornment>
            }
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Ok</Button>
          <Button onClick={handleAccept}>Accept</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
