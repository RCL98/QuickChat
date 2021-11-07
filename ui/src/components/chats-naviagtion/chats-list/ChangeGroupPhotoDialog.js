import React from "react";

import Input from "@mui/material/Input";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Stack from "@mui/material/Stack";
import { Button, Avatar } from "@mui/material";
import GroupsIcon from "@mui/icons-material/Groups";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";

import { useDispatch, useSelector } from "react-redux";

import { chatPhotoUpdated } from "../../../reducers/chatsSlice";

import { serverHost } from "../../../app/constants";

import AlertDialog from "../../../app/AlertDialog";
import PrepareAvatarDialog from "../../../app/PrepareAvatarDialog";
import DraggablePaperComponent from "../../../app/DraggablePaperComponent";

import axios from "axios";

export default function ChangeGroupPhotoDialog(props) {
  const sessionId = useSelector((state) => state.profile.sessionId);
  const [groupPhoto, setGroupPhoto] = React.useState(props.chat?.photo);
  const [uploadPhoto, setUploadPhoto] = React.useState(null);
  const [openCropPhotoDialog, setOpenCropPhotoDialog] = React.useState(false);
  const [alertOpen, setAlertOpen] = React.useState(false);

  React.useEffect(() => {
    setGroupPhoto(props.chat?.photo);
  }, [props.chat]);

  const dispatch = useDispatch();

  const handleAccept = async () => {
    if (groupPhoto !== null) {
      let formData = new FormData();
      const blob = await (await fetch(groupPhoto)).blob();
      formData.append("file", blob);
      formData.append("groupId", props.chat.id);
      formData.append("sessionId", sessionId);
      axios
        .post(serverHost + "/photos/group/upload", formData, {
          headers: {
            "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
          },
        })
        .then(() => dispatch(chatPhotoUpdated({ id: props.chat.id, photo: groupPhoto })))
        .catch((error) => console.error(error));
    }
    props.open.setter(false);
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
              axios
                .post(serverHost + "/photos/upload", formData, {
                  headers: {
                    "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
                  },
                })
                .then(function (response) {
                  console.log(response);
                })
                .catch((error) => console.error(error));
              setGroupPhoto(reader.result);
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
        sx={{ height: "100%", witdh: "100%" }}
        onClose={handleClose}
        PaperComponent={DraggablePaperComponent}
      >
        <DialogTitle style={{ cursor: "move" }} id="draggable-chat-details-dialog-title">
          Group Photo
        </DialogTitle>

        <DialogContent id="group-name-dialog-context" sx={{ width: "30vw", height: "60vh", boxSizing: "border-box" }}>
          <DialogContentText>You can change the group's photo.</DialogContentText>
          <Stack
            id="group-photo"
            spacing={3}
            sx={{
              height: "90%",
              width: "100%",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Avatar id="group-photo" alt="Group Photo" src={groupPhoto} sx={{ width: "50%", height: "50%" }}>
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
        setAvatarPath={setGroupPhoto}
        uploadedPhoto={{ value: uploadPhoto, setter: setUploadPhoto }}
        open={{ value: openCropPhotoDialog, setter: setOpenCropPhotoDialog }}
      />
    </div>
  );
}
