import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#E4E1D9] bg-white/60 px-6 py-10 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-[#E4E1D9] bg-[#F6F3ED] text-[#183B36]">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <h3 className="mt-3 text-base font-semibold text-[#293330]">{title}</h3>
      <p className="mt-1.5 max-w-md text-sm leading-relaxed text-[#738078]">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#183B36] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#122D29] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#183B36]"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
