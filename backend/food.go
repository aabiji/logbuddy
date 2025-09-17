package main

import (
	"net/http"
	"time"

	"github.com/aabiji/lobbuddy/database"
)

type FoodJSON struct {
	ID           int32    `json:"id,omitempty"`
	Name         string   `json:"name"`
	Servings     []int32  `json:"servings"`
	ServingSizes []string `json:"units"`
	Calories     float64  `json:"calories"`
	Carbohydrate float64  `json:"carbohydrate"`
	Protein      float64  `json:"protein"`
	Fat          float64  `json:"fat"`
	Calcium      float64  `json:"calcium"`
	Potassium    float64  `json:"potassium"`
	Iron         float64  `json:"iron"`
}

func (a *API) CreateFood(w http.ResponseWriter, r *http.Request) {
	req, ok := parseRequest[FoodJSON](w, r)
	if !ok {
		return
	}

	id, err := a.queries.CreateFood(a.ctx, database.CreateFoodParams{
		Lastmodified: time.Now(),
		Name:         req.Name,
		Servings:     req.Servings,
		Servingsizes: req.ServingSizes,
		Calories:     req.Calories,
		Carbohydrate: req.Carbohydrate,
		Protein:      req.Protein,
		Fat:          req.Fat,
		Calcium:      req.Calcium,
		Potassium:    req.Potassium,
		Iron:         req.Iron,
	})
	if err != nil {
		respond(w, http.StatusInternalServerError, "couldn't create food")
		return
	}

	respond(w, http.StatusOK, map[string]any{"id": id})
}

func (a *API) SearchFood(w http.ResponseWriter, r *http.Request) {
	query, ok := getQueryParam(w, r, "query")
	if !ok {
		return
	}

	results, err := a.queries.SearchFoods(a.ctx, query)
	if err != nil {
		respond(w, http.StatusInternalServerError, "failed to search")
		return
	}

	foods := []FoodJSON{}
	for _, row := range results {
		foods = append(foods, FoodJSON{
			ID:           row.ID,
			Name:         row.Name,
			Servings:     row.Servings,
			ServingSizes: row.Servingsizes,
			Calories:     row.Calories,
			Carbohydrate: row.Carbohydrate,
			Protein:      row.Protein,
			Fat:          row.Fat,
			Calcium:      row.Calcium,
			Potassium:    row.Potassium,
			Iron:         row.Iron,
		})
	}

	respond(w, http.StatusOK, map[string]any{"results": foods})
}
