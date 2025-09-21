package main

import (
	"net/http"
	"strconv"
	"time"

	"github.com/aabiji/lobbuddy/database"
)

type FoodJSON struct {
	ID                  int32    `json:"id,omitempty"`
	Name                string   `json:"name"`
	Servings            []int32  `json:"servings"`
	ServingSizes        []string `json:"units"`
	DefaultServingIndex int32    `json:"defaultServingIndex"`
	Calories            float64  `json:"calories"`
	Carbohydrate        float64  `json:"carbohydrate"`
	Protein             float64  `json:"protein"`
	Fat                 float64  `json:"fat"`
	Calcium             float64  `json:"calcium"`
	Potassium           float64  `json:"potassium"`
	Iron                float64  `json:"iron"`
}

func (a *API) CreateFood(w http.ResponseWriter, r *http.Request) {
	userID, okID := parseJWT(w, r)
	req, ok := parseRequest[FoodJSON](w, r)
	if !ok || !okID {
		return
	}

	id, err := a.queries.CreateFood(a.ctx, database.CreateFoodParams{
		Lastmodified:        time.Now(),
		Userid:              userID,
		Name:                req.Name,
		Servings:            req.Servings,
		Servingsizes:        req.ServingSizes,
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
		Servings:            row.Servings,
		ServingSizes:        row.Servingsizes,
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
	userID, ok := parseJWT(w, r)
	query, okQuery := getQueryParam(w, r, "query")
	filterUser, okFilter := getQueryParam(w, r, "onlyUser")
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
	idStr, ok := getQueryParam(w, r, "id")
	if !ok {
		return
	}

	foodID, err := strconv.ParseInt(idStr, 10, 32)
	if err != nil {
		respond(w, http.StatusBadRequest, "invalid id")
		return
	}

	row, err := a.queries.GetFoodByID(a.ctx, int32(foodID))
	if err != nil {
		respond(w, http.StatusInternalServerError, "failed to find food")
		return
	}

	data := map[string]any{"foods": foodRowToJson(row)}
	respond(w, http.StatusOK, data)
}

type MealInfo struct {
	Updating bool   `json:"updating"`
	ID       int32  `json:"id,omitempty"`
	Date     string `json:"date,omitempty"`
	FoodID   int32  `json:"foodID,omitempty"`
	MealTag  string `json:"mealTag"`
	Servings int32  `json:"servings"`
	Unit     string `json:"servingsUnit"`
}

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
