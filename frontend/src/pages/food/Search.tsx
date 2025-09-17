import { useState } from "react";
import { useHistory } from "react-router-dom";

import { Food } from "../../lib/state";
import { request } from "../../lib/utils";

import {
  IonContent, IonHeader, IonPage, IonTitle,
  IonToolbar, IonButtons, IonItem, IonList,
  IonLabel, IonBackButton, IonIcon, IonInput,
  IonButton,
  IonText
} from "@ionic/react";
import { add, search } from "ionicons/icons";

export default function FoodSearchPage() {
  const history = useHistory();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Food[]>([]);

  const searchFood = async () => {
    try {
      const params = new URLSearchParams();
      params.append("query", query);
      const endpoint = `/food/search?${params.toString()}`;
      const response = await request("GET", endpoint, undefined, undefined);
      setResults(response.results);
    } catch (err: any) {
      console.log(err);
    }
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
        <IonItem>
          <IonInput
            value={query}
            placeholder="Search food"
            onChange={(e) => setQuery(e.currentTarget.value as string)}
          />
          <IonButton size="default" fill="clear" onClick={searchFood}>
            <IonIcon item-right slot="icon-only" color="blue" icon={search}></IonIcon>
          </IonButton>
        </IonItem>

        <IonButton size="default" onClick={() => history.push("/food/edit")}>
          Create food
        </IonButton>

        {results.length == 0
          ? <IonText>No results</IonText>
          : <IonList>
            {results.map((r, i) => (
              <IonItem key={i}>
                <IonLabel>
                  <h2>{r.name}</h2>
                  <p>{r.calories}</p>
                </IonLabel>

                <IonButton shape="round" size="large" fill="clear">
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