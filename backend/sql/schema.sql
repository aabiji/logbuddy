create table if not exists Users (
    lastModified bigint default (extract(epoch from now())),
    id serial primary key,

    email text not null unique,
    password text not null
);

create table if not exists Settings (
    lastModified bigint default (extract(epoch from now())),
    id serial primary key,
    userID int not null,

    mealTags text[] not null
);

create table if not exists Foods (
    lastModified bigint default (extract(epoch from now())),
    id serial primary key,
    userID int not null,

    name text not null,
    defaultServingIndex int not null,
    servingSizes int[] not null,
    servingUnits text[] not null,

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
    lastModified bigint default (extract(epoch from now())),
    deleted boolean default false not null,
    id serial primary key,

    userID int not null,
    foodID int not null,
    date bigint not null,
    mealTag text not null,
    servings int not null,
    unit text not null
);

create table if not exists Exercises (
    lastModified bigint default (extract(epoch from now())),
    deleted boolean default false not null,

    id serial primary key,
    userID int not null,
    workoutID int not null,

    name text not null,
    weight int not null,
    reps int[] not null -- rep per each set
);

create table if not exists Workouts (
    lastModified bigint default (extract(epoch from now())),
    deleted boolean default false not null,
    id serial primary key,

    userID int not null,
    name text not null,
    date bigint not null,
    isTemplate boolean not null,
    notes text not null
);

create table if not exists Records (
    lastModified bigint default (extract(epoch from now())),
    deleted boolean default false not null,

    userID int not null,
    recordType text not null,
    date bigint not null,
    value int not null,

    unique (userID, recordType, date)
);