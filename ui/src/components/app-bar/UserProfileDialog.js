import * as React from "react";

import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
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
import DeleteIcon from "@mui/icons-material/Delete";

import DraggablePaperComponent from "../../app/DraggablePaperComponent";

import { useSelector, useDispatch } from "react-redux";
import { avatarChanged, usernameChanged } from "../../reducers/profileSlice";

import { WsClientContext } from "../../app/WsClientContext";
import { serverHost } from "../../app/constants";

import AlertDialog from "../../app/AlertDialog";
import PrepareAvatarDialog from "../../app/PrepareAvatarDialog";

import axios from "axios";

export default function UserProfileDialog(props) {
  const profile = useSelector((state) => state.profile);
  const wsClient = React.useContext(WsClientContext);
  const [auxUsername, setAuxUsername] = React.useState(profile.username);
  const [avatar, setAvatar] = React.useState(profile.avatar);
  const [uploadPhoto, setUploadPhoto] = React.useState(null);
  const [openCropPhotoDialog, setOpenCropPhotoDialog] = React.useState(false);
  const [alertOpen, setAlertOpen] = React.useState(false);

  React.useEffect(() => setAvatar(profile.avatar), [profile]);

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

  const handleAccept = async () => {
    if (avatar !== null) {
      let formData = new FormData();
      const blob = await (await fetch(avatar)).blob();
      formData.append("file", blob);
      formData.append("userSessionId", profile.sessionId);
      axios
        .post(serverHost + "/photos/upload", formData, {
          headers: {
            "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
          },
        })
        .then(function (response) {
          dispatch(avatarChanged(avatar));
        })
        .catch((error) => console.error(error));
    } else if (profile.avatar !== null) {
      axios
        .delete(serverHost + `/photos/user/${profile.sessionId}`)
        .then(() => {
          dispatch(avatarChanged(avatar));
        })
        .catch((error) => console.error(error));
    }
    props.setOpen(false);
    dispatch(usernameChanged(auxUsername));
    wsClient.send("/user/change/name", {}, auxUsername);
  };

  const handlePhotoUpload = (event) => {
    if (event.target.files && event.target.files.length > 0) {
      const fileSize = event.target.files[0].size / 1024 / 1024;
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        let img = new Image();
        img.src = reader.result;
        img.onload = function () {
          if (img.height < 300 && img.width < 300) {
            if (fileSize > 0.5) setAlertOpen(true);
            else {
              setAvatar(reader.result);
            }
          } else {
            setUploadPhoto(reader.result);
            setOpenCropPhotoDialog(true);
          }
        };
      });
      reader.readAsDataURL(event.target.files[0]);
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
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Avatar id="user-avatar" alt="User Avatar" src={avatar} sx={{ width: "50%", height: "50%" }}>
                <AccountCircleIcon />
              </Avatar>
              <label htmlFor="avatar-photo-upload">
                <Input
                  accept="image/*"
                  id="avatar-photo-upload"
                  type="file"
                  sx={{ display: "none" }}
                  onChange={handlePhotoUpload}
                />

                {avatar === null ? (
                  <Button variant="contained" component="span" endIcon={<AddAPhotoIcon />}>
                    Upload photo
                  </Button>
                ) : (
                  <ButtonGroup variant="contained" aria-label="outlined photo button group">
                    <Button component="span" endIcon={<AddAPhotoIcon />}>
                      Change photo
                    </Button>
                    <Button
                      component="span"
                      endIcon={<DeleteIcon />}
                      onClick={(event) => {
                        event.preventDefault();
                        setAvatar(null);
                      }}
                    >
                      Remove photo
                    </Button>
                  </ButtonGroup>
                )}
              </label>
            </Stack>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Ok</Button>
          <Button onClick={handleAccept}>Accept</Button>
        </DialogActions>
      </Dialog>
      <AlertDialog
        open={alertOpen}
        setOpen={setAlertOpen}
        content={"Upload file must not be bigger than 500 Kb."}
        title={"File to big"}
      />
      <PrepareAvatarDialog
        setAvatarPath={setAvatar}
        uploadedPhoto={{ value: uploadPhoto, setter: setUploadPhoto }}
        open={{ value: openCropPhotoDialog, setter: setOpenCropPhotoDialog }}
      />
    </div>
  );
}
