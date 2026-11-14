const DB_NAME = 'clover_media_assets_v1';
const DB_VERSION = 1;
const STORE_NAME = 'profile_photos';

interface StoredAssetRecord {
  id: string;
  blob: Blob;
  mimeType: string;
  updatedAt: string;
}

function openAssetsDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      reject(new Error('IndexedDB is unavailable in this environment.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error || new Error('Failed to open IndexedDB.'));
  });
}

export async function saveImageAsset(
  id: string,
  blob: Blob
): Promise<{ ok: boolean; error?: string }> {
  try {
    const db = await openAssetsDatabase();
    return await new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const record: StoredAssetRecord = {
        id,
        blob,
        mimeType: blob.type || 'image/jpeg',
        updatedAt: new Date().toISOString(),
      };
      store.put(record);
      tx.oncomplete = () => {
        db.close();
        resolve({ ok: true });
      };
      tx.onerror = () => {
        db.close();
        resolve({
          ok: false,
          error: 'Could not save the uploaded image to local browser storage.',
        });
      };
    });
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof Error
          ? err.message
          : 'IndexedDB storage unavailable for image files.',
    };
  }
}

export async function loadImageAssetAsDataUrl(id: string): Promise<string | null> {
  if (!id) return null;
  try {
    const db = await openAssetsDatabase();
    const record = await new Promise<StoredAssetRecord | null>((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);
      req.onsuccess = () => {
        db.close();
        resolve((req.result as StoredAssetRecord) || null);
      };
      req.onerror = () => {
        db.close();
        resolve(null);
      };
    });

    if (!record || !record.blob) return null;

    return await new Promise<string | null>((resolve) => {
      const reader = new FileReader();
      reader.onload = () =>
        resolve(typeof reader.result === 'string' ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(record.blob);
    });
  } catch {
    return null;
  }
}

export async function deleteImageAsset(id: string): Promise<void> {
  if (!id) return;
  try {
    const db = await openAssetsDatabase();
    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.delete(id);
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        resolve();
      };
    });
  } catch {
    // Graceful no-op if IndexedDB unavailable
  }
}

export async function duplicateImageAsset(
  sourceId: string | null,
  targetId: string
): Promise<boolean> {
  if (!sourceId) return false;
  try {
    const db = await openAssetsDatabase();
    const record = await new Promise<StoredAssetRecord | null>((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get(sourceId);
      req.onsuccess = () => {
        db.close();
        resolve((req.result as StoredAssetRecord) || null);
      };
      req.onerror = () => {
        db.close();
        resolve(null);
      };
    });
    if (!record?.blob) return false;
    const saved = await saveImageAsset(targetId, record.blob);
    return saved.ok;
  } catch {
    return false;
  }
}
