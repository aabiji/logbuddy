import { useMemo } from "react";
import { useHistory } from "react-router";
import { Workout, useAppState } from "../../lib/state";

import {
  IonContent, IonPage, IonButton, IonList, IonText,
} from "@ionic/react";
import { Entry } from "./workout";

export default function WorkoutsPage() {
  const history = useHistory();
  const { workoutEntries } = useAppState();

  const entries = useMemo(() => {
    const values = Array.from(workoutEntries.values()) as Workout[] ?? [];
    values.sort((a: Workout, b: Workout) => b.date - a.date);
    return values; // in reverse chronological order
  }, [workoutEntries]);

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
      </IonContent>
    </IonPage>
  );
};
