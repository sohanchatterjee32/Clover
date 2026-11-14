import React from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { useResumeStore } from '../../lib/resume/store';

export const ToastViewport: React.FC = () => {
  const toasts = useResumeStore((s) => s.toasts);
  const dismissToast = useResumeStore((s) => s.dismissToast);

  if (toasts.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed right-4 bottom-4 z-50 flex w-full max-w-sm flex-col gap-2"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => {
        const Icon =
          toast.type === 'success'
            ? CheckCircle2
            : toast.type === 'error'
            ? AlertCircle
            : Info;
        const accentClasses =
          toast.type === 'success'
            ? 'border-[#183B36]/25 text-[#183B36]'
            : toast.type === 'error'
            ? 'border-red-300 text-red-700'
            : 'border-[#D69A43]/40 text-[#9A6B21]';

        return (
          <div
            key={toast.id}
            role="status"
            className="pointer-events-auto flex items-start gap-3 rounded-xl border border-[#E4E1D9] bg-white p-3.5 shadow-md"
          >
            <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${accentClasses}`} aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[#293330]">{toast.title}</p>
              {toast.description && (
                <p className="mt-0.5 text-xs leading-relaxed text-[#738078]">
                  {toast.description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              aria-label={`Dismiss notification: ${toast.title}`}
              className="rounded p-1 text-[#738078] hover:bg-[#F6F3ED] hover:text-[#293330]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
