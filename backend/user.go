package main

import (
	"net/http"

	"github.com/aabiji/lobbuddy/database"
	"github.com/jackc/pgx/v5/pgtype"
)

type SettingsJSON struct {
	MealTags []string `json:"mealTags"`
}

func (a *API) UpdatedUserData(w http.ResponseWriter, r *http.Request) {
	userID, ok := parseJWT(w, r)
	if !ok {
		return
	}
	time, ok := getQueryInt(w, r, "time")
	if !ok {
		return
	}

	tx, err := a.conn.Begin(a.ctx)
	if err != nil {
		respond(w, http.StatusInternalServerError, "failed to fetch data")
		return
	}
	defer tx.Rollback(a.ctx)
	txq := a.queries.WithTx(tx)

	// get the user's workouts
	workoutRows, err := txq.GetUpdatedWorkouts(a.ctx, database.GetUpdatedWorkoutsParams{
		Lastmodified: pgtype.Int8{Int64: time, Valid: true},
		Userid:       userID,
	})
	if err != nil {
		respond(w, http.StatusInternalServerError, "failed to fetch workouts")
		return
	}
	workouts := []WorkoutJSON{}
	for _, row := range workoutRows {
		workout, err := getWorkout(a.ctx, txq, row)
		if err != nil {
			respond(w, http.StatusInternalServerError, "failed to fetch exercises")
			return
		}
		workouts = append(workouts, workout)
	}

	// get the user's meals and the foods associated to them
	mealRows, err := txq.GetUpdatedMeals(a.ctx, database.GetUpdatedMealsParams{
		Lastmodified: pgtype.Int8{Int64: time, Valid: true},
		Userid:       userID,
	})
	if err != nil {
		respond(w, http.StatusInternalServerError, "failed to fetch meals")
		return
	}
	meals := []MealJSON{}
	foods := []FoodJSON{}
	for _, row := range mealRows {
		frow, err := txq.GetFoodByID(a.ctx, row.Foodid)
		if err != nil {
			respond(w, http.StatusInternalServerError, "failed to fetch foods")
			return
		}
		meals = append(meals, MealJSON{
			Deleted: row.Deleted, ID: row.ID, Date: row.Date, FoodID: row.Foodid,
			MealTag: row.Mealtag, Servings: row.Servings, Unit: row.Unit,
		})
		foods = append(foods, foodRowToJson(frow))
	}

	// get the user's records
	recordRows, err := txq.GetUpdatedRecords(a.ctx, database.GetUpdatedRecordsParams{
		Lastmodified: pgtype.Int8{Int64: time, Valid: true},
		Userid:       userID,
	})
	if err != nil {
		respond(w, http.StatusInternalServerError, "failed to fetch records")
		return
	}
	records := []RecordJSON{}
	for _, row := range recordRows {
		records = append(records, RecordJSON{
			Deleted: row.Deleted, IsPeriod: row.Recordtype == "period",
			Date: row.Date, Value: row.Value,
		})
	}

	// always get settings
	row, err := txq.GetUserSettings(a.ctx, userID)
	if err != nil {
		respond(w, http.StatusInternalServerError, "failed to fetch settings")
		return
	}
	settings := SettingsJSON{MealTags: row.Mealtags}

	if err := tx.Commit(a.ctx); err != nil {
		respond(w, http.StatusInternalServerError, "failed to fetch data")
		return
	}

	respond(w, http.StatusOK, map[string]any{
		"workouts": workouts,
		"foods":    foods,
		"meals":    meals,
		"records":  records,
		"settings": settings,
	})
}

func (a *API) DeleteUser(w http.ResponseWriter, r *http.Request) {
}
