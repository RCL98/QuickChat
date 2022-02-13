import * as React from "react";

import { makeStyles } from "@mui/styles";
import { useTheme } from "@emotion/react";
import Typography from "@mui/material/Typography";
import Toolbar from "@mui/material/Toolbar";
import AppBar from "@mui/material/AppBar";
import IconButton from "@mui/material/IconButton";
import Grid from "@mui/material/Grid";
import Brightness2Icon from "@mui/icons-material/Brightness2";
import Brightness5Icon from "@mui/icons-material/Brightness5";
import SettingsIcon from "@mui/icons-material/Settings";
import Avatar from "@mui/material/Avatar";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

import UserProfileDialog from "./UserProfileDialog";

import { useSelector } from "react-redux";

const appBarStyles = makeStyles((theme) => ({
  appBar: {
    backgroundColor: theme.palette.primary.dark,
  },
  profile: {
    boxSizing: "border-box",
    // margin: "5%",
    display: "flex",
    height: "100%",
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
  },
  buttonsBox: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
}));

export default function MyAppBar(props) {
  const classes = appBarStyles();
  const [openSettings, setOpenSettings] = React.useState(false);

  const theme = useTheme();

  const profile = useSelector((state) => state.profile);

  const lightingMode = () => {
    props.lightingMode();
  };

  const clickedSettings = () => {
    setOpenSettings(true);
  };

  return (
    <div>
      <AppBar position="fixed" sx={{ height: "7%" }}>
        <Toolbar className={classes.appBar}>
          <Grid container sx={{ height: "100%" }}>
            <Grid item xs></Grid>
            <Grid item xs={3} id="profile" className={classes.profile}>
              <Typography variant="h6"> {`Your name: ${profile.username}`} </Typography>
              <Avatar alt="Profile Pic" src={profile.avatar}>
                <AccountCircleIcon />
              </Avatar>
            </Grid>
            <Grid item xs></Grid>
            <Grid item xs={1} className={classes.buttonsBox}>
              <IconButton aria-label="dark-light-mode" onClick={lightingMode} sx={{ color: "yellow" }}>
                {theme.palette.mode === "dark" ? <Brightness5Icon /> : <Brightness2Icon />}
              </IconButton>
              <IconButton aria-label="dark-light-mode" sx={{ color: "white" }} onClick={clickedSettings}>
                <SettingsIcon />
              </IconButton>
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
      <UserProfileDialog openDialog={openSettings} setOpen={setOpenSettings} />
    </div>
  );
}
