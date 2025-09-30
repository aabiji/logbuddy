import { create, StateCreator } from "zustand";
import { persist } from "zustand/middleware";
import { AppStorage } from "./storage";

// macro and micr nutrients are per 1 g
export interface Food {
  id: number;
  name: string;
  servings: number[];
  units: string[];
  defaultServingIndex: number;
  calories: number;
  carbohydrate: number;
  protein: number;
  fat: number;
  calcium: number;
  potassium: number;
  iron: number;
}

export interface Meal {
  id: number;
  date: number;
  foodID: number;
  mealTag: string;
  servings: number;
  servingsUnit: string;
}

export interface Exercise {
  id: number;
  workoutID: number;
  name: string;
  weight: number;
  reps: number[];
}

export interface Workout {
  id: number;
  name: string;
  date: number;
  notes: string;
  isTemplate: boolean;
  exercises: Exercise[];
}

export interface AppState {
  mainToken: string;
  refreshToken: string;

  mealTags: string[];
  foods: Map<number, Food>; // map food ids to foods
  meals: Map<number, Meal[]>; // map dates (unix timestamp) to meals
  templates: number[], // keeping a separate list for efficiency
  workouts: Map<number, Workout> // map id to workout
  weightLog: Map<number, number>, // map date to weight

  upsertFood: (food: Food) => void;
  removeMeal: (date: number, index: number) => void;
  upsertMeal: (date: number, newMeal: Meal, index: number) => void;
  upsertMeals: (date: number, meals: Meal[]) => void;
  upsertWorkout: (value: Workout) => void;
  removeWorkout: (id: number) => void;
  setWeight: (date: number, weight: number) => void;
  removeWeight: (date: number) => void;
  updateTokens: (main: string, refresh: string) => void;
}

const state: StateCreator<AppState> = (set, _) => ({
  mainToken: "",
  refreshToken: "",

  foods: new Map(),
  meals: new Map(),
  mealTags: ["Breakfast", "Lunch", "Dinner", "Snacks"], // TODO: get from /user/data
  templates: [],
  workouts: new Map(),
  weightLog: new Map(),

  updateTokens: (main: string, refresh: string) =>
    set((state: AppState) => ({ ...state, mainToken: main, refreshToken: refresh })),

  upsertFood: (food: Food) =>
    set((state: AppState) => {
      const foods = new Map(state.foods);
      foods.set(food.id, food);
      return { ...state, foods };
    }),

  upsertMeal: (date: number, newMeal: Meal, index: number) =>
    set((state: AppState) => {
      const meals = new Map(state.meals);
      const existing = meals.get(date) ?? [] as Meal[];
      meals.set(date, [
        ...existing.slice(0, index),
        newMeal,
        ...existing.slice(index + 1),
      ]);
      return { ...state, meals };
    }),

  removeMeal: (date: number, index: number) =>
    set((state: AppState) => {
      const meals = new Map(state.meals);
      const existing = meals.get(date) ?? [] as Meal[];
      meals.set(date, [...existing.slice(0, index), ...existing.slice(index + 1)]);
      return { ...state, meals };
    }),

  upsertMeals: (date: number, meals: Meal[]) =>
    set((state: AppState) => {
      const copy = new Map(state.meals);
      copy.set(date, meals);
      return { ...state, meals: copy };
    }),

  upsertWorkout: (w: Workout) =>
    set((state: AppState) => {
      let templates = [...state.templates];
      if (w.isTemplate && !templates.includes(w.id))
        templates.push(w.id);

      const workouts = new Map(state.workouts);
      workouts.set(w.id, w);
      return { ...state,  workouts, templates };
    }),

  removeWorkout: (id: number) =>
    set((state: AppState) => {
      const workouts = new Map(state.workouts);
      const isTemplate = workouts.get(id)?.isTemplate;
      workouts.delete(id)

      let templates = [...state.templates];
      if (isTemplate) templates.splice(templates.indexOf(id), 1);
      return { ...state,  workouts, templates };
    }),

  setWeight: (date: number, weight: number) =>
    set((state: AppState) => {
      const log = new Map(state.weightLog);
      log.set(date, weight);
      return { ...state, weightLog: log };
    }),

  removeWeight: (date: number) =>
    set((state: AppState) => {
      const log = new Map(state.weightLog);
      log.delete(date);
      return {...state, weightLog: log };
    })
});

const storage = new AppStorage();
await storage.init();
const options = { name: "app-state", storage: storage };
export const useAppState = create(persist(state, options));
