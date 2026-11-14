import React, { useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  onConfirm,
  onCancel,
}) => {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#183B36]/30 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="clover-confirm-title"
      aria-describedby="clover-confirm-desc"
    >
      <div className="w-full max-w-md rounded-xl border border-[#E4E1D9] bg-white p-6 shadow-lg">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${
                destructive
                  ? 'border-red-200 bg-red-50 text-red-700'
                  : 'border-[#E4E1D9] bg-[#F6F3ED] text-[#183B36]'
              }`}
            >
              <AlertTriangle className="h-4 w-4" aria-hidden="true" />
            </div>
            <h2
              id="clover-confirm-title"
              className="font-editorial text-lg font-semibold text-[#293330]"
            >
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close dialog"
            className="rounded-md p-1.5 text-[#738078] transition-colors hover:bg-[#F6F3ED] hover:text-[#293330] focus-visible:outline-2 focus-visible:outline-[#183B36]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p
          id="clover-confirm-desc"
          className="mt-3 text-sm leading-relaxed text-[#738078]"
        >
          {description}
        </p>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-[#E4E1D9] bg-white px-4 py-2 text-sm font-medium text-[#293330] transition-colors hover:bg-[#F6F3ED] focus-visible:outline-2 focus-visible:outline-[#183B36]"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${
              destructive
                ? 'bg-red-700 hover:bg-red-800 focus-visible:outline-red-700'
                : 'bg-[#183B36] hover:bg-[#122D29] focus-visible:outline-[#183B36]'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
