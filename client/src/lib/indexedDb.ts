import { type Analysis, type InsertAnalysis } from "@shared/schema";

const DB_NAME = "property-analyzer";
const DB_VERSION = 1;
const STORE_NAME = "analyses";

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        });
        store.createIndex("createdAt", "createdAt", { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return dbPromise;
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function sortByCreatedAtDesc(items: Analysis[]): Analysis[] {
  return [...items].sort((a, b) => {
    const aTime = new Date(a.createdAt ?? 0).getTime();
    const bTime = new Date(b.createdAt ?? 0).getTime();
    return bTime - aTime;
  });
}

export async function getAllAnalyses(): Promise<Analysis[]> {
  const db = await openDb();
  const tx = db.transaction(STORE_NAME, "readonly");
  const store = tx.objectStore(STORE_NAME);
  const rows = await requestToPromise(store.getAll());
  return sortByCreatedAtDesc(rows as Analysis[]);
}

export async function getAnalysisById(id: number): Promise<Analysis | null> {
  const db = await openDb();
  const tx = db.transaction(STORE_NAME, "readonly");
  const store = tx.objectStore(STORE_NAME);
  const row = await requestToPromise(store.get(id));
  return (row as Analysis | undefined) ?? null;
}

export async function createAnalysisRecord(input: InsertAnalysis): Promise<Analysis> {
  const db = await openDb();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  const record: Omit<Analysis, "id"> = {
    ...input,
    createdAt: new Date().toISOString(),
  } as Omit<Analysis, "id">;
  const id = await requestToPromise(store.add(record));
  const saved = await requestToPromise(store.get(id));
  return saved as Analysis;
}

export async function deleteAnalysisRecord(id: number): Promise<void> {
  const db = await openDb();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  await requestToPromise(store.delete(id));
}
