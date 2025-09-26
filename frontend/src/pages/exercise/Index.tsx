import { useMemo } from "react";
import { useHistory } from "react-router";
import { Workout, useAppState } from "../../lib/state";
import { Entry } from "./workout";

import {
  IonContent, IonPage, IonButton, IonList, IonText,
  IonFab, IonFabButton, IonIcon
} from "@ionic/react";
import { add } from "ionicons/icons";

export default function WorkoutsPage() {
  const history = useHistory();
  const { workouts } = useAppState();

  const entries = useMemo(() => {
    const values = Array.from(workouts.values()) as Workout[] ?? [];
    const entries = values.filter((w: Workout) => !w.isTemplate);
    entries.sort((a: Workout, b: Workout) => b.date - a.date);
    return entries; // in reverse chronological order
  }, [workouts]);

  const addWorkout = () => {}

  return (
    <IonPage>
      <IonContent>
        <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
          <IonButton fill="clear" onClick={() => history.push("/exercise/progress")}>
            <p>View progress</p>
          </IonButton>

          <IonButton fill="clear" onClick={() => history.push("/exercise/templates")}>
            <p>Edit templates</p>
          </IonButton>
        </div>

        {entries.length == 0
          ? <IonText>No workouts</IonText>
          : <IonList>
            {entries.map((w: Workout, i: number) => <Entry workout={w} key={i} />)}
          </IonList>
        }

        <IonFab slot="fixed" vertical="bottom" horizontal="end">
          <IonFabButton onClick={addWorkout}>
            <IonIcon icon={add}></IonIcon>
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};
