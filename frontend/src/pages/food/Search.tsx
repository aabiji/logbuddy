import { useState, useRef } from "react";
import { useHistory, useParams } from "react-router-dom";
import { useIonViewWillEnter } from "@ionic/react";
import { Food, useAppState } from "../../lib/state";
import { dayUnixTimestamp } from "../../lib/date";
import { request, useAuthRequest } from "../../lib/request";

import {
  IonContent, IonHeader, IonPage, IonTitle,
  IonToolbar, IonButtons, IonBackButton, IonIcon,
  IonButton, IonSelect, IonSelectOption
} from "@ionic/react";
import { Input, NotificationTray } from "../../Components";
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
    addNotification({ message: `Added ${food.name}`, error: false });
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
      else if (str.trim().length == 0)
        setResults(Array.from(useAppState.getState().foods.values()));
    }, 300);
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="#" />
          </IonButtons>
          <IonTitle className="centered-title">Search</IonTitle>
          <IonButtons slot="end">
            <IonButton className="save-header-button" onClick={() => history.push("/food/view/-1")}>
              Create
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <NotificationTray />

        <div className="search-controls horizontal-strip">
          <Input
            placeholder="Search food" value={query}
            setValue={(value: string) => updateSearchQuery(value)}
          />
          <IonSelect
            value={searchFilter}
            onIonChange={(e) => setSearchFilter(e.detail.value)}>
            <IonSelectOption value="all">All</IonSelectOption>
            <IonSelectOption value="onlyUser">Your foods</IonSelectOption>
          </IonSelect>
        </div>

        {results.length == 0
          ? <p>No results</p>
          : <div>
            {results.map((r: Food, i: number) => (
              <div key={i} className="food-item">
                <div
                  onClick={() => history.push(`/food/view/${r.id}`)}>
                  <p className="food-name">{r.name}</p>
                  <div style={{ display: "flex", flexDirection: "row", gap: "2px" }}>
                    <p>
                      {r.servingSizes[r.defaultServingIndex]}
                      {r.servingUnits[r.defaultServingIndex]}
                    </p>
                    <p> • </p>
                    <p> {r.calories * r.servingSizes[r.defaultServingIndex]} </p>
                    <p> calories </p>
                  </div>
                </div>

                <IonButton
                  onClick={() => createMeal(r)}
                  shape="round" size="small" fill="clear">
                  <IonIcon
                    slot="icon-only" color="tertiary"
                    icon={add} className="bold-icon"
                  />
                </IonButton>
              </div>
            ))}
          </div>
        }
      </IonContent>
    </IonPage>
  );
}
