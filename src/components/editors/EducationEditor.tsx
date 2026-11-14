import React from 'react';
import { ArrowDown, ArrowUp, GraduationCap, Plus, Trash2 } from 'lucide-react';
import { validateDateRange } from '../../lib/resume/date-formatting';
import { createId } from '../../lib/resume/initial-data';
import {
  moveArrayItem,
  reindexDisplayOrder,
} from '../../lib/resume/section-configuration';
import { selectActiveDocument, useResumeStore } from '../../lib/resume/store';
import type { EducationItem } from '../../lib/resume/types';
import { EmptyState } from '../shared/EmptyState';
import { FormField, inputBaseClass } from '../shared/FormField';

export const EducationEditor: React.FC = () => {
  const doc = useResumeStore(selectActiveDocument);
  const updateActiveDocument = useResumeStore((s) => s.updateActiveDocument);

  const items = [...doc.education].sort(
    (a, b) => a.displayOrder - b.displayOrder
  );

  const handleAdd = () => {
    const entry: EducationItem = {
      id: createId('edu'),
      qualification: '',
      institution: '',
      location: '',
      startDate: '',
      endDate: '',
      description: '',
      displayOrder: items.length,
    };
    updateActiveDocument((current) => ({
      ...current,
      education: [...current.education, entry],
    }));
  };

  const handleDelete = (id: string) => {
    updateActiveDocument((current) => ({
      ...current,
      education: reindexDisplayOrder(
        current.education.filter((e) => e.id !== id)
      ),
    }));
  };

  const handleMove = (index: number, direction: -1 | 1) => {
    const next = reindexDisplayOrder(
      moveArrayItem(items, index, index + direction)
    );
    updateActiveDocument((current) => ({
      ...current,
      education: next,
    }));
  };

  const updateField = <K extends keyof EducationItem>(
    id: string,
    field: K,
    value: EducationItem[K]
  ) => {
    updateActiveDocument((current) => ({
      ...current,
      education: current.education.map((edu) =>
        edu.id === id ? { ...edu, [field]: value } : edu
      ),
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#E4E1D9] pb-5">
        <div>
          <h2 className="font-editorial text-2xl font-semibold text-[#293330]">
            Education
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-[#738078]">
            Degrees, diplomas, and academic programs. Incomplete entries are preserved safely while you draft.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-2 rounded-lg bg-[#183B36] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#122D29] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#183B36]"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add Education
        </button>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No education records yet"
          description="Add your university degree, technical diploma, or specialized academic program."
          actionLabel="Add Education"
          onAction={handleAdd}
        />
      ) : (
        <div className="space-y-5">
          {items.map((edu, idx) => {
            const dateCheck = validateDateRange(
              edu.startDate,
              edu.endDate,
              false
            );
            const titleLabel =
              edu.qualification.trim() || edu.institution.trim()
                ? `${edu.qualification.trim() || 'Qualification'}${
                    edu.institution.trim() ? ` — ${edu.institution.trim()}` : ''
                  }`
                : `Education Entry #${idx + 1}`;

            return (
              <article
                key={edu.id}
                aria-label={titleLabel}
                className="rounded-xl border border-[#E4E1D9] bg-white p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E4E1D9] pb-3.5">
                  <h3 className="text-base font-semibold text-[#293330]">
                    {titleLabel}
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMove(idx, -1)}
                      aria-label={`Move ${titleLabel} up`}
                      className="rounded-lg border border-[#E4E1D9] p-1.5 text-[#738078] hover:bg-[#F6F3ED] hover:text-[#293330] disabled:opacity-40"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === items.length - 1}
                      onClick={() => handleMove(idx, 1)}
                      aria-label={`Move ${titleLabel} down`}
                      className="rounded-lg border border-[#E4E1D9] p-1.5 text-[#738078] hover:bg-[#F6F3ED] hover:text-[#293330] disabled:opacity-40"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(edu.id)}
                      aria-label={`Delete ${titleLabel}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-[#E4E1D9] px-2.5 py-1.5 text-xs font-medium text-red-700 hover:border-red-200 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      Delete
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    id={`edu-qual-${edu.id}`}
                    label="Degree or Qualification"
                    className="sm:col-span-2"
                  >
                    <input
                      id={`edu-qual-${edu.id}`}
                      type="text"
                      value={edu.qualification}
                      onChange={(e) =>
                        updateField(edu.id, 'qualification', e.target.value)
                      }
                      placeholder="e.g., Bachelor of Technology in Computer Science"
                      className={inputBaseClass}
                    />
                  </FormField>

                  <FormField id={`edu-inst-${edu.id}`} label="Institution">
                    <input
                      id={`edu-inst-${edu.id}`}
                      type="text"
                      value={edu.institution}
                      onChange={(e) =>
                        updateField(edu.id, 'institution', e.target.value)
                      }
                      placeholder="e.g., Western Institute of Technology"
                      className={inputBaseClass}
                    />
                  </FormField>

                  <FormField id={`edu-loc-${edu.id}`} label="Location">
                    <input
                      id={`edu-loc-${edu.id}`}
                      type="text"
                      value={edu.location}
                      onChange={(e) =>
                        updateField(edu.id, 'location', e.target.value)
                      }
                      placeholder="City, Country"
                      className={inputBaseClass}
                    />
                  </FormField>

                  <FormField id={`edu-start-${edu.id}`} label="Start Month">
                    <input
                      id={`edu-start-${edu.id}`}
                      type="month"
                      value={edu.startDate}
                      onChange={(e) =>
                        updateField(edu.id, 'startDate', e.target.value)
                      }
                      className={inputBaseClass}
                    />
                  </FormField>

                  <FormField
                    id={`edu-end-${edu.id}`}
                    label="End Month"
                    error={!dateCheck.valid ? dateCheck.error : undefined}
                  >
                    <input
                      id={`edu-end-${edu.id}`}
                      type="month"
                      value={edu.endDate}
                      onChange={(e) =>
                        updateField(edu.id, 'endDate', e.target.value)
                      }
                      className={inputBaseClass}
                    />
                  </FormField>

                  <FormField
                    id={`edu-desc-${edu.id}`}
                    label="Notes or Coursework (Optional)"
                    className="sm:col-span-2"
                  >
                    <textarea
                      id={`edu-desc-${edu.id}`}
                      rows={2}
                      value={edu.description}
                      onChange={(e) =>
                        updateField(edu.id, 'description', e.target.value)
                      }
                      placeholder="Relevant honors, thesis focus, or specialized coursework..."
                      className={`${inputBaseClass} resize-y`}
                    />
                  </FormField>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
