import { useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { Food, useAppState } from "../../lib/state";
import { dayUnixTimestamp } from "../../lib/date";
import { request, useAuthRequest } from "../../lib/request";

import {
  IonContent, IonHeader, IonPage, IonTitle,
  IonToolbar, IonButtons, IonItem, IonList,
  IonLabel, IonBackButton, IonIcon, IonInput,
  IonButton, IonSelect, IonSelectOption, IonText
} from "@ionic/react";
import ErrorTray from "../../ErrorTray";
import { add, search } from "ionicons/icons";

export default function FoodSearchPage() {
  const history = useHistory();
  const authRequest = useAuthRequest();

  const { mealTag, timestampStr } = useParams<{ mealTag: string; timestampStr: string; }>();
  const date = Number(timestampStr);

  const { foods, meals, upsertMeals, upsertFood } = useAppState();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Food[]>(Array.from(foods.values()));
  const [filterOption, setFilterOption] = useState("all");

  const createMeal = async (food: Food) => {
    const mealInfo = {
      id: -1,
      mealTag,
      servings: 1,
      foodID: food.id,
      servingsUnit: food.servingUnits[0],
      date: dayUnixTimestamp(new Date()),
    };
    const body = { ...mealInfo, updating: false };
    const json = await authRequest((jwt: string) => request("POST", "/meal/set", body, jwt));
    if (json === undefined) return;

    const meal = { ...mealInfo, id: json.mealID };
    upsertMeals(date, [...meals.get(date)!, meal]);
  }

  const searchFood = async () => {
    if (query.length == 0) return;

    const params = new URLSearchParams();
    params.append("query", query);
    params.append("onlyUser", filterOption == "user-food" ? "true" : "false");
    const endpoint = `/food/search?${params.toString()}`;

    const response = await authRequest((jwt: string) => request("GET", endpoint, undefined, jwt));
    if (response === undefined) return;

    setResults(prev => [...prev, ...response.results]);
    for (const food of response.results)
      upsertFood(food);
  }

  return (
    <IonPage>
      <IonHeader mode="ios" className="ion-no-border">
        <IonToolbar>
          <IonTitle>Search</IonTitle>
          <IonButtons slot="start">
            <IonBackButton defaultHref="#" />
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <ErrorTray />

        <IonItem>
          <IonSelect
            slot="start" aria-label="Serving unit" value={filterOption}
            onIonChange={(event) => setFilterOption(event.detail.value)}>
            <IonSelectOption value="all">All</IonSelectOption>
            <IonSelectOption value="user-foods">Your foods</IonSelectOption>
          </IonSelect>

          <IonInput
            value={query}
            placeholder="Search food"
            onChange={(e) => setQuery(e.currentTarget.value as string)}
          />
          <IonButton size="default" fill="clear" onClick={searchFood}>
            <IonIcon item-right slot="icon-only" color="blue" icon={search}></IonIcon>
          </IonButton>

          <IonButton
            size="large" shape="round" fill="clear"
            onClick={() => history.push("/food/view/-1")}>
            <IonIcon slot="icon-only" color="success" icon={add}></IonIcon>
          </IonButton>
        </IonItem>

        {results.length == 0
          ? <IonText>No results</IonText>
          : <IonList>
            {results.map((r: Food, i: number) => (
              <IonItem key={i}>
                <IonLabel
                  style={{ cursor: "pointer" }}
                  onClick={() => history.push(`/food/view/${r.id}`)}>
                  <h2>{r.name}</h2>
                  <p>
                    {r.servingSizes[r.defaultServingIndex]}
                    {r.servingUnits[r.defaultServingIndex]} •
                    {r.calories * r.servingSizes[r.defaultServingIndex]}
                    calories
                  </p>
                </IonLabel>

                <IonButton
                  onClick={() => createMeal(r)}
                  shape="round" size="large" fill="clear">
                  <IonIcon slot="icon-only" color="success" icon={add}></IonIcon>
                </IonButton>
              </IonItem>
            ))}
          </IonList>
        }
      </IonContent>
    </IonPage>
  );
}
