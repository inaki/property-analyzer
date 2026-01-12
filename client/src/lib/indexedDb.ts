import { type Analysis, type InsertAnalysis } from "@shared/schema";
import { type BuydInputs } from "@/lib/buyd";

export type BuydSummary = {
  netWorth: number;
  ltv: number;
  cashFlow: number;
  dscr: number;
  breakYear: number | null;
};

export type BuydSavedData = {
  inputs: BuydInputs;
  summary: BuydSummary;
};

export type SavedKind = "property" | "buyd";

export type SavedRecord =
  | {
      id: number;
      kind: "property";
      title: string;
      description: string | null;
      createdAt: string;
      data: Analysis;
    }
  | {
      id: number;
      kind: "buyd";
      title: string;
      description: string | null;
      createdAt: string;
      data: BuydSavedData;
    };

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

function sortByCreatedAtDesc(items: SavedRecord[]): SavedRecord[] {
  return [...items].sort((a, b) => {
    const aTime = new Date(a.createdAt ?? 0).getTime();
    const bTime = new Date(b.createdAt ?? 0).getTime();
    return bTime - aTime;
  });
}

function normalizeRecord(raw: any): SavedRecord | null {
  if (!raw) return null;
  if (raw.kind === "property" || raw.kind === "buyd") {
    return raw as SavedRecord;
  }

  if (typeof raw.purchasePrice === "number") {
    const createdAt = raw.createdAt ?? new Date().toISOString();
    return {
      id: raw.id,
      kind: "property",
      title: raw.title ?? "Property Analysis",
      description: raw.description ?? null,
      createdAt,
      data: raw as Analysis,
    };
  }

  return null;
}

export async function getAllAnalyses(): Promise<SavedRecord[]> {
  const db = await openDb();
  const tx = db.transaction(STORE_NAME, "readonly");
  const store = tx.objectStore(STORE_NAME);
  const rows = await requestToPromise(store.getAll());
  const normalized = (rows as any[])
    .map((row) => normalizeRecord(row))
    .filter((row): row is SavedRecord => row !== null);
  return sortByCreatedAtDesc(normalized);
}

export async function getAnalysisById(id: number): Promise<SavedRecord | null> {
  const db = await openDb();
  const tx = db.transaction(STORE_NAME, "readonly");
  const store = tx.objectStore(STORE_NAME);
  const row = await requestToPromise(store.get(id));
  return normalizeRecord(row);
}

export async function createPropertyAnalysisRecord(
  input: InsertAnalysis,
): Promise<SavedRecord> {
  const db = await openDb();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  const createdAt = new Date().toISOString();
  const record = {
    kind: "property",
    title: input.title,
    description: input.description ?? null,
    createdAt,
    data: {
      ...input,
      createdAt,
    } as Analysis,
  } satisfies Omit<SavedRecord, "id">;
  const id = await requestToPromise(store.add(record));
  const saved = await requestToPromise(store.get(id));
  return saved as SavedRecord;
}

export async function deleteAnalysisRecord(id: number): Promise<void> {
  const db = await openDb();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  await requestToPromise(store.delete(id));
}

export async function createBuydRecord(params: {
  title: string;
  description?: string;
  data: BuydSavedData;
}): Promise<SavedRecord> {
  const db = await openDb();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  const createdAt = new Date().toISOString();
  const record = {
    kind: "buyd",
    title: params.title,
    description: params.description ?? null,
    createdAt,
    data: params.data,
  } satisfies Omit<SavedRecord, "id">;
  const id = await requestToPromise(store.add(record));
  const saved = await requestToPromise(store.get(id));
  return saved as SavedRecord;
}
