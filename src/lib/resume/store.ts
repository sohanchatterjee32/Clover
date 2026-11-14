import { create } from 'zustand';
import {
  createBlankDocument,
  createId,
  createSampleDocument,
} from './initial-data';
import {
  deleteImageAsset,
  duplicateImageAsset,
  loadImageAssetAsDataUrl,
  saveImageAsset,
} from './indexeddb';
import {
  loadWorkspaceFromStorage,
  saveWorkspaceToStorage,
} from './storage';
import type {
  DesignConfiguration,
  ResumeDocument,
  SaveStatus,
  TemplateId,
  WorkspaceSection,
} from './types';
import { validateImportedResumeJson } from './validation';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  description?: string;
}

interface WorkspaceState {
  documents: ResumeDocument[];
  activeDocumentId: string;
  activeSection: WorkspaceSection;
  saveStatus: SaveStatus;
  saveError: string | null;
  hydrated: boolean;
  photoDataUrls: Record<string, string>;
  past: ResumeDocument[];
  future: ResumeDocument[];
  lastHistoryTimestamp: number;
  toasts: ToastMessage[];

  // Lifecycle & persistence
  hydrateWorkspace: () => Promise<void>;
  persistDocuments: (docs: ResumeDocument[], activeId: string) => void;

  // Navigation
  setActiveSection: (section: WorkspaceSection) => void;

  // Notifications
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  dismissToast: (id: string) => void;

  // Document management
  selectDocument: (id: string) => void;
  createNewBlankDocument: (name?: string) => void;
  renameDocument: (id: string, newName: string) => void;
  duplicateDocument: (id: string) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  restoreSampleDocument: () => void;
  importDocumentJson: (rawJson: unknown) => void;

  // Canonical document mutation + Undo/Redo
  updateActiveDocument: (
    updater: (doc: ResumeDocument) => ResumeDocument,
    options?: { recordHistory?: boolean }
  ) => void;
  setTemplate: (template: TemplateId) => void;
  updateDesign: (patch: Partial<DesignConfiguration>) => void;
  undo: () => void;
  redo: () => void;

  // Photo assets
  uploadProfilePhoto: (blob: Blob, previewDataUrl: string) => Promise<boolean>;
  removeProfilePhoto: () => Promise<void>;
  ensurePhotoLoaded: (photoRef: string | null) => Promise<void>;
}

const initialSample = createSampleDocument('doc_initial_sample');

