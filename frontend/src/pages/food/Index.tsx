import { useEffect, useState } from "react";
import { useHistory } from "react-router";
import { Food, Meal, useAppState } from "../../lib/state";
import { request, useAuthRequest } from "../../lib/request";
import { dayUnixTimestamp, formatDate } from "../../lib/date";

import {
  IonContent, IonPage, IonIcon, IonButton, IonItem, IonLabel,
  IonModal, IonInput, IonSelect, IonSelectOption,
  IonProgressBar,
} from "@ionic/react";
import ErrorTray from "../../ErrorTray";
import { add, chevronForward, chevronBack, pencil } from "ionicons/icons";

function EditMeal({ date, index, close, setPreviousMealTag }: {
  date: number; index: number;
  close: () => void; setPreviousMealTag: (tag: string) => void;
}) {
  const authRequest = useAuthRequest();
  const { foods, meals, settings, upsertMeal, removeMeal } = useAppState();

  const update = async (m: Meal) => {
    const response = await authRequest((jwt: string) =>
      request("POST", "/meal/set", { ...m, updating: true }, jwt));
    if (response !== undefined)
      upsertMeal(date, m, index);
  }

  const remove = async () => {
    const id = meals.get(date)![index].id;
    const response = await authRequest((jwt: string) =>
      request("DELETE", `/meal/delete?mealID=${id}`, undefined, jwt));
    if (response !== undefined) {
      removeMeal(date, index);
      close();
    }
  }

  return (
    <IonModal
      isOpen={index != -1}
      initialBreakpoint={0.5}
      breakpoints={[0.0, 0.5, 1.0]}
      onDidDismiss={close}
      handleBehavior="cycle">
      <IonContent>
        <div style={{ display: "flex", alignItems: "center", gap: 25 }}>
          <IonSelect
            label="Move to"
            aria-label="Move to meal"
            value={meals.get(date)![index].mealTag}
            onIonChange={(event) => {
              update({
                ...meals.get(date)![index],
                mealTag: event.detail.value,
              });
              setPreviousMealTag(event.detail.value);
            }}>
            {settings.mealTags.map((t: string, i: number) =>
              <IonSelectOption value={t} key={i}>{t}</IonSelectOption>)}
          </IonSelect>
          <IonButton size="default" color="danger" onClick={remove}>
            Remove meal
          </IonButton>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 25 }}>
          <IonInput
            type="number"
            placeholder="0"
            labelPlacement="end"
            label="Servings"
            min={0.1}
            value={meals.get(date)![index].servings}
            onIonInput={(event) => {
              update({
                ...meals.get(date)![index],
                servings: Number(event.detail.value)
              });
            }}
          />

          <IonSelect
            aria-label="Serving unit"
            value={meals.get(date)![index].servingsUnit}
            onIonChange={(event) => {
              update({
                ...meals.get(date)![index],
                servingsUnit: event.detail.value,
              });
            }}>
            {foods.get(meals.get(date)![index].foodID)!
              .servingUnits.map((u: string, i: number) =>
                <IonSelectOption value={u} key={i}>{u}</IonSelectOption>
              )}
          </IonSelect>
        </div>
      </IonContent>
    </IonModal>
  );
}

