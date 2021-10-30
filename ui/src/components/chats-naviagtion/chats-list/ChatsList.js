import React from "react";

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { Button, InputAdornment, OutlinedInput, Box } from "@mui/material";
import SupervisedUserCircleIcon from "@mui/icons-material/SupervisedUserCircle";

import { useDispatch, useSelector } from "react-redux";
import { chatUpdated } from "../../../reducers/chatsSlice";

import { WsClientContext } from "../../../app/WsClientContext";
import { CONVERSATION } from "../../../app/constants";
import ChatBox from "./ChatBox";

export default function ChatsList(props) {
  const [openDialog, setOpenDialog] = React.useState(false);
  const [chatName, setChatName] = React.useState("");
  const [chosenChat, setChosenChat] = React.useState(null);

  const chats = useSelector((state) => state.chats);
  const sessionId = useSelector((state) => state.profile.sessionId);
  const wsClient = React.useContext(WsClientContext);

  const dispatch = useDispatch();

  // Dialog functions
  const handleDialogClose = () => setOpenDialog(false);

  const handleChatNameChange = (event) => setChatName(event.target.value);

  const handleAcceptChatName = () => {
    const updatedChat = {
      id: chosenChat.id,
      name: chatName,
    };
    wsClient.send(
      chosenChat.type === CONVERSATION ? "/conversations/change-name" : "/groups/change-name",
      {},
      JSON.stringify(updatedChat)
    );
    dispatch(chatUpdated(updatedChat));
  };

  const handleClickedItem = async (chatId, type) => {
    console.log(chatId, type);
    if (type === CONVERSATION) wsClient.send(`/conversations/get/${chatId}/user/${sessionId}`, {}, {});
    else wsClient.send(`/groups/get/${chatId}/user/${sessionId}`, {}, {});
  };

  const renderChatsList = () => {
    let renderedChats = chats;
    if (props.filterText !== "") {
      let reg = new RegExp("\\w*" + props.filterText + "\\w*");
      renderedChats = renderedChats.filter((chat) => reg.test(chat.name));
    }
    return (
      <div>
        <List sx={{ width: "100%", maxWidth: "100%", bgcolor: "background.paper" }}>
          {renderedChats.map((chat, index) => {
            const labelId = `chat-list-label-${index}`;
            return (
              <ListItem key={chat.id} disablePadding>
                <ListItemButton role={undefined} onClick={() => handleClickedItem(chat.id, chat.type)} dense>
                  <ListItemText
                    id={labelId}
                    primary={
                      <ChatBox
                        chat={chat}
                        dialog={{ value: openDialog, setter: setOpenDialog }}
                        setChosenChat={setChosenChat}
                        setChatName={setChatName}
                      />
                    }
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        <Dialog id="change-chat-name-dialog" open={openDialog} onClose={handleDialogClose}>
          <DialogTitle> Details </DialogTitle>

          <DialogContent id="group-name-dialog-context">
            <DialogContentText>Choose the chat name</DialogContentText>
            <Box
              id="group-name"
              sx={{
                height: "min-content",
                padding: "0%",
                width: "100%",
                display: "flex",
                boxSizing: "border-box",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Typography sx={{ flexBasis: "10", marginRight: "1%", marginLeft: "0" }}> Chat name: </Typography>
              <OutlinedInput
                margin="dense"
                id="chat-name-input-with-icon-adornment"
                type="text"
                sx={{
                  flexBasis: "90",
                  margin: "1%",
                  borderRadius: "50px",
                }}
                value={chatName}
                variant="outlined"
                onChange={handleChatNameChange}
                endAdornment={
                  <InputAdornment position="end">
                    <SupervisedUserCircleIcon fontSize="small" />
                  </InputAdornment>
                }
              />
            </Box>
          </DialogContent>

          <DialogActions>
            <Button onClick={handleDialogClose}>Ok</Button>
            <Button onClick={handleAcceptChatName}>Accept</Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  };

  return renderChatsList();
}
