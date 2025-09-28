import {
  IonContent, IonPage, IonHeader, IonToolbar,
  IonTitle, IonButtons, IonBackButton
} from "@ionic/react";
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, Tooltip, BarElement,
} from 'chart.js';
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, BarElement, Tooltip);

export default function FoodAnalysisPage() {
  const random = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dataset = {
    data: labels.map(() => random(0, 100)),
    backgroundColor: "cyan",
  };

  return (
    <IonPage>
      <IonHeader mode="ios" className="ion-no-border">
        <IonToolbar>
          <IonTitle>Food breakdown</IonTitle>
          <IonButtons slot="start">
            <IonBackButton defaultHref="#" />
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
          <h2>Calorie breakdown</h2>
          <Bar
            options={{ responsive: true }}
            data={{ labels, datasets: [dataset] }}
          />
      </IonContent>
    </IonPage>
  );
};
