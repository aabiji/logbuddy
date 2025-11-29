import { relations } from "drizzle-orm";
import { int, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const workouts = sqliteTable("workouts", {
  id: text().primaryKey(),
  timestamp: int().notNull(),
  duration: int().notNull(),
});

export const exercises = sqliteTable("exercises", {
  id: text().primaryKey(),
  workoutId: text().notNull().references(() => workouts.id),
  name: text().notNull(),
  notes: text().notNull(),
});

export const exerciseSets = sqliteTable("exercise_sets", {
  id: int().primaryKey({ autoIncrement: true }),
  exerciseId: text().notNull().references(() => exercises.id),
  weight: real().notNull(),
  reps: int().notNull(),
});

export const workoutRelations = relations(workouts, ({ many }) => ({
  exercises: many(exercises),
}));

export const exerciseRelations = relations(exercises, ({ one, many }) => ({
  workout: one(workouts, {
    fields: [exercises.workoutId],
    references: [workouts.id],
  }),
  sets: many(exerciseSets),
}));

export const exerciseSetsRelations = relations(exerciseSets, ({ one }) => ({
  exercise: one(exercises, {
    fields: [exerciseSets.exerciseId],
    references: [exercises.id],
  }),
}));
