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
	(*w).Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
	(*w).Header().Set("Access-Control-Allow-Credentials", "true")
	(*w).Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
	(*w).Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Authorization,  X-Requested-With")
	if req.Method == http.MethodOptions {
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

	if enableCORS(&w, req) {
		return
	}

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
	login := contentMap["username"]
	password := contentMap["password"]

	goodCredentials, sessionId := security.ValidCredentials(login, password)

	if goodCredentials {
		cookie := http.Cookie{Name: security.COOKIE_SESSION_ID, Value: sessionId, Path: "/"}
		http.SetCookie(w, &cookie)
		if len(sessionId) == 0 {
			w.WriteHeader(http.StatusBadRequest)
			w.Write([]byte("You have to add a sessionId first!"))
			return
		}
		database.MigrateDatabase(sessionId)

		w.WriteHeader(http.StatusOK)
		w.Write([]byte(sessionId))
		return
	}
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

	content, err := ioutil.ReadAll(req.Body)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		utils.Logg(err)
		fmt.Fprint(w, "Internal error!")
	}

	contentMap := make(map[string]string)
	json.Unmarshal(content, &contentMap)
	login := contentMap["username"]
	password := contentMap["password"]
	sessionId := contentMap["sessionId"]

	if !security.SaveNewUser(login, password, sessionId) {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Some errors at register"))
	}
	w.Write([]byte("You have successfully registered!"))
}

func getChat(w http.ResponseWriter, req *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")

	sessionId, errCookie := req.Cookie(security.COOKIE_SESSION_ID)

	if errCookie != nil {
		utils.Logg(errCookie)
		return
	}

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

		w.Write(serialize(database.ConstructChatDTO(sessionId.Value, database.GetChat(sessionId.Value, id))))
	}
}

func createWsConnection(w http.ResponseWriter, req *http.Request) {

	if security.ValidateAuthentication(w, req) {
		return
	}
	sessionId, errCookie := req.Cookie(security.COOKIE_SESSION_ID)

	if errCookie != nil {
		utils.Logg(errCookie)
		return
	}
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
			database.CloseConnectionDB(sessionId.Value)
			return
		}

		reciveMessage := deserialize(content_bytes)
		fmt.Print(string(content_bytes))
		if reciveMessage.MessageType != AUTHENTICATION && isFirstPackage {
			conn.Close()
			return
		}

		switch reciveMessage.MessageType {

		case ENCRYPTED_MESSAGE:
			handleEncryptedMessage(reciveMessage)

		case CLEAR_MESSAGE:
			handleClearMessage(sessionId.Value, reciveMessage)

		case USER_UPDATE:
			handleUserUpdate(sessionId.Value, reciveMessage)

		case REMOVE_USER_IN_CHAT:
			//TO DO

		case ADD_USER_IN_CHAT:
			//TO DO

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
	router.HandleFunc("/chat/create", createChat)
	router.HandleFunc("/synchronization", synchronizationWithServer)

	err := http.ListenAndServe(":"+sv.Port, router)

	if err != nil {
		fmt.Println(err.Error())
	}
}
