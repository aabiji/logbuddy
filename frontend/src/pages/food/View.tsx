import { useState } from "react";
import { useHistory, useParams } from "react-router";
import { useIonViewDidEnter } from "@ionic/react";
import { Food, useAppState } from "../../lib/state";
import { request, useAuthRequest } from "../../lib/request";

import {
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
  IonButtons, IonItem, IonLabel, IonBackButton, IonInput,
  IonButton, IonSelect, IonSelectOption, IonIcon, IonText
} from "@ionic/react";
import { NotificationTray } from "../../Components";
import { add, trash, star } from "ionicons/icons";
import "../../theme/styles.css";

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
    servingSizes: [ 0 ], servingUnits: [ "g" ],
    defaultServingIndex: 0
  };
  // when we just want nutrients
  const excludedKeys = ["servingSizes", "servingUnits", "name", "id", "defaultServingIndex"];

  const [error, setError] = useState<undefined | string>(undefined);
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
      setError("Must set a name");
    } else if (!haveServingSizes) {
      setError("Must set a valid serving size")
    } else if (food.calories == 0) {
      setError("Must set calories");
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
            {edit ? "Create" : "View"} food
          </IonTitle>

          {edit && <IonButtons slot="end">
            <IonButton className="save-header-button" onClick={createFood}>
              Save
            </IonButton>
          </IonButtons>}
        </IonToolbar>
      </IonHeader>

      <IonContent className="inner-page">
        <NotificationTray />

        {edit
          ? <IonInput
            value={food.name}
            fill="outline"
            className="food-view-name"
            placeholder="Food name"
            onChange={(event) => {
              const value = event.currentTarget.value as string ?? "";
              setFood((prev: Food) => ({ ...prev, name: value }));
            }}
          />
          : <IonText><h3>{food.name}</h3></IonText>
        }
        {error !== undefined &&
          <p style={{ color: "red", fontSize: "0.9rem" }}>{error}</p>}

        <div className="horizontal-strip">
          <b>Serving sizes</b>
          {edit &&
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
            </IonButton>}
        </div>
        <hr />

        {edit && food.servingSizes.map((_, i) => (
          <IonItem key={i} className="serving-size">
            <div className="horizontal-strip">
              <IonInput
                className="nutrient-input"
                slot="start"
                type="number"
                placeholder="0"
                fill="solid"
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
            </div>

            <div className="wtf">
              <IonButton
                fill="clear" slot="end" size="small"
                onClick={() => {
                  setFood((prev: Food) => ({ ...prev, defaultServingIndex: i }));
                }}>
                <IonIcon
                  icon={star} slot="icon-only"
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
                <IonIcon slot="icon-only" color="danger" icon={trash} />
              </IonButton>
            </div>
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

        <b>Nutrients</b>
        <hr />
        {(Object.keys(food) as (keyof Food)[]).map((key, i) => {
          if (excludedKeys.includes(key)) return null;
          const unit = key == "calories" ? "cal" : "g";
          return (
            <IonItem key={i} className="nutrient-input">
              <IonLabel position="fixed" slot="start">
                {key[0].toUpperCase() + key.slice(1)}
              </IonLabel>
              {edit
                ? <IonInput
                  className="nutrient-input"
                  slot="end"
                  type="number"
                  label={unit}
                  labelPlacement="end"
                  fill="solid"
                  placeholder="0"
                  required={key == "calories"}
                  value={food[key] as number}
                  onIonInput={(event) => {
                    const value = Number(event.detail.value);
                    setFood(prev => ({ ...prev, [key]: value }));
                  }}
                />
                : <b>{(food[key as keyof Food] as number) * food.servingSizes[currentServing]}</b>
              }
            </IonItem>
          );
        })}
      </IonContent>
    </IonPage >
  );
}
