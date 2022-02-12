import axios from "axios";
import { serverHost } from "./constants";

export default async function getUsersAvatars(_users, setUsers, setRenderedUsers) {
  for (let i = 0; i < _users.length; i++) {
    await axios
      .get(serverHost + `/photos/get/${_users[i].id}`, {
        responseType: "arraybuffer",
      })
      .then((response) => {
        _users[i].avatar = "data:image/jpeg;base64," + Buffer.from(response.data, "binary").toString("base64");
      })
      .catch((error) => console.error(error));
  }
  if (setUsers && setRenderedUsers) {
    setUsers(_users);
    setRenderedUsers(_users);
  }
  return _users;
}
