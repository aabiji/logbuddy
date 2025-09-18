import { create } from "zustand";
import { persist } from "zustand/middleware";

class AppStorage {
  private db: IDBDatabase;

  async init() {
    const request = indexedDB.open("logbuddy-storage");
    request.onupgradeneeded = (event: Event) => {
      const db = (event.target as IDBRequest).result;
      db.createObjectStore("keyValue", { keyPath: "key" });
    }

    request.onsuccess = (event: Event) =>
      this.db = (event.target as IDBRequest).result;

    request.onerror = (event: Event) => {
      console.log("couldn't create database!");
      console.log((event.target as IDBRequest).error?.message);
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction("keyValue", "readwrite");
      const store = tx.objectStore("keyValue");
      const request = store.put({ key, value: JSON.stringify(value) });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getItem(key: string): Promise<any | null> {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction("keyValue", "readwrite");
      const store = tx.objectStore("keyValue");
      const response = store.get(key);

      response.onsuccess = (event: Event) =>
        resolve(JSON.parse((event.target as IDBRequest).result.value));
      response.onerror = (event: Event) => reject((event.target as IDBRequest).error);
    });
  }

  async removeItem(key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction("keyValue", "readwrite");
      const store = tx.objectStore("keyValue");
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

const state = (set, _get) => ({
  foods: [],
});

const storage = new AppStorage();
await storage.init();

export const useAppState = create(persist(state, {
  name: "app-state",
  storage: storage,
}));