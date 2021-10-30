import * as React from "react";

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Checkbox from "@mui/material/Checkbox";
import Avatar from "@mui/material/Avatar";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

export default function UsersListCheck(props) {
  return (
    <List
      sx={{
        width: "100%",
        maxWidth: "100%",
        bgcolor: "background.paper",
      }}
    >
      {props.users.map((user, index) => {
        const labelId = `checkbox-list-label-${index}`;

        return (
          <ListItem key={user.id} sx={{ width: "100%" }} disablePadding>
            <ListItemButton role={undefined} onClick={props.handleToggle(user.id)} dense>
              <ListItemIcon>
                <Checkbox
                  edge="start"
                  checked={props.checked.indexOf(user.id) !== -1}
                  tabIndex={-1}
                  disableRipple
                  inputProps={{ "aria-labelledby": labelId }}
                />
              </ListItemIcon>
              <ListItemAvatar>
                <Avatar alt="User Profile Pic">
                  <AccountCircleIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText id={labelId} primary={user.name} />
            </ListItemButton>
          </ListItem>
        );
      })}
    </List>
  );
}
