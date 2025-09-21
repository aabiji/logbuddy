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
  foodID: number;
  mealTag: string;
  servings: number;
  servingsUnit: string;
}

interface AppState {
  mainToken: string;
  refreshToken: string;
  lastSyncTime: number;

  foods: Record<number, Food>; // map food ids to foods
  meals: Record<string, Meal[]>; // map date to its meals
  mealTags: string[];

  upsertFood: (food: Food) => void;
  removeMeal: (dateStr: string, index: number) => void;
  upsertMeal: (dateStr: string, newMeal: Meal, index: number) => void;
  upsertMeals: (dateStr: string, meals: Meal[]) => void;

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

  upsertMeal: (dateStr: string, newMeal: Meal, index: number) =>
    set((state: AppState) => ({
      ...state,
      meals: {
        ...state.meals,
        [dateStr]: [
          ...state.meals[dateStr].slice(0, index),
          newMeal,
          ...state.meals[dateStr].slice(index + 1)
        ],
      }
    })),

  removeMeal: (dateStr: string, index: number) =>
    set((state: AppState) => ({
      ...state,
      meals: {
        ...state.meals,
        [dateStr]: [
          ...state.meals[dateStr].slice(0, index),
          ...state.meals[dateStr].slice(index + 1)
        ],
      }
    })),

  upsertMeals: (dateStr: string, meals: Meal[]) =>
    set((state: AppState) => ({
      ...state,
      meals: { ...state.meals, [dateStr]: meals },
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
