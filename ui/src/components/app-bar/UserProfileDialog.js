import * as React from "react";

import Button from "@mui/material/Button";
import Input from "@mui/material/Input";
import Stack from "@mui/material/Stack";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import InputAdornment from "@mui/material/InputAdornment";
import OutlinedInput from "@mui/material/OutlinedInput";
import Avatar from "@mui/material/Avatar";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";

import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { usernameChanged } from "../../reducers/profileSlice";

import { WsClientContext } from "../../app/WsClientContext";

export default function UserProfileDialog(props) {
  const username = useSelector((state) => state.profile.username);
  const wsClient = React.useContext(WsClientContext);
  const [auxUsername, setAuxUsername] = React.useState(username);

  const dispatch = useDispatch();

  const handleChangeusername = (event) => {
    let name = event.target.value;
    if (name.length <= 20) {
      setAuxUsername(event.target.value);
    }
  };

  const handleClose = () => {
    props.setOpen(false);
  };

  const handleAccept = () => {
    dispatch(usernameChanged(auxUsername));
    wsClient.send("/user/change/name", {}, auxUsername);
  };

  return (
    <Dialog open={props.openDialog} onClose={handleClose} sx={{ height: "100%" }}>
      <DialogTitle> Profile </DialogTitle>

      <DialogContent sx={{ maxWidth: "27vw", height: "60vh", boxSizing: "border-box" }}>
        <DialogContentText sx={{ marginBottom: "5%" }}>
          {" "}
          You can change your username (only 20 characters are allowed) and your profile picture.{" "}
        </DialogContentText>
        <Stack spacing={2} sx={{ height: "80%" }}>
          <OutlinedInput
            margin="dense"
            id="username-input-with-icon-adornment"
            sx={{ height: "15%" }}
            fullWidth
            value={auxUsername}
            variant="outlined"
            onChange={handleChangeusername}
            startAdornment={
              <InputAdornment position="start">
                <AccountCircleIcon fontSize="medium" />
              </InputAdornment>
            }
          />
          <Stack
            id="profile-picture"
            spacing={3}
            sx={{
              height: "85%",
              borderStyle: "groove",
              borderWidth: "2px",
              borderRadius: "15px",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Avatar alt="Profile Pic" sx={{ width: "40%", height: "50%" }}>
              <AccountCircleIcon />
            </Avatar>
            <label htmlFor="contained-button-file">
              <Input accept="image/*" id="contained-button-file" type="file" sx={{ display: "none" }} />
              <Button variant="contained" component="span" endIcon={<AddAPhotoIcon />}>
                Change photo
              </Button>
            </label>
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Ok</Button>
        <Button onClick={handleAccept}>Accept</Button>
      </DialogActions>
    </Dialog>
  );
}
