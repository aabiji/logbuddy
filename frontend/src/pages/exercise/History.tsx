import { useMemo } from "react";
import { Workout, useAppState } from "../../lib/state";
import { formatDate } from "../../lib/date";

import {
  IonCard, IonCardHeader, IonItem, IonCardTitle,
  IonCardSubtitle, IonCardContent, IonTitle,
  IonContent, IonPage, IonHeader, IonToolbar,
  IonButtons, IonBackButton, IonList, IonText
} from "@ionic/react";

export default function HistoryPage() {
  const { workouts } = useAppState();

  const entries = useMemo(() => {
    const values = Array.from(workouts.values()) as Workout[] ?? [];
    const entries = values.filter((w: Workout) => !w.isTemplate);
    entries.sort((a: Workout, b: Workout) => b.date - a.date);
    return entries; // in reverse chronological order
  }, [workouts]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Workout history</IonTitle>
          <IonButtons slot="start">
            <IonBackButton defaultHref="#" />
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {entries.length == 0
          ? <IonText><p style={{ textAlign: "center" }}>No workouts</p></IonText>
          : <IonList style={{ background: "transparent" }}>
            {entries.map((workout: Workout, i: number) => (
              <IonCard key={i}>
                <IonCardHeader>
                  <IonCardSubtitle>{
                    formatDate(new Date(workout.date))}
                  </IonCardSubtitle>
                  <IonCardTitle>{workout.name}</IonCardTitle>
                </IonCardHeader>

                <IonCardContent>
                  {workout.exercises.map((e, i) => (
                    <IonItem slot="header" key={i}>
                      <IonText>
                        <p>{e.name} ({e.weight} lbs) {e.reps.join(", ")}</p>
                      </IonText>
                    </IonItem>
                  ))}

                  {workout.notes.length > 0 &&
                    <IonItem>
                      <IonText><p>{workout.notes}</p></IonText>
                    </IonItem>
                  }
                </IonCardContent>
              </IonCard>
            ))}
          </IonList>
        }
      </IonContent>
    </IonPage>
  );
}
