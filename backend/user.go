package main

import (
	"encoding/json"
	"net/http"

	"github.com/aabiji/logbuddy/database"
	"github.com/jackc/pgx/v5/pgtype"
)

func newUser(a *API, email string, hashedPassword string) (int32, error) {
	tx, err := a.conn.Begin(a.ctx)
	if err != nil {
		return -1, err
	}
	defer tx.Rollback(a.ctx)
	qtx := a.queries.WithTx(tx)

	params := database.CreateUserParams{Email: email, Password: hashedPassword}
	id, err := qtx.CreateUser(a.ctx, params)
	if err != nil {
		return -1, err
	}

	// create the default user settings
	encoded, err := json.Marshal(map[string]int{"calories": 2000})
	if err != nil {
		return -1, err
	}

	if err := qtx.SetUserSettings(a.ctx, database.SetUserSettingsParams{
		Userid:       id,
		Mealtags:     []string{"Breakfast", "Lunch", "Dinner"},
		Useimperial:  true,
		Trackperiod:  true,
		Macrotargets: encoded,
	}); err != nil {
		return -1, err
	}

	return id, tx.Commit(a.ctx)
}

type SettingsJSON struct {
	MealTags     []string       `json:"mealTags"`
	UseImperial  bool           `json:"useImperial"`
	TrackPeriod  bool           `json:"trackPeriod"`
	MacroTargets map[string]int `json:"macroTargets"`
}

func (a *API) UpdatedUserData(w http.ResponseWriter, r *http.Request) {
	// get all user data that has been updated after a certain timestamp
	userID, ok := parseJWT(a, w, r)
	if !ok {
		return
	}
	time, ok := getQueryInt(w, r, "time")
	if !ok {
		return
	}
	flag, ok := getQueryString(w, r, "ignoreDeleted")
	if !ok {
		return
	}
	// optionally only get data that hasn't been soft deleted
	ignoreDeleted := pgtype.Bool{Valid: flag == "true", Bool: true}

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
		Userid:       userID, IgnoreDeleted: ignoreDeleted,
	})
	if err != nil {
		respond(w, http.StatusInternalServerError, "failed to fetch workouts")
		return
	}
	workouts := []WorkoutJSON{}
	for _, row := range workoutRows {
		workout, err := getWorkout(a.ctx, txq, row, ignoreDeleted)
		if err != nil {
			respond(w, http.StatusInternalServerError, "failed to fetch exercises")
			return
		}
		workouts = append(workouts, workout)
	}

	// get the user's meals and the foods associated to them
	mealRows, err := txq.GetUpdatedMeals(a.ctx, database.GetUpdatedMealsParams{
		Lastmodified: pgtype.Int8{Int64: time, Valid: true},
		Userid:       userID, IgnoreDeleted: ignoreDeleted,
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
		Userid:       userID, IgnoreDeleted: ignoreDeleted,
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
	settings := SettingsJSON{
		MealTags: row.Mealtags, UseImperial: row.Useimperial, TrackPeriod: row.Trackperiod,
	}
	if err := json.Unmarshal(row.Macrotargets, &settings.MacroTargets); err != nil {
		respond(w, http.StatusInternalServerError, "failed to fetch settings")
		return
	}

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

func (a *API) UpdateUserSettings(w http.ResponseWriter, r *http.Request) {
	userID, ok := parseJWT(a, w, r)
	if !ok {
		return
	}

	settings, ok := parseRequest[SettingsJSON](w, r)
	if !ok {
		return
	}

	encoded, err := json.Marshal(settings.MacroTargets)
	if err != nil {
		respond(w, http.StatusInternalServerError, "failed to update settings")
		return
	}

	if err := a.queries.SetUserSettings(a.ctx, database.SetUserSettingsParams{
		Userid:       userID,
		Mealtags:     settings.MealTags,
		Useimperial:  settings.UseImperial,
		Trackperiod:  settings.TrackPeriod,
		Macrotargets: encoded,
	}); err != nil {
		respond(w, http.StatusInternalServerError, "failed to update settings")
		return
	}

	respond(w, http.StatusOK, nil)
}

func deleteUser(a *API, userID int32) error {
	// hard delete the user's data
	tx, err := a.conn.Begin(a.ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(a.ctx)
	txq := a.queries.WithTx(tx)

	if err := txq.DeleteUser(a.ctx, userID); err != nil {
		return err
	}
	if err := txq.DeleteSettings(a.ctx, userID); err != nil {
		return err
	}
	if err := txq.DeleteFoods(a.ctx, userID); err != nil {
		return err
	}
	if err := txq.DeleteMeals(a.ctx, userID); err != nil {
		return err
	}
	if err := txq.DeleteRecords(a.ctx, userID); err != nil {
		return err
	}
	if err := txq.DeleteExercises(a.ctx, userID); err != nil {
		return err
	}
	if err := txq.DeleteWorkouts(a.ctx, userID); err != nil {
		return err
	}

	return tx.Commit(a.ctx)
}

func (a *API) DeleteUser(w http.ResponseWriter, r *http.Request) {
	userID, ok := parseJWT(a, w, r)
	if !ok {
		return
	}

	// verify the user's password then delete all their data
	user, err := a.queries.GetUser(a.ctx, database.GetUserParams{ID: userID})
	if err != nil {
		respond(w, http.StatusInternalServerError, "failed to delete user")
		return
	}

	password, ok := getQueryString(w, r, "password")
	if !ok {
		return
	}

	correct, err := verifyPassword(password, user.Password)
	if err != nil || !correct {
		respond(w, http.StatusBadRequest, "wrong password")
		return
	}

	if err := deleteUser(a, userID); err != nil {
		respond(w, http.StatusInternalServerError, "failed to delete user")
		return
	}

	respond(w, http.StatusOK, nil)
}
