package main

import (
	"net/http"
	"strconv"
	"time"

	"github.com/aabiji/lobbuddy/database"
)

type MealInfo struct {
	Updating bool   `json:"updating"`
	ID       int32  `json:"omitempty"`
	Date     string `json:"date,omitempty"`
	FoodID   int32  `json:"foodID,omitempty"`
	MealTag  string `json:"mealTag"`
	Servings int32  `json:"servings"`
	Unit     string `json:"servingsUnits"`
}

// Create or update a meal
func (a *API) SetMeal(w http.ResponseWriter, r *http.Request) {
	req, okReq := parseRequest[MealInfo](w, r)
	userID, okID := parseJWT(w, r)
	if !okID || !okReq {
		respond(w, http.StatusBadRequest, "invalid request")
		return
	}

	if req.Updating {
		if err := a.queries.UpdateMeal(a.ctx, database.UpdateMealParams{
			Lastmodified: time.Now(),
			Mealtag:      req.MealTag,
			Servings:     req.Servings,
			Unit:         req.Unit,
			ID:           req.ID,
		}); err != nil {
			respond(w, http.StatusInternalServerError, "couldn't update meal")
			return
		}
		respond(w, http.StatusOK, nil)
		return
	}

	id, err := a.queries.CreateMeal(a.ctx, database.CreateMealParams{
		Userid:       userID,
		Lastmodified: time.Now(),
		Deleted:      false,
		Foodid:       req.FoodID,
		Date:         req.Date,
		Mealtag:      req.MealTag,
		Servings:     req.Servings,
		Unit:         req.Unit,
	})
	if err != nil {
		respond(w, http.StatusInternalServerError, "couldn't create meal")
		return
	}
	respond(w, http.StatusOK, map[string]int32{"mealID": id})
}

func (a *API) DeleteMeal(w http.ResponseWriter, r *http.Request) {
	idStr, exists := getQueryParam(w, r, "mealID")
	userID, okID := parseJWT(w, r)
	if !okID || !exists {
		respond(w, http.StatusBadRequest, "invalid request")
		return
	}

	mealID, err := strconv.ParseInt(idStr, 10, 32)
	if err != nil {
		respond(w, http.StatusBadRequest, "invalid id")
		return
	}

	if err := a.queries.DeleteMeal(a.ctx, database.DeleteMealParams{
		Lastmodified: time.Now(),
		Userid:       userID,
		ID:           int32(mealID),
	}); err != nil {
		respond(w, http.StatusInternalServerError, "couldn't delete meal")
		return
	}
	respond(w, http.StatusOK, nil)
}

func (a *API) GetMeals(w http.ResponseWriter, r *http.Request) {
	date, dateExists := getQueryParam(w, r, "date")
	userID, okID := parseJWT(w, r)
	if !okID || !dateExists {
		respond(w, http.StatusBadRequest, "invalid request")
		return
	}

	params := database.GetMealsForDayParams{Date: date, Userid: userID}
	rows, err := a.queries.GetMealsForDay(a.ctx, params)
	if err != nil {
		respond(w, http.StatusInternalServerError, "couldn't get meals")
		return
	}

	meals := []MealInfo{}
	for _, row := range rows {
		meals = append(meals, MealInfo{
			ID:       row.ID,
			Date:     row.Date,
			FoodID:   row.Foodid,
			MealTag:  row.Mealtag,
			Servings: row.Servings,
			Unit:     row.Unit,
		})
	}

	respond(w, http.StatusOK, map[string]any{"meals": meals})
}
