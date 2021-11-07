import React from "react";

import Input from "@mui/material/Input";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Stack from "@mui/material/Stack";
import { Button, InputAdornment, OutlinedInput, Avatar } from "@mui/material";
import GroupsIcon from "@mui/icons-material/Groups";
import SupervisedUserCircleIcon from "@mui/icons-material/SupervisedUserCircle";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";

import { useSelector } from "react-redux";

import { CONVERSATION } from "../../../app/constants";

import AlertDialog from "../../../app/AlertDialog";
import PrepareAvatarDialog from "../../../app/PrepareAvatarDialog";
import DraggablePaperComponent from "../../../app/DraggablePaperComponent";

export default function GroupDetailsDialog(props) {
  const sessionId = useSelector((state) => state.profile.sessionId);

  const [uploadPhoto, setUploadPhoto] = React.useState(null);
  const [openCropPhotoDialog, setOpenCropPhotoDialog] = React.useState(false);
  const [alertOpen, setAlertOpen] = React.useState(false);

  const handleNameChange = (event) => props.groupName.setter(event.target.value);

  const handleAccept = () => {
    props.open.closer();
  };

  const handlePhotoUpload = (event) => {
    if (event.target.files && event.target.files.length > 0) {
      const fileSize = event.target.files[0].size / 1024 / 1024;
      const reader = new FileReader();
      let formData = new FormData();
      formData.append("file", event.target.files[0], event.target.files[0].name);
      formData.append("userSessionId", sessionId);
      reader.addEventListener("load", () => {
        let img = new Image();
        img.src = reader.result;
        img.onload = function () {
          if (img.height < 300 && img.width < 300) {
            if (fileSize > 0.5) setAlertOpen(true);
            else {
              props.groupPhoto.setter(reader.result);
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

  const handleClose = () => props.open.setter(false);

  return (
    <div>
      <Dialog
        id="change-chat-name-dialog"
        open={props.open.value}
        sx={{ height: "100%" }}
        onClose={handleClose}
        PaperComponent={DraggablePaperComponent}
      >
        <DialogTitle style={{ cursor: "move" }} id="draggable-chat-details-dialog-title">
          Group Details
        </DialogTitle>

        <DialogContent
          id="group-name-dialog-context"
          sx={{ maxWidth: "27vw", height: "60vh", boxSizing: "border-box" }}
        >
          <DialogContentText>
            You need to give this new Group a name and you can also choose a group photo.
          </DialogContentText>
          <Stack id="group-details-change-dialog" spacing={2} sx={{ height: "80%" }}>
            <OutlinedInput
              margin="dense"
              id="group-name-input-with-icon-adornment"
              sx={{ height: "15%" }}
              fullWidth
              value={props.groupName.value}
              variant="outlined"
              onChange={handleNameChange}
              startAdornment={
                <InputAdornment position="end">
                  <SupervisedUserCircleIcon fontSize="small" />
                </InputAdornment>
              }
            />
            {props.chat?.type !== CONVERSATION ? (
              <Stack
                id="group-picture"
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
                <Avatar
                  id="group-photo"
                  alt="Group Photo"
                  src={props.groupPhoto.value}
                  sx={{ width: "50%", height: "50%" }}
                >
                  <GroupsIcon />
                </Avatar>
                <label htmlFor="group-photo-upload">
                  <Input
                    accept="image/*"
                    id="group-photo-upload"
                    type="file"
                    sx={{ display: "none" }}
                    onChange={handlePhotoUpload}
                  />
                  <Button variant="contained" component="span" endIcon={<AddAPhotoIcon />}>
                    Change photo
                  </Button>
                </label>
              </Stack>
            ) : null}
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
        setAvatarPath={props.groupPhoto.setter}
        uploadedPhoto={{ value: uploadPhoto, setter: setUploadPhoto }}
        open={{ value: openCropPhotoDialog, setter: setOpenCropPhotoDialog }}
      />
    </div>
  );
}
