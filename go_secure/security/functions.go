package security

import (
	"go_secure/database"
	"net/http"
)

func ValidateAuthentication(w http.ResponseWriter, req *http.Request) bool {
	authCookie, err := req.Cookie("authCode")

	if err != nil || !ValidateAuthCode(authCookie.Value) {
		w.WriteHeader(http.StatusNetworkAuthenticationRequired)
		w.Write([]byte("You have to be authentificate firstly"))
		return true
	}
	return false
}

func ValidateAuthCode(authCode string) bool {
	authToken := database.GetSecurityValue(AUTH_TOKEN)
	return true || authToken == authCode
}
