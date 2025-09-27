import { useMemo } from "react";
import { Workout, useAppState } from "../../lib/state";
import { request, useAuthRequest } from "../../lib/request";
import { formatDate } from "../../lib/date";

import {
  IonCard, IonCardHeader, IonItem, IonCardTitle,
  IonLabel, IonCardSubtitle, IonCardContent, IonTitle,
  IonTextarea, IonInput, IonAccordionGroup, IonAccordion,
  IonContent, IonPage, IonHeader, IonToolbar, IonButtons,
  IonBackButton, IonList, IonText
} from "@ionic/react";

function Entry({ workout }: { workout: Workout; }) {
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

export default function HistoryPage() {
  const { workouts, removeWorkout } = useAppState();
  const authRequest = useAuthRequest();

  const entries = useMemo(() => {
    const values = Array.from(workouts.values()) as Workout[] ?? [];
    const entries = values.filter((w: Workout) => !w.isTemplate);
    entries.sort((a: Workout, b: Workout) => b.date - a.date);
    return entries; // in reverse chronological order
  }, [workouts]);

  const remove = async (id: number) => {
    try {
      await authRequest((jwt: string) =>
        request("DELETE", `/workout/delete?id=${id}`, undefined, jwt));
      removeWorkout(id);
    } catch (err: any) {
      console.log("ERROR!", err.message);
    }
  }

  return (
    <IonPage>
      <IonHeader mode="ios" className="ion-no-border">
        <IonToolbar>
          <IonTitle>Workout history</IonTitle>
          <IonButtons slot="start">
            <IonBackButton defaultHref="#" />
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {entries.length == 0
          ? <IonText><p>No workouts</p></IonText>
          : <IonList style={{ background: "transparent" }}>
            {entries.map((w: Workout, i: number) => <Entry workout={w} key={i} />)}
          </IonList>
        }
      </IonContent>
    </IonPage>
  );
};
