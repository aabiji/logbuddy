import { useState } from "react";
import { Workout } from "../../lib/state";
import { dayUnixTimestamp, formatDate } from "../../lib/utils";

import {
  IonCard, IonCardHeader, IonItem, IonCardTitle,
  IonLabel, IonCardSubtitle, IonCardContent,
  IonTextarea, IonItemOptions, IonItemSliding,
  IonInput, IonAccordionGroup, IonAccordion,
  IonItemOption, IonIcon
} from "@ionic/react";
import { trash } from "ionicons/icons";

export function Entry({ workout }: { workout: Workout; }) {
  return (
    <IonCard>
      <IonCardHeader>
        <IonCardSubtitle>{
          formatDate(new Date(workout.date))}
        </IonCardSubtitle>
        <IonCardTitle>{workout.name}</IonCardTitle>
      </IonCardHeader>

      <IonCardContent>
        <IonAccordionGroup>
          {workout.exercises.map((e, i) => (
            <IonAccordion key={i}>
              <IonItem slot="header">
                <IonLabel>{e.name} ({e.weight} lbs)</IonLabel>
              </IonItem>

              <div slot="content">
                {e.reps.map((r, i) => (
                  <IonItem>
                    <IonLabel slot="start">Set #{i + 1}</IonLabel>
                    <IonInput
                      fill="outline" placeholder="0" type="number"
                      slot="end" key={i} value={r}
                    />
                  </IonItem>
                ))}
              </div>
            </IonAccordion>
          ))}
        </IonAccordionGroup>

        <IonItem>
          <IonTextarea label="Notes" autoGrow={true}
            labelPlacement="stacked" placeholder="Workout notes" />
        </IonItem>
      </IonCardContent>
    </IonCard>
  );
}

export function Template() {
  const [workout, setWorkout] = useState<Workout>({
    id: -1, name: "",
    date: dayUnixTimestamp(new Date()),
    isTemplate: true, exercises: []
  });

  return (
    <IonCard>
      <IonInput
        placeholder="Template name" fill="outline" value={workout.name}
        onIonInput={(event) => setWorkout((prev: Workout) =>
          ({ ...prev, name: event.detail.value as string }))}
      />

      <div>
        {workout.exercises.map((e, i) => (
          <IonItemSliding
            key={i} style={{ borderBottom: "1px solid gray", marginBottom: 25 }}>
            <IonItem>
              <div>
                <IonItem>
                  <IonInput
                    placeholder="Name" value={e.name}
                    onIonInput={(event) => setWorkout((prev: Workout) => ({
                      ...prev,
                      exercises: [
                        ...prev.exercises.slice(0, i),
                        { ...workout.exercises[i], name: event.detail.value as string },
                        ...prev.exercises.slice(i + 1)
                      ]
                    }))}
                  />
                </IonItem>

                <IonItem>
                  <IonLabel slot="start">Number of sets</IonLabel>
                  <IonInput
                    value={0} placeholder="0" type="number" slot="end"
                    onIonInput={(event) => setWorkout((prev: Workout) => ({
                      ...prev,
                      exercises: [
                        ...prev.exercises.slice(0, i),
                        {
                          ...workout.exercises[i],
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
                    onIonInput={(event) => setWorkout((prev: Workout) => ({
                      ...prev,
                      exercises: [
                        ...prev.exercises.slice(0, i),
                        { ...workout.exercises[i], weight: Number(event.detail.value) },
                        ...prev.exercises.slice(i + 1)
                      ]
                    }))}
                  />
                </IonItem>
              </div>
            </IonItem>

            <IonItemOptions>
              <IonItemOption color="danger" onClick={() => {
                setWorkout((prev: Workout) => ({
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
          setWorkout((prev: Workout) => ({
            ...prev,
            exercises: [
              ...prev.exercises,
              { id: -1, workoutID: -1, name: "", weight: 0, reps: [] }
            ]
          }));
        }}>
        Add exercise
      </IonButton>
    </IonCard >
  );
}
