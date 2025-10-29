import { create, StateCreator } from "zustand";
import { persist, PersistStorage, StorageValue } from "zustand/middleware";
import { Storage } from "@ionic/storage";

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
  exerciseType: string; // "strength" or "cardio"
  name: string;
  weight: number;
  weightUnit: string;
  reps: number[];
  duration: number; // in minutes
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
  darkMode: boolean;
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

interface Notification { message: string; error: boolean; };

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
  notifications: Notification[];
  indexedbLoaded: boolean; // whether zustand has hydrated data from indexedb

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
  addNotification: (n: Notification) => void;
  removeNotification: (index: number) => void;
  clearNotifications: () => void;
  setIndexedbLoaded: (state: boolean) => void;
  resetState: () => void;
}

// Define the persisted state type
interface PersistedState {
  token: string;
  lastSyncTime: number;
  settings: Settings;
  foods: Map<number, Food>;
  meals: Map<number, Meal[]>;
  templates: number[];
  workouts: Map<number, Workout>;
  weightLog: Map<number, number>;
  periodDates: Map<number, boolean>;
  notifications: Notification[];
  indexedbLoaded: boolean;
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
    darkMode: false
  },
  notifications: [],
  indexedbLoaded: false,
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
      const templates = [...state.templates];
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

      const templates = [...state.templates];
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
      const workouts = new Map(state.workouts);
      const templates = [...state.templates];
      const meals = new Map(state.meals);
      const foods = new Map(state.foods);
      const weightLog = new Map(state.weightLog);
      const periodDates = new Map(state.periodDates);

      // Update workouts
      for (const workout of json.workouts) {
        if (workout.deleted) {
          if (workout.isTemplate) {
            const idx = templates.indexOf(workout.id);
            if (idx !== -1) templates.splice(idx, 1);
          }
          workouts.delete(workout.id);
        } else {
          if (workout.isTemplate && !templates.includes(workout.id)) {
            templates.push(workout.id);
          }
          workouts.set(workout.id, workout);
        }
      }

      // Update meals
      for (const meal of json.meals) {
        const list = meals.get(meal.date) ?? [];
        const index = list.findIndex(m => m.id === meal.id);

        if (meal.deleted && index !== -1) {
          meals.set(meal.date, [
            ...list.slice(0, index),
            ...list.slice(index + 1)
          ]);
        } else if (!meal.deleted) {
          if (index !== -1) {
            meals.set(meal.date, [
              ...list.slice(0, index),
              meal,
              ...list.slice(index + 1)
            ]);
          } else
            meals.set(meal.date, [...list, meal]);
        }
      }

      // Update foods
      for (const food of json.foods)
        foods.set(food.id, food);

      // Update records
      for (const record of json.records) {
        if (record.isPeriod) {
          if (record.deleted)
            periodDates.delete(record.date);
          else
            periodDates.set(record.date, true);
        } else {
          if (record.deleted)
            weightLog.delete(record.date);
          else
            weightLog.set(record.date, record.value);
        }
      }

      return {
        ...state,
        lastSyncTime: new Date().getTime(),
        settings: json.settings,
        workouts, templates, meals,
        foods, weightLog, periodDates,
      };
    }),

    addNotification: (n: Notification) =>
      set((state: AppState) => ({ ...state, notifications: [ ...state.notifications, n ] })),

    removeNotification: (index: number) =>
      set((state: AppState) => ({
        ...state,
        notifications: [
          ...state.notifications.slice(0, index),
          ...state.notifications.slice(index + 1),
        ]
      })),

    clearNotifications: () => set((state: AppState) => ({ ...state, notifications: [] })),

    setIndexedbLoaded: (state: boolean) => set({ indexedbLoaded: state }),
});

const store = new Storage();
const storagePromise = store.create();

export const storage: PersistStorage<PersistedState> = {
  getItem: async (name: string) => {
    await storagePromise;
    const val = await store.get(name);
    return val || null;
  },
  setItem: async (name: string, value: StorageValue<PersistedState>) => {
    await storagePromise;
    await store.set(name, value);
  },
  removeItem: async (name: string) => {
    await storagePromise;
    await store.remove(name);
  },
};

export const useAppState = create(persist(state, {
  name: "app-state",
  storage,
  partialize: (state): PersistedState => ({
    token: state.token,
    lastSyncTime: state.lastSyncTime,
    settings: state.settings,
    foods: state.foods,
    meals: state.meals,
    templates: state.templates,
    workouts: state.workouts,
    weightLog: state.weightLog,
    periodDates: state.periodDates,
    notifications: state.notifications,
    indexedbLoaded: state.indexedbLoaded,
  }),
  onRehydrateStorage: () => (state) => { state?.setIndexedbLoaded(true); }
}));
