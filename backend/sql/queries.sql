-- name: CreateUser :one
insert into users (email, password) values ($1, $2) returning id;

-- name: SetUserSettings :exec
insert into settings
(userID, mealTags, macroTargets, useImperial, trackPeriod)
values ($1, $2, $3, $4, $5)
on conflict (userID) do update
set mealTags = excluded.mealTags,
    macroTargets = excluded.macroTargets,
    useImperial = excluded.useImperial,
    trackPeriod = excluded.trackPeriod;

-- name: GetUserSettings :one
select * from settings where userID = $1;

-- name: UserExists :one
select exists(select 1 from users where id = $1);

-- name: GetUser :one
select id, email, Password from users where email = $1 or id = $2;

-- name: CreateFood :one
insert into foods
(userID, name, servingSizes, servingUnits, defaultServingIndex,
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
select * from meals where date = $1 and userID = $2 and deleted = false;

-- name: CreateWorkout :one
insert into workouts (userID, name, notes, date, isTemplate)
values ($1, $2, $3, $4, $5) returning id;

-- name: CreateExercise :one
insert into exercises (userID, workoutID, name, weight, reps)
values ($1, $2, $3, $4, $5) returning id;

-- name: DeleteWorkout :exec
update workouts set deleted = true, lastModified = $1
where userID = $2 and id = $3;

-- name: DeleteExercise :exec
update exercises set deleted = true, lastModified = $1 where workoutID = $2 and userID = $3;

-- name: SetWeight :exec
insert into records (userID, recordType, date, value) values ($1, 'weight', $2, $3);

-- name: TogglePeriodDate :exec
-- (toggles the value column between 0/1)
insert into records (userID, recordType, date, value) values ($1, 'period', $2, $3)
on conflict (userID, recordType, date) do update
set value = 1 - excluded.value, lastModified = $4;

-- name: DeleteRecord :exec
update records set deleted = true, lastModified = $1 where userID = $2 and date = $3;

-- name: GetUpdatedWorkouts :many
select * from workouts
where userID = $1 and lastModified >= $2
  and deleted = coalesce(sqlc.narg('ignoreDeleted'), deleted);

-- name: GetExercises :many
select * from exercises
where userID = $1 and workoutID = $2
  and deleted = coalesce(sqlc.narg('ignoreDeleted'), deleted);

-- name: GetUpdatedMeals :many
select * from meals where userID = $1 and lastModified >= $2
  and deleted = coalesce(sqlc.narg('ignoreDeleted'), deleted);

-- name: GetUpdatedRecords :many
select * from records where userID = $1 and lastModified >= $2
  and deleted = coalesce(sqlc.narg('ignoreDeleted'), deleted);

-- name: DeleteUser :exec
delete from users where id = $1;

-- name: DeleteSettings :exec
delete from settings where userID = $1;

-- name: DeleteFoods :exec
delete from foods where userID = $1;

-- name: DeleteMeals :exec
delete from meals where userID = $1;

-- name: DeleteRecords :exec
delete from records where userID = $1;

-- name: DeleteExercises :exec
delete from exercises where userID = $1;

-- name: DeleteWorkouts :exec
delete from workouts where userID = $1;