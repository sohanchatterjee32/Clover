import React, { useRef, useState } from 'react';
import {
  Copy,
  Download,
  FilePlus2,
  FileText,
  FolderOpen,
  Pencil,
  RotateCcw,
  Trash2,
  Upload,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { selectActiveDocument, useResumeStore } from '../../lib/resume/store';
import { buildBackupJsonFilename } from '../../lib/utils/filename';
import { PWAInstallButton } from '../pwa/PWAInstallButton';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { inputBaseClass } from '../shared/FormField';

export const OverviewWorkspace: React.FC = () => {
  const documents = useResumeStore((s) => s.documents);
  const activeDoc = useResumeStore(selectActiveDocument);
  const selectDocument = useResumeStore((s) => s.selectDocument);
  const setActiveSection = useResumeStore((s) => s.setActiveSection);
  const createNewBlankDocument = useResumeStore((s) => s.createNewBlankDocument);
  const renameDocument = useResumeStore((s) => s.renameDocument);
  const duplicateDocument = useResumeStore((s) => s.duplicateDocument);
  const deleteDocument = useResumeStore((s) => s.deleteDocument);
  const restoreSampleDocument = useResumeStore((s) => s.restoreSampleDocument);
  const importDocumentJson = useResumeStore((s) => s.importDocumentJson);
  const addToast = useResumeStore((s) => s.addToast);

  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmSampleOpen, setConfirmSampleOpen] = useState(false);
  const [confirmNewOpen, setConfirmNewOpen] = useState(false);
  const [pendingImportJson, setPendingImportJson] = useState<unknown | null>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  const hasUserEdits =
    activeDoc.personal.fullName.trim().length > 0 ||
    activeDoc.experiences.length > 0 ||
    activeDoc.skills.length > 0;

  const handleStartRename = (id: string, currentName: string) => {
    setRenamingId(id);
    setRenameDraft(currentName);
  };

  const handleCommitRename = (id: string) => {
    if (renameDraft.trim()) {
      renameDocument(id, renameDraft.trim());
    }
    setRenamingId(null);
  };

  const handleExportJsonBackup = () => {
    try {
      const json = JSON.stringify(activeDoc, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = buildBackupJsonFilename(activeDoc.name);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      addToast({
        type: 'success',
        title: 'JSON backup exported',
        description: `Downloaded ${buildBackupJsonFilename(activeDoc.name)}.`,
      });
    } catch {
      addToast({
        type: 'error',
        title: 'Backup export failed',
        description: 'Could not prepare JSON backup download.',
      });
    }
  };

  const handleImportFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      setPendingImportJson(parsed);
    } catch {
      addToast({
        type: 'error',
        title: 'Invalid JSON file',
        description: 'The selected file could not be parsed as valid JSON.',
      });
    }
  };

  const sectionJumpCards = [
    {
      id: 'personal' as const,
      title: 'Personal Profile',
      meta: activeDoc.personal.fullName.trim() || 'Name & contact details',
    },
    {
      id: 'experience' as const,
      title: 'Experience',
      meta: `${activeDoc.experiences.length} ${
        activeDoc.experiences.length === 1 ? 'role' : 'roles'
      }`,
    },
    {
      id: 'education' as const,
      title: 'Education',
      meta: `${activeDoc.education.length} ${
        activeDoc.education.length === 1 ? 'record' : 'records'
      }`,
    },
    {
      id: 'skills' as const,
      title: 'Skills',
      meta: `${activeDoc.skills.length} ${
        activeDoc.skills.length === 1 ? 'skill' : 'skills'
      }`,
    },
    {
      id: 'design' as const,
      title: 'Design Studio',
      meta: `Template: ${
        activeDoc.selectedTemplate.charAt(0).toUpperCase() +
        activeDoc.selectedTemplate.slice(1)
      }`,
    },
    {
      id: 'review' as const,
      title: 'Career Review',
      meta: 'Readiness & Job Fit Lab',
    },
  ];

  const docToDelete = documents.find((d) => d.id === confirmDeleteId);

  return (
    <div className="space-y-8">
      <div className="border-b border-[#E4E1D9] pb-5">
        <h2 className="font-editorial text-2xl font-semibold text-[#293330]">
          Document Overview
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-[#738078]">
          Manage your local resume documents, jump directly into editing sections, or back up your structured data as JSON. All content stays privately in your browser.
        </p>
      </div>

      <PWAInstallButton variant="banner" />

      {/* Quick Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => {
            if (hasUserEdits) setConfirmNewOpen(true);
            else createNewBlankDocument();
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-[#183B36] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#122D29] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#183B36]"
        >
          <FilePlus2 className="h-4 w-4" aria-hidden="true" />
          New Blank Resume
        </button>

        <button
          type="button"
          onClick={() => setConfirmSampleOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-[#E4E1D9] bg-white px-4 py-2 text-sm font-medium text-[#293330] transition-colors hover:bg-[#F6F3ED] focus-visible:outline-2 focus-visible:outline-[#183B36]"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Load Sample Resume
        </button>

        <button
          type="button"
          onClick={handleExportJsonBackup}
          className="inline-flex items-center gap-2 rounded-lg border border-[#E4E1D9] bg-white px-4 py-2 text-sm font-medium text-[#293330] transition-colors hover:bg-[#F6F3ED] focus-visible:outline-2 focus-visible:outline-[#183B36]"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          Export JSON Backup
        </button>

        <button
          type="button"
          onClick={() => importInputRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-lg border border-[#E4E1D9] bg-white px-4 py-2 text-sm font-medium text-[#293330] transition-colors hover:bg-[#F6F3ED] focus-visible:outline-2 focus-visible:outline-[#183B36]"
        >
          <Upload className="h-4 w-4" aria-hidden="true" />
          Import JSON Backup
        </button>
        <input
          ref={importInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleImportFileChange}
          className="hidden"
          aria-label="Import CLOVER JSON backup file"
        />
      </div>

      {/* Workspace Sections Quick Jump */}
      <div>
        <h3 className="text-sm font-semibold text-[#293330]">
          Active Document Sections
        </h3>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {sectionJumpCards.map((card) => (
            <button
              key={card.id}
              type="button"
              onClick={() => setActiveSection(card.id)}
              className="flex items-center justify-between rounded-xl border border-[#E4E1D9] bg-white p-4 text-left transition-colors hover:border-[#183B36]/40 hover:bg-[#FAF8F4] focus-visible:outline-2 focus-visible:outline-[#183B36]"
            >
              <div>
                <div className="text-sm font-semibold text-[#293330]">
                  {card.title}
                </div>
                <div className="mt-0.5 text-xs text-[#738078]">{card.meta}</div>
              </div>
              <span className="text-xs font-medium text-[#183B36]">
                Open →
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Local Documents Library */}
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#293330]">
            Local Documents ({documents.length})
          </h3>
          <span className="text-xs text-[#738078]">
            Stored locally in browser storage
          </span>
        </div>

        <div className="mt-3 divide-y divide-[#E4E1D9] rounded-xl border border-[#E4E1D9] bg-white">
          {documents.map((doc) => {
            const isActive = doc.id === activeDoc.id;
            const isRenaming = renamingId === doc.id;
            let updatedLabel = 'Recently updated';
            try {
              updatedLabel = `Updated ${formatDistanceToNow(
                new Date(doc.updatedAt),
                { addSuffix: true }
              )}`;
            } catch {
              updatedLabel = 'Saved locally';
            }

            return (
              <div
                key={doc.id}
                className={`flex flex-wrap items-center justify-between gap-3 p-4 ${
                  isActive ? 'bg-[#F6F3ED]/60' : ''
                }`}
              >
                <div className="min-w-0 flex-1">
                  {isRenaming ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleCommitRename(doc.id);
                      }}
                      className="flex items-center gap-2"
                    >
                      <input
                        type="text"
                        value={renameDraft}
                        onChange={(e) => setRenameDraft(e.target.value)}
                        aria-label={`Rename ${doc.name}`}
                        className={`${inputBaseClass} max-w-xs py-1.5`}
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="rounded-lg bg-[#183B36] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#122D29]"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setRenamingId(null)}
                        className="rounded-lg border border-[#E4E1D9] bg-white px-3 py-1.5 text-xs font-medium text-[#293330]"
                      >
                        Cancel
                      </button>
                    </form>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <FileText
                          className="h-4 w-4 shrink-0 text-[#183B36]"
                          aria-hidden="true"
                        />
                        <span className="truncate text-sm font-semibold text-[#293330]">
                          {doc.name}
                        </span>
                        {isActive && (
                          <span className="text-xs font-semibold text-[#183B36]">
                            · Active
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#738078]">
                        <span>{doc.personal.fullName.trim() || 'Unnamed candidate'}</span>
                        <span aria-hidden="true">·</span>
                        <span className="capitalize">{doc.selectedTemplate}</span>
                        <span aria-hidden="true">·</span>
                        <span>{updatedLabel}</span>
                      </div>
                    </>
                  )}
                </div>

                {!isRenaming && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    {!isActive && (
                      <button
                        type="button"
                        onClick={() => selectDocument(doc.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#183B36] bg-white px-3 py-1.5 text-xs font-medium text-[#183B36] transition-colors hover:bg-[#183B36] hover:text-white"
                      >
                        <FolderOpen className="h-3.5 w-3.5" aria-hidden="true" />
                        Open
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleStartRename(doc.id, doc.name)}
                      aria-label={`Rename ${doc.name}`}
                      className="rounded-lg border border-[#E4E1D9] bg-white p-1.5 text-[#738078] transition-colors hover:bg-[#F6F3ED] hover:text-[#293330]"
                      title="Rename document"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => void duplicateDocument(doc.id)}
                      aria-label={`Duplicate ${doc.name}`}
                      className="rounded-lg border border-[#E4E1D9] bg-white p-1.5 text-[#738078] transition-colors hover:bg-[#F6F3ED] hover:text-[#293330]"
                      title="Duplicate document"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(doc.id)}
                      aria-label={`Delete ${doc.name}`}
                      className="rounded-lg border border-[#E4E1D9] bg-white p-1.5 text-[#738078] transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                      title="Delete document"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Confirmations */}
      <ConfirmDialog
        open={Boolean(confirmDeleteId)}
        title="Delete resume document?"
        description={`"${
          docToDelete?.name || 'This document'
        }" will be permanently removed from local browser storage. This cannot be undone.`}
        confirmLabel="Delete Document"
        destructive
        onConfirm={() => {
          if (confirmDeleteId) {
            void deleteDocument(confirmDeleteId);
          }
          setConfirmDeleteId(null);
        }}
        onCancel={() => setConfirmDeleteId(null)}
      />

      <ConfirmDialog
        open={confirmSampleOpen}
        title="Restore sample resume?"
        description="Restoring the Rohan Mehta demonstration resume will replace the contents and design settings of your currently open document."
        confirmLabel="Restore Sample"
        onConfirm={() => {
          restoreSampleDocument();
          setConfirmSampleOpen(false);
        }}
        onCancel={() => setConfirmSampleOpen(false)}
      />

      <ConfirmDialog
        open={confirmNewOpen}
        title="Create a new blank resume?"
        description="A new blank resume document will be created and opened in the editor. Your existing saved documents remain untouched."
        confirmLabel="Create Blank Resume"
        onConfirm={() => {
          createNewBlankDocument();
          setConfirmNewOpen(false);
        }}
        onCancel={() => setConfirmNewOpen(false)}
      />

      <ConfirmDialog
        open={pendingImportJson !== null}
        title="Import CLOVER JSON backup?"
        description="The validated resume backup will be imported as a new document in your studio without overwriting your existing saved resumes."
        confirmLabel="Import Backup"
        onConfirm={() => {
          if (pendingImportJson !== null) {
            importDocumentJson(pendingImportJson);
          }
          setPendingImportJson(null);
        }}
        onCancel={() => setPendingImportJson(null)}
      />
    </div>
  );
};
