import { create, StateCreator } from "zustand";
import { persist } from "zustand/middleware";
import { AppStorage } from "./storage";

// macro and micr nutrients are per 1 g
export interface Food {
  id?: string;
  name: string;
  servings: number[];
  units: string[];
  calories: number;
  carbohydrate: number;
  protein: number;
  fat: number;
  calcium: number;
  potassium: number;
  iron: number;
}

interface AppState {
  mainToken: string;
  refreshToken: string;

  updateTokens: (main: string, refresh: string) => void;
}

const state: StateCreator<AppState> = (set, _) => ({
  mainToken: "",
  refreshToken: "",

  updateTokens: (state: AppState, main: string, refresh: string) =>
    set({ ...state, mainToken: main, refreshToken: refresh }),
});

const storage = new AppStorage();
await storage.init();
const options = { name: "app-state", storage: storage };
export const useAppState = create(persist(state, options));