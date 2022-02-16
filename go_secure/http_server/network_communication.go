package http_server

import (
	"encoding/json"
	"fmt"
	"go_secure/database"
	"go_secure/security"
	"go_secure/utils"
	"io/ioutil"
	"net/http"

	"github.com/mitchellh/mapstructure"
)

type Child struct {
	Name string `json:"gigiName"`
	Age  int    `json:"age"`
}

func deserialize(bytesArray []byte) database.WebsocketMessage {
	wsMessage := database.WebsocketMessage{}
	json.Unmarshal(bytesArray, &wsMessage)
	return wsMessage
}

func serialize(obj interface{}) []byte {
	ret, err := json.Marshal(obj)
	if err != nil {
		utils.Logg(err)
	}
	return ret
}

func handleEncryptedMessage(wsMessage database.WebsocketMessage) {
	message := database.MessageDTO{}
	mapstructure.Decode(wsMessage.Content, &message)
}

func handleClearMessage(wsMessage database.WebsocketMessage) {
	messageDTO := database.MessageDTO{}
	mapstructure.Decode(wsMessage.Content, &messageDTO)
	message := database.MessageDTOToMessage(messageDTO)
	database.AddMessage(&message)
}

func handleUserUpdate(wsMessage database.WebsocketMessage) {
	userDTO := database.UserDTO{}
	mapstructure.Decode(wsMessage.Content, &userDTO)
	user := database.GetUserById(userDTO.Id)
	user.Name = userDTO.Name
	database.UpdateUser(user)

}

func handleAddSessionId(wsMessage database.WebsocketMessage) {
	sessionId := fmt.Sprintf("%v", wsMessage.Content)
	database.AddSecurityInfo(security.SESSION_ID, sessionId)
}

func handleAuthentication(wsMessage database.WebsocketMessage) bool {
	return security.ValidateAuthCode(fmt.Sprintf("%v",
		wsMessage.Content))
}

func createChat(w http.ResponseWriter, req *http.Request) {

	if req.Method != http.MethodPost {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	if !security.ValidateAuthentication(w, req) {
		return
	}

	content, err := ioutil.ReadAll(req.Body)

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(err.Error()))
		fmt.Print(err)
		return
	}

	chatDTO := database.ChatDTO{}
	json.Unmarshal(content, &chatDTO)

	chat := database.ChatDTOToChat(chatDTO)

	database.AddChat(&chat)
}

func getSessionId(w http.ResponseWriter, req *http.Request) {
	if req.Method != http.MethodGet {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	if !security.ValidateAuthentication(w, req) {
		return
	}
	sessionId := database.GetSecurityValue(security.SESSION_ID)
	if len(sessionId) == 0 {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("You have to add a sessionId first!"))
		return
	}
	w.Write([]byte(sessionId))
}

func synchronizationWithServer(w http.ResponseWriter, req *http.Request) {
	if enableCORS(&w, req) {
		return
	}

	if req.Method != http.MethodPost {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	if security.ValidateAuthentication(w, req) {
		return
	}

	content, err := ioutil.ReadAll(req.Body)

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(err.Error()))
		fmt.Print(err)
		return
	}

	synchronizationDTO := database.SynchronizationDTO{}
	json.Unmarshal(content, &synchronizationDTO)

	database.Synchronize(synchronizationDTO)

}
