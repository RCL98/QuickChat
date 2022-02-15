import { AUTHENTICATION } from "./constants";

export default function connectWebSocketsDesktop(authCode) {
  let socket = new WebSocket("ws://localhost:8090/connect-ws");

  socket.onopen = function (e) {
    console.log("Connected to desktop app was successful.");
    socket.send(JSON.stringify({ Content: authCode, MessageType: AUTHENTICATION }));
  };

  socket.onmessage = function (event) {
    console.log(`Data received from server: ${event.data}`);
  };

  socket.onclose = function (event) {
    if (event.wasClean) {
      console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
    } else {
      // e.g. server process killed or network down
      // event.code is usually 1006 in this case
      console.log("[close] Connection died");
    }
  };

  socket.onerror = function (error) {
    console.log(`[error] ${error.message}`);
  };

  return socket;
}
