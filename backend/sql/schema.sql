
create table if not exists Users (
    id serial primary key,
    lastModified timestamp not null,

    email text not null unique,
    password text not null
);

create table if not exists Foods (
    id serial primary key,
    lastModified timestamp not null,

    name text not null,
    servings int[] not null,
    servingSizes text[] not null,

    -- per 1 g
    calories float not null,
    carbohydrate float not null,
    protein float not null,
    fat float not null,
    calcium float not null,
    potassium float not null,
    iron float not null
);