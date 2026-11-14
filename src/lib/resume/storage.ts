import {
  CURRENT_SCHEMA_VERSION,
  createSampleDocument,
} from './initial-data';
import type { ResumeDocument } from './types';
import { ResumeDocumentSchema } from './validation';

const STORAGE_KEY = 'clover_studio_workspace_v1';

export interface WorkspaceStoragePayload {
  schemaVersion: number;
  activeDocumentId: string;
  documents: ResumeDocument[];
}

export interface StorageResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

export function isBrowserStorageAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const testKey = '__clover_storage_probe__';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

function migrateDocument(raw: unknown): ResumeDocument | null {
  if (!raw || typeof raw !== 'object') return null;
  const candidate = raw as Record<string, unknown>;
  if (typeof candidate.schemaVersion !== 'number') {
    candidate.schemaVersion = CURRENT_SCHEMA_VERSION;
  }
  const parsed = ResumeDocumentSchema.safeParse(candidate);
  if (parsed.success) {
    return parsed.data as ResumeDocument;
  }
  return null;
}

export function loadWorkspaceFromStorage(): StorageResult<WorkspaceStoragePayload> {
  if (typeof window === 'undefined') {
    const sample = createSampleDocument();
    return {
      ok: true,
      data: {
        schemaVersion: CURRENT_SCHEMA_VERSION,
        activeDocumentId: sample.id,
        documents: [sample],
      },
    };
  }

  if (!isBrowserStorageAvailable()) {
    const sample = createSampleDocument();
    return {
      ok: false,
      error: 'Browser localStorage is unavailable. Changes will stay in memory for this session.',
      data: {
        schemaVersion: CURRENT_SCHEMA_VERSION,
        activeDocumentId: sample.id,
        documents: [sample],
      },
    };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const sample = createSampleDocument();
      const initial: WorkspaceStoragePayload = {
        schemaVersion: CURRENT_SCHEMA_VERSION,
        activeDocumentId: sample.id,
        documents: [sample],
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return { ok: true, data: initial };
    }

    const parsed = JSON.parse(raw) as Partial<WorkspaceStoragePayload>;
    const rawDocs = Array.isArray(parsed.documents) ? parsed.documents : [];
    const validDocs = rawDocs
      .map(migrateDocument)
      .filter((doc): doc is ResumeDocument => doc !== null);

    if (validDocs.length === 0) {
      const sample = createSampleDocument();
      return {
        ok: true,
        data: {
          schemaVersion: CURRENT_SCHEMA_VERSION,
          activeDocumentId: sample.id,
          documents: [sample],
        },
      };
    }

    const activeExists = validDocs.some((d) => d.id === parsed.activeDocumentId);
    return {
      ok: true,
      data: {
        schemaVersion: CURRENT_SCHEMA_VERSION,
        activeDocumentId: activeExists
          ? (parsed.activeDocumentId as string)
          : validDocs[0].id,
        documents: validDocs,
      },
    };
  } catch {
    const sample = createSampleDocument();
    return {
      ok: false,
      error: 'Saved workspace data could not be parsed cleanly. Restored sample document.',
      data: {
        schemaVersion: CURRENT_SCHEMA_VERSION,
        activeDocumentId: sample.id,
        documents: [sample],
      },
    };
  }
}

export function saveWorkspaceToStorage(
  payload: WorkspaceStoragePayload
): StorageResult<void> {
  if (typeof window === 'undefined') {
    return { ok: true };
  }
  if (!isBrowserStorageAvailable()) {
    return {
      ok: false,
      error: 'Local storage is disabled or blocked in this browser.',
    };
  }
  try {
    const serialized = JSON.stringify({
      schemaVersion: CURRENT_SCHEMA_VERSION,
      activeDocumentId: payload.activeDocumentId,
      documents: payload.documents,
    });
    window.localStorage.setItem(STORAGE_KEY, serialized);
    return { ok: true };
  } catch (err) {
    const isQuota =
      err instanceof DOMException &&
      (err.name === 'QuotaExceededError' || err.code === 22);
    return {
      ok: false,
      error: isQuota
        ? 'Browser storage quota exceeded. Remove unused documents or backups to free space.'
        : 'Unable to persist changes to local browser storage.',
    };
  }
}
