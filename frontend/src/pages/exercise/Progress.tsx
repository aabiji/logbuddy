import { useState } from "react";

import {
  IonContent, IonPage, IonHeader, IonToolbar,
  IonTitle, IonButtons, IonBackButton, IonSegment,
  IonSegmentButton, IonLabel
} from "@ionic/react";
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Tooltip
} from 'chart.js';
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement,Tooltip);

// TODO: implement synching updated workout info
// (add endpoint and function to fetch then upsert all user info that's lastmodified > lastSyncTime)
//
// TODO: work on line graphs
// (
//  generate a fake dataset,
//  run ramer douglas peuker to simplify,
//  auto generate the labels (dates) based off of the simplified points)
//  change graph points based off of the currentView
//  aggregate data points from all exercises over time
//  show the graphs of each
//  )

export default function ProgressPage() {
  const random = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  const [currentView, setCurrentView] = useState("weight");
  const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const dataset = {
    data: labels.map(() => random(0, 100)),
    borderColor: "cyan",
    backgroundColor: "transparent",
  };

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
          <Line
            options={{ responsive: true, interaction: { intersect: false } }}
            data={{ labels, datasets: [dataset] }}
          />
        </div>
      </IonContent>
    </IonPage>
  );
};
