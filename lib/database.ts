import * as SQLite from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import migrations from "@/drizzle/migrations";

import * as schema from "@/lib/schema";
import { stripToTable, Workout } from "@/lib/types";

const expo = SQLite.openDatabaseSync("logbuddy-data.db");
const db = drizzle(expo, { schema });

export function useDrizzleMigrations() {
  const { error } = useMigrations(db, migrations);
  return error;
}

// NOTE: Workouts are immutable once inserted into the database
export async function insertWorkout(w: Workout) {
  let exerciseSetRows: any[] = [];

  const exerciseRows = w.exercises.map(e => {
    const setRows = e.sets.map(s => stripToTable(schema.exerciseSets, s));
    exerciseSetRows = [...exerciseSetRows, ...setRows];

    return stripToTable(schema.exercises, e);
  });

  await db.transaction(async (tx) => {
    await tx.insert(schema.workouts)
      .values(stripToTable(schema.workouts, w))
      .onConflictDoNothing({ target: schema.workouts.id });

    await tx.insert(schema.exercises)
      .values(exerciseRows)
      .onConflictDoNothing({ target: schema.exercises.id });

    await tx.insert(schema.exerciseSets)
      .values(exerciseSetRows)
      .onConflictDoNothing({ target: schema.exerciseSets.id });
  });
}

export async function getWorkouts(page: number, pageSize: number) {
  return await db.query.workouts.findMany({
    limit: pageSize,
    offset: page * pageSize,
    with: {
      exercises: {
        with: {
          sets: true
        }
      }
    }
  });
}
