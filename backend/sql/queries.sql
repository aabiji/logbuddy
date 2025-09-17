
-- name: CreateUser :one
insert into Users (LastModified, Email, Password)
values ($1, $2, $3) returning id;

-- name: GetUserByID :one
select ID from Users where ID = $1;

-- name: GetUserByEmail :one
select ID, Email, Password from Users where Email = $1;

-- name: CreateFood :exec
insert into Foods
(LastModified, Name, Servings, ServingSizes, Calories,
Carbohydrates, Protein, Fat, Calcium, Potassium, Iron)
values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
returning ID;

-- name: FindByID :one
select * from Foods where ID = $1;

-- TODO: find by text query