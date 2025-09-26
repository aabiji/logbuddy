import { useAppState } from "../../lib/state";
import { request, useAuthRequest } from "../../lib/request";
import { dayUnixTimestamp } from "../../lib/date";

import {
  IonContent, IonPage, IonHeader, IonToolbar,
  IonTitle, IonButtons, IonBackButton, IonFab,
  IonIcon, IonFabButton, IonList, IonText,
} from "@ionic/react";
import { add } from "ionicons/icons";
import { Template } from "./workout";

export default function TemplatesPage() {
  const { workouts, templates, upsertWorkout, removeWorkout } = useAppState();
  const authRequest = useAuthRequest();

  // TODO: how to update workouts on the backend side?
  //       should we have 1 bi update endpoint, or a bunch of smaller
  //       ones to update select fields?

  const remove = async (id: number) => {
    try {
      await authRequest((jwt: string) =>
        request("DELETE", `/workout/delete?workoutID=${id}`, undefined, jwt));
      removeWorkout(id);
    } catch (err: any) {
      console.log("ERROR!", err.message);
    }
  }

  const addTemplate = async () => {
    const emptyTemplate = {
      id: -1, name: "New template",
      date: dayUnixTimestamp(new Date()),
      isTemplate: true, exercises: []
    };
    try {
      const json = await authRequest((jwt: string) =>
        request("POST", "/workout/create", emptyTemplate, jwt))
      upsertWorkout(json.workout);
    } catch (err: any) {
      console.log("ERROR!", err.message);
    }
  }

  return (
    <IonPage>
      <IonHeader mode="ios" className="ion-no-border">
        <IonToolbar>
          <IonTitle>Templates</IonTitle>
          <IonButtons slot="start">
            <IonBackButton defaultHref="#" />
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {templates.length == 0
          ? <IonText><p>No workout templates</p></IonText>
          : <IonList style={{ background: "transparent" }}>
            {templates.map((id: number, i: number) =>
              <Template
                key={i}
                initialValue={workouts.get(id)}
                remove={() => remove(id)}
              />
            )}
          </IonList>
        }

        <IonFab slot="fixed" vertical="bottom" horizontal="end">
          <IonFabButton onClick={addTemplate}>
            <IonIcon icon={add}></IonIcon>
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};
