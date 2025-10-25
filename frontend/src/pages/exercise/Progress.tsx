import { useMemo, useState } from "react";
import { Workout, useAppState } from "../../lib/state";

import {
  IonContent, IonPage, IonHeader, IonToolbar,
  IonTitle, IonButtons, IonBackButton, IonSegment,
  IonSegmentButton, IonLabel
} from "@ionic/react";
import { NotificationTray } from "../../Components";
import { LineGraph, Point } from "./Graph";
import "../../theme/styles.css";

type ExerciseData = { weightPoints: Point[], repPoints: Point[] };

function aggregateExerciseDataPoints(
  workouts: Map<number, Workout>
): Map<string, ExerciseData> { // map exercise name to data points
  // group data points by exercises
  const plotData = new Map<string, ExerciseData>();
  for (const id of workouts.keys()) {
    const workout = workouts.get(id)!;

    for (const e of workout.exercises) {
      const existing = plotData.get(e.name);
      const weightPoints = existing ? existing.weightPoints : [];
      const repPoints = existing ? existing.repPoints : [];

      const averageReps =
        Math.floor(e.reps.reduce((a, b) => a + b, 0) / e.reps.length);
      const newData = {
        weightPoints: [
          ...weightPoints,
          { date: new Date(workout.date), value: e.weight }
        ],
        repPoints: [
          ...repPoints,
          { date: new Date(workout.date), value: averageReps }
        ]
      }

      plotData.set(e.name, newData);
    }
  }
  return plotData;
}

export default function ProgressPage() {
  const { workouts } = useAppState();
  const [views, setViews] = useState<Record<string, string>>({});
  const plotData = useMemo(() => aggregateExerciseDataPoints(workouts), []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle className="centered-title">Progress</IonTitle>
          <IonButtons slot="start">
            <IonBackButton defaultHref="#" />
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <NotificationTray />

        {plotData.size == 0 && <p style={{ textAlign: "center" }}>No exercises</p>}

        {plotData.size > 0 && [...plotData.keys()].map((exerciseName, i) => {
          const view = views[exerciseName] || "weight";
          return (
            <div key={i}>
              <div className="view-chooser horizontal-strip">
                <h6>{exerciseName[0].toUpperCase() + exerciseName.slice(1)}</h6>
                <div style={{ width: "60%" }}>
                  <IonSegment
                    style={{ fontSize: "10px" }}
                    value={view} mode="ios"
                    onIonChange={(e) =>
                      setViews({
                        ...views,
                        [exerciseName]: e.detail.value as string
                      })
                    }>
                    <IonSegmentButton value="weight">
                      <IonLabel>Weight</IonLabel>
                    </IonSegmentButton>
                    <IonSegmentButton value="reps">
                      <IonLabel>Reps</IonLabel>
                    </IonSegmentButton>
                  </IonSegment>
                </div>
              </div>
              <LineGraph data={
                view == "weight"
                  ? plotData.get(exerciseName)!.weightPoints
                  : plotData.get(exerciseName)!.repPoints}
              />
            </div>
          );
        })}
      </IonContent>
    </IonPage>
  );
}
