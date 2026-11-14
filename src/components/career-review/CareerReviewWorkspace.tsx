import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  SearchCheck,
  Sparkles,
} from 'lucide-react';
import { analyzeJobFit } from '../../lib/analysis/job-fit-analysis';
import { evaluateResumeReadiness } from '../../lib/analysis/readiness-score';
import { selectActiveDocument, useResumeStore } from '../../lib/resume/store';
import { runWritingQualityChecks } from '../../lib/writing/bullet-improvements';
import { inputBaseClass } from '../shared/FormField';

export const CareerReviewWorkspace: React.FC = () => {
  const doc = useResumeStore(selectActiveDocument);
  const updateActiveDocument = useResumeStore((s) => s.updateActiveDocument);
  const setActiveSection = useResumeStore((s) => s.setActiveSection);

  const [reviewTab, setReviewTab] = useState<'readiness' | 'jobfit' | 'coach'>(
    'readiness'
  );

  const readiness = useMemo(() => evaluateResumeReadiness(doc), [doc]);
  const writingIssues = useMemo(() => runWritingQualityChecks(doc), [doc]);
  const jobFit = useMemo(
    () => analyzeJobFit(doc, doc.targetJobDescription),
    [doc]
  );

  return (
    <div className="space-y-6">
      <div className="border-b border-[#E4E1D9] pb-5">
        <h2 className="font-editorial text-2xl font-semibold text-[#293330]">
          Career Review & Job Fit Lab
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-[#738078]">
          Evaluate your document against structured quality checks, review Writing Coach observations, and compare your resume locally against a target job description.
        </p>
      </div>

      {/* Mode Switch */}
      <div
        role="tablist"
        aria-label="Career review tools"
        className="flex flex-wrap gap-1.5 rounded-xl border border-[#E4E1D9] bg-white p-1.5"
      >
        <button
          type="button"
          role="tab"
          aria-selected={reviewTab === 'readiness'}
          onClick={() => setReviewTab('readiness')}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
            reviewTab === 'readiness'
              ? 'bg-[#183B36] text-white'
              : 'text-[#738078] hover:bg-[#F6F3ED] hover:text-[#293330]'
          }`}
        >
          <ClipboardCheck className="h-3.5 w-3.5" aria-hidden="true" />
          Readiness Estimate ({readiness.score}/100)
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={reviewTab === 'jobfit'}
          onClick={() => setReviewTab('jobfit')}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
            reviewTab === 'jobfit'
              ? 'bg-[#183B36] text-white'
              : 'text-[#738078] hover:bg-[#F6F3ED] hover:text-[#293330]'
          }`}
        >
          <SearchCheck className="h-3.5 w-3.5" aria-hidden="true" />
          Job Fit Lab
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={reviewTab === 'coach'}
          onClick={() => setReviewTab('coach')}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
            reviewTab === 'coach'
              ? 'bg-[#183B36] text-white'
              : 'text-[#738078] hover:bg-[#F6F3ED] hover:text-[#293330]'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          Writing Quality ({writingIssues.length})
        </button>
      </div>

      {/* TAB 1: RESUME READINESS ESTIMATE */}
      {reviewTab === 'readiness' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-[#E4E1D9] bg-white p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold tracking-wide text-[#738078] uppercase">
                  Resume Readiness Estimate
                </span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span
                    data-testid="readiness-score-value"
                    className="font-editorial text-4xl font-semibold text-[#183B36] tabular-nums"
                  >
                    {readiness.score}
                  </span>
                  <span className="text-sm text-[#738078] tabular-nums">
                    / {readiness.maxScore}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[#738078]">
                  Calculated locally from your actual profile, experience, skills, education, and date consistency. Not a third-party ATS guarantee.
                </p>
              </div>
              <div className="w-full sm:w-56">
                <div className="flex justify-between text-xs font-medium text-[#293330] tabular-nums">
                  <span>Completion</span>
                  <span>{readiness.score}%</span>
                </div>
                <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-[#ECE8DF]">
                  <div
                    className="h-full rounded-full bg-[#183B36] transition-all"
                    style={{ width: `${readiness.score}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="mt-6 grid grid-cols-1 gap-3 border-t border-[#E4E1D9] pt-5 sm:grid-cols-2">
              {readiness.categories.map((cat) => (
                <div
                  key={cat.name}
                  className="flex items-center justify-between rounded-lg border border-[#E4E1D9] bg-[#F6F3ED]/40 px-3.5 py-2.5 text-xs"
                >
                  <span className="font-medium text-[#293330]">{cat.name}</span>
                  <span className="font-semibold text-[#183B36] tabular-nums">
                    {cat.earned} / {cat.max}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          {readiness.recommendations.length > 0 && (
            <div className="rounded-xl border border-[#E4E1D9] bg-white p-5">
              <h3 className="text-sm font-semibold text-[#293330]">
                Priority Improvements ({readiness.recommendations.length})
              </h3>
              <div className="mt-3 divide-y divide-[#E4E1D9]">
                {readiness.recommendations.map((rec) => (
                  <div
                    key={rec.id}
                    className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-1 last:pb-1"
                  >
                    <div className="flex items-start gap-2.5">
                      <AlertCircle
                        className="mt-0.5 h-4 w-4 shrink-0 text-[#B65E45]"
                        aria-hidden="true"
                      />
                      <div>
                        <div className="text-xs font-semibold text-[#293330]">
                          {rec.title}
                        </div>
                        <p className="mt-0.5 text-xs text-[#738078]">
                          {rec.detail}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveSection(rec.targetSection)}
                      className="inline-flex items-center gap-1 rounded-lg border border-[#E4E1D9] bg-[#F6F3ED] px-3 py-1.5 text-xs font-semibold text-[#183B36] hover:bg-[#EAE5DA]"
                    >
                      Fix in Editor
                      <ArrowRight className="h-3 w-3" aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completed Checks */}
          <div className="rounded-xl border border-[#E4E1D9] bg-white p-5">
            <h3 className="text-sm font-semibold text-[#293330]">
              Completed Checks ({readiness.completedChecks.length})
            </h3>
            {readiness.completedChecks.length === 0 ? (
              <p className="mt-2 text-xs text-[#738078]">
                No checks completed yet. Start by filling out your Personal Profile.
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {readiness.completedChecks.map((check) => (
                  <li
                    key={check.id}
                    className="flex items-center justify-between gap-2 text-xs text-[#293330]"
                  >
                    <span className="flex items-center gap-2">
                      <CheckCircle2
                        className="h-4 w-4 shrink-0 text-[#183B36]"
                        aria-hidden="true"
                      />
                      {check.label}
                    </span>
                    <span className="font-medium text-[#738078] tabular-nums">
                      +{check.pointsEarned} pts
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: JOB FIT LAB */}
      {reviewTab === 'jobfit' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-[#E4E1D9] bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label
                htmlFor="job-fit-textarea"
                className="text-sm font-semibold text-[#293330]"
              >
                Target Job Description
              </label>
              <span className="text-[11px] text-[#738078]">
                Analyzed 100% locally in your browser · No external AI calls
              </span>
            </div>
            <textarea
              id="job-fit-textarea"
              rows={6}
              value={doc.targetJobDescription}
              onChange={(e) =>
                updateActiveDocument((current) => ({
                  ...current,
                  targetJobDescription: e.target.value,
                }))
              }
              placeholder="Paste a job description here to compare required skills, tools, and role terms against your current resume..."
              className={`${inputBaseClass} mt-2.5 resize-y leading-relaxed`}
            />
            {doc.targetJobDescription.trim() && (
              <div className="mt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() =>
                    updateActiveDocument((current) => ({
                      ...current,
                      targetJobDescription: '',
                    }))
                  }
                  className="text-xs font-medium text-[#738078] hover:text-[#293330]"
                >
                  Clear Job Description
                </button>
              </div>
            )}
          </div>

          {!jobFit.hasJobDescription ? (
            <div className="rounded-xl border border-dashed border-[#E4E1D9] bg-white/60 p-8 text-center">
              <p className="text-sm font-medium text-[#293330]">
                Paste a job description above to begin local keyword comparison
              </p>
              <p className="mt-1 text-xs text-[#738078]">
                CLOVER identifies matching terms, highlights potentially missing terms for your review, and never adds unverified skills automatically.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Coverage Summary */}
              <div className="rounded-xl border border-[#E4E1D9] bg-white p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-semibold text-[#738078] uppercase">
                      Keyword Coverage Estimate
                    </span>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span
                        data-testid="jobfit-coverage-value"
                        className="font-editorial text-3xl font-semibold text-[#183B36] tabular-nums"
                      >
                        {jobFit.coveragePercent}%
                      </span>
                      <span className="text-xs text-[#738078] tabular-nums">
                        ({jobFit.matchingKeywords.length} of{' '}
                        {jobFit.totalKeywords} extracted terms matched)
                      </span>
                    </div>
                  </div>
                  <p className="max-w-xs text-xs leading-relaxed text-[#738078]">
                    Term comparison is an editorial aid only. Only include missing skills that genuinely reflect your real experience.
                  </p>
                </div>
              </div>

              {/* Found vs Missing Keywords */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-[#E4E1D9] bg-white p-5">
                  <h3 className="text-sm font-semibold text-[#183B36]">
                    Keywords Found ({jobFit.matchingKeywords.length})
                  </h3>
                  {jobFit.matchingKeywords.length === 0 ? (
                    <p className="mt-2 text-xs text-[#738078]">
                      No extracted keywords matched your resume text yet.
                    </p>
                  ) : (
                    <ul className="mt-3 space-y-1.5 text-xs text-[#293330]">
                      {jobFit.matchingKeywords.map((kw) => (
                        <li
                          key={kw.normalized}
                          className="flex items-center justify-between border-b border-[#E4E1D9]/60 py-1 last:border-0"
                        >
                          <span className="font-medium">{kw.term}</span>
                          <span className="text-[#183B36]">Matched</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="rounded-xl border border-[#E4E1D9] bg-white p-5">
                  <h3 className="text-sm font-semibold text-[#B65E45]">
                    Potentially Missing Keywords ({jobFit.missingKeywords.length})
                  </h3>
                  {jobFit.missingKeywords.length === 0 ? (
                    <p className="mt-2 text-xs text-[#738078]">
                      All extracted terms appear in your resume.
                    </p>
                  ) : (
                    <ul className="mt-3 space-y-1.5 text-xs text-[#293330]">
                      {jobFit.missingKeywords.map((kw) => (
                        <li
                          key={kw.normalized}
                          className="flex items-center justify-between border-b border-[#E4E1D9]/60 py-1 last:border-0"
                        >
                          <span className="font-medium">{kw.term}</span>
                          <span className="text-[#738078]">Verify if applicable</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Section Feedback & Recommendations */}
              <div className="rounded-xl border border-[#E4E1D9] bg-white p-5">
                <h3 className="text-sm font-semibold text-[#293330]">
                  Section Alignment & Recommendations
                </h3>
                <div className="mt-3 divide-y divide-[#E4E1D9]">
                  {jobFit.sectionChecks.map((sc) => (
                    <div
                      key={sc.sectionName}
                      className="flex flex-wrap items-center justify-between gap-2 py-2.5"
                    >
                      <div>
                        <div className="text-xs font-semibold text-[#293330]">
                          {sc.sectionName}
                        </div>
                        <p className="text-xs text-[#738078]">{sc.note}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveSection(sc.targetSection)}
                        className="rounded-md border border-[#E4E1D9] bg-[#F6F3ED] px-2.5 py-1 text-xs font-medium text-[#183B36] hover:bg-[#EAE5DA]"
                      >
                        Review Section
                      </button>
                    </div>
                  ))}
                </div>
                {jobFit.recommendations.length > 0 && (
                  <ul className="mt-4 space-y-1.5 border-t border-[#E4E1D9] pt-3 text-xs text-[#293330]">
                    {jobFit.recommendations.map((rec, i) => (
                      <li key={i} className="leading-relaxed">
                        • {rec}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: WRITING QUALITY CHECKS */}
      {reviewTab === 'coach' && (
        <div className="rounded-xl border border-[#E4E1D9] bg-white p-5">
          <h3 className="text-sm font-semibold text-[#293330]">
            Writing Coach Observations
          </h3>
          <p className="mt-1 text-xs text-[#738078]">
            Local phrasing checks for weak verbs, repetition, overly brief descriptions, and incomplete entries.
          </p>

          {writingIssues.length === 0 ? (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-[#183B36]/20 bg-[#F6F3ED] p-4 text-xs font-medium text-[#183B36]">
              <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
              No phrasing issues detected across your summary and experience bullets.
            </div>
          ) : (
            <div className="mt-4 divide-y divide-[#E4E1D9]">
              {writingIssues.map((issue) => (
                <div
                  key={issue.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3"
                >
                  <div>
                    <div className="text-xs font-semibold text-[#293330]">
                      {issue.location}
                    </div>
                    <p className="mt-0.5 text-xs text-[#738078]">
                      {issue.message}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveSection(issue.targetSection)}
                    className="rounded-md border border-[#E4E1D9] bg-[#F6F3ED] px-2.5 py-1 text-xs font-medium text-[#183B36] hover:bg-[#EAE5DA]"
                  >
                    Edit
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
