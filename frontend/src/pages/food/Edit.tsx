import { useState } from "react";
import { useHistory } from "react-router";

import { Food, useAppState } from "../../lib/state";
import { request } from "../../lib/utils";

import {
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
  IonButtons, IonItem, IonLabel, IonBackButton, IonInput,
  IonButton, IonSelect, IonSelectOption, IonIcon, IonItemDivider
} from "@ionic/react";
import { add, remove } from "ionicons/icons";

export default function FoodEditPage() {
  const history = useHistory();
  const { mainToken, upsertFood } = useAppState();

  const [error, setError] = useState<undefined | string>(undefined);
  const [food, setFood] = useState<Food>({
    id: -1, name: "", servings: [], units: [],
    calories: 0, carbohydrate: 0, protein: 0,
    fat: 0, calcium: 0, potassium: 0, iron: 0
  });

  const createFood = async () => {
    if (food.name.length == 0) {
      setError("Food must have a name");
    } else if (food.servings.length == 0) {
      setError("Food must have a serving size")
    } else {
      try {
        const json = await request("POST", "/food/new", food, mainToken);
        setFood((prev: Food) => ({ ...prev, id: json.id }));
        upsertFood({ ...food, id: json.id });
        history.goBack();
      } catch (err: any) {
        console.log(err);
      }
    }
  }

  return (
    <IonPage>
      <IonHeader mode="ios" className="ion-no-border">
        <IonToolbar>
          <IonTitle>Create food</IonTitle>

          <IonButtons slot="start">
            <IonBackButton defaultHref="#" />
          </IonButtons>

          <IonButtons slot="end">
            <IonButton onClick={createFood}>Save</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonInput
          value={food.name}
          placeholder="Food name"
          onChange={(event) => {
            const value = event.currentTarget.value as string ?? "";
            setFood((prev: Food) => ({ ...prev, name: value }));
          }}
        />
        {error !== undefined &&
          <p style={{ color: "red", fontSize: "0.9rem" }}>{error}</p>}

        <IonItemDivider>
          <h4>Serving sizes</h4>
          <IonButton
            slot="end"
            size="default" fill="clear"
            onClick={() => {
              setFood(prev => ({
                ...prev,
                servings: [...prev.servings, 0],
                units: [...prev.units, "g"]
              }));
            }}
          >
            <IonIcon slot="icon-only" color="white" icon={add} />
          </IonButton>
        </IonItemDivider>

        {food.servings.map((_, i) => (
          <IonItem key={i}>
            <IonInput
              slot="start"
              type="number"
              placeholder="0"
              value={food.servings[i]}
              onIonChange={(event) => {
                const value = Number(event.detail.value);
                setFood(prev => {
                  const newServings = [...prev.servings];
                  newServings[i] = value;
                  return { ...prev, servings: newServings };
                });
              }}
            />

            <IonSelect
              slot="start"
              aria-label="Serving unit"
              value={food.units[i]}
              onIonChange={(event) => {
                const value = event.detail.value;
                setFood(prev => {
                  const newUnits = [...prev.units];
                  newUnits[i] = value;
                  return { ...prev, units: newUnits };
                });
              }}
            >
              <IonSelectOption value="g">g</IonSelectOption>
              <IonSelectOption value="mL">mL</IonSelectOption>
              <IonSelectOption value="item">Item</IonSelectOption>
            </IonSelect>

            <IonButton
              slot="end"
              size="small" fill="clear"
              onClick={() => {
                setFood(prev => ({
                  ...prev,
                  servings: prev.servings.filter((_, index) => index !== i),
                  units: prev.units.filter((_, index) => index !== i)
                }));
              }}
            >
              <IonIcon slot="icon-only" color="red" icon={remove} />
            </IonButton>
          </IonItem>
        ))}

        <IonItemDivider><h4>Nutrients</h4></IonItemDivider>

        {(Object.keys(food) as (keyof Food)[]).map((key, i) => {
          if (["servings", "units", "name", "id"].includes(key)) return null;
          return (
            <IonItem key={i}>
              <IonLabel position="fixed" slot="start">
                {key[0].toUpperCase() + key.slice(1)}
              </IonLabel>
              <IonInput
                slot="end"
                type="number"
                placeholder="0"
                required={key == "calories"}
                value={food[key] as number}
                onIonChange={(event) => {
                  const value = Number(event.detail.value);
                  setFood(prev => ({ ...prev, [key]: value }));
                }}
              />
            </IonItem>
          );
        })}
      </IonContent>
    </IonPage>
  );
}
