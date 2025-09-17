
-- name: CreateUser :one
insert into users (lastModified, email, password)
values ($1, $2, $3) returning id;

-- name: GetUserByID :one
select id from users where id = $1;

-- name: GetUserByEmail :one
select id, email, Password from users where email = $1;

-- name: CreateFood :one
insert into foods
(lastModified, name, servings, servingSizes, calories,
carbohydrate, protein, fat, calcium, potassium, iron)
values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
returning id;

-- name: GetFoodByID :one
select * from foods where id = $1;

-- name: SearchFoods :many
select * from foods
where to_tsvector(name) @@ websearch_to_tsquery($1);