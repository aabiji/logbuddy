package main

import (
	"fmt"
	"net/http"
)

func (a *API) UserInfo(w http.ResponseWriter, r *http.Request) {
	userID, ok := parseJWT(w, r)
	if !ok {
		return
	}
	fmt.Println(userID)
	respond(w, http.StatusOK, map[string]string{
		"test": "message",
	})
}
