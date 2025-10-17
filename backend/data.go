package main

type SettingsJSON struct {
	MealTags     []string       `json:"mealTags"`
	UseImperial  bool           `json:"useImperial"`
	TrackPeriod  bool           `json:"trackPeriod"`
	MacroTargets map[string]int `json:"macroTargets"`
	DarkMode     bool           `json:"darkMode"`
}

type ExerciseJSON struct {
	ID           int32   `json:"id"`
	WorkoutID    int32   `json:"workoutID"`
	ExerciseType string  `json:"exerciseType"`
	Name         string  `json:"name"`
	Weight       int32   `json:"weight"`
	WeightUnit   string  `json:"weightUnit"`
	Reps         []int32 `json:"reps"`
	Duration     float64 `json:"duration"`
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

type RecordJSON struct {
	Deleted  bool    `json:"deleted"`
	IsPeriod bool    `json:"isPeriod"`
	Date     int64   `json:"date"`
	Value    float64 `json:"value"`
}

type FoodJSON struct {
	ID                  int32     `json:"id,omitempty"`
	Name                string    `json:"name"`
	ServingSizes        []float64 `json:"servingSizes"`
	ServingUnits        []string  `json:"servingUnits"`
	DefaultServingIndex int32     `json:"defaultServingIndex"`
	Calories            float64   `json:"calories"`
	Carbohydrate        float64   `json:"carbohydrate"`
	Protein             float64   `json:"protein"`
	Fat                 float64   `json:"fat"`
	Calcium             float64   `json:"calcium"`
	Potassium           float64   `json:"potassium"`
	Iron                float64   `json:"iron"`
}

type MealJSON struct {
	Updating bool    `json:"updating"`
	Deleted  bool    `json:"deleted"`
	ID       int32   `json:"id,omitempty"`
	Date     int64   `json:"date,omitempty"`
	FoodID   int32   `json:"foodID,omitempty"`
	MealTag  string  `json:"mealTag"`
	Servings float64 `json:"servings"`
	Unit     string  `json:"servingsUnit"`
}
