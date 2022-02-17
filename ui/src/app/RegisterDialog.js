import * as React from "react";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import AccountCircle from "@mui/icons-material/AccountCircle";

import DraggablePaperComponent from "./DraggablePaperComponent";
import { ALREADY_REGISTERED_STATUS, desktopApp } from "./constants";

import axios from "axios";
import store from "./store";

export default function RegisterDialog(props) {
  const [username, setUsername] = React.useState(store.getState().profile.username);
  const [password, setPassword] = React.useState(null);

  const handleClose = () => {
    props.open.setter(false);
  };

  const handleChangeUsernameValue = (event) => {
    if (event.target.value.length <= 20) {
      setUsername(event.target.value);
    }
  };

  const handleChangePasswordValue = (event) => {
    setPassword(event.target.value);
  };

  const handleRegister = () => {
    console.log(`user: ${username} \n password: ${password}`);
    axios
      .post(desktopApp + "/register", {
        username: username,
        password: password,
        sessionId: store.getState().profile.sessionId,
      })
      .then(function (response) {
        console.log(response);
        if (response.status === 200 || response.status === ALREADY_REGISTERED_STATUS) {
          handleClose();
        } else {
          console.log(response);
        }
      })
      .catch((error) => console.error(error));
  };

  return (
    <div>
      <Dialog
        open={props.open.value}
        onClose={handleClose}
        aria-labelledby="register-dialog-title"
        aria-describedby="register-dialog-description"
        PaperComponent={DraggablePaperComponent}
      >
        <DialogTitle id="register-dialog-title">Register</DialogTitle>
        <DialogContent>
          <DialogContentText id="login-dialog-description">
            You need to input a registration password:
          </DialogContentText>
          <Stack spacing={2}>
            <Box sx={{ display: "flex", alignItems: "flex-end" }}>
              <AccountCircle sx={{ color: "action.active", mr: 1, my: 0.5 }} />
              <TextField
                margin="dense"
                id="register-username"
                label="username"
                type="text"
                required
                autoFocus={true}
                value={username}
                onChange={handleChangeUsernameValue}
                onKeyPress={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleRegister();
                  }
                }}
                fullWidth
                variant="standard"
              />
            </Box>
            <TextField
              margin="dense"
              id="register-password"
              label="Password"
              type="password"
              required
              value={password}
              onChange={handleChangePasswordValue}
              fullWidth
              onKeyPress={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleRegister();
                }
              }}
              variant="standard"
            />
            <Button onClick={handleClose} color="info">
              Are you already registered to the Desktop app?
            </Button>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleRegister} autoFocus>
            Register
          </Button>
          <Button onClick={handleClose} autoFocus>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
