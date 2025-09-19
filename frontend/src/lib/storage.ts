// Serves as the storage backend for the zustand state
// Uses IndexexdDB to set, get and delete key/value pairs
// AppStorage.ts
export class AppStorage {
  private db?: IDBDatabase;

  /** Initialize the IndexedDB database */
  public async init(): Promise<void> {
    if (this.db) return; // already initialized

    return new Promise((resolve, reject) => {
      const request = indexedDB.open("logbuddy-storage", 1);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains("keyValue")) {
          db.createObjectStore("keyValue", { keyPath: "key" });
        }
      };

      request.onsuccess = (event: Event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };

      request.onerror = (event: Event) => {
        console.error("Failed to open IndexedDB:", (event.target as IDBRequest).error);
        reject((event.target as IDBRequest).error);
      };
    });
  }

  public async setItem(key: string, value: any): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction("keyValue", "readwrite");
      const store = tx.objectStore("keyValue");
      const request = store.put({ key, value: JSON.stringify(value) });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  public async getItem(key: string): Promise<any | null> {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction("keyValue", "readonly");
      const store = tx.objectStore("keyValue");
      const request = store.get(key);

      request.onsuccess = () => {
        const res = request.result;
        if (!res) return resolve(null);
        try {
          resolve(JSON.parse(res.value));
        } catch {
          resolve(res.value); // fallback if not JSON
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  public async removeItem(key: string): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction("keyValue", "readwrite");
      const store = tx.objectStore("keyValue");
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}
