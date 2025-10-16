package main

import (
	"net/http"
	"time"

	"github.com/aabiji/logbuddy/database"
	"github.com/jackc/pgx/v5/pgtype"
)

func (a *API) CreateFood(w http.ResponseWriter, r *http.Request) {
	userID, ok := parseJWT(a, w, r)
	if !ok {
		return
	}
	req, ok := parseRequest[FoodJSON](w, r)
	if !ok {
		return
	}

	id, err := a.queries.CreateFood(a.ctx, database.CreateFoodParams{
		Userid:              userID,
		Name:                req.Name,
		Servingsizes:        req.ServingSizes,
		Servingunits:        req.ServingUnits,
		Defaultservingindex: req.DefaultServingIndex,
		Calories:            req.Calories,
		Carbohydrate:        req.Carbohydrate,
		Protein:             req.Protein,
		Fat:                 req.Fat,
		Calcium:             req.Calcium,
		Potassium:           req.Potassium,
		Iron:                req.Iron,
	})
	if err != nil {
		respond(w, http.StatusInternalServerError, "couldn't create food")
		return
	}

	respond(w, http.StatusOK, map[string]any{"id": id})
}

func foodRowToJson(row database.Food) FoodJSON {
	return FoodJSON{
		ID:                  row.ID,
		Name:                row.Name,
		ServingSizes:        row.Servingsizes,
		ServingUnits:        row.Servingunits,
		DefaultServingIndex: row.Defaultservingindex,
		Calories:            row.Calories,
		Carbohydrate:        row.Carbohydrate,
		Protein:             row.Protein,
		Fat:                 row.Fat,
		Calcium:             row.Calcium,
		Potassium:           row.Potassium,
		Iron:                row.Iron,
	}
}

func (a *API) SearchFood(w http.ResponseWriter, r *http.Request) {
	userID, ok := parseJWT(a, w, r)
	query, okQuery := getQuery[string](w, r, "query")
	filterUser, okFilter := getQuery[string](w, r, "onlyUser")
	if !ok || !okQuery || !okFilter {
		return
	}

	var results []database.Food
	if filterUser == "true" {
		// only get foods the user has created that match the query
		var err error
		params := database.SearchUserFoodsParams{WebsearchToTsquery: query, Userid: userID}
		results, err = a.queries.SearchUserFoods(a.ctx, params)
		if err != nil {
			respond(w, http.StatusInternalServerError, "failed to search")
			return
		}
	} else {
		// fetch all query matches
		var err error
		results, err = a.queries.SearchFoods(a.ctx, query)
		if err != nil {
			respond(w, http.StatusInternalServerError, "failed to search")
			return
		}
	}

	foods := []FoodJSON{}
	for _, row := range results {
		foods = append(foods, foodRowToJson(row))
	}

	respond(w, http.StatusOK, map[string]any{"results": foods})
}

func (a *API) GetFood(w http.ResponseWriter, r *http.Request) {
	foodID, ok := getQuery[int64](w, r, "id")
	if !ok {
		return
	}

	row, err := a.queries.GetFoodByID(a.ctx, int32(foodID))
	if err != nil {
		respond(w, http.StatusInternalServerError, "failed to find food")
		return
	}

	data := map[string]any{"food": foodRowToJson(row)}
	respond(w, http.StatusOK, data)
}

func (a *API) SetMeal(w http.ResponseWriter, r *http.Request) {
	req, ok := parseRequest[MealJSON](w, r)
	if !ok {
		return
	}
	userID, ok := parseJWT(a, w, r)
	if !ok {
		return
	}

	if req.Updating {
		if err := a.queries.UpdateMeal(a.ctx, database.UpdateMealParams{
			Lastmodified: pgtype.Int8{Int64: time.Now().Unix(), Valid: true},
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
		Userid:   userID,
		Foodid:   req.FoodID,
		Date:     req.Date,
		Mealtag:  req.MealTag,
		Servings: req.Servings,
		Unit:     req.Unit,
	})
	if err != nil {
		respond(w, http.StatusInternalServerError, "couldn't create meal")
		return
	}
	respond(w, http.StatusOK, map[string]int32{"mealID": id})
}

func (a *API) DeleteMeal(w http.ResponseWriter, r *http.Request) {
	mealID, ok := getQuery[int64](w, r, "mealID")
	if !ok {
		return
	}

	userID, ok := parseJWT(a, w, r)
	if !ok {
		return
	}

	if err := a.queries.DeleteMeal(a.ctx, database.DeleteMealParams{
		Lastmodified: pgtype.Int8{Int64: time.Now().Unix(), Valid: true},
		Userid:       userID,
		ID:           int32(mealID),
	}); err != nil {
		respond(w, http.StatusInternalServerError, "couldn't delete meal")
		return
	}
	respond(w, http.StatusOK, nil)
}

func (a *API) GetMeals(w http.ResponseWriter, r *http.Request) {
	date, ok := getQuery[int64](w, r, "dateTimestamp")
	if !ok {
		return
	}

	userID, ok := parseJWT(a, w, r)
	if !ok {
		return
	}

	params := database.GetMealsForDayParams{Date: date, Userid: userID}
	rows, err := a.queries.GetMealsForDay(a.ctx, params)
	if err != nil {
		respond(w, http.StatusInternalServerError, "couldn't get meals")
		return
	}

	meals := []MealJSON{}
	for _, row := range rows {
		meals = append(meals, MealJSON{
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
