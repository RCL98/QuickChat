package http_server

import (
	"encoding/json"
	"fmt"
	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
	"go_secure/database"
	"go_secure/security"
	"go_secure/utils"
	"io/ioutil"
	"net/http"
	"strconv"
)

const (
	ENCRYPTED_MESSAGE   = "ENCRYPTED_MESSAGE"
	CLEAR_MESSAGE       = "CLEAR_MESSAGE"
	USER_UPDATE         = "USER_UPDATE"
	NEW_USER            = "NEW_USER"
	GET_SESSION_ID      = "GET_SESSION_ID"
	ADD_SESSION_ID      = "ADD_SESSION_ID"
	AUTHENTICATION      = "AUTHENTICATION"
	ADD_USER_IN_CHAT    = "ADD_USER_IN_CHAT"
	REMOVE_USER_IN_CHAT = "REMOVE_USER_IN_CHAT"
)

var upgrader = websocket.Upgrader{}

type Secure_Server struct {
	Port string
}

func login(w http.ResponseWriter, req *http.Request) {
	if req.Method != http.MethodPost {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	content, err := ioutil.ReadAll(req.Body)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		utils.Logg(err)
		fmt.Fprint(w, "Internal error!")
	}
	contentMap := make(map[string]string)
	json.Unmarshal(content, &contentMap)
	authCode := contentMap["authCode"]

	if security.ValidateAuthCode(authCode) {
		cookie := http.Cookie{Name: "authCode", Value: authCode, HttpOnly: true}
		http.SetCookie(w, &cookie)
	}

	sessionId := database.GetSecurityValue(security.SESSION_ID)
	if len(sessionId) == 0 {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("You have to add a sessionId firstly"))
		return
	}

	w.Write([]byte(sessionId))
}

func register(w http.ResponseWriter, req *http.Request) {
	if req.Method != http.MethodPost {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	res := database.GetSecurityValue(security.AUTH_TOKEN)
	if len(res) != 0 {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("You have already registered!"))
		return
	}
	content, err := ioutil.ReadAll(req.Body)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		utils.Logg(err)
		fmt.Fprint(w, "Internal error!")
	}
	contentMap := make(map[string]string)
	json.Unmarshal(content, &contentMap)
	database.AddSecurityInfo(security.AUTH_TOKEN, contentMap["authCode"])
	w.Write([]byte("You have successfully registered!"))

}

func getChat(w http.ResponseWriter, req *http.Request) {

	vars := mux.Vars(req)
	stringId, ok := vars["id"]

	if !ok || req.Method != http.MethodGet {
		w.WriteHeader(http.StatusBadRequest)
	} else {
		if security.ValidateAuthentication(w, req) {
			return
		}
		id, err := strconv.ParseUint(stringId, 10, 32)
		if err != nil {
			fmt.Print(err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		fmt.Print(id)
		w.Write(serialize(database.ConstructChatDTO(database.GetChat(id))))
	}
}

func createWsConnection(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)

	isFirstPackage := true

	if err != nil {
		utils.Logg(err)
		return
	}

	for {
		_, content_bytes, err := conn.ReadMessage()

		if err != nil {
			utils.Logg(err)
		}

		reciveMessage := deserialize(content_bytes)

		if reciveMessage.MessageType != AUTHENTICATION && isFirstPackage {
			return
		}

		switch reciveMessage.MessageType {
		case AUTHENTICATION:
			if !handleAuthentication(reciveMessage) {
				return
			}
			isFirstPackage = false
			break
		case ENCRYPTED_MESSAGE:
			handleEncryptedMessage(reciveMessage)
			break
		case CLEAR_MESSAGE:
			handleClearMessage(reciveMessage)
			break
		case USER_UPDATE:
			handleUserUpdate(reciveMessage)
			break
		case REMOVE_USER_IN_CHAT:
			//TO DO
			break
		case ADD_USER_IN_CHAT:
			//TO DO
			break
		case ADD_SESSION_ID:
			handleAddSessionId(reciveMessage)
			break
		}

	}

}

func (sv Secure_Server) Run() {

	router := mux.NewRouter()
	router.HandleFunc("/chat/{id}", getChat)
	router.HandleFunc("/connect-ws", createWsConnection)
	router.HandleFunc("/login", login)
	router.HandleFunc("/register", register)
	router.HandleFunc("/security/sessionid", getSessionId)
	router.HandleFunc("/chat/create", createChat)

	err := http.ListenAndServe(":"+sv.Port, router)

	if err != nil {
		fmt.Printf(err.Error())
	}
}
