import { useMemo, useState } from "react";
import { Workout, useAppState } from "../../lib/state";

import {
  IonContent, IonPage, IonHeader, IonToolbar,
  IonTitle, IonButtons, IonBackButton, IonSegment,
  IonSegmentButton, IonLabel
} from "@ionic/react";
import { NotificationTray } from "../../Components";
import { LineGraph, Heatmap } from "../exercise/Graph";
import { Point } from "../../lib/simplify";
import "../../theme/styles.css";

interface ExerciseData {
  exerciseType: string;
  weightPoints: Point[];
  repPoints: Point[];
  durationPoints: Point[];
}

function aggregateExerciseDataPoints(workouts: Map<number, Workout>): Map<string, ExerciseData> { 
  const plotData = new Map<string, ExerciseData>();
  
  for (const id of workouts.keys()) {
    const workout = workouts.get(id)!;

    for (const e of workout.exercises) {
      let existing = plotData.get(e.name);
      if (!existing) {
        existing = {
          exerciseType: e.exerciseType,
          weightPoints: [], repPoints: [], durationPoints: []
        };
      }
      const averageReps = e.reps.length > 0
        ? Math.floor(e.reps.reduce((a, b) => a + b, 0) / e.reps.length)
        : 0;
      if (e.exerciseType === "strength") {
        existing.weightPoints.push({ date: new Date(workout.date), value: e.weight });
        existing.repPoints.push({ date: new Date(workout.date), value: averageReps });
      } else {
        existing.durationPoints.push({ date: new Date(workout.date), value: e.duration });
      }
      plotData.set(e.name, existing);
    }
  }
  
  return plotData;
}

export default function ProgressPage() {
  const { settings, workouts } = useAppState();
  const [views, setViews] = useState<Record<string, string>>({});
  const plotData = useMemo(() => aggregateExerciseDataPoints(workouts), [workouts]);

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

        {plotData.size === 0 && <p style={{ textAlign: "center" }}>No exercises</p>}

        {plotData.size > 0 && [...plotData.keys()].map((exerciseName, i) => {
          const exerciseData = plotData.get(exerciseName)!;
          const view = views[exerciseName] || "weight";
          
          return (
            <div key={i}>
              <div className="view-chooser horizontal-strip">
                <h6>{exerciseName[0].toUpperCase() + exerciseName.slice(1)}</h6>
                
                {exerciseData.exerciseType === "strength" && (
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
                )}
              </div>

              {exerciseData.exerciseType === "cardio" ? (
                <Heatmap 
                  data={exerciseData.durationPoints} 
                  padding={{ x: 20, y: 20 }} 
                  innerPadding={2} 
                />
              ) : (
                <LineGraph
                  data={
                    view === "weight"
                      ? exerciseData.weightPoints
                      : exerciseData.repPoints
                  }
                  spacingY={20} 
                  padding={{ x: 40, y: 20 }}
                  maxNumPoints={10}
                  unit={settings.useImperial ? "lbs" : "kg"}
                />
              )}
            </div>
          );
        })}
      </IonContent>
    </IonPage>
  );
}
