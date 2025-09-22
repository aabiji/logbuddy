package main

import (
	"net/http"
	"strconv"
)

type ExerciseJSON struct {
	ID        int     `json:"id"`
	WorkoutID int     `json:"workoutID"`
	Name      string  `json:"name"`
	Weight    int32   `json:"weight"`
	Reps      []int32 `json:"reps"`
}

type WorkoutJSON struct {
	ID         int32  `json:"id"`
	Name       string `json:"name"`
	Date       string `json:"date"`
	IsTemplate bool   `json:"isTemplate"`
}

func (a *API) CreateWorkout(w http.ResponseWriter, r *http.Request) {
	userID, okID := parseJWT(w, r)
	req, okReq := parseRequest[UpdateExerciseRequest](w, r)
	if !okID || !okReq {
		respond(w, http.StatusBadRequest, "invalid request payload")
		return
	}
}

func (a *API) DeleteWorkout(w http.ResponseWriter, r *http.Request) {
	userID, okID := parseJWT(w, r)
	idStr, okStr := getQueryParam(w, r, "workoutID")
	if !okID || !okStr {
		respond(w, http.StatusBadRequest, "invalid request parameter")
		return
	}
	workoutID, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		respond(w, http.StatusBadRequest, "invalid request parameter")
		return
	}

	respond(w, http.StatusOK, map[string]any{
		"workouts":  []WorkoutJSON{},
		"exercises": []ExerciseJSON{},
	})
}

func (a *API) GetWorkouts(w http.ResponseWriter, r *http.Request) {
	userID, okID := parseJWT(w, r)
	startTime, okStartTime := getQueryParam(w, r, "startTime")
	endTime, okEndTime := getQueryParam(w, r, "endTime")
	if !okID || !okStartTime || !okEndTime {
		respond(w, http.StatusBadRequest, "invalid request parameter")
		return
	}

	respond(w, http.StatusOK, map[string]any{"more": true})
}

type UpdateExerciseRequest struct {
	Delete bool `json:"isDelete"`
	ExerciseJSON
}

func (a *API) UpdateExercise(w http.ResponseWriter, r *http.Request) {
	userID, okID := parseJWT(w, r)
	req, okReq := parseRequest[UpdateExerciseRequest](w, r)
	if !okID || !okReq {
		respond(w, http.StatusBadRequest, "invalid request payload")
		return
	}
}
