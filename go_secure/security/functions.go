package security

import (
	"go_secure/database"
	"net/http"
)

func ValidateAuthentication(w http.ResponseWriter, req *http.Request) bool {
	sessionId, err := req.Cookie(COOKIE_SESSION_ID)

	authUser := database.GetUserBySessionId(sessionId.Value)

	if err != nil || !(len(authUser.SessionId) > 0) {
		w.WriteHeader(http.StatusNetworkAuthenticationRequired)
		w.Write([]byte("You have to be authentificate firstly"))
		return true
	}
	return false
}

func ValidCredentials(login string, password string) (bool, string) {
	authUser := database.GetAuthUser(login)
	return authUser.Username == login && authUser.Password == password, authUser.SessionId
}

func SaveNewUser(login string, password string, sessionId string) bool {
	authUser := database.GetAuthUser(login)
	if authUser.ID != 0 {
		return false
	}
	database.SaveAuthUser(database.AuthTable{Username: login, Password: password, SessionId: sessionId})
	return true
}
