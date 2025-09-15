import {
  IonCard, IonContent, IonList, IonCardHeader,
  IonPage, IonItem, IonLabel, IonCardTitle,
  IonCardSubtitle, IonCardContent,
} from '@ionic/react';

import "./Index.css";

function Workout() {
  const workout = {
    name: "Workout name",
    date: "September 15, 2025",
    exercises: [
      {
        name: "Exercise name",
        reps: [1, 2, 3, 4]
      },
      {
        name: "Another exercise name",
        reps: [2, 3, 4, 5]
      }
    ]
  }

  return (
    <IonCard color="light">
      <IonCardHeader>
        <IonCardTitle>{workout.name}</IonCardTitle>
        <IonCardSubtitle>{workout.date}</IonCardSubtitle>
      </IonCardHeader>

      <IonCardContent>
        <IonList>
          {workout.exercises.map((e, i) => (
            <IonItem key={i}>
              <IonLabel>{e.name}</IonLabel>
              <div className="flex-row">
                {e.reps.map((r, i) =>
                  <input key={i} className="small-input" placeholder="0" />
                )}
              </div>
            </IonItem>
          ))}
        </IonList>
      </IonCardContent>
    </IonCard>
  );
}

function Index() {
  return (
    <IonPage>
      <IonContent>

        <Workout />

      </IonContent>
    </IonPage>
  );
};

export default Index;
