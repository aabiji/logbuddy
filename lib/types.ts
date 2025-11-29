import { v7 as uuidv7 } from "uuid";

export interface ExerciseSet { weight: number; reps: number; };

export interface Exercise {
  id: string;
  name: string;
  workoutId: string;
  sets: ExerciseSet[];
  notes: string;
};

export interface Workout {
  id: string;
  exercises: Exercise[];
  timestamp: number;
  duration: number;
};

export const newWorkout = () => ({
  id: uuidv7(),
  exercises: [] as Exercise[],
  timestamp: Date.now(),
  duration: 0
});

export const newExercise = (workoutId: string) => ({
  id: uuidv7(),
  name: "Bench press",
  workoutId,
  sets: [] as ExerciseSet[],
  notes: ""
});

export const newExerciseSet = (e: Exercise) => ({
  weight: e.sets.length == 0 ? 0 : e.sets[e.sets.length - 1].weight,
  reps: e.sets.length == 0 ? 0 : e.sets[e.sets.length - 1].reps,
});
