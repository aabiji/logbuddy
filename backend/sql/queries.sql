-- name: CreateUser :one
insert into users (email, password) values ($1, $2) returning id;

-- name: CreateDefaultPreferences :exec
insert into userpreferences (userID, mealTags)
values ($1, ARRAY['Breakfast','Lunch','Dinner','Snacks']);

-- name: GetUserByID :one
select id from users where id = $1;

-- name: GetUserByEmail :one
select id, email, Password from users where email = $1;

-- name: CreateFood :one
insert into foods
(userID, name, servings, servingSizes, defaultServingIndex,
calories, carbohydrate, protein, fat, calcium, potassium, iron)
values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
returning id;

-- name: GetFoodByID :one
select * from foods where id = $1;

-- name: SearchFoods :many
select * from foods
where to_tsvector(name) @@ websearch_to_tsquery($1) limit 100;

-- name: SearchUserFoods :many
select * from foods
where to_tsvector(name) @@ websearch_to_tsquery($1) and userID = $2 limit 100;

-- name: CreateMeal :one
insert into meals
(userID, foodID, date, mealTag, servings, unit)
values ($1, $2, $3, $4, $5, $6) returning id;

-- name: DeleteMeal :exec
update meals set deleted = true, lastModified = $1
where userID = $2 and id = $3;

-- name: UpdateMeal :exec
update meals
set lastModified = $1, mealTag = $2, servings = $3, unit = $4
where ID = $5;

-- name: GetMealsForDay :many
select id, foodID, date, mealTag, servings, unit
from meals where date = $1 and userID = $2 and deleted = false;

-- name: CreateWorkout :one
insert into workouts (userID, name, date, isTemplate)
values ($1, $2, $3, $4) returning id;

-- name: CreateExercise :one
insert into exercises (userID, workoutID, name, weight, reps)
values ($1, $2, $3, $4, $5) returning id;

-- name: UpdateExercise :exec
update exercises
set lastModified = $1, deleted = $2, name = $3, weight = $4, reps = $5
where id = $6 and userID = $7;

-- name: DeleteWorkout :exec
update workouts set deleted = true, lastModified = $1
where userID = $2 and id = $3;

-- name: DeleteExercise :exec
update exercises set deleted = true, lastModified = $1 where workoutID = $2 and userID = $3;

-- name: GetExercises :many
select * from exercises where workoutID = $1 and userID = $2;

-- name: GetWorkouts :many
select * from workouts
where id = $1 and userID = $2 and date >= $3 and date <= $4;
