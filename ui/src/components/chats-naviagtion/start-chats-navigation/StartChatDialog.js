import React from "react";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { Button, InputAdornment, OutlinedInput, Typography, Box, IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import SupervisedUserCircleIcon from "@mui/icons-material/SupervisedUserCircle";
import AutorenewIcon from "@mui/icons-material/Autorenew";

import UsersListCheck from "./UsersListCheck";
import DraggablePaperComponent from "../../../app/DraggablePaperComponent";

import { chatAdded } from "../../../reducers/chatsSlice";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";

import axios from "axios";

import { serverHost, GROUP, CONVERSATION } from "../../../app/constants";

// await fetch(serverHost + `/photos/get/${users[i].id}`, {
//   method: "GET",
// })
//   .then((data) => {
//     console.log(data);
//     return data.blob();
//   })
//   .then((data) => {
//     var reader = new FileReader();
//     reader.onload = function () {
//       users[i].avatar = reader.result;
//       // console.log("This is base64", reader.result);
//     };
//     reader.readAsDataURL(data);
//   })
//   .catch((error) => console.error(error));

export default function StartChatDialog(props) {
  const [lookupText, setLookupText] = React.useState("");
  const [checked, setChecked] = React.useState([]);
  const [users, setUsers] = React.useState([]);
  const [renderedUsers, setRenderedUsers] = React.useState([]);
  const [openGroupDetails, setOpenGroupDetails] = React.useState(false);
  const [groupName, setGroupName] = React.useState("");

  const sessionId = useSelector((state) => state.profile.sessionId);

  const dispatch = useDispatch();

  const getUsersAvatars = async (users) => {
    for (let i = 0; i < users.length; i++) {
      await axios
        .get(serverHost + `/photos/get/${users[i].id}`, {
          responseType: "arraybuffer",
        })
        .then((response) => {
          users[i].avatar = "data:image/jpeg;base64," + Buffer.from(response.data, "binary").toString("base64");
        })
        .catch((error) => console.error(error));
    }
    setUsers(users);
    setRenderedUsers(users);
  };

  const getUsersList = () => {
    if (props.open.value) {
      axios
        .get(serverHost + `/users/${sessionId}`)
        .then(function (response) {
          getUsersAvatars(response.data);
        })
        .catch(function (error) {
          console.error(error);
        });
    }
  };

  React.useEffect(getUsersList, [props.open.value, sessionId]);

  const handleToggle = (value) => () => {
    if (props.option.value === "conversation") {
      if (checked[0] !== value) setChecked([value]);
    } else {
      const currentIndex = checked.indexOf(value);
      const newChecked = [...checked];

      if (currentIndex === -1) {
        newChecked.push(value);
      } else {
        newChecked.splice(currentIndex, 1);
      }
      setChecked(newChecked);
    }
  };

  const makeCreateRequest = (path, name, partners, type) => {
    axios
      .post(path, {
        name: name,
        chat: { users: partners },
      })
      .then(function (response) {
        const chatId = response.data.id;
        dispatch(chatAdded({ id: chatId, name: name, type: type }));
      })
      .catch(function (error) {
        console.error(error);
      });
  };

  const startChat = () => {
    let path = serverHost;
    let chatName;
    let type;
    let partners = null;
    switch (props.option.value) {
      case "conversation":
        type = CONVERSATION;
        path += `/conversations/create/${sessionId}/${checked[0]}`;
        chatName = users.find((user) => user.id === checked[0]).name;
        break;
      case "group":
        type = GROUP;
        path += `/groups/create/${sessionId}`;
        partners = users
          .filter((user) => checked.indexOf(user.id) !== -1)
          .map((user) => {
            return { id: user.id };
          });
        chatName = groupName;
        break;
      default:
        console.log(props.option.value);
        break;
    }
    makeCreateRequest(path, chatName, partners, type);
  };

  const handleLookup = (event) => {
    setLookupText(event.target.value);
    if (event.target.value !== "") {
      const reg = new RegExp("\\w*" + event.target.value + "\\w*");
      setRenderedUsers(users.filter((user) => reg.test(user.name)));
    } else {
      setRenderedUsers(users);
    }
  };

  const handleStart = () => (props.option.value === "group" ? setOpenGroupDetails(true) : startChat());

  const handleClose = () => {
    props.open.setter(false);
    props.option.setter(null);
    setChecked([]);
    setUsers([]);
  };

  // Group details dialog functions
  const handleCloseGroupDetails = () => {
    setOpenGroupDetails(false);
    startChat();
    setChecked([]);
    setGroupName("");
  };

  const handleGroupNameChange = (event) => setGroupName(event.target.value);

  return (
    <div style={{ overflowY: "hidden", height: "min-content" }}>
      <Dialog
        open={props.open.value}
        onClose={handleClose}
        id="start-chat-dialog"
        PaperComponent={DraggablePaperComponent}
        sx={{ overflowY: "hidden", height: "100%" }}
      >
        <DialogTitle style={{ cursor: "move" }} id="draggable-start-chat-dialog-title">
          Start a chat
        </DialogTitle>

        <DialogContent id="start-chat-dialog-context" sx={{ overflow: "hidden", height: "100%" }}>
          <DialogContentText>
            {props.option.value === "group"
              ? "Choose some users with which to start a group."
              : "Choose a user with which to start a conversation."}
          </DialogContentText>
          <Box
            id="users-dialog"
            sx={{
              boxSizing: "border-box",
              width: "30vw",
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box
              id="look-up-area"
              sx={{
                flexBasis: "10%",
                boxSizing: "border-box",
              }}
            >
              <div id="top-divider">
                <hr style={{ width: "98%" }} />
              </div>

              <Box
                id="look-up"
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
                <Typography sx={{ flexBasis: "7%", marginRight: "1%", marginLeft: "0" }}> Lookup users: </Typography>
                <OutlinedInput
                  margin="dense"
                  id="lookup-input-with-icon-adornment"
                  type="text"
                  sx={{
                    flexBasis: "90",
                    margin: "1%",
                    borderRadius: "50px",
                  }}
                  value={lookupText}
                  variant="outlined"
                  onChange={handleLookup}
                  endAdornment={
                    <InputAdornment position="end">
                      <SearchIcon fontSize="medium" />
                    </InputAdornment>
                  }
                />
                <IconButton onClick={getUsersList} sx={{ flexBasis: "3%" }}>
                  <AutorenewIcon fontSize="medmium" />
                </IconButton>
              </Box>

              <div id="bottom-divider">
                <hr style={{ width: "98%" }} />
              </div>
            </Box>

            <Box
              id="users-list"
              sx={{
                width: "100%",
                flexBasis: "90%",
                justifyContent: "center",
                alignItems: "center",
                overflowY: "auto",
              }}
            >
              <UsersListCheck users={renderedUsers} checked={checked} handleToggle={handleToggle} />
            </Box>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Ok</Button>
          <Button onClick={handleStart}>Start</Button>
        </DialogActions>
      </Dialog>

      <Dialog id="group-name-dialog" open={openGroupDetails} onClose={handleCloseGroupDetails}>
        <DialogTitle> Details </DialogTitle>

        <DialogContent id="group-name-dialog-context">
          <DialogContentText>Choose the group name and profile picture.</DialogContentText>
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
            <Typography sx={{ flexBasis: "10", marginRight: "1%", marginLeft: "0" }}> Group name: </Typography>
            <OutlinedInput
              margin="dense"
              id="group-name-input-with-icon-adornment"
              type="text"
              sx={{
                flexBasis: "90",
                margin: "1%",
                borderRadius: "50px",
              }}
              value={groupName}
              variant="outlined"
              onChange={handleGroupNameChange}
              endAdornment={
                <InputAdornment position="end">
                  <SupervisedUserCircleIcon fontSize="small" />
                </InputAdornment>
              }
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseGroupDetails}>Ok</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
