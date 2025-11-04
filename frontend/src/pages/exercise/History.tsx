import { useMemo, useState } from "react";
import { Workout, useAppState } from "../../lib/state";
import { Point } from "../../lib/simplify";
import { formatDate } from "../../lib/date";

import {
  IonTitle, IonContent, IonPage, IonHeader, IonToolbar, IonButtons,
  IonBackButton, IonSegment, IonSegmentButton, IonLabel
} from "@ionic/react";
import { NotificationTray } from "../../Components";
import { LineGraph, Heatmap } from "../exercise/Graph";

interface ExerciseData {
  exerciseType: string;
  weightPoints: Point[];
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
          weightPoints: [], durationPoints: []
        };
      }
      const averageReps = e.reps.length > 0
        ? Math.floor(e.reps.reduce((a, b) => a + b, 0) / e.reps.length)
        : 0;
      if (e.exerciseType === "strength")
        existing.weightPoints.push({ date: new Date(workout.date), value: e.weight });
      else
        existing.durationPoints.push({ date: new Date(workout.date), value: e.duration });
      plotData.set(e.name, existing);
    }
  }

  return plotData;
}

function ProgressList() {
  const { settings, workouts } = useAppState();
  const plotData = useMemo(() => aggregateExerciseDataPoints(workouts), [workouts]);

  return (
    <div>
      {plotData.size === 0 && <p style={{ textAlign: "center" }}>No exercises</p>}

      {plotData.size > 0 && [...plotData.keys()].map((exerciseName, i) => {
        const exerciseData = plotData.get(exerciseName)!;
        return (
          <div key={i}>
            <h6>{exerciseName[0].toUpperCase() + exerciseName.slice(1)}</h6>
            {exerciseData.exerciseType === "cardio" ? (
              <Heatmap
                data={exerciseData.durationPoints}
                padding={{ x: 20, y: 20 }}
                innerPadding={2}
              />
            ) : (
              <LineGraph
                data={exerciseData.weightPoints}
                spacingY={20}
                padding={{ x: 40, y: 20 }}
                maxNumPoints={10}
                unit={settings.useImperial ? "lbs" : "kg"}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function WorkoutsList() {
  const { workouts, settings } = useAppState();

  const entries = useMemo(() => {
    const values = Array.from(workouts.values()) as Workout[] ?? [];
    const entries = values.filter((w: Workout) => !w.isTemplate);
    entries.sort((a: Workout, b: Workout) => b.date - a.date);
    return entries; // in reverse chronological order
  }, [workouts]);

  const formatDuration = (totalMinutes: number) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);
    const seconds = Math.round((totalMinutes % 1) * 60);
    return `${hours} h : ${minutes} m : ${seconds} s`;
  }

  return (
    <div>
      {entries.length == 0
        ? <p style={{ textAlign: "center" }}>No workouts</p>
        : <div>
          {entries.map((workout: Workout, i: number) => (
            <div key={i} className="workout-entry">
              <div className="horizontal-strip">
                <h6>{workout.name}</h6>
                <p className="workout-date"> {formatDate(new Date(workout.date))} </p>
              </div>

              {workout.exercises.map((e, i) => (
                <div key={i} className="exercise-entry">
                  {e.exerciseType == "strength" ?
                    <div className="horizontal-strip">
                      <p>{e.name}</p>
                      <div style={{ width: "35%", textAlign: "right" }}>
                        <p className="description">
                          {e.reps.length} set{e.reps.length > 1 ? "s" : ""} × {e.weight} {settings.useImperial ? "lbs" : "kg"}
                        </p>
                        <p>{e.reps.join(", ")} reps</p>
                      </div>
                    </div>
                    : <div className="horizontal-strip">
                      <p>{e.name} duration: </p>
                      <b style={{ width: "35%", textAlign: "right" }}>
                        {formatDuration(e.duration)}
                      </b>
                    </div>
                  }
                </div>
              ))}

              {workout.notes.length > 0 && (
                <div className="exercise-entry" style={{ fontStyle: "italic" }}>
                  <p>{workout.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      }
    </div>
  );
}

export default function HistoryPage() {
  const [view, setView] = useState("list");

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle className="centered-title">Workout history</IonTitle>
          <IonButtons slot="start">
            <IonBackButton defaultHref="#" />
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <NotificationTray />

        <IonSegment
          style={{ fontSize: "10px" }}
          value={view} mode="ios"
          onIonChange={() => setView(view == "list" ? "graphs" : "list")}>
          <IonSegmentButton value="list">
            <IonLabel>Past workouts</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="graphs">
            <IonLabel>Exercise progress</IonLabel>
          </IonSegmentButton>
        </IonSegment>

        {view == "list" ? <WorkoutsList /> : <ProgressList />}
      </IonContent>
    </IonPage>
  );
}
