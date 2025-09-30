import { useHistory } from "react-router";
import { useAppState } from "../../lib/state";
import { dayUnixTimestamp } from "../../lib/date";
import { request, useAuthRequest } from "../../lib/request";

import {
  IonContent, IonPage, IonButton, IonList, IonText, IonIcon
} from "@ionic/react";
import { add, pencil } from "ionicons/icons";
import { useEffect } from "react";

export default function ExercisePage() {
  const history = useHistory();
  const authRequest = useAuthRequest();
  const { workouts, templates, removeWorkout, upsertWorkout } = useAppState();

  const lastSyncTime = 0; // TODO: initially should be like 1 month before this date

  // TODO: when paginating workouts in History, get
  // workouts with useDate=1, so we filter date, not lastModified

  const updateWorkoutData = async () => {
    // update workouts based off of backend updates
    // (either workouts that were deleted or created)
    try {
      const end = dayUnixTimestamp(new Date());
      const endpoint =
        `/workout/entries?startTime=${lastSyncTime}&endTime=${end}&useDate=0`;
      const json = await authRequest((jwt: string) =>
        request("GEt", endpoint, undefined, jwt));

      for (const w of json.results) {
        let workoutCopy = JSON.parse(JSON.stringify(w));
        if (workoutCopy.deleted) {
          removeWorkout(w.id);
        } else {
          delete workoutCopy[w.id];
          upsertWorkout(workoutCopy);
        }
      }

    } catch (err: any) {
      console.log("ERROR!", err.message);
    }
  }

  useEffect(() => { updateWorkoutData() }, [])

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
                <h4>{workouts.get(id)!.name}</h4>
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
