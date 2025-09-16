
create table if not exists Foods (
    ID serial primary key,
    LastModified timestamp not null,

    Name text not null,
    Servings int[] not null,
    ServingSizes text[] not null,

    -- per 1 g
    Calories float not null,
    Carbohydrates float not null,
    Protein float not null,
    Fat float not null,
    Calcium float not null,
    Potassium float not null,
    Iron float not null
);