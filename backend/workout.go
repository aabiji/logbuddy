package main

import (
	"net/http"
	"time"

	"github.com/aabiji/lobbuddy/database"
	"github.com/jackc/pgx/v5/pgtype"
)

type ExerciseJSON struct {
	ID        int32   `json:"id"`
	WorkoutID int32   `json:"workoutID"`
	Name      string  `json:"name"`
	Weight    int32   `json:"weight"`
	Reps      []int32 `json:"reps"`
}

type WorkoutJSON struct {
	ID         int32          `json:"id"`
	Name       string         `json:"name"`
	Date       int64          `json:"date"`
	IsTemplate bool           `json:"isTemplate"`
	Exercises  []ExerciseJSON `json:"exercises"`
}

func (a *API) CreateWorkout(w http.ResponseWriter, r *http.Request) {
	userID, ok := parseJWT(w, r)
	if !ok {
		return
	}

	req, ok := parseRequest[WorkoutJSON](w, r)
	if !ok {
		return
	}

	tx, err := a.conn.Begin(a.ctx)
	if err != nil {
		respond(w, http.StatusInternalServerError, "couldn't create workout")
		return
	}
	defer tx.Rollback(a.ctx)
	qtx := a.queries.WithTx(tx)

	response := req
	response.ID, err = qtx.CreateWorkout(a.ctx, database.CreateWorkoutParams{
		Userid:     userID,
		Name:       req.Name,
		Date:       req.Date,
		Istemplate: req.IsTemplate,
	})
	if err != nil {
		respond(w, http.StatusInternalServerError, "couldn't create workout")
		return
	}

	for i := range response.Exercises {
		var err error
		response.Exercises[i].ID, err = qtx.CreateExercise(a.ctx,
			database.CreateExerciseParams{
				Userid:    userID,
				Workoutid: response.ID,
				Name:      response.Exercises[i].Name,
				Weight:    response.Exercises[i].Weight,
				Reps:      response.Exercises[i].Reps,
			})
		if err != nil {
			respond(w, http.StatusInternalServerError, "couldn't create workout")
			return
		}
	}

	if err := tx.Commit(a.ctx); err != nil {
		respond(w, http.StatusInternalServerError, "couldn't create workout")
		return
	}
	respond(w, http.StatusOK, map[string]any{"workout": response})
}

func (a *API) DeleteWorkout(w http.ResponseWriter, r *http.Request) {
	userID, ok := parseJWT(w, r)
	if !ok {
		return
	}
	workoutID, ok := getQueryInt(w, r, "workoutID")
	if !ok {
		return
	}

	tx, err := a.conn.Begin(a.ctx)
	if err != nil {
		respond(w, http.StatusInternalServerError, "couldn't delete workout")
		return
	}
	defer tx.Rollback(a.ctx)
	qtx := a.queries.WithTx(tx)

	if err := qtx.DeleteWorkout(a.ctx, database.DeleteWorkoutParams{
		Lastmodified: pgtype.Int8{Int64: time.Now().Unix(), Valid: true},
		Userid:       userID,
		ID:           int32(workoutID),
	}); err != nil {
		respond(w, http.StatusInternalServerError, "couldn't delete workout")
		return
	}

	if err := qtx.DeleteExercise(a.ctx, database.DeleteExerciseParams{
		Lastmodified: pgtype.Int8{Int64: time.Now().Unix(), Valid: true},
		Userid:       userID,
		Workoutid:    int32(workoutID),
	}); err != nil {
		respond(w, http.StatusInternalServerError, "couldn't delete workout")
		return
	}

	if err := tx.Commit(a.ctx); err != nil {
		respond(w, http.StatusInternalServerError, "couldn't delete workout")
		return
	}
	respond(w, http.StatusOK, nil)
}

type UpdateExerciseRequest struct {
	Deleted bool `json:"deleted"`
	ExerciseJSON
}

func (a *API) UpdateExercise(w http.ResponseWriter, r *http.Request) {
	userID, ok := parseJWT(w, r)
	if !ok {
		return
	}

	req, ok := parseRequest[UpdateExerciseRequest](w, r)
	if !ok {
		return
	}

	if err := a.queries.UpdateExercise(a.ctx, database.UpdateExerciseParams{
		Lastmodified: pgtype.Int8{Int64: time.Now().Unix(), Valid: true},
		Deleted:      req.Deleted,
		Name:         req.Name,
		Weight:       req.Weight,
		Reps:         req.Reps,
		ID:           req.ID,
		Userid:       userID,
	}); err != nil {
		respond(w, http.StatusInternalServerError, "couldn't update exercise")
		return
	}

	if err := a.queries.UpdateWorkout(a.ctx, database.UpdateWorkoutParams{
		Lastmodified: pgtype.Int8{Int64: time.Now().Unix(), Valid: true},
		ID:           req.WorkoutID,
		Userid:       userID,
	}); err != nil {
		respond(w, http.StatusInternalServerError, "couldn't update exercise")
		return
	}

	respond(w, http.StatusOK, nil)
}

func (a *API) GetWorkouts(w http.ResponseWriter, r *http.Request) {
	userID, ok := parseJWT(w, r)
	if !ok {
		return
	}
	workoutID, ok := getQueryInt(w, r, "workoutID")
	if !ok {
		return
	}
	startTime, ok := getQueryInt(w, r, "startTime")
	if !ok {
		return
	}
	endTime, ok := getQueryInt(w, r, "endTime")
	if !ok {
		return
	}

	tx, err := a.conn.Begin(a.ctx)
	if err != nil {
		respond(w, http.StatusInternalServerError, "couldn't get workouts")
		return
	}
	defer tx.Rollback(a.ctx)
	qtx := a.queries.WithTx(tx)

	rows, err := qtx.GetWorkouts(a.ctx, database.GetWorkoutsParams{
		ID:     int32(workoutID),
		Userid: userID,
		Date:   startTime,
		Date_2: endTime,
	})
	if err != nil {
		respond(w, http.StatusInternalServerError, "couldn't get workouts")
		return
	}

	workouts := []WorkoutJSON{}
	for _, row := range rows {
		workout := WorkoutJSON{
			ID:         row.ID,
			Name:       row.Name,
			Date:       row.Date,
			IsTemplate: row.Istemplate,
			Exercises:  []ExerciseJSON{},
		}
		childRows, err := qtx.GetExercises(a.ctx, database.GetExercisesParams{
			Workoutid: workout.ID,
			Userid:    userID,
		})
		if err != nil {
			respond(w, http.StatusInternalServerError, "couldn't get workouts")
			return
		}
		for _, child := range childRows {
			workout.Exercises = append(workout.Exercises, ExerciseJSON{
				ID:        child.ID,
				WorkoutID: child.Workoutid,
				Name:      child.Name,
				Weight:    child.Weight,
				Reps:      child.Reps,
			})
		}
		workouts = append(workouts, workout)
	}

	if err := tx.Commit(a.ctx); err != nil {
		respond(w, http.StatusInternalServerError, "couldn't get workouts")
		return
	}
	respond(w, http.StatusOK, map[string]any{"results": workouts})
}
