import React, { useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Layers,
  Plus,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { createId } from '../../lib/resume/initial-data';
import {
  moveArrayItem,
  reindexDisplayOrder,
} from '../../lib/resume/section-configuration';
import { selectActiveDocument, useResumeStore } from '../../lib/resume/store';
import {
  detectBestProfessionCategory,
  PROFESSION_SKILL_MAPPINGS,
  SKILL_CATEGORIES,
} from '../../lib/writing/skill-suggestions';
import { EmptyState } from '../shared/EmptyState';
import { FormField, inputBaseClass } from '../shared/FormField';

export const SkillsEditor: React.FC = () => {
  const doc = useResumeStore(selectActiveDocument);
  const updateActiveDocument = useResumeStore((s) => s.updateActiveDocument);
  const addToast = useResumeStore((s) => s.addToast);

  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState<string>(
    SKILL_CATEGORIES[0]
  );
  const [skillError, setSkillError] = useState<string | null>(null);

  const defaultProfession = useMemo(
    () =>
      detectBestProfessionCategory(
        doc.personal.professionalHeadline,
        doc.targetRole
      ),
    [doc.personal.professionalHeadline, doc.targetRole]
  );
  const [selectedProfession, setSelectedProfession] =
    useState<string>(defaultProfession);
  const [dismissedSuggestions, setDismissedSuggestions] = useState<string[]>(
    []
  );
  const [editingSuggestion, setEditingSuggestion] = useState<{
    originalName: string;
    draftName: string;
    category: string;
  } | null>(null);

  const skills = [...doc.skills].sort(
    (a, b) => a.displayOrder - b.displayOrder
  );

  const addSkill = (rawName: string, category: string): boolean => {
    const trimmed = rawName.trim();
    if (!trimmed) {
      setSkillError('Enter a skill name before adding.');
      return false;
    }
    const isDuplicate = skills.some(
      (s) => s.name.trim().toLowerCase() === trimmed.toLowerCase()
    );
    if (isDuplicate) {
      setSkillError(`"${trimmed}" is already in your skills list.`);
      return false;
    }

    setSkillError(null);
    updateActiveDocument((current) => ({
      ...current,
      skills: [
        ...current.skills,
        {
          id: createId('sk'),
          name: trimmed,
          category,
          displayOrder: current.skills.length,
        },
      ],
    }));
    return true;
  };

  const handleSubmitSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (addSkill(newSkillName, newSkillCategory)) {
      setNewSkillName('');
    }
  };

  const handleRemoveSkill = (id: string) => {
    updateActiveDocument((current) => ({
      ...current,
      skills: reindexDisplayOrder(current.skills.filter((s) => s.id !== id)),
    }));
  };

  const handleMoveSkill = (index: number, direction: -1 | 1) => {
    const next = reindexDisplayOrder(
      moveArrayItem(skills, index, index + direction)
    );
    updateActiveDocument((current) => ({
      ...current,
      skills: next,
    }));
  };

  const handleCategoryChange = (id: string, category: string) => {
    updateActiveDocument((current) => ({
      ...current,
      skills: current.skills.map((s) =>
        s.id === id ? { ...s, category } : s
      ),
    }));
  };

  const activeProfessionGroup =
    PROFESSION_SKILL_MAPPINGS.find((g) => g.profession === selectedProfession) ||
    PROFESSION_SKILL_MAPPINGS[0];

  const availableSuggestions = activeProfessionGroup.suggestions.filter(
    (sug) =>
      !dismissedSuggestions.includes(sug.name) &&
      !skills.some((s) => s.name.toLowerCase() === sug.name.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="border-b border-[#E4E1D9] pb-5">
        <h2 className="font-editorial text-2xl font-semibold text-[#293330]">
          Skills Workspace
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-[#738078]">
          Add, categorize, and prioritize your core competencies. Duplicates and blank entries are filtered automatically.
        </p>
      </div>

      {/* Add Skill Bar */}
      <form
        onSubmit={handleSubmitSkill}
        className="rounded-xl border border-[#E4E1D9] bg-white p-5"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_210px_auto] sm:items-end">
          <FormField
            id="skill-input"
            label="Add a Skill"
            error={skillError || undefined}
          >
            <input
              id="skill-input"
              type="text"
              value={newSkillName}
              onChange={(e) => {
                setNewSkillName(e.target.value);
                if (skillError) setSkillError(null);
              }}
              placeholder="e.g., Terraform, TypeScript, Financial Modeling"
              className={inputBaseClass}
            />
          </FormField>

          <FormField id="skill-category" label="Category">
            <select
              id="skill-category"
              value={newSkillCategory}
              onChange={(e) => setNewSkillCategory(e.target.value)}
              className={inputBaseClass}
            >
              {SKILL_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </FormField>

          <button
            type="submit"
            className="inline-flex h-[38px] items-center justify-center gap-1.5 rounded-lg bg-[#183B36] px-4 text-sm font-medium text-white transition-colors hover:bg-[#122D29] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#183B36]"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add
          </button>
        </div>
      </form>

      {/* Current Skills List */}
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#293330]">
            Active Skills ({skills.length})
          </h3>
          <span className="text-xs text-[#738078]">
            Order determines display sequence in your resume
          </span>
        </div>

        <div className="mt-3">
          {skills.length === 0 ? (
            <EmptyState
              icon={Layers}
              title="No skills added yet"
              description="Type a skill above and press Enter, or review curated role suggestions below."
            />
          ) : (
            <div className="divide-y divide-[#E4E1D9] rounded-xl border border-[#E4E1D9] bg-white">
              {skills.map((skill, idx) => (
                <div
                  key={skill.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5"
                >
                  <div className="min-w-0 flex-1 font-medium text-sm text-[#293330]">
                    {skill.name}
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={skill.category}
                      onChange={(e) =>
                        handleCategoryChange(skill.id, e.target.value)
                      }
                      aria-label={`Category for ${skill.name}`}
                      className="rounded-md border border-[#E4E1D9] bg-[#F6F3ED]/60 px-2.5 py-1 text-xs text-[#293330] focus:border-[#183B36] focus:outline-none"
                    >
                      {SKILL_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveSkill(idx, -1)}
                      aria-label={`Move ${skill.name} up`}
                      className="rounded border border-[#E4E1D9] p-1 text-[#738078] hover:bg-[#F6F3ED] disabled:opacity-40"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === skills.length - 1}
                      onClick={() => handleMoveSkill(idx, 1)}
                      aria-label={`Move ${skill.name} down`}
                      className="rounded border border-[#E4E1D9] p-1 text-[#738078] hover:bg-[#F6F3ED] disabled:opacity-40"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill.id)}
                      aria-label={`Remove ${skill.name}`}
                      className="rounded border border-[#E4E1D9] p-1 text-[#738078] hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Role-Based Skill Suggestions */}
      <div className="rounded-xl border border-[#E4E1D9] bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#183B36]" aria-hidden="true" />
            <h3 className="text-sm font-semibold text-[#293330]">
              Role-Based Skill Suggestions
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <label
              htmlFor="profession-suggestion-select"
              className="text-xs text-[#738078]"
            >
              Profession:
            </label>
            <select
              id="profession-suggestion-select"
              value={selectedProfession}
              onChange={(e) => {
                setSelectedProfession(e.target.value);
                setEditingSuggestion(null);
              }}
              className="rounded-lg border border-[#E4E1D9] bg-[#F6F3ED] px-3 py-1.5 text-xs font-medium text-[#293330] focus:border-[#183B36] focus:outline-none"
            >
              {PROFESSION_SKILL_MAPPINGS.map((group) => (
                <option key={group.profession} value={group.profession}>
                  {group.profession}
                </option>
              ))}
            </select>
          </div>
        </div>
        <p className="mt-1 text-xs text-[#738078]">
          Curated locally for {activeProfessionGroup.profession}. Add only skills you genuinely use, or customize the wording before adding.
        </p>

        {editingSuggestion && (
          <div className="mt-3 rounded-lg border border-[#183B36]/25 bg-[#F6F3ED] p-3">
            <div className="text-xs font-semibold text-[#183B36]">
              Customize Suggestion Before Adding
            </div>
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_180px_auto_auto]">
              <input
                type="text"
                value={editingSuggestion.draftName}
                onChange={(e) =>
                  setEditingSuggestion({
                    ...editingSuggestion,
                    draftName: e.target.value,
                  })
                }
                aria-label="Edit suggested skill name"
                className={`${inputBaseClass} py-1.5 text-xs`}
              />
              <select
                value={editingSuggestion.category}
                onChange={(e) =>
                  setEditingSuggestion({
                    ...editingSuggestion,
                    category: e.target.value,
                  })
                }
                aria-label="Edit suggested skill category"
                className={`${inputBaseClass} py-1.5 text-xs`}
              >
                {SKILL_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  if (
                    addSkill(
                      editingSuggestion.draftName,
                      editingSuggestion.category
                    )
                  ) {
                    addToast({
                      type: 'success',
                      title: 'Skill added',
                      description: editingSuggestion.draftName.trim(),
                    });
                    setEditingSuggestion(null);
                  }
                }}
                className="rounded-md bg-[#183B36] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#122D29]"
              >
                Add Skill
              </button>
              <button
                type="button"
                onClick={() => setEditingSuggestion(null)}
                className="rounded-md border border-[#E4E1D9] bg-white px-3 py-1.5 text-xs font-medium text-[#293330]"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="mt-4 divide-y divide-[#E4E1D9] rounded-lg border border-[#E4E1D9]">
          {availableSuggestions.length === 0 ? (
            <div className="p-4 text-xs text-[#738078]">
              All suggestions for {activeProfessionGroup.profession} are already in your list or dismissed.
            </div>
          ) : (
            availableSuggestions.map((sug) => (
              <div
                key={sug.name}
                className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 text-xs"
              >
                <div>
                  <span className="font-semibold text-[#293330]">
                    {sug.name}
                  </span>
                  <span className="mx-1.5 text-[#738078]" aria-hidden="true">
                    ·
                  </span>
                  <span className="text-[#738078]">{sug.category}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      setEditingSuggestion({
                        originalName: sug.name,
                        draftName: sug.name,
                        category: sug.category,
                      })
                    }
                    className="rounded border border-[#E4E1D9] bg-white px-2.5 py-1 font-medium text-[#293330] hover:bg-[#F6F3ED]"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      addSkill(sug.name, sug.category);
                    }}
                    className="rounded bg-[#183B36] px-2.5 py-1 font-medium text-white hover:bg-[#122D29]"
                  >
                    + Add
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setDismissedSuggestions((prev) => [...prev, sug.name])
                    }
                    aria-label={`Dismiss suggestion ${sug.name}`}
                    className="rounded border border-[#E4E1D9] bg-white px-2 py-1 text-[#738078] hover:bg-[#F6F3ED]"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
