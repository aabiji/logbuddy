import { create, StateCreator } from "zustand";
import { persist } from "zustand/middleware";
import { AppStorage } from "./storage";

// macro and micr nutrients are per 1 g
export interface Food {
  id: number;
  name: string;
  servingSizes: number[];
  servingUnits: string[];
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
  deleted?: boolean;
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
  deleted?: boolean;
  id: number;
  name: string;
  date: number;
  notes: string;
  isTemplate: boolean;
  exercises: Exercise[];
}

interface Settings {
  mealTags: string[];
  useImperial: boolean;
  trackPeriod: boolean;
  macroTargets: Record<string, number>;
}

interface RecordJSON {
  deleted: boolean;
  isPeriod: boolean;
  date: number;
  value: number;
};

export interface UserDataUpdate {
  workouts: Workout[];
  foods: Food[];
  meals: Meal[];
  records: RecordJSON[];
  settings: Settings;
};

export interface AppState {
  token: string;
  lastSyncTime: number;
  settings: Settings;
  foods: Map<number, Food>; // map food ids to foods
  meals: Map<number, Meal[]>; // map dates (unix timestamp) to meals
  templates: number[], // keeping a separate list for efficiency
  workouts: Map<number, Workout> // map id to workout
  weightLog: Map<number, number>, // map date to weight
  periodDates: Map<number, boolean>, // map date to 'true'
  errors: string[];

  upsertFood: (food: Food) => void;
  removeMeal: (date: number, index: number) => void;
  upsertMeal: (date: number, newMeal: Meal, index: number) => void;
  upsertMeals: (date: number, meals: Meal[]) => void;
  upsertWorkout: (value: Workout) => void;
  removeWorkout: (id: number) => void;
  setWeight: (date: number, weight: number) => void;
  removeWeight: (date: number) => void;
  togglePeriodDate: (date: number) => void;
  updateToken: (token: string) => void;
  updateSettings: (updatedFields: Partial<Settings>) => void;
  updateUserData: (json: UserDataUpdate) => void;
  resetState: () => void;
  addError: (err: string) => void;
  removeError: (index: number) => void;
  clearErrors: () => void;
}

const defaultProps = {
  token: "",
  lastSyncTime: 0,
  foods: new Map(),
  meals: new Map(),
  templates: [],
  workouts: new Map(),
  weightLog: new Map(),
  periodDates: new Map(),
  settings: {
    mealTags: [],
    macroTargets: {},
    useImperial: true,
    trackPeriod: true,
  },
  errors: []
};

const state: StateCreator<AppState> = (set, _) => ({
  ...defaultProps,

  resetState: () => set((_) => ({ ...defaultProps })),

  updateToken: (token: string) => set((state: AppState) => ({ ...state, token })),

  updateSettings: (updatedFields: Partial<Settings>) =>
    set((state: AppState) => ({
      ...state,
      settings: { ...state.settings,...updatedFields }
    })),

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
      return { ...state, workouts, templates };
    }),

  removeWorkout: (id: number) =>
    set((state: AppState) => {
      const workouts = new Map(state.workouts);
      const isTemplate = workouts.get(id)?.isTemplate;
      workouts.delete(id)

      let templates = [...state.templates];
      if (isTemplate) templates.splice(templates.indexOf(id), 1);
      return { ...state, workouts, templates };
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
      return { ...state, weightLog: log };
    }),

  togglePeriodDate: (date: number) =>
    set((state: AppState) => {
      const dates = new Map(state.periodDates);
      if (dates.has(date))
        dates.delete(date);
      else
        dates.set(date, true);
      return { ...state, periodDates: dates };
    }),

  updateUserData: (json: UserDataUpdate) =>
    set((state: AppState) => {
      const newState = {
        ...state,
        lastSyncTime: new Date().getTime(),
        settings: json.settings
      };

      for (const workout of json.workouts) {
        if (workout.deleted && newState.workouts.get(workout.id))
          newState.removeWorkout(workout.id);
        else if (!workout.deleted)
          newState.upsertWorkout(workout);
      }

      for (const meal of json.meals) {
        const list = state.meals.get(meal.date) ?? [] as Meal[];
        const index = list.findIndex(m => m.id == meal.id);

        if (meal.deleted && index != -1)
          newState.removeMeal(meal.date, index);
        if (!meal.deleted && index != -1)
          newState.upsertMeal(meal.date, meal, index);
      }

      for (const food of json.foods)
        newState.upsertFood(food);

      for (const record of json.records) {
        if (record.isPeriod) {
          const set = newState.periodDates.get(record.date) === true;
          if ((record.deleted && set) || (!record.deleted && !set))
            newState.togglePeriodDate(record.date);
        } else {
          if (record.deleted && newState.weightLog.get(record.date))
            newState.removeWeight(record.date);
          else if (!record.deleted)
            newState.setWeight(record.date, record.value);
        }
      }

      return newState;
    }),

    addError: (err: string) =>
      set((state: AppState) => ({ ...state, errors: [ ...state.errors, err ] })),

    removeError: (index: number) =>
      set((state: AppState) => ({
        ...state,
        errors: [
          ...state.errors.slice(0, index),
          ...state.errors.slice(index + 1),
        ]
      })),

    clearErrors: () => set((state: AppState) => ({ ...state, errors: [] })),
});

const storage = new AppStorage();
const options = { name: "app-state", storage: storage };
export const useAppState = create(persist(state, options));
