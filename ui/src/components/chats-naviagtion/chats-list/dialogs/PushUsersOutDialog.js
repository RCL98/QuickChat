import React from "react";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { Button, InputAdornment, OutlinedInput, Typography, Box, IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import AutorenewIcon from "@mui/icons-material/Autorenew";

import UsersListCheck from "../../start-chats-navigation/UsersListCheck";
import DraggablePaperComponent from "../../../../app/DraggablePaperComponent";

import { useSelector } from "react-redux";

import axios from "axios";
import { WsClientContext } from "../../../../app/WsClientContext";
import getUsersAvatars from "../../../../app/getUsersAvatars";
import { serverHost } from "../../../../app/constants";

export default function PushUsersOutDialog(props) {
  const wsClient = React.useContext(WsClientContext).wsClient;

  const [lookupText, setLookupText] = React.useState("");
  const [checked, setChecked] = React.useState([]);
  const [users, setUsers] = React.useState([]);
  const [renderedUsers, setRenderedUsers] = React.useState([]);

  const profile = useSelector((state) => state.profile);

  const getUsersList = () => {
    if (props.open.value) {
      axios
        .get(serverHost + `/groups/get-users/${props.chat.id}/user/${profile.sessionId}`)
        .then(function (response) {
          let _users = response.data.filter((usr) => usr.id !== profile.userId);
          getUsersAvatars(_users, setUsers, setRenderedUsers);
        })
        .catch(function (error) {
          console.error(error);
        });
    }
  };

  React.useEffect(getUsersList, [props.open.value, profile, props.chat?.id]);

  const handleToggle = (value) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }
    setChecked(newChecked);
  };

  const handlePushUsersOut = () => {
    if (wsClient) {
      const payload = users
        .filter((user) => checked.indexOf(user.id) !== -1)
        .map((user) => {
          return user.id;
        });
      wsClient.send(`/groups/push-users-out/${props.chat.id}`, {}, JSON.stringify(payload));
    }
    setChecked([]);
    props.open.setter(false);
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

  const handleClose = () => {
    props.open.setter(false);
    setChecked([]);
    setUsers([]);
  };

  return (
    <div style={{ overflowY: "hidden", height: "min-content" }}>
      <Dialog
        open={props.open.value}
        onClose={handleClose}
        id="add-new-users-dialog"
        PaperComponent={DraggablePaperComponent}
        sx={{ overflowY: "hidden", height: "100%" }}
      >
        <DialogTitle style={{ cursor: "move" }} id="draggable-add-new-users-dialog-title">
          Get users out of group
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
          <DialogContentText>Choose some users too delete of to the group.</DialogContentText>
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
          <Button onClick={handleClose}>Close</Button>
          <Button onClick={handlePushUsersOut}>Delete</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
