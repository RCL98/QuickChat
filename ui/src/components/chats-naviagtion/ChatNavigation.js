import React from "react";

import OptionsBar from "./OptionsBar";
import ChatsList from "./chats-list/ChatsList";

import { Stack } from "@mui/material";

export default function ChatNavigation() {
  const [filterText, setFilterText] = React.useState("");

  const handleSeacrh = (text) => {
    setFilterText(text);
  };

  return (
    <Stack sx={{ overflow: "hidden", height: "100%" }}>
      <OptionsBar handleSeacrh={handleSeacrh} filterText={filterText} />
      <hr style={{ width: "95%" }} />
      <div id="chats-list" style={{ display: "flex", height: "85%" }}>
        <ChatsList filterText={filterText} />
      </div>
    </Stack>
  );
}
