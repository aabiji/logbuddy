package main

import "net/http"

func (a *API) UpdatedUserData(w http.ResponseWriter, r *http.Request) {
	userID, ok := parseJWT(w, r)
	if !ok {
		return
	}
	lastSyncTime, ok := getQueryInt(w, r, "lastSyncTime")
	if !ok {
		return
	}

	// get settings, meals, food, workout, weight, period where lastSyncTime > 0
}

func (a *API) DeleteUser(w http.ResponseWriter, r *http.Request) {

}