export default function FoodPage() {
  const history = useHistory();
  const authRequest = useAuthRequest();
  const { foods, meals, settings, upsertMeals, upsertFood } = useAppState();

  const [date, setDate] = useState(new Date());
  const [label, setLabel] = useState(formatDate(new Date()));

  const [groupedMeals, setGroupedMeals] = useState<Record<string, Meal[]>>({});

  const [previousMealTag, setPreviousMealTag] = useState(settings.mealTags[0]);
  const [index, setCurrentMealIndex] = useState(-1);

  const countMacro = (meals: Meal[], macro: keyof Food): number => {
    let sum = 0;
    for (const m of meals) {
      const food = foods.get(m.foodID)!;
      const i = food.servingUnits.indexOf(m.servingsUnit);
      sum +=  m.servings * food.servingSizes[i] * (food[macro] as number);
    }
    return sum;
  }

  useEffect(() => { changeDate(0); }, []);

  useEffect(() => {
    const timestamp = dayUnixTimestamp(date);
    const dayMeals = meals.get(timestamp) ?? [];
    let groups: Record<string, Meal[]> = {};

    for (const meal of dayMeals) {
      if (groups[meal.mealTag] === undefined)
        groups[meal.mealTag] = [meal];
      else
        groups[meal.mealTag].push(meal);
    }

    if (Object.keys(groups).length == 0) {
      for (let tag of settings.mealTags) {
        groups[tag] = [];
      }
    }

    setGroupedMeals(groups);
  }, [label, meals]);

  const fetchFood = async (id: number) => {
    const json = await authRequest((_jwt: string) =>
      request("GET", `/food/get?id=${id}`, undefined, undefined)) as { food: Food; };
    if (json !== undefined)
      upsertFood(json.food as Food);
  }

  const fetchMeals = async (dateTimestamp: number) => {
    // fetch all the meals for this day
    const params = new URLSearchParams();
    params.append("dateTimestamp", `${dayUnixTimestamp(date)}`);
    const endpoint = `/meal/day?${params.toString()}`;

    const json = await authRequest((jwt: string) =>
      request("GET", endpoint, undefined, jwt)) as { meals: Meal[] };
    if (json === undefined) return;
      upsertMeals(dateTimestamp, json.meals as Meal[]);

    // fetch foods that we don't have cached as well
    for (const meal of json.meals) {
      if (foods.get(meal.foodID) === undefined) {
        fetchFood(meal.foodID);
      }
    }
  }

  const changeDate = async (delta: number) => {
    const copy = new Date(date);
    copy.setDate(date.getDate() + delta);
    setDate(copy);

    // fetch on demand
    const timestamp = dayUnixTimestamp(copy);
    if (meals.get(timestamp) === undefined)
      await fetchMeals(timestamp);
    setLabel(formatDate(copy));
  };

  const addMeal = () => {
    const timestamp = dayUnixTimestamp(date);
    history.push(`/food/search/${previousMealTag}/${timestamp}`);
  }

  const row = {
    display: "flex",
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between"
  };

  return (
    <IonPage>
      <IonContent>
        <ErrorTray />

        <div style={row}>
          <h3>{label}</h3>
          <IonButton size="default" fill="clear" onClick={() => changeDate(-1)}>
            <IonIcon slot="icon-only" color="white" icon={chevronBack} />
          </IonButton>
          <IonButton size="large" fill="clear" onClick={addMeal}>
            <IonIcon slot="icon-only" icon={add} color="success" />
          </IonButton>
          <IonButton size="default" fill="clear" onClick={() => changeDate(1)}>
            <IonIcon slot="icon-only" color="white" icon={chevronForward} />
          </IonButton>
        </div>

        {Object.keys(settings.macroTargets).map((t, i) => {
          const timestamp = dayUnixTimestamp(date);
          const dayMeals = meals.get(timestamp) ?? [];
          const value = countMacro(dayMeals, t as keyof Food);
          const max = settings.macroTargets[t];
          return (
            <IonItem key={i}>
              <IonProgressBar value={(value / max) * 100} />
              <p><b>{max - value}</b> {t} left</p>
            </IonItem>
        )})}


        {index != -1 &&
          <EditMeal
            date={dayUnixTimestamp(date)} index={index}
            setPreviousMealTag={setPreviousMealTag}
            close={() => setCurrentMealIndex(-1)}
          />}

        {Object.keys(groupedMeals).map((tag: string, i: number) => (
          <div key={i}>
            <h1>{tag}</h1>

            {Object.values(groupedMeals[tag] ?? {}).map((meal: Meal, j: number) => {
              const food = foods.get(meal.foodID)!;
              const servingIndex = food.servingUnits.indexOf(meal.servingsUnit);
              return (
                <IonItem key={j}>
                  <IonLabel>
                    <h2>{food.name}</h2>
                    <p>{meal.servings * food.servingSizes[servingIndex]} {meal.servingsUnit}</p>
                  </IonLabel>

                  <IonButton
                    shape="round" size="default" fill="clear"
                    onClick={() => setCurrentMealIndex(j)}>
                    <IonIcon slot="icon-only" color="success" icon={pencil}></IonIcon>
                  </IonButton>
                </IonItem>
              );
            })}
          </div>
        ))}
      </IonContent>
    </IonPage>
  );
}
