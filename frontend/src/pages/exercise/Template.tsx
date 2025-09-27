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
import { chevronBack, trash } from "ionicons/icons";

export default function TemplatePage() {
  const authRequest = useAuthRequest();
  const { workouts, removeWorkout } = useAppState();
  const { id } = useParams<{ id: string }>();
  const [template, setTemplate] = useState(workouts.get(Number(id)));

  const remove = async () => {
    try {
      await authRequest((jwt: string) =>
        request("DELETE", `/workout/delete?id=${template.id}`, undefined, jwt));
      removeWorkout(id);
    } catch (err: any) {
      console.log("ERROR!", err.message);
    }
  }

  const update = async () => {
    await remove();

    let payload = { ...template, id: -1, date: dayUnixTimestamp(new Date()) };
    for (let i = 0; i < payload.exercises.length; i++) {
      payload.exercises[i].id = -1;
    }

    try {
      await authRequest((jwt: string) =>
        request("POST", "/workout/create", payload, jwt));
      removeWorkout(id);
    } catch (err: any) {
      console.log("ERROR!", err.message);
    }
  }

  return (
    <IonPage>
      <IonHeader mode="ios" className="ion-no-border">
        <IonToolbar>
          <IonTitle>Edit template</IonTitle>
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
        <IonItem>
          <IonInput
            placeholder="Template name" value={template.name} slot="start"
            onIonInput={(event) => setTemplate((prev: Workout) =>
              ({ ...prev, name: event.detail.value as string }))}
          />

          <IonButton
            fill="clear" slot="end" size="small"
            onClick={async () => { await remove(); history.back(); }}>
            <IonIcon icon={trash} color="danger" />
          </IonButton>
        </IonItem>

        <div>
          {template.exercises.map((e: Exercise, i: number) => (
            <IonItemSliding
              key={i} style={{ borderBottom: "1px solid gray", marginBottom: 25 }}>
              <IonItem>
                <div>
                  <IonItem>
                    <IonInput
                      placeholder="Name" value={e.name}
                      onIonInput={(event) => setTemplate((prev: Workout) => ({
                        ...prev,
                        exercises: [
                          ...prev.exercises.slice(0, i),
                          { ...template.exercises[i], name: event.detail.value as string },
                          ...prev.exercises.slice(i + 1)
                        ]
                      }))}
                    />
                  </IonItem>

                  <IonItem>
                    <IonLabel slot="start">Number of sets</IonLabel>
                    <IonInput
                      value={0} placeholder="0" type="number" slot="end"
                      onIonInput={(event) => setTemplate((prev: Workout) => ({
                        ...prev,
                        exercises: [
                          ...prev.exercises.slice(0, i),
                          {
                            ...template.exercises[i],
                            reps: Array(Number(event.detail.value)).fill(0)
                          },
                          ...prev.exercises.slice(i + 1)
                        ]
                      }))}
                    />
                  </IonItem>

                  <IonItem>
                    <IonLabel slot="start">Weight</IonLabel>
                    <IonInput
                      placeholder="0" type="number"
                      slot="end" value={0} label="lbs" labelPlacement="end"
                      onIonInput={(event) => setTemplate((prev: Workout) => ({
                        ...prev,
                        exercises: [
                          ...prev.exercises.slice(0, i),
                          { ...template.exercises[i], weight: Number(event.detail.value) },
                          ...prev.exercises.slice(i + 1)
                        ]
                      }))}
                    />
                  </IonItem>
                </div>
              </IonItem>

              <IonItemOptions>
                <IonItemOption color="danger" onClick={() => {
                  setTemplate((prev: Workout) => ({
                    ...prev,
                    exercises: [...prev.exercises.slice(0, i), ...prev.exercises.slice(i + 1)]
                  }))
                }}>
                  <IonIcon slot="icon-only" icon={trash} />
                </IonItemOption>
              </IonItemOptions>
            </IonItemSliding>
          ))}
        </div>

        <IonButton
          expand="full" size="default"
          onClick={() => {
            setTemplate((prev: Workout) => ({
              ...prev,
              exercises: [
                ...prev.exercises,
                { id: -1, workoutID: prev.id, templateID: -1, name: "", weight: 0, reps: [] }
              ]
            }));
          }}>
          Add exercise
        </IonButton>
      </IonContent>
    </IonPage>
  );
}
