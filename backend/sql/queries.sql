-- name: CreateUser :one
insert into users (lastModified, email, password)
values ($1, $2, $3) returning id;

-- name: CreateDefaultPreferences :exec
insert into userpreferences (userID, lastModified, mealTags)
values ($1, $2, ARRAY['Breakfast','Lunch','Dinner','Snacks']);

-- name: GetUserByID :one
select id from users where id = $1;

-- name: GetUserByEmail :one
select id, email, Password from users where email = $1;

-- name: CreateFood :one
insert into foods
(lastModified, userid, name, servings, servingSizes, defaultServingIndex,
calories, carbohydrate, protein, fat, calcium, potassium, iron)
values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
returning id;

-- name: GetFoodByID :one
select * from foods where id = $1;

-- name: SearchFoods :many
select * from foods
where to_tsvector(name) @@ websearch_to_tsquery($1) limit 100;

-- name: SearchUserFoods :many
select * from foods
where to_tsvector(name) @@ websearch_to_tsquery($1) and userid = $2
limit 100;

-- name: CreateMeal :one
insert into meals
(userID, lastModified, deleted, foodID, date, mealTag, servings, unit)
values ($1, $2, $3, $4, $5, $6, $7, $8) returning id;

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
insert into workouts
(lastModified, deleted, name, date, isTemplate)
values ($1, $2, $3, $4, $5) returning id;

-- name: CreateExercise :one
insert into exercises
(lastModified, deleted, workoutID, name, weight, reps)
values ($1, $2, $3, $4, $5, $6) returning id;

-- name: UpdateExercise :exec
update exercises
set lastModified = $1, deleted = $2, name = $3, weight = $4, reps = $5
where ID = $6;

-- name: DeleteWorkout :exec
update workouts set deleted = true, lastModified = $1
where userID = $2 and id = $3;

-- name: GetWorkouts :many
select * from workouts w
join exercises e on e.workoutID = w.id
where w.id = $1 and w.userID = $2 and w.date >= $3 and w.date <= $4;
