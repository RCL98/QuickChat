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

func handleClearMessage(sessionId string, wsMessage database.WebsocketMessage) {
	messageDTO := database.MessageDTO{}
	mapstructure.Decode(wsMessage.Content, &messageDTO)
	message := database.MessageDTOToMessage(messageDTO)
	database.AddMessage(sessionId, &message)
}

func handleUserUpdate(sessiondId string, wsMessage database.WebsocketMessage) {
	userDTO := database.UserDTO{}
	mapstructure.Decode(wsMessage.Content, &userDTO)
	user := database.GetUserById(sessiondId, userDTO.Id)
	user.Name = userDTO.Name
	database.UpdateUser(sessiondId, user)

}

func createChat(w http.ResponseWriter, req *http.Request) {
	sessionId, err := req.Cookie(security.COOKIE_SESSION_ID)

	if req.Method != http.MethodPost && req.Method != http.MethodOptions {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	if enableCORS(&w, req) {
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

	chat := database.ChatDTOToChat(sessionId.Value, chatDTO)

	database.AddChat(sessionId.Value, &chat)
}

func synchronizationWithServer(w http.ResponseWriter, req *http.Request) {
	if enableCORS(&w, req) {
		return
	}

	sessionId, errCookie := req.Cookie(security.COOKIE_SESSION_ID)

	if errCookie != nil {
		utils.Logg(errCookie)
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

	database.Synchronize(sessionId.Value, synchronizationDTO)

}
