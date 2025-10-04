package main

import (
	"context"
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
	Deleted    bool           `json:"deleted"`
	ID         int32          `json:"id"`
	Name       string         `json:"name"`
	Notes      string         `json:"notes"`
	Date       int64          `json:"date"`
	IsTemplate bool           `json:"isTemplate"`
	Exercises  []ExerciseJSON `json:"exercises"`
}

func (a *API) CreateWorkout(w http.ResponseWriter, r *http.Request) {
	userID, ok := parseJWT(a, w, r)
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
		Notes:      req.Notes,
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
	userID, ok := parseJWT(a, w, r)
	if !ok {
		return
	}
	workoutID, ok := getQueryInt(w, r, "id")
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

func getWorkout(ctx context.Context, q *database.Queries,
	w database.Workout) (WorkoutJSON, error) {
	rows, err := q.GetExercises(ctx,
		database.GetExercisesParams{Userid: w.Userid, Workoutid: w.ID})
	if err != nil {
		return WorkoutJSON{}, err
	}
	workout := WorkoutJSON{
		Deleted: w.Deleted, ID: w.ID, Name: w.Name, Notes: w.Notes,
		Date: w.Date, IsTemplate: w.Istemplate, Exercises: []ExerciseJSON{},
	}
	for _, row := range rows {
		workout.Exercises = append(workout.Exercises, ExerciseJSON{
			ID: row.ID, WorkoutID: w.ID, Name: row.Name,
			Weight: row.Weight, Reps: row.Reps,
		})
	}
	return workout, nil
}
