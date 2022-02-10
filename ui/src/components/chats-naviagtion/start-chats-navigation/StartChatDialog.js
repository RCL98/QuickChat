import React from "react";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { Button, InputAdornment, OutlinedInput, Typography, Box, IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import CloseIcon from "@mui/icons-material/Close";

import UsersListCheck from "./UsersListCheck";
import GroupDetailsDialog from "./GroupDetailsDialog";
import DraggablePaperComponent from "../../../app/DraggablePaperComponent";

import { chatAdded } from "../../../reducers/chatsSlice";
import { useSelector, useDispatch } from "react-redux";

import axios from "axios";
import getUsersAvatars from "../../../app/getUsersAvatars";
import { serverHost, GROUP, CONVERSATION } from "../../../app/constants";

export default function StartChatDialog(props) {
  const [lookupText, setLookupText] = React.useState("");
  const [checked, setChecked] = React.useState([]);
  const [users, setUsers] = React.useState([]);
  const [renderedUsers, setRenderedUsers] = React.useState([]);
  const [openGroupDetails, setOpenGroupDetails] = React.useState(false);
  const [groupName, setGroupName] = React.useState("");
  const [groupPhoto, setGroupPhoto] = React.useState(null);

  const sessionId = useSelector((state) => state.profile.sessionId);

  const dispatch = useDispatch();

  const getUsersList = () => {
    if (props.open.value) {
      axios
        .get(serverHost + `/users/${sessionId}`)
        .then(function (response) {
          getUsersAvatars(response.data, setUsers, setRenderedUsers);
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

  const makeCreateRequest = (path, name, partners, type, photo) => {
    axios
      .post(path, {
        name: name,
        chat: { users: partners },
      })
      .then(async function (response) {
        const chatId = response.data.id;
        if (type === GROUP && groupPhoto !== null) {
          let formData = new FormData();
          const blob = await (await fetch(groupPhoto)).blob();
          formData.append("file", blob);
          formData.append("groupId", chatId);
          formData.append("sessionId", sessionId);
          axios
            .post(serverHost + "/photos/group/upload", formData, {
              headers: {
                "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
              },
            })
            .then(function (_response) {
              var reader = new FileReader();
              reader.onload = function () {
                photo = reader.result;
                setGroupPhoto(null);
                dispatch(chatAdded({ id: chatId, name: name, type: type, photo: photo }));
              };
              reader.readAsDataURL(blob);
            })
            .catch((error) => console.error(error));
        } else {
          dispatch(chatAdded({ id: chatId, name: name, type: type, photo: photo }));
        }
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
    let photo = null;
    switch (props.option.value) {
      case "conversation":
        type = CONVERSATION;
        path += `/conversations/create/${sessionId}/${checked[0]}`;
        let partner = users.find((user) => user.id === checked[0]);
        chatName = partner.name;
        photo = partner.avatar;
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
    makeCreateRequest(path, chatName, partners, type, photo);
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

  const handleStart = () => {
    if (props.option.value === "group") {
      setGroupName("Group_" + Math.floor(10000 + Math.random() * 90000).toString());
      setOpenGroupDetails(true);
    } else {
      startChat();
    }
  };

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
          <Button onClick={handleStart} disabled={checked.length === 0}>
            Start
          </Button>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
      <GroupDetailsDialog
        groupName={{ value: groupName, setter: setGroupName }}
        groupPhoto={{ value: groupPhoto, setter: setGroupPhoto }}
        open={{ value: openGroupDetails, closer: handleCloseGroupDetails, setter: setOpenGroupDetails }}
      />
    </div>
  );
}
