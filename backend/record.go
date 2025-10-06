package main

import (
	"net/http"
	"time"

	"github.com/aabiji/lobbuddy/database"
	"github.com/jackc/pgx/v5/pgtype"
)

type RecordJSON struct {
	Deleted  bool  `json:"deleted"`
	IsPeriod bool  `json:"isPeriod"`
	Date     int64 `json:"date"`
	Value    int32 `json:"value"`
}

func (a *API) SetWeightEntry(w http.ResponseWriter, r *http.Request) {
	userID, ok := parseJWT(a, w, r)
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

	v := database.SetWeightParams{
		Date: date, Value: int32(weight), Userid: userID,
		Lastmodified: pgtype.Int8{Int64: time.Now().Unix(), Valid: true},
	}
	if err := a.queries.SetWeight(a.ctx, v); err != nil {
		respond(w, http.StatusInternalServerError, "failed to set weight entry")
		return
	}

	respond(w, http.StatusOK, nil)
}

func (a *API) DeleteWeightEntry(w http.ResponseWriter, r *http.Request) {
	userID, ok := parseJWT(a, w, r)
	if !ok {
		return
	}
	date, ok := getQueryInt(w, r, "date")
	if !ok {
		return
	}

	v := database.DeleteRecordParams{Date: date, Userid: userID}
	if err := a.queries.DeleteRecord(a.ctx, v); err != nil {
		respond(w, http.StatusInternalServerError, "failed to delete weight entry")
		return
	}

	respond(w, http.StatusOK, nil)
}

func (a *API) TogglePeriodDate(w http.ResponseWriter, r *http.Request) {
	userID, ok := parseJWT(a, w, r)
	if !ok {
		return
	}
	date, ok := getQueryInt(w, r, "date")
	if !ok {
		return
	}
	value, ok := getQueryInt(w, r, "set")
	if !ok {
		return
	}

	if err := a.queries.TogglePeriodDate(a.ctx, database.TogglePeriodDateParams{
		Userid: userID, Date: date, Value: int32(value),
		Lastmodified: pgtype.Int8{Int64: time.Now().Unix(), Valid: true},
	}); err != nil {
		respond(w, http.StatusInternalServerError, "failed to toggle date")
		return
	}

	respond(w, http.StatusOK, nil)
}
