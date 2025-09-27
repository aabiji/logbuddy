import { useHistory } from "react-router";
import { Workout, useAppState } from "../../lib/state";
import { dayUnixTimestamp } from "../../lib/date";
import { request, useAuthRequest } from "../../lib/request";

import {
  IonContent, IonPage, IonButton, IonList, IonText, IonIcon,
} from "@ionic/react";
import { add, pencil } from "ionicons/icons";

// TODO:implement synching updated workout info
// TODO: work on line graphs and bar graphs

export default function ExercisePage() {
  const history = useHistory();
  const authRequest = useAuthRequest();
  const { workouts, templates, upsertWorkout } = useAppState();

  const createWorkout = async (templateID: number | undefined) => {
    let payload = {
      id: -1, name: "New template", notes: "",
      date: dayUnixTimestamp(new Date()),
      isTemplate: true, exercises: [],
    } as Workout;

    if (templateID !== undefined) {
      const base = workouts.get(templateID)!;
      payload = JSON.parse(JSON.stringify(base));
      payload.date = dayUnixTimestamp(new Date());
      payload.isTemplate = false;
      payload.id = -1;
      for (let i = 0; i < payload.exercises.length; i++) {
        payload.exercises[i].id = -1;
      }
    }

    try {
      const json = await authRequest((jwt: string) =>
        request("POST", "/workout/create", payload, jwt))
      upsertWorkout(json.workout);
      return json.workout.id;
    } catch (err: any) {
      console.log("ERROR!", err.message);
    }
  }

  return (
    <IonPage>
      <IonContent>
        <div
          style={{
            display: "flex", flexDirection: "row",
            justifyContent: "space-between"
           }}>
          <IonButton
            fill="clear"
            onClick={() => history.push("/exercise/progress")}>
            <p>Progress</p>
          </IonButton>

          <IonButton
            fill="clear"
            onClick={() => history.push("/exercise/history")}>
            <p>Workouts</p>
          </IonButton>

          <IonButton
            fill="clear"
            onClick={async () => history.push(`/exercise/template/-1`)}>
            <p>New template</p>
          </IonButton>
        </div>

        {templates.length == 0
          ? <IonText><p>No templates</p></IonText>
          : <IonList style={{ background: "transparent" }}>
            {templates.map((id: number, i: number) => (
              <div key={i} style={{
                display: "flex", backgroundColor: "var(--ion-color-dark)",
                alignItems: "center", justifyContent: "space-between",
                width: "95%", margin: "auto", padding: 10, marginBottom: 10
              }}>
                <h4>{workouts.get(id).name}</h4>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <IonButton
                    color="primary"
                    onClick={async () => history.push(`/exercise/workout/${id}`)}>
                    <IonIcon aria-hidden="true" icon={add} color="light" />
                    Start
                  </IonButton>

                  <IonButton
                    color="success"
                    onClick={() => history.push(`/exercise/template/${id}`)}>
                    <IonIcon aria-hidden="true" icon={pencil} color="light" />
                    Edit
                  </IonButton>
                </div>
              </div>
            ))}
          </IonList>
        }
      </IonContent>
    </IonPage>
  );
};
