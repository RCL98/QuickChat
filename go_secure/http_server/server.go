package http_server

import (
	"encoding/json"
	"fmt"
	"go_secure/database"
	"go_secure/security"
	"go_secure/utils"
	"io/ioutil"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
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

var upgrader = websocket.Upgrader{CheckOrigin: func(r *http.Request) bool { return true }}

type Secure_Server struct {
	Port string
}

func enableCORS(w *http.ResponseWriter, req *http.Request) bool {
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
	if req.Method == http.MethodOptions {
		(*w).Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		(*w).Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Authorization,  X-Requested-With")
		(*w).Header().Set("Access-Control-Allow-Credentials", "true")
		(*w).WriteHeader(http.StatusOK)
		return true
	}
	return false
}

func verifyIsOn(w http.ResponseWriter, req *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")

	if req.Method != http.MethodGet {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	w.Write([]byte("I'm here"))
}

func login(w http.ResponseWriter, req *http.Request) {

	fmt.Println(req.Method)
	if req.Method != http.MethodPost && req.Method != http.MethodOptions {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	if enableCORS(&w, req) {
		return
	}

	res := database.GetSecurityValue(security.AUTH_TOKEN)
	if len(res) == 0 {
		w.WriteHeader(security.NOT_REGISTERED_STATUS)
		w.Write([]byte("You are not registered!"))
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
		fmt.Println("Good credentials!")
		cookie := http.Cookie{Name: "authCode", Value: authCode, HttpOnly: true}
		http.SetCookie(w, &cookie)
		sessionId := database.GetSecurityValue(security.SESSION_ID)
		if len(sessionId) == 0 {
			w.WriteHeader(http.StatusBadRequest)
			w.Write([]byte("You have to add a sessionId first!"))
			return
		}

		w.WriteHeader(http.StatusOK)
		w.Write([]byte(sessionId))
		return
	}
	fmt.Println("Bad credentials!")
	w.WriteHeader(http.StatusNetworkAuthenticationRequired)
	w.Write([]byte("Bad credentials!"))
}

func register(w http.ResponseWriter, req *http.Request) {

	if req.Method != http.MethodPost && req.Method != http.MethodOptions {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	if enableCORS(&w, req) {
		return
	}

	res := database.GetSecurityValue(security.AUTH_TOKEN)
	if len(res) != 0 {
		w.WriteHeader(security.ALREADY_REGISTERED_STATUS)
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
	database.AddSecurityInfo(security.SESSION_ID, contentMap["sessionId"])
	w.Write([]byte("You have successfully registered!"))
}

func getChat(w http.ResponseWriter, req *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")

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

func createWsConnection(w http.ResponseWriter, req *http.Request) {
	conn, err := upgrader.Upgrade(w, req, nil)

	isFirstPackage := true

	if err != nil {
		utils.Logg(err)
		return
	}

	for {
		_, content_bytes, err := conn.ReadMessage()

		if err != nil {
			utils.Logg(err)
			conn.Close()
			return
		}

		reciveMessage := deserialize(content_bytes)
		fmt.Print(string(content_bytes))
		if reciveMessage.MessageType != AUTHENTICATION && isFirstPackage {
			conn.Close()
			return
		}

		switch reciveMessage.MessageType {
		case AUTHENTICATION:
			if !handleAuthentication(reciveMessage) {
				conn.Close()
				return
			}
			isFirstPackage = false

		case ENCRYPTED_MESSAGE:
			handleEncryptedMessage(reciveMessage)

		case CLEAR_MESSAGE:
			handleClearMessage(reciveMessage)

		case USER_UPDATE:
			handleUserUpdate(reciveMessage)

		case REMOVE_USER_IN_CHAT:
			//TO DO

		case ADD_USER_IN_CHAT:
			//TO DO

		case ADD_SESSION_ID:
			handleAddSessionId(reciveMessage)

		default:
			fmt.Print("UNKNOWN MESSAGE")
		}

	}

}

func (sv Secure_Server) Run() {

	router := mux.NewRouter()
	router.HandleFunc("/is-open", verifyIsOn)
	router.HandleFunc("/chat/{id}", getChat)
	router.HandleFunc("/connect-ws", createWsConnection)
	router.HandleFunc("/login", login)
	router.HandleFunc("/register", register)
	router.HandleFunc("/security/sessionid", getSessionId)
	router.HandleFunc("/chat/create", createChat)

	err := http.ListenAndServe(":"+sv.Port, router)

	if err != nil {
		fmt.Println(err.Error())
	}
}
