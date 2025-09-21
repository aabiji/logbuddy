import { useEffect, useState } from "react";
import { useHistory } from "react-router";
import { Food, Meal, useAppState } from "../../lib/state";
import { formatDate, request } from "../../lib/utils";

import {
  IonContent, IonPage, IonIcon, IonFabButton,
  IonFab, IonButton, IonItem, IonLabel,
  IonModal, IonInput, IonSelect, IonSelectOption,
} from "@ionic/react";
import { add, chevronForward, chevronBack, pencil } from "ionicons/icons";

import "./Index.css";

function EditMeal({ label, index, close, setPreviousMealTag }: {
  label: string; index: number;
  close: () => void; setPreviousMealTag: (tag: string) => void;
}) {
  const { foods, mainToken, meals, mealTags, upsertMeal, removeMeal } = useAppState();

  const update = async (m: Meal) => {
    try {
      await request("POST", "/meal/set", { ...m, updating: true }, mainToken);
      upsertMeal(label, m, index);
    } catch (err: any) {
      console.log("ERROR", err.message);
    }
  }

  const remove = async () => {
    try {
      const id = meals[label][index].id;
      await request("DELETE", `/meal/delete?mealID=${id}`, undefined, mainToken);
      removeMeal(label, index);
      close();
    } catch (err: any) {
      console.log("ERROR", err.message);
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
            value={meals[label][index].mealTag}
            onIonChange={(event) => {
              update({
                ...meals[label][index],
                mealTag: event.detail.value,
              });
              setPreviousMealTag(event.detail.value);
            }}>
            {mealTags.map((t: string, i: number) =>
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
            value={meals[label][index].servings}
            onIonChange={(event) => {
              update({
                ...meals[label][index],
                servings: Number(event.detail.value)
              });
            }}
          />

          <IonSelect
            aria-label="Serving unit"
            value={meals[label][index].servingsUnit}
            onIonChange={(event) => {
              update({
                ...meals[label][index],
                servingsUnit: event.detail.value,
              });
            }}>
            {foods[meals[label][index].foodID]
              .units.map((u: string, i: number) =>
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
  const {
    foods, mainToken, meals, mealTags, upsertMeals, upsertFood
  } = useAppState();

  const [date, setDate] = useState(new Date());
  const [label, setLabel] = useState(formatDate(new Date()));

  const [groupedMeals, setGroupedMeals] = useState<Record<string, Meal[]>>({});

  const [previousMealTag, setPreviousMealTag] = useState(mealTags[0]);
  const [index, setCurrentMealIndex] = useState(-1);

  useEffect(() => { changeDate(0); }, []);

  useEffect(() => {
    const dayMeals = meals[label] ?? [];
    let groups = Object.fromEntries(mealTags.map((t: string) => [t, []]));

    for (const meal of dayMeals)
      groups[meal.mealTag].push(meal);
    setGroupedMeals(groups);
  }, [meals]);

  const fetchFood = async (id: number) => {
    try {
      const json = await request("GET", `/food/get?id=${id}`, undefined, undefined);
      upsertFood(json.food as Food);
    } catch (err: any) {
      console.log("ERROR", err.message);
    }
  }

  const fetchMeals = async (dateLabel: string) => {
    try {
      // fetch all the meals for this day
      const params = new URLSearchParams();
      params.append("date", dateLabel);
      const endpoint = `/meal/day?${params.toString()}`;
      const json = await request("GET", endpoint, undefined, mainToken);
      upsertMeals(dateLabel, json.meals as Meal[]);

      // fetch foods that we don't have cached as well
      for (const meal of json.meals) {
        if (foods[meal.foodID] === undefined) {
          fetchFood(meal.foodId);
        }
      }

    } catch (err: any) {
      console.log("ERROR", err.message);
    }
  }

  const changeDate = async (delta: number) => {
    const copy = new Date(date);
    copy.setDate(date.getDate() + delta);
    setDate(copy);

    // fetch on demand
    const label = formatDate(copy);
    if (meals[label] === undefined)
      await fetchMeals(label);
    setLabel(label);
  };

  const addMeal = () => history.push(`/food/search/${previousMealTag}/${label}`);

  return (
    <IonPage>
      <IonContent>
        <div className="top-bar">
          <IonButton size="default" fill="clear" onClick={() => changeDate(-1)}>
            <IonIcon slot="icon-only" color="white" icon={chevronBack} />
          </IonButton>

          <h3>{label}</h3>

          <IonButton size="default" fill="clear" onClick={() => changeDate(1)}>
            <IonIcon slot="icon-only" color="white" icon={chevronForward} />
          </IonButton>
        </div>

        {index != -1 &&
          <EditMeal
            label={label} index={index}
            setPreviousMealTag={setPreviousMealTag}
            close={() => setCurrentMealIndex(-1)}
          />}

        {mealTags.map((tag: string, i: number) => (
          <div key={i}>
            <h1>{tag}</h1>

            {Object.values(groupedMeals[tag] ?? {}).map((meal: Meal, j: number) => {
              const food = foods[meal.foodID];
              const servingIndex = food.units.indexOf(meal.servingsUnit);
              return (
                <IonItem key={j}>
                  <IonLabel>
                    <h2>{food.name}</h2>
                    <p>{meal.servings * food.servings[servingIndex]} {meal.servingsUnit}</p>
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

        <IonFab slot="fixed" vertical="bottom" horizontal="end">
          <IonFabButton onClick={addMeal}>
            <IonIcon icon={add}></IonIcon>
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
}
