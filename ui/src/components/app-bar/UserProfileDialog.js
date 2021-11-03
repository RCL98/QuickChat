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

import DraggablePaperComponent from "../../app/DraggablePaperComponent";

import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { usernameChanged } from "../../reducers/profileSlice";

import { WsClientContext } from "../../app/WsClientContext";
import CropIamgeDialog from "./CropImageDialog";

export default function UserProfileDialog(props) {
  const username = useSelector((state) => state.profile.username);
  const wsClient = React.useContext(WsClientContext);
  const [auxUsername, setAuxUsername] = React.useState(username);
  const [photoPath, setPhotoPath] = React.useState("/mario-av.png");
  const [cropPhoto, setCropPhoto] = React.useState(null);
  const [openCropPhotoDialog, setOpenCropPhotoDialog] = React.useState(false);

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

  const handlePhotoUpload = (event) => {
    if (event.target.files && event.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setCropPhoto(reader.result);
        setOpenCropPhotoDialog(true);
      });
      reader.readAsDataURL(event.target.files[0]);
      // setPhotoPath(URL.createObjectURL(event.target.files[0]));
    }
    event.target.value = null;
  };

  return (
    <div>
      <Dialog
        id="change-user-details-dialog"
        open={props.openDialog}
        onClose={handleClose}
        sx={{ height: "100%" }}
        PaperComponent={DraggablePaperComponent}
        aria-labelledby="draggable-dialog-title"
      >
        <DialogTitle style={{ cursor: "move" }} id="draggable-user-profile-dialog-title">
          Profile
        </DialogTitle>

        <DialogContent sx={{ maxWidth: "27vw", height: "60vh", boxSizing: "border-box" }}>
          <DialogContentText sx={{ marginBottom: "5%" }}>
            You can change your username (only 20 characters are allowed) and your profile picture.
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
              <Avatar id="user-profile-pic" alt="Profile Pic" src={photoPath} sx={{ width: "40%", height: "50%" }}>
                <AccountCircleIcon />
              </Avatar>
              <label htmlFor="user-photo-upload">
                <Input
                  accept="image/*"
                  id="user-photo-upload"
                  type="file"
                  sx={{ display: "none" }}
                  onChange={handlePhotoUpload}
                />
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
      <CropIamgeDialog
        photo={{ value: cropPhoto, setter: setCropPhoto }}
        open={{ value: openCropPhotoDialog, setter: setOpenCropPhotoDialog }}
      />
    </div>
  );
}
