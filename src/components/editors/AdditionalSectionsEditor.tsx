import React, { useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Award,
  BadgeCheck,
  Eye,
  EyeOff,
  FolderGit2,
  Globe,
  HeartHandshake,
  ListOrdered,
  Plus,
  PlusSquare,
  Trash2,
} from 'lucide-react';
import { validateDateRange } from '../../lib/resume/date-formatting';
import { createId } from '../../lib/resume/initial-data';
import {
  moveArrayItem,
  reindexDisplayOrder,
} from '../../lib/resume/section-configuration';
import { selectActiveDocument, useResumeStore } from '../../lib/resume/store';
import type {
  LanguageProficiency,
} from '../../lib/resume/types';
import { EmptyState } from '../shared/EmptyState';
import { FormField, inputBaseClass } from '../shared/FormField';

type AdditionalTab =
  | 'languages'
  | 'projects'
  | 'certifications'
  | 'awards'
  | 'volunteer'
  | 'custom'
  | 'order';

const PROFICIENCY_LEVELS: LanguageProficiency[] = [
  'Native',
  'Fluent',
  'Advanced',
  'Intermediate',
  'Basic',
];

export const AdditionalSectionsEditor: React.FC = () => {
  const doc = useResumeStore(selectActiveDocument);
  const updateActiveDocument = useResumeStore((s) => s.updateActiveDocument);
  const [activeTab, setActiveTab] = useState<AdditionalTab>('languages');
  const [newCustomTitle, setNewCustomTitle] = useState('');

  const tabs: Array<{ id: AdditionalTab; label: string; count?: number }> = [
    { id: 'languages', label: 'Languages', count: doc.languages.length },
    { id: 'projects', label: 'Projects', count: doc.projects.length },
    {
      id: 'certifications',
      label: 'Certifications',
      count: doc.certifications.length,
    },
    { id: 'awards', label: 'Awards', count: doc.awards.length },
    {
      id: 'volunteer',
      label: 'Volunteer',
      count: doc.volunteerExperience.length,
    },
    { id: 'custom', label: 'Custom Sections', count: doc.customSections.length },
    { id: 'order', label: 'Section Order & Visibility' },
  ];

  // Sorted views
  const languages = [...doc.languages].sort(
    (a, b) => a.displayOrder - b.displayOrder
  );
  const projects = [...doc.projects].sort(
    (a, b) => a.displayOrder - b.displayOrder
  );
  const certifications = [...doc.certifications].sort(
    (a, b) => a.displayOrder - b.displayOrder
  );
  const awards = [...doc.awards].sort(
    (a, b) => a.displayOrder - b.displayOrder
  );
  const volunteer = [...doc.volunteerExperience].sort(
    (a, b) => a.displayOrder - b.displayOrder
  );
  const sectionOrder = [...doc.sectionConfiguration].sort(
    (a, b) => a.displayOrder - b.displayOrder
  );

  const toggleSectionVisibility = (sectionId: string) => {
    updateActiveDocument((current) => ({
      ...current,
      sectionConfiguration: current.sectionConfiguration.map((s) =>
        s.id === sectionId ? { ...s, visible: !s.visible } : s
      ),
    }));
  };

  const moveSectionOrder = (index: number, direction: -1 | 1) => {
    const next = reindexDisplayOrder(
      moveArrayItem(sectionOrder, index, index + direction)
    );
    updateActiveDocument((current) => ({
      ...current,
      sectionConfiguration: next,
    }));
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-[#E4E1D9] pb-5">
        <h2 className="font-editorial text-2xl font-semibold text-[#293330]">
          Additional Sections & Ordering
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-[#738078]">
          Manage languages, projects, certifications, awards, volunteer work, custom sections, and the exact order sections appear on your resume.
        </p>
      </div>

      {/* Sub-navigation Tabs */}
      <div
        role="tablist"
        aria-label="Additional resume sections"
        className="flex flex-wrap gap-1.5 rounded-xl border border-[#E4E1D9] bg-white p-1.5"
      >
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-[#183B36] ${
                active
                  ? 'bg-[#183B36] text-white'
                  : 'text-[#738078] hover:bg-[#F6F3ED] hover:text-[#293330]'
              }`}
            >
              {tab.label}
              {typeof tab.count === 'number' && tab.count > 0
                ? ` (${tab.count})`
                : ''}
            </button>
          );
        })}
      </div>

      {/* 1. LANGUAGES */}
      {activeTab === 'languages' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#738078]">
              Displayed cleanly as Language — Proficiency across templates and PDF export.
            </p>
            <button
              type="button"
              onClick={() =>
                updateActiveDocument((current) => ({
                  ...current,
                  languages: [
                    ...current.languages,
                    {
                      id: createId('lang'),
                      name: '',
                      proficiency: 'Fluent',
                      displayOrder: current.languages.length,
                    },
                  ],
                }))
              }
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#183B36] px-3.5 py-2 text-xs font-medium text-white hover:bg-[#122D29]"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              Add Language
            </button>
          </div>

          {languages.length === 0 ? (
            <EmptyState
              icon={Globe}
              title="No languages added"
              description="List languages you speak or work in along with your proficiency level."
              actionLabel="Add Language"
              onAction={() =>
                updateActiveDocument((current) => ({
                  ...current,
                  languages: [
                    {
                      id: createId('lang'),
                      name: '',
                      proficiency: 'Fluent',
                      displayOrder: 0,
                    },
                  ],
                }))
              }
            />
          ) : (
            <div className="space-y-3">
              {languages.map((lang, idx) => (
                <div
                  key={lang.id}
                  className="grid grid-cols-1 gap-3 rounded-xl border border-[#E4E1D9] bg-white p-4 sm:grid-cols-[1fr_180px_auto] sm:items-end"
                >
                  <FormField id={`lang-name-${lang.id}`} label="Language">
                    <input
                      id={`lang-name-${lang.id}`}
                      type="text"
                      value={lang.name}
                      onChange={(e) =>
                        updateActiveDocument((current) => ({
                          ...current,
                          languages: current.languages.map((l) =>
                            l.id === lang.id ? { ...l, name: e.target.value } : l
                          ),
                        }))
                      }
                      placeholder="e.g., English, Bengali, German"
                      className={inputBaseClass}
                    />
                  </FormField>

                  <FormField
                    id={`lang-prof-${lang.id}`}
                    label="Proficiency"
                  >
                    <select
                      id={`lang-prof-${lang.id}`}
                      value={lang.proficiency}
                      onChange={(e) =>
                        updateActiveDocument((current) => ({
                          ...current,
                          languages: current.languages.map((l) =>
                            l.id === lang.id
                              ? {
                                  ...l,
                                  proficiency: e.target
                                    .value as LanguageProficiency,
                                }
                              : l
                          ),
                        }))
                      }
                      className={inputBaseClass}
                    >
                      {PROFICIENCY_LEVELS.map((lvl) => (
                        <option key={lvl} value={lvl}>
                          {lvl}
                        </option>
                      ))}
                    </select>
                  </FormField>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() =>
                        updateActiveDocument((current) => ({
                          ...current,
                          languages: reindexDisplayOrder(
                            moveArrayItem(languages, idx, idx - 1)
                          ),
                        }))
                      }
                      aria-label={`Move ${lang.name || 'language'} up`}
                      className="rounded-lg border border-[#E4E1D9] p-2 text-[#738078] hover:bg-[#F6F3ED] disabled:opacity-40"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === languages.length - 1}
                      onClick={() =>
                        updateActiveDocument((current) => ({
                          ...current,
                          languages: reindexDisplayOrder(
                            moveArrayItem(languages, idx, idx + 1)
                          ),
                        }))
                      }
                      aria-label={`Move ${lang.name || 'language'} down`}
                      className="rounded-lg border border-[#E4E1D9] p-2 text-[#738078] hover:bg-[#F6F3ED] disabled:opacity-40"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updateActiveDocument((current) => ({
                          ...current,
                          languages: reindexDisplayOrder(
                            current.languages.filter((l) => l.id !== lang.id)
                          ),
                        }))
                      }
                      aria-label={`Delete ${lang.name || 'language'}`}
                      className="rounded-lg border border-[#E4E1D9] p-2 text-red-700 hover:border-red-200 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. PROJECTS */}
      {activeTab === 'projects' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#738078]">
              Highlight notable builds, open-source work, or case studies.
            </p>
            <button
              type="button"
              onClick={() =>
                updateActiveDocument((current) => ({
                  ...current,
                  projects: [
                    ...current.projects,
                    {
                      id: createId('proj'),
                      title: '',
                      description: '',
                      technologies: [],
                      projectUrl: '',
                      displayOrder: current.projects.length,
                    },
                  ],
                }))
              }
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#183B36] px-3.5 py-2 text-xs font-medium text-white hover:bg-[#122D29]"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              Add Project
            </button>
          </div>

          {projects.length === 0 ? (
            <EmptyState
              icon={FolderGit2}
              title="No projects added"
              description="Showcase technical initiatives, architectures, or portfolio deliverables."
              actionLabel="Add Project"
              onAction={() =>
                updateActiveDocument((current) => ({
                  ...current,
                  projects: [
                    {
                      id: createId('proj'),
                      title: '',
                      description: '',
                      technologies: [],
                      projectUrl: '',
                      displayOrder: 0,
                    },
                  ],
                }))
              }
            />
          ) : (
            <div className="space-y-4">
              {projects.map((proj, idx) => (
                <div
                  key={proj.id}
                  className="space-y-3 rounded-xl border border-[#E4E1D9] bg-white p-5"
                >
                  <div className="flex items-center justify-between border-b border-[#E4E1D9] pb-3">
                    <h3 className="text-sm font-semibold text-[#293330]">
                      {proj.title.trim() || `Project #${idx + 1}`}
                    </h3>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() =>
                          updateActiveDocument((current) => ({
                            ...current,
                            projects: reindexDisplayOrder(
                              moveArrayItem(projects, idx, idx - 1)
                            ),
                          }))
                        }
                        aria-label={`Move ${proj.title || 'project'} up`}
                        className="rounded border border-[#E4E1D9] p-1.5 text-[#738078] disabled:opacity-40"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === projects.length - 1}
                        onClick={() =>
                          updateActiveDocument((current) => ({
                            ...current,
                            projects: reindexDisplayOrder(
                              moveArrayItem(projects, idx, idx + 1)
                            ),
                          }))
                        }
                        aria-label={`Move ${proj.title || 'project'} down`}
                        className="rounded border border-[#E4E1D9] p-1.5 text-[#738078] disabled:opacity-40"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateActiveDocument((current) => ({
                            ...current,
                            projects: reindexDisplayOrder(
                              current.projects.filter((p) => p.id !== proj.id)
                            ),
                          }))
                        }
                        aria-label={`Delete ${proj.title || 'project'}`}
                        className="rounded border border-[#E4E1D9] p-1.5 text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <FormField id={`proj-title-${proj.id}`} label="Project Title">
                      <input
                        id={`proj-title-${proj.id}`}
                        type="text"
                        value={proj.title}
                        onChange={(e) =>
                          updateActiveDocument((current) => ({
                            ...current,
                            projects: current.projects.map((p) =>
                              p.id === proj.id
                                ? { ...p, title: e.target.value }
                                : p
                            ),
                          }))
                        }
                        placeholder="e.g., Multi-Region Terraform Blueprint"
                        className={inputBaseClass}
                      />
                    </FormField>
                    <FormField id={`proj-url-${proj.id}`} label="Project URL">
                      <input
                        id={`proj-url-${proj.id}`}
                        type="url"
                        value={proj.projectUrl}
                        onChange={(e) =>
                          updateActiveDocument((current) => ({
                            ...current,
                            projects: current.projects.map((p) =>
                              p.id === proj.id
                                ? { ...p, projectUrl: e.target.value }
                                : p
                            ),
                          }))
                        }
                        placeholder="github.com/username/project"
                        className={inputBaseClass}
                      />
                    </FormField>
                    <FormField
                      id={`proj-tech-${proj.id}`}
                      label="Technologies (comma-separated)"
                      className="sm:col-span-2"
                    >
                      <input
                        id={`proj-tech-${proj.id}`}
                        type="text"
                        value={proj.technologies.join(', ')}
                        onChange={(e) =>
                          updateActiveDocument((current) => ({
                            ...current,
                            projects: current.projects.map((p) =>
                              p.id === proj.id
                                ? {
                                    ...p,
                                    technologies: e.target.value
                                      .split(',')
                                      .map((t) => t.trim())
                                      .filter(Boolean),
                                  }
                                : p
                            ),
                          }))
                        }
                        placeholder="Terraform, AWS ECS, Grafana"
                        className={inputBaseClass}
                      />
                    </FormField>
                    <FormField
                      id={`proj-desc-${proj.id}`}
                      label="Description"
                      className="sm:col-span-2"
                    >
                      <textarea
                        id={`proj-desc-${proj.id}`}
                        rows={2}
                        value={proj.description}
                        onChange={(e) =>
                          updateActiveDocument((current) => ({
                            ...current,
                            projects: current.projects.map((p) =>
                              p.id === proj.id
                                ? { ...p, description: e.target.value }
                                : p
                            ),
                          }))
                        }
                        placeholder="Explain what the project solves and your implementation role..."
                        className={`${inputBaseClass} resize-y`}
                      />
                    </FormField>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. CERTIFICATIONS */}
      {activeTab === 'certifications' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#738078]">
              Industry credentials, cloud certifications, and licenses.
            </p>
            <button
              type="button"
              onClick={() =>
                updateActiveDocument((current) => ({
                  ...current,
                  certifications: [
                    ...current.certifications,
                    {
                      id: createId('cert'),
                      name: '',
                      issuingOrganization: '',
                      issueDate: '',
                      credentialUrl: '',
                      displayOrder: current.certifications.length,
                    },
                  ],
                }))
              }
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#183B36] px-3.5 py-2 text-xs font-medium text-white hover:bg-[#122D29]"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              Add Certification
            </button>
          </div>

          {certifications.length === 0 ? (
            <EmptyState
              icon={BadgeCheck}
              title="No certifications added"
              description="Add verified industry credentials or professional licenses."
              actionLabel="Add Certification"
              onAction={() =>
                updateActiveDocument((current) => ({
                  ...current,
                  certifications: [
                    {
                      id: createId('cert'),
                      name: '',
                      issuingOrganization: '',
                      issueDate: '',
                      credentialUrl: '',
                      displayOrder: 0,
                    },
                  ],
                }))
              }
            />
          ) : (
            <div className="space-y-4">
              {certifications.map((cert, idx) => (
                <div
                  key={cert.id}
                  className="space-y-3 rounded-xl border border-[#E4E1D9] bg-white p-5"
                >
                  <div className="flex items-center justify-between border-b border-[#E4E1D9] pb-3">
                    <h3 className="text-sm font-semibold text-[#293330]">
                      {cert.name.trim() || `Certification #${idx + 1}`}
                    </h3>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() =>
                          updateActiveDocument((current) => ({
                            ...current,
                            certifications: reindexDisplayOrder(
                              moveArrayItem(certifications, idx, idx - 1)
                            ),
                          }))
                        }
                        aria-label={`Move ${cert.name || 'certification'} up`}
                        className="rounded border border-[#E4E1D9] p-1.5 text-[#738078] disabled:opacity-40"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === certifications.length - 1}
                        onClick={() =>
                          updateActiveDocument((current) => ({
                            ...current,
                            certifications: reindexDisplayOrder(
                              moveArrayItem(certifications, idx, idx + 1)
                            ),
                          }))
                        }
                        aria-label={`Move ${cert.name || 'certification'} down`}
                        className="rounded border border-[#E4E1D9] p-1.5 text-[#738078] disabled:opacity-40"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateActiveDocument((current) => ({
                            ...current,
                            certifications: reindexDisplayOrder(
                              current.certifications.filter(
                                (c) => c.id !== cert.id
                              )
                            ),
                          }))
                        }
                        aria-label={`Delete ${cert.name || 'certification'}`}
                        className="rounded border border-[#E4E1D9] p-1.5 text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <FormField
                      id={`cert-name-${cert.id}`}
                      label="Certification Name"
                    >
                      <input
                        id={`cert-name-${cert.id}`}
                        type="text"
                        value={cert.name}
                        onChange={(e) =>
                          updateActiveDocument((current) => ({
                            ...current,
                            certifications: current.certifications.map((c) =>
                              c.id === cert.id
                                ? { ...c, name: e.target.value }
                                : c
                            ),
                          }))
                        }
                        placeholder="e.g., AWS Cloud Practitioner"
                        className={inputBaseClass}
                      />
                    </FormField>
                    <FormField
                      id={`cert-org-${cert.id}`}
                      label="Issuing Organization"
                    >
                      <input
                        id={`cert-org-${cert.id}`}
                        type="text"
                        value={cert.issuingOrganization}
                        onChange={(e) =>
                          updateActiveDocument((current) => ({
                            ...current,
                            certifications: current.certifications.map((c) =>
                              c.id === cert.id
                                ? {
                                    ...c,
                                    issuingOrganization: e.target.value,
                                  }
                                : c
                            ),
                          }))
                        }
                        placeholder="e.g., Amazon Web Services"
                        className={inputBaseClass}
                      />
                    </FormField>
                    <FormField id={`cert-date-${cert.id}`} label="Issue Month">
                      <input
                        id={`cert-date-${cert.id}`}
                        type="month"
                        value={cert.issueDate}
                        onChange={(e) =>
                          updateActiveDocument((current) => ({
                            ...current,
                            certifications: current.certifications.map((c) =>
                              c.id === cert.id
                                ? { ...c, issueDate: e.target.value }
                                : c
                            ),
                          }))
                        }
                        className={inputBaseClass}
                      />
                    </FormField>
                    <FormField
                      id={`cert-url-${cert.id}`}
                      label="Credential URL (Optional)"
                    >
                      <input
                        id={`cert-url-${cert.id}`}
                        type="url"
                        value={cert.credentialUrl}
                        onChange={(e) =>
                          updateActiveDocument((current) => ({
                            ...current,
                            certifications: current.certifications.map((c) =>
                              c.id === cert.id
                                ? { ...c, credentialUrl: e.target.value }
                                : c
                            ),
                          }))
                        }
                        placeholder="credly.com/badges/..."
                        className={inputBaseClass}
                      />
                    </FormField>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. AWARDS */}
      {activeTab === 'awards' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#738078]">
              Honors, scholarships, and workplace recognitions.
            </p>
            <button
              type="button"
              onClick={() =>
                updateActiveDocument((current) => ({
                  ...current,
                  awards: [
                    ...current.awards,
                    {
                      id: createId('aw'),
                      title: '',
                      issuingOrganization: '',
                      date: '',
                      description: '',
                      displayOrder: current.awards.length,
                    },
                  ],
                }))
              }
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#183B36] px-3.5 py-2 text-xs font-medium text-white hover:bg-[#122D29]"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              Add Award
            </button>
          </div>

          {awards.length === 0 ? (
            <EmptyState
              icon={Award}
              title="No awards added"
              description="Include professional recognitions, academic honors, or distinctions."
              actionLabel="Add Award"
              onAction={() =>
                updateActiveDocument((current) => ({
                  ...current,
                  awards: [
                    {
                      id: createId('aw'),
                      title: '',
                      issuingOrganization: '',
                      date: '',
                      description: '',
                      displayOrder: 0,
                    },
                  ],
                }))
              }
            />
          ) : (
            <div className="space-y-4">
              {awards.map((aw, idx) => (
                <div
                  key={aw.id}
                  className="space-y-3 rounded-xl border border-[#E4E1D9] bg-white p-5"
                >
                  <div className="flex items-center justify-between border-b border-[#E4E1D9] pb-3">
                    <h3 className="text-sm font-semibold text-[#293330]">
                      {aw.title.trim() || `Award #${idx + 1}`}
                    </h3>
                    <button
                      type="button"
                      onClick={() =>
                        updateActiveDocument((current) => ({
                          ...current,
                          awards: reindexDisplayOrder(
                            current.awards.filter((a) => a.id !== aw.id)
                          ),
                        }))
                      }
                      aria-label={`Delete ${aw.title || 'award'}`}
                      className="rounded border border-[#E4E1D9] p-1.5 text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <FormField id={`aw-title-${aw.id}`} label="Award Title">
                      <input
                        id={`aw-title-${aw.id}`}
                        type="text"
                        value={aw.title}
                        onChange={(e) =>
                          updateActiveDocument((current) => ({
                            ...current,
                            awards: current.awards.map((a) =>
                              a.id === aw.id
                                ? { ...a, title: e.target.value }
                                : a
                            ),
                          }))
                        }
                        className={inputBaseClass}
                      />
                    </FormField>
                    <FormField id={`aw-org-${aw.id}`} label="Organization">
                      <input
                        id={`aw-org-${aw.id}`}
                        type="text"
                        value={aw.issuingOrganization}
                        onChange={(e) =>
                          updateActiveDocument((current) => ({
                            ...current,
                            awards: current.awards.map((a) =>
                              a.id === aw.id
                                ? {
                                    ...a,
                                    issuingOrganization: e.target.value,
                                  }
                                : a
                            ),
                          }))
                        }
                        className={inputBaseClass}
                      />
                    </FormField>
                    <FormField id={`aw-date-${aw.id}`} label="Month">
                      <input
                        id={`aw-date-${aw.id}`}
                        type="month"
                        value={aw.date}
                        onChange={(e) =>
                          updateActiveDocument((current) => ({
                            ...current,
                            awards: current.awards.map((a) =>
                              a.id === aw.id
                                ? { ...a, date: e.target.value }
                                : a
                            ),
                          }))
                        }
                        className={inputBaseClass}
                      />
                    </FormField>
                    <FormField
                      id={`aw-desc-${aw.id}`}
                      label="Description"
                      className="sm:col-span-3"
                    >
                      <textarea
                        id={`aw-desc-${aw.id}`}
                        rows={2}
                        value={aw.description}
                        onChange={(e) =>
                          updateActiveDocument((current) => ({
                            ...current,
                            awards: current.awards.map((a) =>
                              a.id === aw.id
                                ? { ...a, description: e.target.value }
                                : a
                            ),
                          }))
                        }
                        className={inputBaseClass}
                      />
                    </FormField>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. VOLUNTEER EXPERIENCE */}
      {activeTab === 'volunteer' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#738078]">
              Community leadership, mentorship, or pro-bono contributions.
            </p>
            <button
              type="button"
              onClick={() =>
                updateActiveDocument((current) => ({
                  ...current,
                  volunteerExperience: [
                    ...current.volunteerExperience,
                    {
                      id: createId('vol'),
                      role: '',
                      organization: '',
                      location: '',
                      startDate: '',
                      endDate: '',
                      description: '',
                      displayOrder: current.volunteerExperience.length,
                    },
                  ],
                }))
              }
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#183B36] px-3.5 py-2 text-xs font-medium text-white hover:bg-[#122D29]"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              Add Volunteer Role
            </button>
          </div>

          {volunteer.length === 0 ? (
            <EmptyState
              icon={HeartHandshake}
              title="No volunteer experience added"
              description="Record mentoring, open-source stewardship, or nonprofit contributions."
              actionLabel="Add Volunteer Role"
              onAction={() =>
                updateActiveDocument((current) => ({
                  ...current,
                  volunteerExperience: [
                    {
                      id: createId('vol'),
                      role: '',
                      organization: '',
                      location: '',
                      startDate: '',
                      endDate: '',
                      description: '',
                      displayOrder: 0,
                    },
                  ],
                }))
              }
            />
          ) : (
            <div className="space-y-4">
              {volunteer.map((vol, idx) => {
                const dateCheck = validateDateRange(
                  vol.startDate,
                  vol.endDate,
                  false
                );
                return (
                  <div
                    key={vol.id}
                    className="space-y-3 rounded-xl border border-[#E4E1D9] bg-white p-5"
                  >
                    <div className="flex items-center justify-between border-b border-[#E4E1D9] pb-3">
                      <h3 className="text-sm font-semibold text-[#293330]">
                        {vol.role.trim() || `Volunteer Role #${idx + 1}`}
                      </h3>
                      <button
                        type="button"
                        onClick={() =>
                          updateActiveDocument((current) => ({
                            ...current,
                            volunteerExperience: reindexDisplayOrder(
                              current.volunteerExperience.filter(
                                (v) => v.id !== vol.id
                              )
                            ),
                          }))
                        }
                        aria-label={`Delete ${vol.role || 'volunteer role'}`}
                        className="rounded border border-[#E4E1D9] p-1.5 text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <FormField id={`vol-role-${vol.id}`} label="Role">
                        <input
                          id={`vol-role-${vol.id}`}
                          type="text"
                          value={vol.role}
                          onChange={(e) =>
                            updateActiveDocument((current) => ({
                              ...current,
                              volunteerExperience:
                                current.volunteerExperience.map((v) =>
                                  v.id === vol.id
                                    ? { ...v, role: e.target.value }
                                    : v
                                ),
                            }))
                          }
                          className={inputBaseClass}
                        />
                      </FormField>
                      <FormField
                        id={`vol-org-${vol.id}`}
                        label="Organization"
                      >
                        <input
                          id={`vol-org-${vol.id}`}
                          type="text"
                          value={vol.organization}
                          onChange={(e) =>
                            updateActiveDocument((current) => ({
                              ...current,
                              volunteerExperience:
                                current.volunteerExperience.map((v) =>
                                  v.id === vol.id
                                    ? { ...v, organization: e.target.value }
                                    : v
                                ),
                            }))
                          }
                          className={inputBaseClass}
                        />
                      </FormField>
                      <FormField
                        id={`vol-start-${vol.id}`}
                        label="Start Month"
                      >
                        <input
                          id={`vol-start-${vol.id}`}
                          type="month"
                          value={vol.startDate}
                          onChange={(e) =>
                            updateActiveDocument((current) => ({
                              ...current,
                              volunteerExperience:
                                current.volunteerExperience.map((v) =>
                                  v.id === vol.id
                                    ? { ...v, startDate: e.target.value }
                                    : v
                                ),
                            }))
                          }
                          className={inputBaseClass}
                        />
                      </FormField>
                      <FormField
                        id={`vol-end-${vol.id}`}
                        label="End Month"
                        error={!dateCheck.valid ? dateCheck.error : undefined}
                      >
                        <input
                          id={`vol-end-${vol.id}`}
                          type="month"
                          value={vol.endDate}
                          onChange={(e) =>
                            updateActiveDocument((current) => ({
                              ...current,
                              volunteerExperience:
                                current.volunteerExperience.map((v) =>
                                  v.id === vol.id
                                    ? { ...v, endDate: e.target.value }
                                    : v
                                ),
                            }))
                          }
                          className={inputBaseClass}
                        />
                      </FormField>
                      <FormField
                        id={`vol-desc-${vol.id}`}
                        label="Description"
                        className="sm:col-span-2"
                      >
                        <textarea
                          id={`vol-desc-${vol.id}`}
                          rows={2}
                          value={vol.description}
                          onChange={(e) =>
                            updateActiveDocument((current) => ({
                              ...current,
                              volunteerExperience:
                                current.volunteerExperience.map((v) =>
                                  v.id === vol.id
                                    ? { ...v, description: e.target.value }
                                    : v
                                ),
                            }))
                          }
                          className={inputBaseClass}
                        />
                      </FormField>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 6. CUSTOM SECTIONS */}
      {activeTab === 'custom' && (
        <div className="space-y-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const title = newCustomTitle.trim() || 'Publications';
              const customId = createId('cust');
              updateActiveDocument((current) => ({
                ...current,
                customSections: [
                  ...current.customSections,
                  {
                    id: customId,
                    title,
                    description: '',
                    entries: [
                      {
                        id: createId('centry'),
                        title: '',
                        subtitle: '',
                        date: '',
                        description: '',
                      },
                    ],
                    visible: true,
                    displayOrder: current.customSections.length,
                  },
                ],
                sectionConfiguration: [
                  ...current.sectionConfiguration,
                  {
                    id: `custom:${customId}`,
                    kind: 'custom',
                    label: title,
                    visible: true,
                    displayOrder: current.sectionConfiguration.length,
                  },
                ],
              }));
              setNewCustomTitle('');
            }}
            className="flex flex-wrap items-end gap-3 rounded-xl border border-[#E4E1D9] bg-white p-4"
          >
            <FormField
              id="new-custom-section-title"
              label="Create a Custom Section"
              className="flex-1"
            >
              <input
                id="new-custom-section-title"
                type="text"
                value={newCustomTitle}
                onChange={(e) => setNewCustomTitle(e.target.value)}
                placeholder="e.g., Publications, Speaking, Patents"
                className={inputBaseClass}
              />
            </FormField>
            <button
              type="submit"
              className="inline-flex h-[38px] items-center gap-1.5 rounded-lg bg-[#183B36] px-4 text-xs font-medium text-white hover:bg-[#122D29]"
            >
              <PlusSquare className="h-3.5 w-3.5" aria-hidden="true" />
              Add Custom Section
            </button>
          </form>

          {doc.customSections.length === 0 ? (
            <EmptyState
              icon={PlusSquare}
              title="No custom sections created"
              description="Create tailored sections such as Publications, Speaking Engagements, Patents, or Board Roles."
            />
          ) : (
            <div className="space-y-4">
              {doc.customSections.map((cs) => (
                <div
                  key={cs.id}
                  className="space-y-4 rounded-xl border border-[#E4E1D9] bg-white p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E4E1D9] pb-3">
                    <input
                      type="text"
                      value={cs.title}
                      onChange={(e) => {
                        const nextTitle = e.target.value;
                        updateActiveDocument((current) => ({
                          ...current,
                          customSections: current.customSections.map((s) =>
                            s.id === cs.id ? { ...s, title: nextTitle } : s
                          ),
                          sectionConfiguration:
                            current.sectionConfiguration.map((sc) =>
                              sc.id === `custom:${cs.id}`
                                ? {
                                    ...sc,
                                    label: nextTitle.trim() || 'Custom Section',
                                  }
                                : sc
                            ),
                        }));
                      }}
                      aria-label="Custom section title"
                      className={`${inputBaseClass} max-w-xs font-semibold`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        updateActiveDocument((current) => ({
                          ...current,
                          customSections: current.customSections.filter(
                            (s) => s.id !== cs.id
                          ),
                          sectionConfiguration: reindexDisplayOrder(
                            current.sectionConfiguration.filter(
                              (sc) => sc.id !== `custom:${cs.id}`
                            )
                          ),
                        }))
                      }
                      aria-label={`Delete custom section ${cs.title}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-[#E4E1D9] px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      Delete Section
                    </button>
                  </div>

                  <FormField
                    id={`custom-desc-${cs.id}`}
                    label="Section Overview (Optional)"
                  >
                    <input
                      id={`custom-desc-${cs.id}`}
                      type="text"
                      value={cs.description}
                      onChange={(e) =>
                        updateActiveDocument((current) => ({
                          ...current,
                          customSections: current.customSections.map((s) =>
                            s.id === cs.id
                              ? { ...s, description: e.target.value }
                              : s
                          ),
                        }))
                      }
                      className={inputBaseClass}
                    />
                  </FormField>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#293330]">
                        Entries
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateActiveDocument((current) => ({
                            ...current,
                            customSections: current.customSections.map((s) =>
                              s.id === cs.id
                                ? {
                                    ...s,
                                    entries: [
                                      ...s.entries,
                                      {
                                        id: createId('centry'),
                                        title: '',
                                        subtitle: '',
                                        date: '',
                                        description: '',
                                      },
                                    ],
                                  }
                                : s
                            ),
                          }))
                        }
                        className="inline-flex items-center gap-1 rounded border border-[#E4E1D9] bg-[#F6F3ED] px-2.5 py-1 text-xs font-medium text-[#183B36]"
                      >
                        <Plus className="h-3 w-3" aria-hidden="true" />
                        Add Entry
                      </button>
                    </div>

                    {cs.entries.map((entry) => (
                      <div
                        key={entry.id}
                        className="grid grid-cols-1 gap-2.5 rounded-lg border border-[#E4E1D9] bg-[#F6F3ED]/40 p-3 sm:grid-cols-3"
                      >
                        <input
                          type="text"
                          value={entry.title}
                          onChange={(e) =>
                            updateActiveDocument((current) => ({
                              ...current,
                              customSections: current.customSections.map((s) =>
                                s.id === cs.id
                                  ? {
                                      ...s,
                                      entries: s.entries.map((en) =>
                                        en.id === entry.id
                                          ? { ...en, title: e.target.value }
                                          : en
                                      ),
                                    }
                                  : s
                              ),
                            }))
                          }
                          placeholder="Entry title"
                          aria-label="Custom entry title"
                          className={inputBaseClass}
                        />
                        <input
                          type="text"
                          value={entry.subtitle}
                          onChange={(e) =>
                            updateActiveDocument((current) => ({
                              ...current,
                              customSections: current.customSections.map((s) =>
                                s.id === cs.id
                                  ? {
                                      ...s,
                                      entries: s.entries.map((en) =>
                                        en.id === entry.id
                                          ? { ...en, subtitle: e.target.value }
                                          : en
                                      ),
                                    }
                                  : s
                              ),
                            }))
                          }
                          placeholder="Publisher / Venue"
                          aria-label="Custom entry subtitle"
                          className={inputBaseClass}
                        />
                        <div className="flex items-center gap-1.5">
                          <input
                            type="month"
                            value={entry.date}
                            onChange={(e) =>
                              updateActiveDocument((current) => ({
                                ...current,
                                customSections: current.customSections.map((s) =>
                                  s.id === cs.id
                                    ? {
                                        ...s,
                                        entries: s.entries.map((en) =>
                                          en.id === entry.id
                                            ? { ...en, date: e.target.value }
                                            : en
                                        ),
                                      }
                                    : s
                                ),
                              }))
                            }
                            aria-label="Custom entry month"
                            className={inputBaseClass}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              updateActiveDocument((current) => ({
                                ...current,
                                customSections: current.customSections.map((s) =>
                                  s.id === cs.id
                                    ? {
                                        ...s,
                                        entries: s.entries.filter(
                                          (en) => en.id !== entry.id
                                        ),
                                      }
                                    : s
                                ),
                              }))
                            }
                            aria-label="Remove custom entry"
                            className="rounded border border-[#E4E1D9] bg-white p-2 text-red-700"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <textarea
                          rows={2}
                          value={entry.description}
                          onChange={(e) =>
                            updateActiveDocument((current) => ({
                              ...current,
                              customSections: current.customSections.map((s) =>
                                s.id === cs.id
                                  ? {
                                      ...s,
                                      entries: s.entries.map((en) =>
                                        en.id === entry.id
                                          ? {
                                              ...en,
                                              description: e.target.value,
                                            }
                                          : en
                                      ),
                                    }
                                  : s
                              ),
                            }))
                          }
                          placeholder="Details..."
                          aria-label="Custom entry description"
                          className={`${inputBaseClass} sm:col-span-3`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 7. SECTION ORDER & VISIBILITY */}
      {activeTab === 'order' && (
        <div className="space-y-4">
          <div className="flex items-start gap-2.5 rounded-xl border border-[#E4E1D9] bg-white p-4 text-xs leading-relaxed text-[#738078]">
            <ListOrdered
              className="mt-0.5 h-4 w-4 shrink-0 text-[#183B36]"
              aria-hidden="true"
            />
            <span>
              Reorder or hide sections below. Both your live A4 canvas and exported PDF follow this exact sequence. Empty sections remain hidden automatically.
            </span>
          </div>

          <div className="divide-y divide-[#E4E1D9] rounded-xl border border-[#E4E1D9] bg-white">
            {sectionOrder.map((sec, idx) => (
              <div
                key={sec.id}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="w-5 text-xs font-semibold text-[#738078] tabular-nums">
                    {idx + 1}.
                  </span>
                  <div>
                    <div className="text-sm font-medium text-[#293330]">
                      {sec.label}
                    </div>
                    <div className="text-[11px] text-[#738078]">
                      {sec.visible ? 'Visible when populated' : 'Hidden from document'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => toggleSectionVisibility(sec.id)}
                    aria-label={`${sec.visible ? 'Hide' : 'Show'} ${sec.label} section`}
                    className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                      sec.visible
                        ? 'border-[#E4E1D9] bg-white text-[#293330] hover:bg-[#F6F3ED]'
                        : 'border-[#D69A43]/40 bg-[#FBF4E7] text-[#8E5F1A]'
                    }`}
                  >
                    {sec.visible ? (
                      <>
                        <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                        Visible
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                        Hidden
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveSectionOrder(idx, -1)}
                    aria-label={`Move ${sec.label} up`}
                    className="rounded-lg border border-[#E4E1D9] p-1.5 text-[#738078] hover:bg-[#F6F3ED] disabled:opacity-40"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === sectionOrder.length - 1}
                    onClick={() => moveSectionOrder(idx, 1)}
                    aria-label={`Move ${sec.label} down`}
                    className="rounded-lg border border-[#E4E1D9] p-1.5 text-[#738078] hover:bg-[#F6F3ED] disabled:opacity-40"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
