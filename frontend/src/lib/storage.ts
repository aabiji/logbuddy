// Serves as the storage backend for the zustand state
// Uses IndexexdDB to set, get and delete key/value pairs
export class AppStorage {
  private db: IDBDatabase;

  public async init() {
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

  public async setItem(key: string, value: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction("keyValue", "readwrite");
      const store = tx.objectStore("keyValue");
      const request = store.put({ key, value: JSON.stringify(value) });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  public async getItem(key: string): Promise<any | null> {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction("keyValue", "readwrite");
      const store = tx.objectStore("keyValue");
      const response = store.get(key);

      response.onsuccess = (event: Event) =>
        resolve(JSON.parse((event.target as IDBRequest).result.value));
      response.onerror = (event: Event) => reject((event.target as IDBRequest).error);
    });
  }

  public async removeItem(key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction("keyValue", "readwrite");
      const store = tx.objectStore("keyValue");
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}