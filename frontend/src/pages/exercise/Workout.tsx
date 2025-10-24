import { useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { Exercise, Workout, useAppState } from "../../lib/state";
import { request, useAuthRequest } from "../../lib/request";
import { dayUnixTimestamp } from "../../lib/date";

import {
  IonHeader, IonTitle, IonToolbar, IonPage,
  IonButton, IonContent, IonButtons, IonBackButton,
} from "@ionic/react";
import { Input, NotificationTray, TimeInput } from "../../Components";
import "../../theme/styles.css";

export default function WorkoutPage() {
  const authRequest = useAuthRequest();
  const history = useHistory();
  const { workouts, upsertWorkout } = useAppState();
  const { templateID } = useParams<{ templateID: string }>();

  const derivedWorkout = (templateID: number) => {
    // Create a new workout using the template as a base
    const base = workouts.get(templateID)!;
    const value = JSON.parse(JSON.stringify(base));
    value.date = dayUnixTimestamp(new Date());
    value.isTemplate = false;
    value.id = -1;
    for (let i = 0; i < value.exercises.length; i++) {
      value.exercises[i].id = -1;
    }
    return value;
  }

  const [workout, setWorkout] = useState(derivedWorkout(Number(templateID)));
  const [error, setError] = useState("");

  const create = async () => {
    for (const e of workout.exercises) {
      if ((e.exerciseType == "strength" && e.reps.includes(0)) ||
        (e.exerciseType == "cardio" && e.duration == 0)) {
        console.log(e);
        setError("Incomplete workout");
        return;
      }
    }

    setError("");
    const payload = { ...workout, id: -1, date: dayUnixTimestamp(new Date()) };
    for (let i = 0; i < payload.exercises.length; i++) {
      payload.exercises[i].id = -1;
    }

    const json = await authRequest((jwt: string) =>
      request("POSt", "/workout/create", payload, jwt)) as { workout: Workout; };
    if (json !== undefined)
      upsertWorkout(json.workout);

    history.replace("/exercise/history");
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="#" />
          </IonButtons>
          <IonTitle>{workout.name}</IonTitle>
          <IonButtons slot="end">
            <IonButton className="save-header-button" onClick={create}>Save</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <NotificationTray />
        {error.length > 0 && <p className="error-message">{error}</p>}

        <div className="workout-entry">
          <p style={{ fontWeight: "bold "}}>Notes</p>
          <Input
            placeholder="Notes"
            value={workout.notes}
            textarea
            setValue={(value) =>
              setWorkout((prev: Workout) => ({ ...prev, notes: value }))}
          />
        </div>

        {workout.exercises.map((e: Exercise, eIndex: number) => (
          <div key={eIndex} className="workout-entry">
            <p style={{ fontWeight: "bold "}}>{e.name} ({e.weight} {e.weightUnit})</p>
            {e.exerciseType == "cardio" &&
              <TimeInput
                setDuration={(n: number) => {
                  setWorkout((prev: Workout) => {
                    const copy = { ...prev };
                    copy.exercises[eIndex].duration = n;
                    return copy;
                  })
                }}
              />
            }
            {e.exerciseType == "strength" && e.reps.map((r: number, i: number) => (
              <div className="horizontal-strip">
                <p>Set #{i + 1} reps</p>
                <div style={{ width: "30%" }}>
                  <Input
                    placeholder="0"
                    inputType="number"
                    key={i} value={r}
                    setValue={(value: string) => {
                      setWorkout((prev: Workout) => {
                        const copy = { ...prev };
                        copy.exercises[eIndex].reps[i] = Number(value);
                        return copy;
                      })
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        ))}
      </IonContent>
    </IonPage>
  );
}
