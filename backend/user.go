package main

import (
	"fmt"
	"net/http"
)

type UserDataRequest struct {
	Timestamp int `json:"startTime"`
}

// TODO!
func (a *API) UserData(w http.ResponseWriter, r *http.Request) {
	req, okReq := parseRequest[UserDataRequest](w, r)
	userID, okID := parseJWT(w, r)
	if !okReq || !okID {
		return
	}

	fmt.Println(userID, req)
	respond(w, http.StatusOK, map[string]string{
		"test": "message",
	})
}
