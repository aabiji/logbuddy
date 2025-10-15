import { useState, useRef } from "react";
import { useHistory, useParams } from "react-router-dom";
import { useIonViewWillEnter } from "@ionic/react";
import { Food, useAppState } from "../../lib/state";
import { dayUnixTimestamp } from "../../lib/date";
import { request, useAuthRequest } from "../../lib/request";

import {
  IonContent, IonHeader, IonPage, IonTitle,
  IonToolbar, IonButtons, IonItem, IonList,
  IonLabel, IonBackButton, IonIcon, IonInput,
  IonButton, IonText, IonSelect, IonSelectOption
} from "@ionic/react";
import { NotificationTray } from "../../Components";
import { add } from "ionicons/icons";
import "../../theme/styles.css";

export default function FoodSearchPage() {
  const history = useHistory();
  const authRequest = useAuthRequest();

  const { mealTag, dayTimestamp } = useParams<{ mealTag: string; dayTimestamp: string; }>();
  const date = Number(dayTimestamp);

  const { addNotification, meals, upsertMeals, upsertFood } = useAppState();

  const [query, setQuery] = useState("");
  const [searchFilter, setSearchFilter] = useState("all");
  const [results, setResults] = useState<Food[]>([]);

  useIonViewWillEnter(() => {
    if (query.length == 0)
      setResults(Array.from(useAppState.getState().foods.values()));
  });

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
    const json = await authRequest((jwt: string) =>
      request("POST", "/meal/set", body, jwt)) as { mealID: number; };
    if (json === undefined) return;

    const meal = { ...mealInfo, id: json.mealID };
    upsertMeals(date, [...meals.get(date)!, meal]);
    addNotification({ message: `Created ${food.name}`, error: false });
  }

  const searchFood = async (search: string) => {
    const params = new URLSearchParams();
    params.append("query", search);
    params.append("onlyUser", searchFilter == "onlyUser" ? "true" : "false");
    const endpoint = `/food/search?${params.toString()}`;

    const response = await authRequest((jwt: string) =>
      request("GET", endpoint, undefined, jwt)) as { results: Food[]; };
    if (response === undefined) return;

    setResults(response.results);
    for (const food of response.results)
      upsertFood(food);
  }

  const timeout = useRef<NodeJS.Timeout | null>(null);
  const updateSearchQuery = (str: string) => {
    setQuery(str);
    // debounced search
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = setTimeout(async () => {
      if (str.trim().length > 0)
        await searchFood(str);
    }, 300);
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle className="centered-title">Search</IonTitle>
          <IonButtons slot="start">
            <IonBackButton defaultHref="#" />
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="inner-page">
        <NotificationTray />

        <div className="search-controls">
          <IonInput
            placeholder="Search food"
            value={query} fill="outline"
            onChange={(e) => updateSearchQuery(e.currentTarget.value as string)}
          />
          <div className="horizontal-strip">
            <IonSelect
              value={searchFilter}
              onIonChange={(e) => setSearchFilter(e.detail.value)}>
              <IonSelectOption value="all">All</IonSelectOption>
              <IonSelectOption value="onlyUser">Your foods</IonSelectOption>
            </IonSelect>

            <IonButton
              shape="round" fill="solid" color="primary"
              onClick={() => history.push("/food/view/-1")}>
              Create
            </IonButton>
          </div>
        </div>

        {results.length == 0
          ? <IonText>No results</IonText>
          : <IonList>
            {results.map((r: Food, i: number) => (
              <IonItem key={i}>
                <IonLabel
                  onClick={() => history.push(`/food/view/${r.id}`)}>
                  <h2>{r.name}</h2>
                  <div style={{ display: "flex", flexDirection: "row", gap: "2px" }}>
                    <p>
                      {r.servingSizes[r.defaultServingIndex]}
                      {r.servingUnits[r.defaultServingIndex]}
                    </p>
                    <p> • </p>
                    <p> {r.calories * r.servingSizes[r.defaultServingIndex]} </p>
                    <p> calories </p>
                  </div>
                </IonLabel>

                <IonButton
                  onClick={() => createMeal(r)}
                  shape="round" size="small" fill="clear">
                  <IonIcon
                    slot="icon-only" color="tertiary"
                    icon={add} className="bold-icon"
                  />
                </IonButton>
              </IonItem>
            ))}
          </IonList>
        }
      </IonContent>
    </IonPage>
  );
}
