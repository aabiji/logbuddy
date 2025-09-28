import { useState } from "react";

import {
  IonContent, IonPage, IonHeader, IonToolbar,
  IonTitle, IonButtons, IonBackButton, IonSegment,
  IonSegmentButton, IonLabel
} from "@ionic/react";
import { LineGraph, Point } from "./Graph";

export default function ProgressPage() {
  const [currentView, setCurrentView] = useState("weight");

  // generate a random dataset
  const random = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  const randomDate = (year: number) => {
    const yearStart = new Date(year, 0, 1).getTime();
    const yearEnd = new Date(year, 11, 31, 23, 9, 59, 999).getTime();
    return new Date(yearStart + Math.random() * (yearEnd - yearStart));
  }

  let data: Point[] = [];
  for (let i = 2023; i <= 2025; i++) {
    for (let j = 0; j < 100; j++) {
      data.push({ date: randomDate(i), value: random(0, 250) });
    }
  }
  data.sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <IonPage>
      <IonHeader mode="ios" className="ion-no-border">
        <IonToolbar>
          <IonTitle>Progress</IonTitle>
          <IonButtons slot="start">
            <IonBackButton defaultHref="#" />
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <div>
          <div>
            <h2>Exercise name</h2>
            <IonSegment
              value={currentView} mode="ios"
              onIonChange={(e) => setCurrentView(e.detail.value as string)}>
              <IonSegmentButton value="weight">
                <IonLabel>Weight</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="reps">
                <IonLabel>Reps</IonLabel>
              </IonSegmentButton>
            </IonSegment>
          </div>
          <LineGraph data={data} />
        </div>
      </IonContent>
    </IonPage>
  );
};
