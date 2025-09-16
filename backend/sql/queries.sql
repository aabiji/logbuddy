
-- name: CreateFood :exec
insert into Foods
(LastModified, Name, Servings, ServingSizes, Calories,
Carbohydrates, Protein, Fat, Calcium, Potassium, Iron)
values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
returning id;

-- name: FindByID :one
select * from Foods where ID = $1;

-- TODO: find by text query