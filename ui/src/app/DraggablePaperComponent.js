import * as React from "react";

import Paper from "@mui/material/Paper";

import Draggable from "react-draggable";

export default function DraggablePaperComponent(props) {
  const nodeRef = React.useRef(null);
  return (
    <Draggable nodeRef={nodeRef} handle="#draggable-dialog-title" cancel={'[class*="MuiDialogContent-root"]'}>
      <Paper ref={nodeRef} {...props} />
    </Draggable>
  );
}
