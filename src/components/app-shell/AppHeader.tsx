import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Check,
  ChevronDown,
  Copy,
  Download,
  Eye,
  FilePlus2,
  Loader2,
  Menu,
  Pencil,
  Redo2,
  RotateCcw,
  Trash2,
  Undo2,
} from 'lucide-react';
import { selectActiveDocument, useResumeStore } from '../../lib/resume/store';
import { PWAInstallButton } from '../pwa/PWAInstallButton';
import { ConfirmDialog } from '../shared/ConfirmDialog';

interface AppHeaderProps {
  isExporting: boolean;
  mobileView: 'editor' | 'preview';
  onMobileViewChange: (view: 'editor' | 'preview') => void;
  onToggleMobileNav: () => void;
  onQuickExportPdf: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  isExporting,
  mobileView,
  onMobileViewChange,
  onToggleMobileNav,
  onQuickExportPdf,
}) => {
  const documents = useResumeStore((s) => s.documents);
  const activeDoc = useResumeStore(selectActiveDocument);
  const saveStatus = useResumeStore((s) => s.saveStatus);
  const saveError = useResumeStore((s) => s.saveError);
  const pastCount = useResumeStore((s) => s.past.length);
  const futureCount = useResumeStore((s) => s.future.length);

  const undo = useResumeStore((s) => s.undo);
  const redo = useResumeStore((s) => s.redo);
  const selectDocument = useResumeStore((s) => s.selectDocument);
  const createNewBlankDocument = useResumeStore((s) => s.createNewBlankDocument);
  const renameDocument = useResumeStore((s) => s.renameDocument);
  const duplicateDocument = useResumeStore((s) => s.duplicateDocument);
  const deleteDocument = useResumeStore((s) => s.deleteDocument);
  const restoreSampleDocument = useResumeStore((s) => s.restoreSampleDocument);

  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [confirmNewOpen, setConfirmNewOpen] = useState(false);
  const [confirmSampleOpen, setConfirmSampleOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    window.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      window.removeEventListener('keydown', handleEsc);
    };
  }, [menuOpen]);

  const hasContent =
    activeDoc.personal.fullName.trim().length > 0 ||
    activeDoc.experiences.length > 0 ||
    activeDoc.skills.length > 0;

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-[#E4E1D9] bg-white px-3 sm:px-5">
      {/* Left: Mobile Nav Trigger + CLOVER Wordmark + Active Document */}
      <div className="flex min-w-0 items-center gap-2.5 sm:gap-4">
        <button
          type="button"
          onClick={onToggleMobileNav}
          aria-label="Open workspace navigation"
          className="rounded-lg border border-[#E4E1D9] p-1.5 text-[#293330] hover:bg-[#F6F3ED] lg:hidden"
        >
          <Menu className="h-4 w-4" />
        </button>

        <div className="flex shrink-0 items-center gap-2">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <rect width="24" height="24" rx="6" fill="#183B36" />
            <circle cx="9.2" cy="9.4" r="2.9" fill="#F6F3ED" />
            <circle cx="14.8" cy="9.4" r="2.9" fill="#F6F3ED" />
            <circle cx="12" cy="14.2" r="2.9" fill="#D69A43" />
          </svg>
          <span className="font-editorial text-lg font-semibold tracking-tight text-[#183B36] whitespace-nowrap">
            CLOVER
          </span>
        </div>

        <span
          className="hidden h-4 w-px bg-[#E4E1D9] md:inline-block"
          aria-hidden="true"
        />

        {/* Document Selector & Actions Menu (visible on tablet/desktop; mobile uses Overview & drawer) */}
        <div ref={menuRef} className="relative hidden min-w-0 md:block">
          {renaming ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (renameValue.trim()) {
                  renameDocument(activeDoc.id, renameValue.trim());
                }
                setRenaming(false);
              }}
              className="flex items-center gap-1.5"
            >
              <input
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                aria-label="Rename active document"
                autoFocus
                className="w-40 rounded-md border border-[#183B36] bg-white px-2 py-1 text-xs font-medium text-[#293330] focus:outline-none sm:w-56"
              />
              <button
                type="submit"
                className="rounded-md bg-[#183B36] px-2.5 py-1 text-xs font-medium text-white"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setRenaming(false)}
                className="rounded-md border border-[#E4E1D9] px-2 py-1 text-xs text-[#738078]"
              >
                Cancel
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              aria-label={`Document actions for ${activeDoc.name}`}
              className="flex max-w-[160px] items-center gap-1.5 rounded-lg border border-transparent px-2 py-1.5 text-left text-xs font-medium text-[#293330] transition-colors hover:border-[#E4E1D9] hover:bg-[#F6F3ED] sm:max-w-[260px]"
            >
              <span className="truncate">{activeDoc.name}</span>
              <ChevronDown
                className="h-3.5 w-3.5 shrink-0 text-[#738078]"
                aria-hidden="true"
              />
            </button>
          )}

          {menuOpen && (
            <div
              role="menu"
              className="absolute left-0 z-40 mt-1.5 w-72 rounded-xl border border-[#E4E1D9] bg-white p-1.5 shadow-lg"
            >
              <div className="px-2.5 py-1.5 text-[11px] font-semibold text-[#738078]">
                Document Actions
              </div>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setRenameValue(activeDoc.name);
                  setRenaming(true);
                  setMenuOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-[#293330] hover:bg-[#F6F3ED]"
              >
                <Pencil className="h-3.5 w-3.5 text-[#738078]" />
                Rename Document
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  void duplicateDocument(activeDoc.id);
                  setMenuOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-[#293330] hover:bg-[#F6F3ED]"
              >
                <Copy className="h-3.5 w-3.5 text-[#738078]" />
                Duplicate Document
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setConfirmSampleOpen(true);
                  setMenuOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-[#293330] hover:bg-[#F6F3ED]"
              >
                <RotateCcw className="h-3.5 w-3.5 text-[#738078]" />
                Load Sample Resume
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setConfirmDeleteOpen(true);
                  setMenuOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete Current Document
              </button>

              {documents.length > 1 && (
                <>
                  <div className="my-1.5 border-t border-[#E4E1D9]" />
                  <div className="px-2.5 py-1 text-[11px] font-semibold text-[#738078]">
                    Switch Local Document
                  </div>
                  <div className="max-h-40 overflow-y-auto">
                    {documents.map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          selectDocument(d.id);
                          setMenuOpen(false);
                        }}
                        className="flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs text-[#293330] hover:bg-[#F6F3ED]"
                      >
                        <span className="truncate">{d.name}</span>
                        {d.id === activeDoc.id && (
                          <Check className="h-3.5 w-3.5 shrink-0 text-[#183B36]" />
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Save Status Indicator */}
        <div
          role="status"
          aria-live="polite"
          title={saveError || undefined}
          className="hidden items-center gap-1.5 text-xs md:flex"
        >
          {saveStatus === 'saving' && (
            <span className="flex items-center gap-1 text-[#738078]">
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              Saving changes...
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="flex items-center gap-1 text-[#738078]">
              <Check className="h-3.5 w-3.5 text-[#183B36]" aria-hidden="true" />
              All changes saved
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="flex items-center gap-1 font-medium text-red-700">
              <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
              Unable to save
            </span>
          )}
        </div>
      </div>

      {/* Right: Mobile Editor/Preview Switch + Undo/Redo + New + Export */}
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        {/* Mobile/Tablet View Mode Toggle (< lg) */}
        <div
          role="group"
          aria-label="Workspace view mode"
          className="flex items-center rounded-lg border border-[#E4E1D9] bg-[#F6F3ED] p-0.5 lg:hidden"
        >
          <button
            type="button"
            onClick={() => onMobileViewChange('editor')}
            className={`rounded-md px-2.5 py-1 text-xs font-medium ${
              mobileView === 'editor'
                ? 'bg-white text-[#183B36] shadow-xs'
                : 'text-[#738078]'
            }`}
          >
            Editor
          </button>
          <button
            type="button"
            onClick={() => onMobileViewChange('preview')}
            className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium ${
              mobileView === 'preview'
                ? 'bg-white text-[#183B36] shadow-xs'
                : 'text-[#738078]'
            }`}
          >
            <Eye className="h-3 w-3" aria-hidden="true" />
            Preview
          </button>
        </div>

        {/* Undo / Redo */}
        <div className="hidden items-center gap-1 sm:flex">
          <button
            type="button"
            disabled={pastCount === 0}
            onClick={undo}
            aria-label="Undo last change"
            title="Undo"
            className="rounded-lg border border-[#E4E1D9] bg-white p-1.5 text-[#293330] transition-colors hover:bg-[#F6F3ED] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Undo2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            disabled={futureCount === 0}
            onClick={redo}
            aria-label="Redo change"
            title="Redo"
            className="rounded-lg border border-[#E4E1D9] bg-white p-1.5 text-[#293330] transition-colors hover:bg-[#F6F3ED] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Redo2 className="h-4 w-4" />
          </button>
        </div>

        {/* Install PWA CTA (tablet/desktop header; mobile uses Overview banner & nav drawer) */}
        <div className="hidden sm:block">
          <PWAInstallButton variant="header" />
        </div>

        {/* New Document */}
        <button
          type="button"
          onClick={() => {
            if (hasContent) setConfirmNewOpen(true);
            else createNewBlankDocument();
          }}
          className="hidden items-center gap-1.5 rounded-lg border border-[#E4E1D9] bg-white px-3 py-1.5 text-xs font-medium text-[#293330] whitespace-nowrap transition-colors hover:bg-[#F6F3ED] sm:inline-flex"
        >
          <FilePlus2 className="h-3.5 w-3.5" aria-hidden="true" />
          New
        </button>

        {/* Export PDF Primary CTA */}
        <button
          type="button"
          disabled={isExporting}
          onClick={onQuickExportPdf}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#183B36] px-3.5 py-1.5 text-xs font-semibold text-white whitespace-nowrap transition-colors hover:bg-[#122D29] disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#183B36]"
        >
          {isExporting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          <span className="hidden sm:inline">
            {isExporting ? 'Exporting...' : 'Export PDF'}
          </span>
          <span className="sm:hidden">{isExporting ? '...' : 'PDF'}</span>
        </button>
      </div>

      {/* Dialogs */}
      <ConfirmDialog
        open={confirmNewOpen}
        title="Create a new blank resume?"
        description="Creates a new blank document in your local library. Your current resume remains saved."
        confirmLabel="Create Blank Resume"
        onConfirm={() => {
          createNewBlankDocument();
          setConfirmNewOpen(false);
        }}
        onCancel={() => setConfirmNewOpen(false)}
      />

      <ConfirmDialog
        open={confirmSampleOpen}
        title="Load sample resume?"
        description="This replaces the currently open document with the Rohan Mehta demonstration resume and default design settings."
        confirmLabel="Load Sample"
        onConfirm={() => {
          restoreSampleDocument();
          setConfirmSampleOpen(false);
        }}
        onCancel={() => setConfirmSampleOpen(false)}
      />

      <ConfirmDialog
        open={confirmDeleteOpen}
        title="Delete current document?"
        description={`"${activeDoc.name}" will be permanently deleted from local browser storage.`}
        confirmLabel="Delete Document"
        destructive
        onConfirm={() => {
          void deleteDocument(activeDoc.id);
          setConfirmDeleteOpen(false);
        }}
        onCancel={() => setConfirmDeleteOpen(false)}
      />
    </header>
  );
};
