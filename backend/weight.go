package main

import (
	"net/http"

	"github.com/aabiji/lobbuddy/database"
)

func (a *API) SetWeightEntry(w http.ResponseWriter, r *http.Request) {
	userID, ok := parseJWT(w, r)
	if !ok {
		return
	}
	date, ok := getQueryInt(w, r, "date")
	if !ok {
		return
	}
	weight, ok := getQueryInt(w, r, "weight")
	if !ok {
		return
	}

	v := database.SetWeightParams{Date: date, Weight: int32(weight), Userid: userID}
	if err := a.queries.SetWeight(a.ctx, v); err != nil {
		respond(w, http.StatusInternalServerError, "failed to set entry")
		return
	}

	respond(w, http.StatusOK, nil)
}

func (a *API) DeleteWeightEntry(w http.ResponseWriter, r *http.Request) {
	userID, ok := parseJWT(w, r)
	if !ok {
		return
	}
	date, ok := getQueryInt(w, r, "date")
	if !ok {
		return
	}

	v := database.DeleteWeightParams{Date: date, Userid: userID}
	if err := a.queries.DeleteWeight(a.ctx, v); err != nil {
		respond(w, http.StatusInternalServerError, "failed to set entry")
		return
	}

	respond(w, http.StatusOK, nil)
}
