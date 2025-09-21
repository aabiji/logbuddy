
create table if not exists Users (
    id serial primary key,
    lastModified timestamp not null,

    email text not null unique,
    password text not null
);

create table if not exists UserPreferences (
    id serial primary key,
    userID int not null,
    lastModified timestamp not null,

    mealTags text[] not null
);

create table if not exists Foods (
    id serial primary key,
    userid int not null,
    lastModified timestamp not null,

    name text not null,
    defaultServingIndex int not null,
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

create table if not exists Meals (
    id serial primary key,
    lastModified timestamp not null,
    deleted boolean not null,

    userID int not null,
    foodID int not null,
    date text not null,
    mealTag text not null,
    servings int not null,
    unit text not null
);
