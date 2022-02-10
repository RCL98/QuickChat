import * as React from "react";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import Slider from "@mui/material/Slider";
import Slide from "@mui/material/Slide";
import Input from "@mui/material/Input";
import Avatar from "@mui/material/Avatar";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";

import AvatarEditor from "react-avatar-editor";

import "../styles/PrepareAvatarDialog.css";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function PrepareAvatarDialog(props) {
  const [zoom, setZoom] = React.useState(1);
  const [rotation, setRotation] = React.useState(0);
  const [imageSrc, setImageSrc] = React.useState(props.uploadedPhoto.value);
  const [croppedImage, setCroppedImage] = React.useState(null);
  const [disabled, setDisabled] = React.useState(false);

  React.useEffect(() => setImageSrc(props.uploadedPhoto.value), [props.uploadedPhoto.value]);

  const handleChangePhoto = (event) => {
    if (event.target.files && event.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        props.uploadedPhoto.setter(reader.result);
      });
      reader.readAsDataURL(event.target.files[0]);
    }
    event.target.value = null;
  };

  const handlePreview = () => {
    if (editor) {
      const canvas = editor.current.getImageScaledToCanvas();
      const url = canvas.toDataURL();
      setCroppedImage(url);
      setDisabled(true);
    }
  };

  const editor = React.useRef();

  const handleRedit = () => {
    setDisabled(false);
    setCroppedImage(null);
  };

  const handleAccept = async () => {
    props.setAvatarPath(croppedImage !== null ? croppedImage : editor.current.getImageScaledToCanvas().toDataURL());
    handleClose();
  };

  const handleClose = () => {
    setCroppedImage(null);
    setDisabled(false);
    props.open.setter(false);
  };

  return (
    <Dialog fullScreen open={props.open.value} onClose={handleClose} TransitionComponent={Transition}>
      <AppBar sx={{ position: "relative" }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={handleClose} aria-label="close">
            <CloseIcon />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
            You neeed to crop your image
          </Typography>
          <Button color="inherit" onClick={handleAccept}>
            Accept
          </Button>
        </Toolbar>
      </AppBar>

      <div className="root">
        <div className="controls">
          <div className="controlButtonsContainer">
            <div className="controlButtons">
              {croppedImage === null ? (
                <Button variant="contained" onClick={handlePreview}>
                  Preview
                </Button>
              ) : (
                <Button variant="contained" onClick={handleRedit}>
                  Redit
                </Button>
              )}
            </div>
            <div className="controlButtons">
              <label htmlFor="avatar-photo-upload-dialog">
                <Input
                  accept="image/*"
                  id="avatar-photo-upload-dialog"
                  type="file"
                  sx={{ display: "none" }}
                  onChange={handleChangePhoto}
                />
                <Button variant="contained" component="span" endIcon={<AddAPhotoIcon />}>
                  Change photo
                </Button>
              </label>
            </div>
          </div>

          <div id="sliders" className="slidersContainer">
            <div className="sliderContainer">
              <Typography variant="overline" className="sliderLabel">
                Zoom
              </Typography>
              <Slider
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                disabled={disabled}
                aria-labelledby="Zoom"
                className="slider"
                onChange={(e, _zoom) => setZoom(_zoom)}
              />
            </div>
            <div className="sliderContainer">
              <Typography variant="overline" className="sliderLabel">
                Rotation
              </Typography>
              <Slider
                value={rotation}
                min={0}
                max={360}
                step={1}
                disabled={disabled}
                aria-labelledby="Rotation"
                className="slider"
                onChange={(e, _rotation) => setRotation(_rotation)}
              />
            </div>
          </div>

          <div id="left-right" className="left-right-buttons-container">
            <div className="controlButtons">
              <Button
                variant="contained"
                disabled={disabled}
                onClick={(e) => setRotation((((rotation - 90) % 360) + 360) % 360)}
              >
                Rotate Left
              </Button>
            </div>
            <div className="controlButtons">
              <Button variant="contained" disabled={disabled} onClick={(e) => setRotation((rotation + 90) % 360)}>
                Rotate Right
              </Button>
            </div>
          </div>
        </div>
        <div className={croppedImage === null ? "cropContainer" : "imgContainer"}>
          {croppedImage === null ? (
            <AvatarEditor
              ref={editor}
              image={
                imageSrc !== null
                  ? imageSrc
                  : "https://img.huffingtonpost.com/asset/5ab4d4ac2000007d06eb2c56.jpeg?cache=sih0jwle4e&ops=1910_1000"
              }
              width={300}
              height={300}
              border={10}
              borderRadius={180}
              color={[255, 255, 255, 0.6]} // RGBA
              scale={zoom}
              rotate={rotation}
            />
          ) : (
            <Avatar id="user-profile-pic" alt="Profile Pic" src={croppedImage} sx={{ width: "50%", height: "50%" }}>
              <AccountCircleIcon />
            </Avatar>
          )}
        </div>
      </div>
    </Dialog>
  );
}
