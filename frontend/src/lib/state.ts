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

// TODO: what if we held exercise ids instead of actual exercises? (exercises hashmap??)
export interface Workout {
  id: number;
  name: string;
  date: number;
  isTemplate: boolean;
  exercises: Exercise[];
}

export interface AppState {
  mainToken: string;
  refreshToken: string;
  lastSyncTime: number;

  foods: Record<number, Food>; // map food ids to foods
  meals: Record<number, Meal[]>; // map dates (unix timestamp) to meals
  mealTags: string[];

  upsertFood: (food: Food) => void;
  removeMeal: (date: number, index: number) => void;
  upsertMeal: (date: number, newMeal: Meal, index: number) => void;
  upsertMeals: (date: number, meals: Meal[]) => void;

  updateUserData: (json: object) => void;
  updateTokens: (main: string, refresh: string) => void;
}

const state: StateCreator<AppState> = (set, _) => ({
  mainToken: "",
  refreshToken: "",
  lastSyncTime: 0,

  foods: {},
  meals: {},
  mealTags: ["Breakfast", "Lunch", "Dinner", "Snacks"], // TODO: get from /user/data

  updateTokens: (main: string, refresh: string) =>
    set((state: AppState) => ({ ...state, mainToken: main, refreshToken: refresh })),

  upsertFood: (food: Food) =>
    set((state: AppState) => ({
      ...state,
      foods: { ...state.foods, [food.id]: food }
    })),

  upsertMeal: (date: number, newMeal: Meal, index: number) =>
    set((state: AppState) => ({
      ...state,
      meals: {
        ...state.meals,
        [date]: [
          ...state.meals[date].slice(0, index),
          newMeal,
          ...state.meals[date].slice(index + 1)
        ],
      }
    })),

  removeMeal: (date: number, index: number) =>
    set((state: AppState) => ({
      ...state,
      meals: {
        ...state.meals,
        [date]: [
          ...state.meals[date].slice(0, index),
          ...state.meals[date].slice(index + 1)
        ],
      }
    })),

  upsertMeals: (date: number, meals: Meal[]) =>
    set((state: AppState) => ({
      ...state,
      meals: { ...state.meals, [date]: meals },
    })),

  updateUserData: (json: object) =>
    set((state: AppState) => ({
      ...state,
      lastSyncTime: new Date().getTime()
    }))
});

const storage = new AppStorage();
await storage.init();
const options = { name: "app-state", storage: storage };
export const useAppState = create(persist(state, options));
