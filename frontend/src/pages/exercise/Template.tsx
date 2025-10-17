import { useState } from "react";
import { useParams } from "react-router-dom";
import { Exercise, Workout, useAppState } from "../../lib/state";
import { request, useAuthRequest } from "../../lib/request";
import { dayUnixTimestamp } from "../../lib/date";

import {
  IonHeader, IonTitle, IonToolbar, IonPage,
  IonIcon, IonButton, IonContent, IonButtons, IonBackButton
} from "@ionic/react";
import { Input, NotificationTray, Selection } from "../../Components";
import { trash } from "ionicons/icons";
import "../../theme/styles.css";

export default function TemplatePage() {
  const authRequest = useAuthRequest();
  const { workouts, removeWorkout, upsertWorkout, settings } = useAppState();
  const { id } = useParams<{ id: string }>();
  const creating = id === "-1";
  const [template, setTemplate] = useState(
    !creating
      ? workouts.get(Number(id))!
      : {
        id: -1, name: "New template", notes: "",
        date: dayUnixTimestamp(new Date()),
        isTemplate: true, exercises: [],
      } as Workout
  );
   const exerciseTypes = ["strength", "cardio"];

  const remove = async () => {
    const response = await authRequest((jwt: string) =>
      request("DELETE", `/workout/delete?id=${template.id}`, undefined, jwt));
    if (response !== undefined)
      removeWorkout(template.id);
  }

  const update = async () => {
    if (!creating) await remove();

    const payload = JSON.parse(JSON.stringify(template));
    payload.date = dayUnixTimestamp(new Date());
    payload.id = -1;
    for (let i = 0; i < payload.exercises.length; i++) {
      payload.exercises[i].id = -1;
    }

    const json = await authRequest((jwt: string) =>
      request("POST", "/workout/create", payload, jwt)) as { workout: Workout; };
    if (json !== undefined)
      upsertWorkout(json.workout);
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="#" />
          </IonButtons>
          <IonTitle>{creating ? "Create" : "Edit"} template</IonTitle>
          <IonButtons slot="end">
            {!creating &&
              <IonButton
                className="delete-header-button"
                onClick={async () => { await remove(); history.back(); }}>
                Delete
              </IonButton>
            }

            <IonButton className="save-header-button"
              onClick={async () => { await update(); history.back(); }}>
              Save
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <NotificationTray />

        <div className="horizontal-strip">
          <Input
            placeholder="Template name" value={template.name}
            setValue={(value: string) => setTemplate((prev: Workout) => ({ ...prev, name: value }))}
          />
          <Selection
            selections={exerciseTypes}
            setSelection={(value: string) => {
              setTemplate((prev: Workout) => ({
                ...prev,
                exercises: [
                  ...prev.exercises,
                  {
                    id: -1, workoutID: prev.id,
                    exerciseType: value, name: "new exercise",
                    weight: 0, weightUnit: settings.useImperial ? "lbs" : "kg",
                    reps: [], duration: 0,
                  }
                ]
              }));
            }}
          />
        </div>

        {template.exercises.map((e: Exercise, i: number) => (
          <div key={i}>
            <div>
              <Input
                placeholder="Name" value={e.name}
                setValue={(value: string) => setTemplate((prev: Workout) => ({
                  ...prev,
                  exercises: [
                    ...prev.exercises.slice(0, i),
                    { ...template.exercises[i], name: value },
                    ...prev.exercises.slice(i + 1)
                  ]
                }))}
              />

              <IonButton color="danger" onClick={() => {
                setTemplate((prev: Workout) => ({
                  ...prev,
                  exercises: [...prev.exercises.slice(0, i), ...prev.exercises.slice(i + 1)]
                }))
              }}>
                <IonIcon slot="icon-only" icon={trash} />
              </IonButton>
            </div>

            {e.exerciseType == "strength" &&
              <div className="horizontal-strip">
                <Input
                  value={e.reps.length}
                  label="sets" labelPlacement="end"
                  placeholder="0" inputType="number"
                  min={1} max={10}
                  setValue={(value: string) => setTemplate((prev: Workout) => ({
                    ...prev,
                    exercises: [
                      ...prev.exercises.slice(0, i),
                      {
                        ...template.exercises[i],
                        reps: Array(Number(value)).fill(0)
                      },
                      ...prev.exercises.slice(i + 1)
                    ]
                  }))}
                />
                <Input
                  placeholder="0" inputType="number"
                  value={e.weight} label={e.weightUnit} labelPlacement="end"
                  setValue={(value: string) => setTemplate((prev: Workout) => ({
                    ...prev,
                    exercises: [
                      ...prev.exercises.slice(0, i),
                      { ...template.exercises[i], weight: Number(value) },
                      ...prev.exercises.slice(i + 1)
                    ]
                  }))}
                />
              </div>
            }
            <hr />
          </div>
        ))}
      </IonContent>
    </IonPage>
  );
}
