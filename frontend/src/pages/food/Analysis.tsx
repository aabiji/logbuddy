import { useAppState } from "../../lib/state";
import { dayUnixTimestamp } from "../../lib/date";

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
  const { foods, meals } = useAppState();

  const weeklyMacroConsumption = (macro: string) => {
    // start from sunday of the current week
    const now = new Date();
    const diff = now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1);
    const weekStart = new Date(now.setDate(diff));
    const startTimestamp = dayUnixTimestamp(weekStart);

    // get the consumption of a macro each day, for the entire week
    let dailyCount = [];
    for (let i = 0; i < 7; i++) {
      const timestamp = startTimestamp + i * 86400000;
      const list = meals.get(timestamp);

      if (list) {
        let sum = 0;
        for (const m of list) {
          const food = foods.get(m.foodID)!;
          const i = food.servingUnits.indexOf(m.servingsUnit);
          sum += m.servings * food.servingSizes[i] * food[macro];
        }
        dailyCount.push(sum);
      } else {
        dailyCount.push(0);
      }
    }

    return dailyCount;
  }

  const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dataset = {
    data: weeklyMacroConsumption("calories"),
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
