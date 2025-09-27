import { useState } from "react";
import { useParams } from "react-router-dom";
import { Exercise, Workout, useAppState } from "../../lib/state";
import { request, useAuthRequest } from "../../lib/request";
import { dayUnixTimestamp } from "../../lib/date";

import {
  IonHeader, IonTitle, IonItem, IonButtons,
  IonLabel, IonBackButton, IonItemOptions,
  IonItemSliding, IonInput, IonToolbar, IonPage,
  IonItemOption, IonIcon, IonButton, IonContent
} from "@ionic/react";
import { chevronBack } from "ionicons/icons";

export default function WorkoutPage() {
  const authRequest = useAuthRequest();
  const { workouts, removeWorkout } = useAppState();
  const { id } = useParams<{ id: string }>();
  const [workout, setWorkout] = useState(workouts.get(Number(id)));

  const remove = async () => {
    try {
      await authRequest((jwt: string) =>
        request("DELETE", `/workout/delete?id=${workout.id}`, undefined, jwt));
      removeWorkout(id);
    } catch (err: any) {
      console.log("ERROR!", err.message);
    }
  }

  const update = async () => {
    await remove();

    let payload = { ...workout, id: -1, date: dayUnixTimestamp(new Date()) };
    for (let i = 0; i < payload.exercises.length; i++) {
      payload.exercises[i].id = -1;
    }

    try {
      await authRequest((jwt: string) =>
        request("POSt", "/workout/create", payload, jwt));
      removeWorkout(id);
    } catch (err: any) {
      console.log("ERROR!", err.message);
    }
  }

  return (
    <IonPage>
      <IonHeader mode="ios" className="ion-no-border">
        <IonToolbar>
          <IonTitle>{workout.name}</IonTitle>

          <IonButton
            slot="start"
            fill="clear"
            style={{marginLeft: -10}}
            onClick={async () => { await update(); history.back(); }}>
            <IonIcon size="default" icon={chevronBack} />
            Back
          </IonButton>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        workout editing goes here :)
      </IonContent>
    </IonPage>
  );
  }