import { useMemo } from "react";
import { Workout, useAppState } from "../../lib/state";
import { formatDate } from "../../lib/date";

import {
  IonTitle, IonContent, IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton
} from "@ionic/react";
import { NotificationTray } from "../../Components";

export default function HistoryPage() {
  const { workouts, settings } = useAppState();

  const entries = useMemo(() => {
    const values = Array.from(workouts.values()) as Workout[] ?? [];
    const entries = values.filter((w: Workout) => !w.isTemplate);
    entries.sort((a: Workout, b: Workout) => b.date - a.date);
    return entries; // in reverse chronological order
  }, [workouts]);

  const formatDuration = (totalMinutes: number) => {
    const hours = totalMinutes / 60;
    const minutes = Math.floor(totalMinutes - hours * 60);
    const seconds = (totalMinutes - hours * 60 - minutes) * 60;
    return `${hours} h : ${minutes} m : ${seconds} s`;
  }

  // TODO: delete workout

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle className="centered-title">Past workouts</IonTitle>
          <IonButtons slot="start">
            <IonBackButton defaultHref="#" />
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <NotificationTray />

        {entries.length == 0
          ? <p style={{ textAlign: "center" }}>No workouts</p>
          : <div>
            {entries.map((workout: Workout, i: number) => (
              <div key={i} className="workout-entry">
                <div className="horizontal-strip">
                  <h5>{workout.name}</h5>
                  <p style={{ color: "var(--ion-color-medium)" }}>
                    {formatDate(new Date(workout.date))}
                  </p>
                </div>

                {workout.exercises.map((e, i) => (
                  <div key={i} className="exercise-entry">
                    {e.exerciseType == "strength" ?
                      <div className="horizontal-strip" style={{ fontSize: 15 }}>
                        <p>{e.name}</p>
                        <i>{e.weight} {settings.useImperial ? "lbs" : "kg"}</i>
                        <p> reps:</p>
                        <b>{e.reps.join(", ")}</b>
                      </div>
                      : <div className="horizontal-strip" style={{ fontSize: 15 }}>
                        <p>{e.name} duration: </p>
                        <b>{formatDuration(e.duration)}</b>
                      </div>
                    }
                  </div>
                ))}

                {workout.notes.length > 0 && (
                  <div className="exercise-entry" style={{ paddingTop: 8 }}>
                    <i>Notes:</i>
                    <p style={{ fontSize: 15 }}>{workout.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        }
      </IonContent>
    </IonPage>
  );
}
