import { int, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const workouts_table = sqliteTable("workouts", {
  id: text().primaryKey(),
  timestamp: int().notNull(),
  duration: int().notNull(),
});

export const exercise_table = sqliteTable("exercises", {
  id: text().primaryKey(),
  workoutId: text().notNull(),
  name: text().notNull(),
  notes: text().notNull(),
});

export const sets_table = sqliteTable("exercise_sets", {
  exercise_id: text().notNull(),
  weight: real().notNull(),
  reps: int().notNull(),
});
