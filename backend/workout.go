package main

import (
	"context"
	"net/http"
	"time"

	"github.com/aabiji/logbuddy/database"
	"github.com/jackc/pgx/v5/pgtype"
)

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
		respond(w, http.StatusInternalServerError, "Couldn't create workout")
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
		respond(w, http.StatusInternalServerError, "Couldn't create workout")
		return
	}

	params := []database.CreateExercisesParams{}
	for i := range response.Exercises {
		params = append(params, database.CreateExercisesParams{
			Userid:       userID,
			Workoutid:    response.ID,
			Exercisetype: response.Exercises[i].ExerciseType,
			Name:         response.Exercises[i].Name,
			Weight:       response.Exercises[i].Weight,
			Weightunit:   response.Exercises[i].WeightUnit,
			Reps:         response.Exercises[i].Reps,
			Duration:     response.Exercises[i].Duration,
		})
	}
	problem := false
	qtx.CreateExercises(a.ctx, params).Query(func(i1 int, ids []int32, err error) {
		if err != nil {
			problem = true
			return
		}
		for i, id := range ids {
			response.Exercises[i].ID = id
		}
	})
	if problem {
		respond(w, http.StatusInternalServerError, "Couldn't create workout")
		return
	}

	if err := tx.Commit(a.ctx); err != nil {
		respond(w, http.StatusInternalServerError, "Couldn't create workout")
		return
	}
	respond(w, http.StatusOK, map[string]any{"workout": response})
}

func (a *API) DeleteWorkout(w http.ResponseWriter, r *http.Request) {
	userID, ok := parseJWT(a, w, r)
	if !ok {
		return
	}
	workoutID, ok := getQuery[int64](w, r, "id")
	if !ok {
		return
	}

	tx, err := a.conn.Begin(a.ctx)
	if err != nil {
		respond(w, http.StatusInternalServerError, "Couldn't delete workout")
		return
	}
	defer tx.Rollback(a.ctx)
	qtx := a.queries.WithTx(tx)

	if err := qtx.DeleteWorkout(a.ctx, database.DeleteWorkoutParams{
		Lastmodified: pgtype.Int8{Int64: time.Now().Unix(), Valid: true},
		Userid:       userID,
		ID:           int32(workoutID),
	}); err != nil {
		respond(w, http.StatusInternalServerError, "Couldn't delete workout")
		return
	}

	if err := qtx.DeleteExercise(a.ctx, database.DeleteExerciseParams{
		Lastmodified: pgtype.Int8{Int64: time.Now().Unix(), Valid: true},
		Userid:       userID,
		Workoutid:    int32(workoutID),
	}); err != nil {
		respond(w, http.StatusInternalServerError, "Couldn't delete workout")
		return
	}

	if err := tx.Commit(a.ctx); err != nil {
		respond(w, http.StatusInternalServerError, "Couldn't delete workout")
		return
	}
	respond(w, http.StatusOK, nil)
}

func getWorkout(
	ctx context.Context, q *database.Queries,
	w database.Workout, ignoreDeleted pgtype.Bool,
) (WorkoutJSON, error) {
	rows, err := q.GetExercises(ctx, database.GetExercisesParams{
		Userid: w.Userid, Workoutid: w.ID, IgnoreDeleted: ignoreDeleted})
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
			Weight: row.Weight, WeightUnit: row.Weightunit,
			Reps: row.Reps,
		})
	}
	return workout, nil
}
