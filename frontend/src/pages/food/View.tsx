import { useState } from "react";
import { useHistory, useParams } from "react-router";
import { Food, useAppState } from "../../lib/state";
import { request, useAuthRequest } from "../../lib/request";

import {
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
  IonButtons, IonItem, IonLabel, IonBackButton, IonInput,
  IonButton, IonSelect, IonSelectOption, IonIcon, IonItemDivider,
  IonText
} from "@ionic/react";
import ErrorTray from "../../ErrorTray";
import { add, remove, star } from "ionicons/icons";

export default function FoodViewPage() {
  const history = useHistory();
  const authRequest = useAuthRequest();
  const { foodID } = useParams<{ foodID: string; }>();
  const { foods, upsertFood } = useAppState();

  const edit = foodID == "-1";
  const defaultFood = {
    id: -1, name: "",
    calories: 0, carbohydrate: 0, protein: 0,
    fat: 0, calcium: 0, potassium: 0, iron: 0,
    servingSizes: [], servingUnits: [],
    defaultServingIndex: 0
  };
  // when we just want nutrients
  const excludedKeys = ["servingSizes", "servingUnits", "name", "id", "defaultServingIndex"];

  const [error, setError] = useState<undefined | string>(undefined);
  const [food, setFood] = useState<Food>(edit ? defaultFood : foods.get(Number(foodID))!);
  const [currentServing, setCurrentServing] = useState(food.defaultServingIndex);

  const createFood = async () => {
    if (food.name.length == 0) {
      setError("Food must have a name");
    } else if (food.servingSizes.length == 0) {
      setError("Food must have a serving size")
    } else {
      const json = await authRequest((jwt: string) =>
        request("POST", "/food/new", food, jwt)) as { id: number; };
      if (json === undefined) return;

      // normalize the nutrient values down to per 1 g
      // (or whatever the default serving unit is)
      const servingSize = food.servingSizes[food.defaultServingIndex];
      let normalizedFood = { ...food, id: json.id } as Food;
      for (const key of Object.keys(food)) {
        if (!excludedKeys.includes(key))
          (normalizedFood[key as keyof Food] as number) /= servingSize;
      }

      upsertFood(normalizedFood);
      setFood(normalizedFood);
      history.goBack();
    }
  }

  return (
    <IonPage>
      <IonHeader mode="ios" className="ion-no-border">
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="#" />
          </IonButtons>

          <IonTitle>Create food</IonTitle>

          {edit && <IonButtons slot="end">
            <IonButton onClick={createFood}>Save</IonButton>
          </IonButtons>}
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <ErrorTray />

        {edit
          ? <IonInput
            value={food.name}
            placeholder="Food name"
            onChange={(event) => {
              const value = event.currentTarget.value as string ?? "";
              setFood((prev: Food) => ({ ...prev, name: value }));
            }}
          />
          : <IonText><h1>{food.name}</h1></IonText>
        }
        {error !== undefined &&
          <p style={{ color: "red", fontSize: "0.9rem" }}>{error}</p>}

        <IonItemDivider>
          <IonText><h4>Serving sizes</h4></IonText>
          {edit &&
            <IonButton
              slot="end"
              size="default" fill="clear"
              onClick={() => {
                setFood(prev => ({
                  ...prev,
                  servingSizes: [...prev.servingSizes, 0],
                  servingUnits: [...prev.servingUnits, "g"]
                }));
              }}
            >
              <IonIcon slot="icon-only" color="white" icon={add} />
            </IonButton>}
        </IonItemDivider>

        {edit && food.servingSizes.map((_, i) => (
          <IonItem key={i}>
            <IonInput
              slot="start"
              type="number"
              placeholder="0"
              value={food.servingSizes[i]}
              onIonInput={(event) => {
                const value = Number(event.detail.value);
                setFood((prev) => {
                  const newServings = [...prev.servingSizes];
                  newServings[i] = value;
                  return { ...prev, servingSizes: newServings };
                });
              }}
            />

            <IonSelect
              slot="start"
              aria-label="Serving unit"
              value={food.servingUnits[i]}
              onIonChange={(event) => {
                const value = event.detail.value;
                setFood((prev) => {
                  const newUnits = [...prev.servingUnits];
                  newUnits[i] = value;
                  return { ...prev, servingUnits: newUnits };
                });
              }}>
              <IonSelectOption value="g">g</IonSelectOption>
              <IonSelectOption value="mL">mL</IonSelectOption>
            </IonSelect>

            <IonButton
              fill="clear" slot="end" size="small"
              onClick={() => {
                setFood((prev: Food) => ({ ...prev, defaultServingIndex: i }));
              }}>
              <IonIcon
                icon={star} slot="icon-only"
                color={food.defaultServingIndex == i ? "warning" : "white"}
              />
            </IonButton>

            <IonButton
              slot="end" size="small" fill="clear"
              onClick={() => {
                setFood((prev) => ({
                  ...prev,
                  servingSizes: prev.servingSizes.filter((_, index) => index !== i),
                  servingUnits: prev.servingUnits.filter((_, index) => index !== i),
                }));
              }}
            >
              <IonIcon slot="icon-only" color="red" icon={remove} />
            </IonButton>
          </IonItem>
        ))}

        {!edit &&
          <IonSelect
            aria-label="Serving size"
            value={currentServing}
            onIonChange={(event) => setCurrentServing(Number(event.detail.value))}>
            {food.servingSizes.map((_, i: number) => (
              <IonSelectOption value={currentServing} key={i}>
                {food.servingSizes[i]} {food.servingUnits[i]}
              </IonSelectOption>
            ))}
          </IonSelect>
        }

        <IonItemDivider>
          <IonText><h4>Nutrients</h4></IonText>
        </IonItemDivider>

        {(Object.keys(food) as (keyof Food)[]).map((key, i) => {
          if (excludedKeys.includes(key)) return null;
          return (
            <IonItem key={i}>
              <IonLabel position="fixed" slot="start">
                {key[0].toUpperCase() + key.slice(1)}
              </IonLabel>
              {edit
                ? <IonInput
                  slot="end"
                  type="number"
                  placeholder="0"
                  required={key == "calories"}
                  value={food[key] as number}
                  onIonInput={(event) => {
                    const value = Number(event.detail.value);
                    setFood(prev => ({ ...prev, [key]: value }));
                  }}
                />
                : <IonText><h4>{(food[key as keyof Food] as number) * food.servingSizes[currentServing]}</h4></IonText>
              }
            </IonItem>
          );
        })}
      </IonContent>
    </IonPage >
  );
}
