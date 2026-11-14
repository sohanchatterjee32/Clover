import React, { useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Briefcase,
  Plus,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { validateDateRange } from '../../lib/resume/date-formatting';
import { createId } from '../../lib/resume/initial-data';
import {
  moveArrayItem,
  reindexDisplayOrder,
} from '../../lib/resume/section-configuration';
import { selectActiveDocument, useResumeStore } from '../../lib/resume/store';
import type { ExperienceItem } from '../../lib/resume/types';
import {
  improveAchievementWording,
  type WordingSuggestion,
} from '../../lib/writing/bullet-improvements';
import { EmptyState } from '../shared/EmptyState';
import { FormField, inputBaseClass } from '../shared/FormField';

export const ExperienceEditor: React.FC = () => {
  const doc = useResumeStore(selectActiveDocument);
  const updateActiveDocument = useResumeStore((s) => s.updateActiveDocument);

  const [activeSuggestion, setActiveSuggestion] = useState<{
    expId: string;
    achId: string;
    suggestion: WordingSuggestion;
    editableDraft: string;
  } | null>(null);

  const experiences = [...doc.experiences].sort(
    (a, b) => a.displayOrder - b.displayOrder
  );

  const handleAddExperience = () => {
    const newExp: ExperienceItem = {
      id: createId('exp'),
      jobTitle: '',
      company: '',
      employmentType: 'Full-time',
      location: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      achievements: [{ id: createId('ach'), text: '' }],
      displayOrder: experiences.length,
    };
    updateActiveDocument((current) => ({
      ...current,
      experiences: [...current.experiences, newExp],
    }));
  };

  const handleDeleteExperience = (expId: string) => {
    updateActiveDocument((current) => ({
      ...current,
      experiences: reindexDisplayOrder(
        current.experiences.filter((e) => e.id !== expId)
      ),
    }));
  };

  const handleMoveExperience = (index: number, direction: -1 | 1) => {
    const next = reindexDisplayOrder(
      moveArrayItem(experiences, index, index + direction)
    );
    updateActiveDocument((current) => ({
      ...current,
      experiences: next,
    }));
  };

  const updateExperienceField = <K extends keyof ExperienceItem>(
    expId: string,
    field: K,
    value: ExperienceItem[K]
  ) => {
    updateActiveDocument((current) => ({
      ...current,
      experiences: current.experiences.map((exp) =>
        exp.id === expId ? { ...exp, [field]: value } : exp
      ),
    }));
  };

  const handleToggleCurrent = (expId: string, checked: boolean) => {
    updateActiveDocument((current) => ({
      ...current,
      experiences: current.experiences.map((exp) =>
        exp.id === expId
          ? {
              ...exp,
              isCurrent: checked,
              endDate: checked ? '' : exp.endDate,
            }
          : exp
      ),
    }));
  };

  const handleAddAchievement = (expId: string) => {
    updateActiveDocument((current) => ({
      ...current,
      experiences: current.experiences.map((exp) =>
        exp.id === expId
          ? {
              ...exp,
              achievements: [
                ...exp.achievements,
                { id: createId('ach'), text: '' },
              ],
            }
          : exp
      ),
    }));
  };

  const handleUpdateAchievement = (
    expId: string,
    achId: string,
    text: string
  ) => {
    updateActiveDocument((current) => ({
      ...current,
      experiences: current.experiences.map((exp) =>
        exp.id === expId
          ? {
              ...exp,
              achievements: exp.achievements.map((a) =>
                a.id === achId ? { ...a, text } : a
              ),
            }
          : exp
      ),
    }));
  };

  const handleDeleteAchievement = (expId: string, achId: string) => {
    updateActiveDocument((current) => ({
      ...current,
      experiences: current.experiences.map((exp) =>
        exp.id === expId
          ? {
              ...exp,
              achievements: exp.achievements.filter((a) => a.id !== achId),
            }
          : exp
      ),
    }));
    if (activeSuggestion?.achId === achId) {
      setActiveSuggestion(null);
    }
  };

  const handleMoveAchievement = (
    expId: string,
    index: number,
    direction: -1 | 1
  ) => {
    updateActiveDocument((current) => ({
      ...current,
      experiences: current.experiences.map((exp) =>
        exp.id === expId
          ? {
              ...exp,
              achievements: moveArrayItem(
                exp.achievements,
                index,
                index + direction
              ),
            }
          : exp
      ),
    }));
  };

  const handleImproveWording = (
    expId: string,
    achId: string,
    currentText: string
  ) => {
    const suggestion = improveAchievementWording(currentText);
    setActiveSuggestion({
      expId,
      achId,
      suggestion,
      editableDraft: suggestion.improved,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#E4E1D9] pb-5">
        <div>
          <h2 className="font-editorial text-2xl font-semibold text-[#293330]">
            Professional Experience
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-[#738078]">
            Chronicle your roles and key responsibilities. Use Writing Coach to sharpen achievement wording without inventing metrics.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddExperience}
          className="inline-flex items-center gap-2 rounded-lg bg-[#183B36] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#122D29] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#183B36]"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add Experience
        </button>
      </div>

      {experiences.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No experience entries yet"
          description="Add your current or past roles, internships, or consulting engagements to populate your career history."
          actionLabel="Add First Experience"
          onAction={handleAddExperience}
        />
      ) : (
        <div className="space-y-5">
          {experiences.map((exp, expIdx) => {
            const dateValidation = validateDateRange(
              exp.startDate,
              exp.endDate,
              exp.isCurrent
            );
            const headingLabel =
              exp.jobTitle.trim() || exp.company.trim()
                ? `${exp.jobTitle.trim() || 'Untitled Role'}${
                    exp.company.trim() ? ` at ${exp.company.trim()}` : ''
                  }`
                : `Experience Entry #${expIdx + 1}`;

            return (
              <article
                key={exp.id}
                aria-label={headingLabel}
                className="rounded-xl border border-[#E4E1D9] bg-white p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E4E1D9] pb-3.5">
                  <h3 className="text-base font-semibold text-[#293330]">
                    {headingLabel}
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={expIdx === 0}
                      onClick={() => handleMoveExperience(expIdx, -1)}
                      aria-label={`Move ${headingLabel} up`}
                      className="rounded-lg border border-[#E4E1D9] p-1.5 text-[#738078] hover:bg-[#F6F3ED] hover:text-[#293330] disabled:opacity-40"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={expIdx === experiences.length - 1}
                      onClick={() => handleMoveExperience(expIdx, 1)}
                      aria-label={`Move ${headingLabel} down`}
                      className="rounded-lg border border-[#E4E1D9] p-1.5 text-[#738078] hover:bg-[#F6F3ED] hover:text-[#293330] disabled:opacity-40"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteExperience(exp.id)}
                      aria-label={`Delete ${headingLabel}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-[#E4E1D9] px-2.5 py-1.5 text-xs font-medium text-red-700 hover:border-red-200 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      Delete
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField id={`exp-title-${exp.id}`} label="Job Title">
                    <input
                      id={`exp-title-${exp.id}`}
                      type="text"
                      value={exp.jobTitle}
                      onChange={(e) =>
                        updateExperienceField(exp.id, 'jobTitle', e.target.value)
                      }
                      placeholder="e.g., Cloud Platform Engineer"
                      className={inputBaseClass}
                    />
                  </FormField>

                  <FormField id={`exp-company-${exp.id}`} label="Company">
                    <input
                      id={`exp-company-${exp.id}`}
                      type="text"
                      value={exp.company}
                      onChange={(e) =>
                        updateExperienceField(exp.id, 'company', e.target.value)
                      }
                      placeholder="e.g., Nimbus Technologies"
                      className={inputBaseClass}
                    />
                  </FormField>

                  <FormField
                    id={`exp-type-${exp.id}`}
                    label="Employment Type"
                  >
                    <select
                      id={`exp-type-${exp.id}`}
                      value={exp.employmentType}
                      onChange={(e) =>
                        updateExperienceField(
                          exp.id,
                          'employmentType',
                          e.target.value
                        )
                      }
                      className={inputBaseClass}
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                      <option value="Freelance">Freelance</option>
                    </select>
                  </FormField>

                  <FormField id={`exp-location-${exp.id}`} label="Location">
                    <input
                      id={`exp-location-${exp.id}`}
                      type="text"
                      value={exp.location}
                      onChange={(e) =>
                        updateExperienceField(exp.id, 'location', e.target.value)
                      }
                      placeholder="e.g., Bengaluru, India"
                      className={inputBaseClass}
                    />
                  </FormField>

                  <FormField id={`exp-start-${exp.id}`} label="Start Month">
                    <input
                      id={`exp-start-${exp.id}`}
                      type="month"
                      value={exp.startDate}
                      onChange={(e) =>
                        updateExperienceField(exp.id, 'startDate', e.target.value)
                      }
                      className={inputBaseClass}
                    />
                  </FormField>

                  <FormField
                    id={`exp-end-${exp.id}`}
                    label="End Month"
                    error={!dateValidation.valid ? dateValidation.error : undefined}
                  >
                    <input
                      id={`exp-end-${exp.id}`}
                      type="month"
                      value={exp.isCurrent ? '' : exp.endDate}
                      disabled={exp.isCurrent}
                      onChange={(e) =>
                        updateExperienceField(exp.id, 'endDate', e.target.value)
                      }
                      className={inputBaseClass}
                    />
                  </FormField>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor={`exp-current-${exp.id}`}
                      className="inline-flex cursor-pointer items-center gap-2.5 text-sm font-medium text-[#293330]"
                    >
                      <input
                        id={`exp-current-${exp.id}`}
                        type="checkbox"
                        checked={exp.isCurrent}
                        onChange={(e) =>
                          handleToggleCurrent(exp.id, e.target.checked)
                        }
                        className="h-4 w-4 rounded border-[#E4E1D9] accent-[#183B36]"
                      />
                      Currently working here
                    </label>
                  </div>
                </div>

                {/* Achievements */}
                <div className="mt-5 border-t border-[#E4E1D9] pt-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-[#293330]">
                      Key Achievements & Responsibilities
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAddAchievement(exp.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-[#E4E1D9] bg-[#F6F3ED] px-3 py-1.5 text-xs font-semibold text-[#183B36] hover:bg-[#EAE5DA]"
                    >
                      <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                      Add Achievement
                    </button>
                  </div>

                  <div className="mt-3 space-y-3">
                    {exp.achievements.map((ach, achIdx) => {
                      const isEditingSuggestion =
                        activeSuggestion?.expId === exp.id &&
                        activeSuggestion?.achId === ach.id;

                      return (
                        <div key={ach.id} className="space-y-2">
                          <div className="flex items-start gap-2">
                            <textarea
                              rows={2}
                              value={ach.text}
                              onChange={(e) =>
                                handleUpdateAchievement(
                                  exp.id,
                                  ach.id,
                                  e.target.value
                                )
                              }
                              aria-label={`Achievement ${achIdx + 1} for ${headingLabel}`}
                              placeholder="Describe an action you led, system you supported, or outcome you delivered..."
                              className={`${inputBaseClass} flex-1 resize-y text-sm`}
                            />
                            <div className="flex flex-col gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  handleImproveWording(exp.id, ach.id, ach.text)
                                }
                                title="Improve Wording with Writing Coach"
                                aria-label={`Improve wording for achievement ${achIdx + 1}`}
                                className="inline-flex items-center gap-1 rounded-md border border-[#183B36]/25 bg-[#F6F3ED] px-2 py-1 text-[11px] font-semibold text-[#183B36] hover:bg-[#EAE5DA]"
                              >
                                <Sparkles className="h-3 w-3" aria-hidden="true" />
                                Improve Wording
                              </button>
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  type="button"
                                  disabled={achIdx === 0}
                                  onClick={() =>
                                    handleMoveAchievement(exp.id, achIdx, -1)
                                  }
                                  aria-label={`Move achievement ${achIdx + 1} up`}
                                  className="rounded border border-[#E4E1D9] p-1 text-[#738078] hover:bg-[#F6F3ED] disabled:opacity-40"
                                >
                                  <ArrowUp className="h-3 w-3" />
                                </button>
                                <button
                                  type="button"
                                  disabled={achIdx === exp.achievements.length - 1}
                                  onClick={() =>
                                    handleMoveAchievement(exp.id, achIdx, 1)
                                  }
                                  aria-label={`Move achievement ${achIdx + 1} down`}
                                  className="rounded border border-[#E4E1D9] p-1 text-[#738078] hover:bg-[#F6F3ED] disabled:opacity-40"
                                >
                                  <ArrowDown className="h-3 w-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDeleteAchievement(exp.id, ach.id)
                                  }
                                  aria-label={`Remove achievement ${achIdx + 1}`}
                                  className="rounded border border-[#E4E1D9] p-1 text-[#738078] hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {isEditingSuggestion && activeSuggestion && (
                            <div className="rounded-lg border border-[#183B36]/25 bg-[#F6F3ED] p-3">
                              <div className="text-xs font-semibold text-[#183B36]">
                                Writing Coach Suggestion
                              </div>
                              <p className="mt-1 text-[11px] text-[#738078]">
                                {activeSuggestion.suggestion.reason}
                              </p>
                              <textarea
                                rows={2}
                                value={activeSuggestion.editableDraft}
                                onChange={(e) =>
                                  setActiveSuggestion({
                                    ...activeSuggestion,
                                    editableDraft: e.target.value,
                                  })
                                }
                                aria-label="Edit suggested wording before accepting"
                                className={`${inputBaseClass} mt-2 text-xs`}
                              />
                              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                                <button
                                  type="button"
                                  disabled={!activeSuggestion.editableDraft.trim()}
                                  onClick={() => {
                                    handleUpdateAchievement(
                                      exp.id,
                                      ach.id,
                                      activeSuggestion.editableDraft.trim()
                                    );
                                    setActiveSuggestion(null);
                                  }}
                                  className="rounded-md bg-[#183B36] px-3 py-1 text-xs font-medium text-white hover:bg-[#122D29] disabled:opacity-40"
                                >
                                  Accept Suggestion
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setActiveSuggestion(null)}
                                  className="rounded-md border border-[#E4E1D9] bg-white px-3 py-1 text-xs font-medium text-[#293330]"
                                >
                                  Dismiss
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
