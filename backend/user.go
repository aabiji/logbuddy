package main

import (
	"fmt"
	"net/http"
)

type UserDataRequest struct {
	Timestamp int `json:"startTime"`
}

// TODO! i don't even think we need this endpoint
func (a *API) UserData(w http.ResponseWriter, r *http.Request) {
	req, ok := parseRequest[UserDataRequest](w, r)
	if !ok {
		return
	}
	userID, ok := parseJWT(w, r)
	if !ok {
		return
	}

	fmt.Println(userID, req)
	respond(w, http.StatusOK, map[string]string{
		"test": "message",
	})
}
