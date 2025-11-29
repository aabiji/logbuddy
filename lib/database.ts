import * as SQLite from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import migrations from "@/drizzle/migrations";

import * as schema from "@/lib/schema";
import { Workout } from "@/lib/types";

const expo = SQLite.openDatabaseSync("logbuddy.db");
const db = drizzle(expo, { schema });

export function useDrizzleMigrations() {
  const { error } = useMigrations(db, migrations);
  return error;
}

// NOTE: Workouts are immutable once inserted into the database
export async function insertWorkout(w: Workout) {
  const setsValues = [] as any[];
  const exerciseValues = [] as any[];

  for (const e of w.exercises) {
    exerciseValues.push({
      id: e.id, workoutId: w.id, name: e.name, notes: e.notes
    });;
    for (const s of e.sets) {
      setsValues.push({
        exerciseId: e.id, weight: s.weight, reps: s.reps
      });
    }
  }

  await db.transaction(async (tx) => {
    await tx.insert(schema.workouts)
      .values({ id: w.id, timestamp: w.timestamp, duration: w.duration })
      .onConflictDoNothing({ target: schema.workouts.id });

    await tx.insert(schema.exercises)
      .values(exerciseValues)
      .onConflictDoNothing({ target: schema.exercises.id });

    await tx.insert(schema.exerciseSets)
      .values(setsValues)
      .onConflictDoNothing({ target: schema.exerciseSets.id });
  });
}

export async function getWorkouts(pageSize: number) {
  const values = await db.query.workouts.findMany({
    with: {
      exercises: {
        with: {
          sets: true
        }
      }
    }
  });
  console.log(JSON.stringify(values));
}
