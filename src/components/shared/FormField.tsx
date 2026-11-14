import React from 'react';
import { cn } from '../../lib/utils/cn';

interface FormFieldProps {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  required,
  hint,
  error,
  className,
  children,
}) => {
  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex items-baseline justify-between gap-2">
        <label
          htmlFor={id}
          className="block text-sm font-medium text-[#293330]"
        >
          {label}
          {required && (
            <span className="ml-1 text-[#B65E45]" aria-hidden="true">
              *
            </span>
          )}
        </label>
        {hint && !error && (
          <span className="text-xs text-[#738078]">{hint}</span>
        )}
      </div>
      {children}
      {error && (
        <p className="text-xs font-medium text-red-700" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export const inputBaseClass =
  'w-full rounded-lg border border-[#E4E1D9] bg-white px-3 py-2 text-sm text-[#293330] placeholder:text-[#9CA59F] transition-colors focus:border-[#183B36] focus:outline-none focus:ring-2 focus:ring-[#183B36]/15 disabled:cursor-not-allowed disabled:bg-[#F6F3ED] disabled:text-[#738078]';
