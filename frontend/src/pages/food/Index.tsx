import { useEffect, useState } from "react";
import { useHistory } from "react-router";
import { Food, Meal, useAppState } from "../../lib/state";
import { formatDate, request } from "../../lib/utils";

import {
  IonContent, IonPage, IonIcon, IonFabButton,
  IonFab, IonButton, IonItem, IonLabel
} from "@ionic/react";
import { add, chevronForward, chevronBack, pencil } from "ionicons/icons";

import "./Index.css";

export default function FoodPage() {
  const history = useHistory();
  const { foods, mainToken, meals, mealTags, upsertMeals, upsertFood } = useAppState();

  const [date, setDate] = useState(new Date());
  const [previousMealTag, setPreviousMealTag] = useState(mealTags[0]);
  const [groupedMeals, setGroupedMeals] = useState<Record<string, Meal[]>>({});

  useEffect(() => { changeDate(0); }, []);

  const fetchFood = async (id: number) => {
    try {
      const json = await request("GET", `/food/get?id=${id}`, undefined, undefined);
      upsertFood(json.food as Food);
    } catch (err: any) {
      console.log("ERROR", err.message);
    }
  }

  const fetchMeals = async (dateLabel: string): Promise<Meal[]> => {
    return new Promise(async (resolve, _) => {
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

        resolve(json.meals);
      } catch (err: any) {
        console.log("ERROR", err.message);
        resolve([]);
      }
    });
  }

  const changeDate = async (delta: number) => {
    const copy = new Date(date);
    copy.setDate(date.getDate() + delta);
    setDate(copy);

    // fetch on demand
    const label = formatDate(copy);
    let dayMeals = meals[label];
    if (dayMeals === undefined)
      dayMeals = await fetchMeals(label);

    let groups = Object.fromEntries(mealTags.map((t: string) => [t, []]));
    for (const meal of dayMeals)
      groups[meal.mealTag].push(meal);
    setGroupedMeals(groups);
  };

  const addMeal = () => {
    const label = formatDate(date);
    history.push(`/food/search/${previousMealTag}/${label}`);
  }

  return (
    <IonPage>
      <IonContent>
        <div className="top-bar">
          <IonButton size="default" fill="clear" onClick={() => changeDate(-1)}>
            <IonIcon slot="icon-only" color="white" icon={chevronBack} />
          </IonButton>

          <h3>{formatDate(date)}</h3>

          <IonButton size="default" fill="clear" onClick={() => changeDate(1)}>
            <IonIcon slot="icon-only" color="white" icon={chevronForward} />
          </IonButton>
        </div>

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

                  <IonButton shape="round" size="default" fill="clear">
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