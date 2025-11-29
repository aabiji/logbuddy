import { InferSelectModel } from "drizzle-orm";
import { AnySQLiteTable } from "drizzle-orm/sqlite-core";

import "react-native-get-random-values";
import { v7 as uuidv7 } from "uuid";

import * as schema from "@/lib/schema";

export type ExerciseSet =
  InferSelectModel<typeof schema.exerciseSets>;

export interface Exercise
  extends InferSelectModel<typeof schema.exercises> {
  sets: ExerciseSet[];
}

export interface Workout
  extends InferSelectModel<typeof schema.workouts> {
  exercises: Exercise[];
}

// Strip the keys in `obj` down to only the columns defined in the Drizzle table
export function stripToTable<
  TTable extends AnySQLiteTable,
  TObj extends Record<string, any>
>(
  table: TTable,
  obj: TObj
): TTable["$inferInsert"] {
  const result: any = {};
  console.log(Object.keys(table));
  for (const key of Object.keys(table)) {
    if (key in obj)
      result[key] = obj[key];
  }
  return result;
}

export const newWorkout = (): Workout => ({
  id: uuidv7(), timestamp: new Date().getTime(),
  duration: 0, exercises: []
});

export const newExercise = (workoutId: string, name: string): Exercise => ({
  id: uuidv7(), workoutId, name, notes: "", sets: []
});

export const newExerciseSet = (exerciseId: string): ExerciseSet => ({
  id: uuidv7(), exerciseId, weight: 0, reps: 0
});