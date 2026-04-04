import { openDB } from 'idb';

const DB_NAME = 'KrishiSetuOffline';
const STORE_NAME = 'pendingApplications';

async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    },
  });
}

export async function saveOfflineApplication(formData) {
  const db = await getDB();
  const entry = {
    ...formData,
    savedAt: new Date().toISOString(),
    synced: false,
  };
  await db.add(STORE_NAME, entry);
  return entry;
}

export async function getOfflineApplications() {
  const db = await getDB();
  return db.getAll(STORE_NAME);
}

export async function clearSyncedApplications() {
  const db = await getDB();
  const all = await db.getAll(STORE_NAME);
  const tx = db.transaction(STORE_NAME, 'readwrite');
  for (const item of all) {
    if (item.synced) {
      await tx.store.delete(item.id);
    }
  }
  await tx.done;
}

export async function markAsSynced(id) {
  const db = await getDB();
  const item = await db.get(STORE_NAME, id);
  if (item) {
    item.synced = true;
    await db.put(STORE_NAME, item);
  }
}
