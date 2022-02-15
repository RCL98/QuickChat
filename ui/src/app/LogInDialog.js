import * as React from "react";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import AccountCircle from "@mui/icons-material/AccountCircle";

import DraggablePaperComponent from "./DraggablePaperComponent";
import { desktopApp, NOT_REGISTERED_STATUS, serverHost } from "./constants";

import store from "./store";
import { sessionIdChanged, userIdChanged, usernameChanged } from "../reducers/profileSlice";

import axios from "axios";
import connectWebSocketsServer from "./ConnectWebSocketsServer";
import connectWebSocketsDesktop from "./ConnectWebSocketsDesktop";
import RegisterDialog from "./RegisterDialog";

export default function LogInDialog(props) {
  const [canceled, setCanceled] = React.useState(false);
  const [wrongPassword, setWrongPassword] = React.useState(false);

  const handleCancel = () => {
    setCanceled(true);
  };

  const connectToServer = (sessionId) => {
    axios
      .get(serverHost + `/user/auth/${sessionId}`)
      .then(function (response) {
        if (response.status === 200) {
          store.dispatch(usernameChanged(response.data.name));
          store.dispatch(userIdChanged(response.data.id));
          connectWebSocketsServer(sessionId, props.setWsClient, props.setIsConnected);
        }
      })
      .catch((error) => console.error(error));
  };

  const handleLogin = () => {
    console.log(document.getElementById("login-password").value);
    axios
      .post(desktopApp + "/login", {
        authCode: document.getElementById("login-password").value,
      })
      .then(function (response) {
        console.log(response);
        if (response.status === NOT_REGISTERED_STATUS) {
          changeToRegistration();
        } else if (response.status === 511) {
          setWrongPassword(true);
        } else if (response.status === 200) {
          const sessionId = response.data.sessionId;
          store.dispatch(sessionIdChanged(sessionId));

          let socket = connectWebSocketsDesktop();
          props.setWsDesktopClient(socket);

          props.setIsLoggedIn(true);
          if (props.wsClient === null) {
            connectToServer(sessionId);
          }
        }
      })
      .catch((error) => console.error(error));
  };

  const changeToRegistration = () => {
    props.setIsRegistered(false);
  };

  return (
    <div>
      <Dialog
        open={!props.isLoggedIn && !canceled}
        onClose={handleCancel}
        aria-labelledby="login-dialog-title"
        aria-describedby="login-dialog-description"
        PaperComponent={DraggablePaperComponent}
      >
        <DialogTitle id="login-dialog-title">LogIn</DialogTitle>
        <DialogContent>
          <DialogContentText id="login-dialog-description">Input password</DialogContentText>
          <Box sx={{ display: "flex", alignItems: "flex-end" }}>
            <AccountCircle sx={{ color: "action.active", mr: 1, my: 0.5 }} />
            <TextField
              error={wrongPassword}
              margin="dense"
              id="login-password"
              label="Password"
              type="password"
              fullWidth
              variant="standard"
              helperText={wrongPassword ? "The password inputed is not correct!" : null}
            />
          </Box>
          <Button onClick={changeToRegistration} color="info">
            Are you not registered to the Desktop app yet?
          </Button>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleLogin} autoFocus>
            Login
          </Button>
          <Button onClick={handleCancel} autoFocus>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
      <RegisterDialog isRegistered={props.isRegistered} setIsRegistered={props.setIsRegistered} />
    </div>
  );
}
