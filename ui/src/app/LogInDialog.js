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
  const [wrongPassword, setWrongPassword] = React.useState(false);
  const [openRegisterDialog, setOpenRegisterDialog] = React.useState(false);

  const handleClose = () => {
    props.open.setter(false);
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
    let authCode = document.getElementById("login-password").value;
    console.log(authCode);
    axios
      .post(desktopApp + "/login", {
        authCode: authCode,
      })
      .then(function (response) {
        console.log(response);
        if (response.status === NOT_REGISTERED_STATUS) {
          changeToRegistration();
        } else if (response.status === 200) {
          console.log(response.data);
          const sessionId = response.data;
          store.dispatch(sessionIdChanged(sessionId));

          let socket = connectWebSocketsDesktop(authCode);
          props.setWsDesktopClient(socket);

          props.open.setter(false);
          console.log(sessionId);
          console.log(props.wsClient);
          if (props.wsClient === null) {
            connectToServer(sessionId);
          } else {
            console.log("am intrat");
            props.wsClient.send("/user/register", {}, {});
          }
        }
      })
      .catch((error) => {
        console.error(error);
        if (error.response.status === 511) {
          setWrongPassword(true);
        }
      });
  };

  const changeToRegistration = () => {
    setOpenRegisterDialog(true);
  };

  return (
    <div>
      <Dialog
        open={props.open.value}
        onClose={handleClose}
        aria-labelledby="login-dialog-title"
        aria-describedby="login-dialog-description"
        PaperComponent={DraggablePaperComponent}
      >
        <DialogTitle id="login-dialog-title">Log in</DialogTitle>
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
          <Button onClick={handleClose} autoFocus>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
      <RegisterDialog open={{ value: openRegisterDialog, setter: setOpenRegisterDialog }} />
    </div>
  );
}
