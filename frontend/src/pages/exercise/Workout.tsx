import { useState } from "react";
import { useParams } from "react-router-dom";
import { Exercise, Workout, useAppState } from "../../lib/state";
import { request, useAuthRequest } from "../../lib/request";
import { dayUnixTimestamp } from "../../lib/date";

import {
  IonHeader, IonTitle, IonItem, IonLabel,
  IonTextarea, IonText, IonInput, IonToolbar,
  IonPage, IonButton, IonContent, IonButtons,
  IonBackButton
} from "@ionic/react";

export default function WorkoutPage() {
  const authRequest = useAuthRequest();
  const { workouts, upsertWorkout } = useAppState();
  const { templateID } = useParams<{ templateID: string }>();

  const derivedWorkout = (templateID: number) => {
    // Create a new workout using the template as a base
    const base = workouts.get(templateID)!;
    let value = JSON.parse(JSON.stringify(base));
    value.date = dayUnixTimestamp(new Date());
    value.isTemplate = false;
    value.id = -1;
    for (let i = 0; i < value.exercises.length; i++) {
      value.exercises[i].id = -1;
    }
    return value;
  }

  const [workout, setWorkout] = useState(derivedWorkout(Number(templateID)));

  const create = async () => {
    let payload = { ...workout, id: -1, date: dayUnixTimestamp(new Date()) };
    for (let i = 0; i < payload.exercises.length; i++) {
      payload.exercises[i].id = -1;
    }

    try {
      const json = await authRequest((jwt: string) =>
        request("POSt", "/workout/create", payload, jwt));
      upsertWorkout(json.workout);
    } catch (err: any) {
      console.log("ERROR!", err.message);
    }
  }

  return (
    <IonPage>
      <IonHeader mode="ios" className="ion-no-border">
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="#" />
          </IonButtons>
          <IonTitle>{workout.name}</IonTitle>
          <IonButtons slot="end">
            <IonButton
              onClick={async () => { await create(); history.back(); }}>
              Save
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonTextarea
          label="Notes" autoGrow={true}
          labelPlacement="stacked" placeholder="Notes"
          onIonInput={(event) =>
            setWorkout((prev: Workout) => ({ ...prev, notes: event.detail.value }))}
        />

        {workout.exercises.map((e: Exercise, eIndex: number) => (
          <div key={eIndex}>
            <IonText><h3>{e.name} ({e.weight} lbs)</h3></IonText>

            {e.reps.map((r: number, i: number) => (
              <IonItem key={i}>
                <IonLabel slot="start">Set #{i + 1}</IonLabel>
                <IonInput
                  fill="outline" placeholder="0" type="number"
                  slot="end" key={i} value={r}
                  onIonInput={(event) => {
                    setWorkout((prev: Workout) => {
                      let copy = { ...prev };
                      copy.exercises[eIndex].reps[i] = Number(event.detail.value);
                      return copy;
                    })
                  }}
                />
              </IonItem>
            ))}
          </div>
        ))}
      </IonContent>
    </IonPage>
  );
}