export const useResumeStore = create<WorkspaceState>((set, get) => ({
  documents: [initialSample],
  activeDocumentId: initialSample.id,
  activeSection: 'overview',
  saveStatus: 'saved',
  saveError: null,
  hydrated: false,
  photoDataUrls: {},
  past: [],
  future: [],
  lastHistoryTimestamp: 0,
  toasts: [],

  addToast: (toast) => {
    const id = createId('toast');
    set((state) => ({
      toasts: [...state.toasts.slice(-3), { ...toast, id }],
    }));
    if (typeof window !== 'undefined') {
      window.setTimeout(() => {
        get().dismissToast(id);
      }, 4500);
    }
  },

  dismissToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  persistDocuments: (docs, activeId) => {
    set({ saveStatus: 'saving', saveError: null });
    const result = saveWorkspaceToStorage({
      schemaVersion: 1,
      activeDocumentId: activeId,
      documents: docs,
    });
    if (result.ok) {
      set({ saveStatus: 'saved', saveError: null });
    } else {
      set({
        saveStatus: 'error',
        saveError: result.error || 'Unable to save changes locally.',
      });
    }
  },

  hydrateWorkspace: async () => {
    const loaded = loadWorkspaceFromStorage();
    if (loaded.data) {
      set({
        documents: loaded.data.documents,
        activeDocumentId: loaded.data.activeDocumentId,
        hydrated: true,
        saveStatus: loaded.ok ? 'saved' : 'error',
        saveError: loaded.ok ? null : loaded.error || null,
      });

      const activeDoc = loaded.data.documents.find(
        (d) => d.id === loaded.data?.activeDocumentId
      );
      if (activeDoc?.personal.profilePhotoRef) {
        await get().ensurePhotoLoaded(activeDoc.personal.profilePhotoRef);
      }
    } else {
      set({ hydrated: true });
    }
  },

  setActiveSection: (section) => set({ activeSection: section }),

  selectDocument: (id) => {
    const doc = get().documents.find((d) => d.id === id);
    if (!doc) return;
    set({
      activeDocumentId: id,
      past: [],
      future: [],
    });
    get().persistDocuments(get().documents, id);
    if (doc.personal.profilePhotoRef) {
      void get().ensurePhotoLoaded(doc.personal.profilePhotoRef);
    }
  },

  createNewBlankDocument: (name) => {
    const existingCount = get().documents.length;
    const blank = createBlankDocument(
      name?.trim() || `Untitled Resume ${existingCount + 1}`
    );
    const nextDocs = [blank, ...get().documents];
    set({
      documents: nextDocs,
      activeDocumentId: blank.id,
      activeSection: 'personal',
      past: [],
      future: [],
    });
    get().persistDocuments(nextDocs, blank.id);
    get().addToast({
      type: 'success',
      title: 'Created blank resume',
      description: `"${blank.name}" is ready for editing.`,
    });
  },

  renameDocument: (id, newName) => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    const nextDocs = get().documents.map((doc) =>
      doc.id === id
        ? { ...doc, name: trimmed, updatedAt: new Date().toISOString() }
        : doc
    );
    set({ documents: nextDocs });
    get().persistDocuments(nextDocs, get().activeDocumentId);
    get().addToast({
      type: 'success',
      title: 'Document renamed',
      description: `Renamed to "${trimmed}".`,
    });
  },

  duplicateDocument: async (id) => {
    const source = get().documents.find((d) => d.id === id);
    if (!source) return;

    const now = new Date().toISOString();
    const cloned: ResumeDocument = JSON.parse(JSON.stringify(source));
    cloned.id = createId('doc');
    cloned.name = `${source.name} (Copy)`;
    cloned.createdAt = now;
    cloned.updatedAt = now;

    if (source.personal.profilePhotoRef) {
      const newPhotoRef = createId('photo');
      const copied = await duplicateImageAsset(
        source.personal.profilePhotoRef,
        newPhotoRef
      );
      if (copied) {
        cloned.personal.profilePhotoRef = newPhotoRef;
        const existingDataUrl =
          get().photoDataUrls[source.personal.profilePhotoRef];
        if (existingDataUrl) {
          set((state) => ({
            photoDataUrls: {
              ...state.photoDataUrls,
              [newPhotoRef]: existingDataUrl,
            },
          }));
        }
      } else {
        cloned.personal.profilePhotoRef = null;
      }
    }

    const nextDocs = [cloned, ...get().documents];
    set({
      documents: nextDocs,
      activeDocumentId: cloned.id,
      past: [],
      future: [],
    });
    get().persistDocuments(nextDocs, cloned.id);
    get().addToast({
      type: 'success',
      title: 'Document duplicated',
      description: `Created independent copy "${cloned.name}".`,
    });
  },

  deleteDocument: async (id) => {
    const target = get().documents.find((d) => d.id === id);
    if (!target) return;

    if (target.personal.profilePhotoRef) {
      await deleteImageAsset(target.personal.profilePhotoRef);
    }

    let remaining = get().documents.filter((d) => d.id !== id);
    let nextActive = get().activeDocumentId;

    if (remaining.length === 0) {
      const freshBlank = createBlankDocument('Untitled Resume');
      remaining = [freshBlank];
      nextActive = freshBlank.id;
    } else if (nextActive === id) {
      nextActive = remaining[0].id;
    }

    set({
      documents: remaining,
      activeDocumentId: nextActive,
      past: [],
      future: [],
    });
    get().persistDocuments(remaining, nextActive);
    get().addToast({
      type: 'info',
      title: 'Document deleted',
      description: `Removed "${target.name}" from local storage.`,
    });
  },

  restoreSampleDocument: () => {
    const activeId = get().activeDocumentId;
    const sample = createSampleDocument(activeId);
    const nextDocs = get().documents.map((doc) =>
      doc.id === activeId ? sample : doc
    );
    set({
      documents: nextDocs,
      past: [],
      future: [],
    });
    get().persistDocuments(nextDocs, activeId);
    get().addToast({
      type: 'success',
      title: 'Sample resume restored',
      description: 'Restored Rohan Mehta demonstration document and default design settings.',
    });
  },

  importDocumentJson: (rawJson) => {
    const validation = validateImportedResumeJson(rawJson);
    if (!validation.valid || !validation.document) {
      get().addToast({
        type: 'error',
        title: 'Import rejected',
        description: validation.error || 'Invalid CLOVER JSON backup file.',
      });
      return;
    }

    const imported = validation.document;
    const now = new Date().toISOString();
    const cloned: ResumeDocument = {
      ...imported,
      id: createId('doc'),
      createdAt: imported.createdAt || now,
      updatedAt: now,
      personal: {
        ...imported.personal,
        profilePhotoRef: null, // JSON backup does not bundle external binary IndexedDB blobs
      },
    };

    const nextDocs = [cloned, ...get().documents];
    set({
      documents: nextDocs,
      activeDocumentId: cloned.id,
      past: [],
      future: [],
    });
    get().persistDocuments(nextDocs, cloned.id);
    get().addToast({
      type: 'success',
      title: 'Backup imported',
      description: `Loaded "${cloned.name}" into your studio.`,
    });
  },

  updateActiveDocument: (updater, options = { recordHistory: true }) => {
    const { documents, activeDocumentId, past, lastHistoryTimestamp } = get();
    const current = documents.find((d) => d.id === activeDocumentId);
    if (!current) return;

    const updatedRaw = updater(current);
    const updated: ResumeDocument = {
      ...updatedRaw,
      updatedAt: new Date().toISOString(),
    };

    const nowMs = Date.now();
    let nextPast = past;
    if (options.recordHistory !== false) {
      // Coalesce rapid keystrokes within 700ms so Undo feels natural
      if (nowMs - lastHistoryTimestamp > 700 || past.length === 0) {
        nextPast = [...past.slice(-29), current];
      }
    }

    const nextDocs = documents.map((d) =>
      d.id === activeDocumentId ? updated : d
    );

    set({
      documents: nextDocs,
      past: nextPast,
      future: options.recordHistory !== false ? [] : get().future,
      lastHistoryTimestamp: nowMs,
    });
    get().persistDocuments(nextDocs, activeDocumentId);
  },

  setTemplate: (template) => {
    get().updateActiveDocument((doc) => ({
      ...doc,
      selectedTemplate: template,
      designConfiguration: {
        ...doc.designConfiguration,
        // Keep photo preference if user already uploaded one, otherwise respect Signal's clean default
        showPhoto: doc.personal.profilePhotoRef
          ? doc.designConfiguration.showPhoto
          : template === 'signal'
          ? false
          : doc.designConfiguration.showPhoto,
      },
    }));
  },

  updateDesign: (patch) => {
    get().updateActiveDocument((doc) => ({
      ...doc,
      designConfiguration: {
        ...doc.designConfiguration,
        ...patch,
      },
    }));
  },

  undo: () => {
    const { past, future, documents, activeDocumentId } = get();
    if (past.length === 0) return;
    const current = documents.find((d) => d.id === activeDocumentId);
    if (!current) return;

    const previous = past[past.length - 1];
    const nextPast = past.slice(0, -1);
    const nextDocs = documents.map((d) =>
      d.id === activeDocumentId ? previous : d
    );

    set({
      documents: nextDocs,
      past: nextPast,
      future: [current, ...future.slice(0, 29)],
    });
    get().persistDocuments(nextDocs, activeDocumentId);
  },

  redo: () => {
    const { past, future, documents, activeDocumentId } = get();
    if (future.length === 0) return;
    const current = documents.find((d) => d.id === activeDocumentId);
    if (!current) return;

    const next = future[0];
    const nextFuture = future.slice(1);
    const nextDocs = documents.map((d) =>
      d.id === activeDocumentId ? next : d
    );

    set({
      documents: nextDocs,
      past: [...past.slice(-29), current],
      future: nextFuture,
    });
    get().persistDocuments(nextDocs, activeDocumentId);
  },

  uploadProfilePhoto: async (blob, previewDataUrl) => {
    const activeDoc = get().documents.find(
      (d) => d.id === get().activeDocumentId
    );
    if (!activeDoc) return false;

    const oldRef = activeDoc.personal.profilePhotoRef;
    const newRef = createId('photo');
    const saved = await saveImageAsset(newRef, blob);
    if (!saved.ok) {
      get().addToast({
        type: 'error',
        title: 'Photo storage failed',
        description:
          saved.error || 'Unable to store photo in browser IndexedDB.',
      });
      return false;
    }

    if (oldRef) {
      await deleteImageAsset(oldRef);
    }

    set((state) => ({
      photoDataUrls: {
        ...state.photoDataUrls,
        [newRef]: previewDataUrl,
      },
    }));

    get().updateActiveDocument((doc) => ({
      ...doc,
      personal: {
        ...doc.personal,
        profilePhotoRef: newRef,
      },
      designConfiguration: {
        ...doc.designConfiguration,
        showPhoto: true,
      },
    }));

    get().addToast({
      type: 'success',
      title: 'Profile photo updated',
      description: 'Saved locally in IndexedDB and enabled on your resume.',
    });
    return true;
  },

  removeProfilePhoto: async () => {
    const activeDoc = get().documents.find(
      (d) => d.id === get().activeDocumentId
    );
    if (!activeDoc) return;
    const oldRef = activeDoc.personal.profilePhotoRef;

    if (oldRef) {
      await deleteImageAsset(oldRef);
    }

    get().updateActiveDocument((doc) => ({
      ...doc,
      personal: {
        ...doc.personal,
        profilePhotoRef: null,
      },
      designConfiguration: {
        ...doc.designConfiguration,
        showPhoto: false,
      },
    }));

    get().addToast({
      type: 'info',
      title: 'Profile photo removed',
    });
  },

  ensurePhotoLoaded: async (photoRef) => {
    if (!photoRef) return;
    if (get().photoDataUrls[photoRef]) return;
    const dataUrl = await loadImageAssetAsDataUrl(photoRef);
    if (dataUrl) {
      set((state) => ({
        photoDataUrls: {
          ...state.photoDataUrls,
          [photoRef]: dataUrl,
        },
      }));
    }
  },
}));

export function selectActiveDocument(state: WorkspaceState): ResumeDocument {
  return (
    state.documents.find((d) => d.id === state.activeDocumentId) ||
    state.documents[0]
  );
}
