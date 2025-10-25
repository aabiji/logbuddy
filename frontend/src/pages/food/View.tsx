import { useState } from "react";
import { useHistory, useParams } from "react-router";
import { useIonViewDidEnter } from "@ionic/react";
import { Food, useAppState } from "../../lib/state";
import { request, useAuthRequest } from "../../lib/request";

import {
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
  IonButtons, IonBackButton, IonButton,
  IonSelect, IonSelectOption, IonIcon
} from "@ionic/react";
import { Input, NotificationTray } from "../../Components";
import { add, trash, star } from "ionicons/icons";
import "../../theme/styles.css";

export default function FoodViewPage() {
  const history = useHistory();
  const authRequest = useAuthRequest();
  const { foodID } = useParams<{ foodID: string; }>();
  const { addNotification, foods, upsertFood } = useAppState();

  const edit = foodID == "-1";
  const defaultFood = {
    id: -1, name: "",
    calories: 0, carbohydrate: 0, protein: 0,
    fat: 0, calcium: 0, potassium: 0, iron: 0,
    servingSizes: [ 0 ], servingUnits: [ "g" ],
    defaultServingIndex: 0
  };
  // when we just want nutrients
  const excludedKeys = ["servingSizes", "servingUnits", "name", "id", "defaultServingIndex"];

  const [food, setFood] = useState<Food>(edit ? defaultFood : foods.get(Number(foodID))!);
  const [currentServing, setCurrentServing] = useState(food.defaultServingIndex);

  // Update food when viewing it
  useIonViewDidEnter(() => {
    (async () => {
      if (edit) return;
      const json = await authRequest((_jwt: string) =>
        request("GET", `/food/get?id=${foodID}`, undefined, undefined)) as { food: Food; };
      if (json !== undefined)
        upsertFood(json.food as Food);
    })();
  });

  const createFood = async () => {
    const haveServingSizes =
      food.servingSizes.length > 0 && !food.servingSizes.some(s => s == 0);

    if (food.name.length == 0) {
      addNotification({ message: "Must set a name", error: false });
    } else if (!haveServingSizes) {
      addNotification({ message: "Must set a valid serving size", error: false });
    } else if (food.calories == 0) {
      addNotification({ message: "Must set calories", error: false });
    } else {
      const json = await authRequest((jwt: string) =>
        request("POST", "/food/new", food, jwt)) as { id: number; };
      if (json === undefined) return;

      // normalize the nutrient values down to per 1 g
      // (or whatever the default serving unit is)
      const servingSize = food.servingSizes[food.defaultServingIndex];
      const normalizedFood = { ...food, id: json.id } as Food;
      for (const key of Object.keys(food)) {
        if (!excludedKeys.includes(key))
          (normalizedFood[key as keyof Food] as number) /= servingSize;
      }

      setFood(normalizedFood);
      upsertFood(normalizedFood);
      history.goBack();
    }
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="#" />
          </IonButtons>

          <IonTitle className="centered-title">
            {edit ? "Create food" : food.name}
          </IonTitle>

          {edit && <IonButtons slot="end">
            <IonButton className="save-header-button" onClick={createFood}>
              Save
            </IonButton>
          </IonButtons>}
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <NotificationTray />
        {edit
          ? <Input
            value={food.name}
            placeholder="Food name"
            setValue={(value: string) =>
              setFood((prev: Food) => ({ ...prev, name: value }))}
          />
          : <div className="horizontal-strip">
            {!edit && <IonSelect
              aria-label="Serving size" value={currentServing}
              onIonChange={(event) => setCurrentServing(Number(event.detail.value))}>
                {food.servingSizes.map((_, i: number) => (
                  <IonSelectOption value={currentServing} key={i}>
                    {food.servingSizes[i]} {food.servingUnits[i]}
                  </IonSelectOption>
                ))}
              </IonSelect>}
          </div>
        }

        {edit && <div className="horizontal-strip">
          <b>Serving sizes</b>
            <IonButton
              slot="end"
              size="default"
              fill="solid"
              onClick={() => {
                setFood(prev => ({
                  ...prev,
                  servingSizes: [...prev.servingSizes, 0],
                  servingUnits: [...prev.servingUnits, "g"]
                }));
              }}
            >
              <IonIcon slot="icon-only" color="white" icon={add} />
            </IonButton>
        </div>}

        {edit && food.servingSizes.map((_, i) => (
          <div className="horizontal-strip" key={i}>
            <div style={{ width: "54%" }}>
              <Input
                inputType="number"
                placeholder="0"
                value={food.servingSizes[i]}
                setValue={(value: string) => {
                  setFood((prev) => {
                    const newServings = [...prev.servingSizes];
                    newServings[i] = Number(value);
                    return { ...prev, servingSizes: newServings };
                  });
                }}
              />
            </div>

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
                icon={star} slot="icon-only" style={{ fontSize: 16 }}
                color={food.defaultServingIndex == i ? "warning" : "medium"}
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
              <IonIcon slot="icon-only" color="danger" icon={trash} style={{ fontSize: 16 }} />
            </IonButton>
          </div>
        ))}

        {(Object.keys(food) as (keyof Food)[]).map((key, i) => {
          if (excludedKeys.includes(key)) return null;
          const unit = key == "calories" ? "cal" : "g";
          const foodValue = `${(food[key as keyof Food] as number) * food.servingSizes[currentServing]}`;
          return (
            <div key={i} className="nutrient-input horizontal-strip">
              <p> {key[0].toUpperCase() + key.slice(1)} </p>
              <div style={{ width: "50%" }}>
                {edit
                  ? <Input
                    inputType="number"
                    label={unit}
                    labelPlacement="end"
                    placeholder="0"
                    value={food[key] as number}
                    setValue={(value: string) => setFood(prev => ({ ...prev, [key]: Number(value) }))}
                  />
                  : <b>{foodValue} {unit}</b>
                }
              </div>
            </div>
          );
        })}
      </IonContent>
    </IonPage >
  );
}
