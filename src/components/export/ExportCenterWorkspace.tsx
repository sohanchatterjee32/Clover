import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileCheck2,
  Loader2,
} from 'lucide-react';
import { ACCENT_PALETTES } from '../../lib/resume/initial-data';
import { selectActiveDocument, useResumeStore } from '../../lib/resume/store';
import { hasInvalidExperienceDates } from '../../lib/resume/validation';
import { getTemplateMetadata } from '../../lib/templates/template-registry';
import { buildResumePdfFilename } from '../../lib/utils/filename';

interface ExportCenterWorkspaceProps {
  pageCount: number;
  isExporting: boolean;
  exportProgress: { label: string; percent: number } | null;
  lastExportResult: {
    ok: boolean;
    filename?: string;
    pageCount?: number;
    error?: string;
  } | null;
  onTriggerPdfExport: () => void;
}

export const ExportCenterWorkspace: React.FC<ExportCenterWorkspaceProps> = ({
  pageCount,
  isExporting,
  exportProgress,
  lastExportResult,
  onTriggerPdfExport,
}) => {
  const doc = useResumeStore(selectActiveDocument);
  const setActiveSection = useResumeStore((s) => s.setActiveSection);

  const templateMeta = getTemplateMetadata(doc.selectedTemplate);
  const accentMeta = ACCENT_PALETTES[doc.designConfiguration.accentColor];
  const expectedFilename = buildResumePdfFilename(
    doc.personal.fullName,
    doc.name
  );
  const hasDateWarnings = hasInvalidExperienceDates(doc);
  const hasPhoto = Boolean(
    doc.personal.profilePhotoRef && doc.designConfiguration.showPhoto
  );

  return (
    <div className="space-y-6">
      <div className="border-b border-[#E4E1D9] pb-5">
        <h2 className="font-editorial text-2xl font-semibold text-[#293330]">
          Export Center
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-[#738078]">
          Generate a multi-page A4 PDF directly in your browser using the exact same layout, typography, accent color, section order, and portrait photo shown on the document canvas.
        </p>
      </div>

      {/* Document Summary Card */}
      <div className="rounded-xl border border-[#E4E1D9] bg-white p-6">
        <div className="flex items-center gap-2.5">
          <FileCheck2 className="h-5 w-5 text-[#183B36]" aria-hidden="true" />
          <h3 className="text-base font-semibold text-[#293330]">
            Ready-to-Export Configuration
          </h3>
        </div>

        <dl className="mt-4 grid grid-cols-1 gap-4 border-t border-[#E4E1D9] pt-4 text-xs sm:grid-cols-2">
          <div>
            <dt className="text-[#738078]">Output Filename</dt>
            <dd className="mt-1 font-mono font-medium text-[#293330]">
              {expectedFilename}
            </dd>
          </div>
          <div>
            <dt className="text-[#738078]">Page Format & Count</dt>
            <dd className="mt-1 font-semibold text-[#293330] tabular-nums">
              A4 Portrait · {pageCount} {pageCount === 1 ? 'page' : 'pages'}
            </dd>
          </div>
          <div>
            <dt className="text-[#738078]">Selected Design</dt>
            <dd className="mt-1 font-semibold text-[#293330]">
              {templateMeta.name} ({templateMeta.tagline})
            </dd>
          </div>
          <div>
            <dt className="text-[#738078]">Accent & Portrait</dt>
            <dd className="mt-1 flex items-center gap-2 font-medium text-[#293330]">
              <span
                aria-hidden="true"
                className="inline-block h-3 w-3 rounded-sm"
                style={{ backgroundColor: accentMeta.hex }}
              />
              <span>
                {accentMeta.name} ·{' '}
                {hasPhoto ? 'Profile photo enabled' : 'No photo shown'}
              </span>
            </dd>
          </div>
        </dl>

        {hasDateWarnings && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#D69A43]/50 bg-[#FBF4E7] p-3 text-xs text-[#293330]">
            <div className="flex items-center gap-2">
              <AlertTriangle
                className="h-4 w-4 shrink-0 text-[#9A6B21]"
                aria-hidden="true"
              />
              <span>
                One or more entries have an end date earlier than the start date.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setActiveSection('experience')}
              className="font-semibold text-[#183B36] underline"
            >
              Review Dates
            </button>
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={isExporting}
            onClick={onTriggerPdfExport}
            className="inline-flex items-center gap-2 rounded-lg bg-[#183B36] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#122D29] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#183B36]"
          >
            {isExporting ? (
              <>
                <Loader2
                  className="h-4 w-4 animate-spin"
                  aria-hidden="true"
                />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" aria-hidden="true" />
                Download PDF
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('design')}
            className="rounded-lg border border-[#E4E1D9] bg-white px-4 py-2.5 text-xs font-medium text-[#293330] hover:bg-[#F6F3ED]"
          >
            Adjust Design & Spacing
          </button>
        </div>

        {/* Live Export Progress */}
        {exportProgress && isExporting && (
          <div className="mt-5 space-y-1.5 border-t border-[#E4E1D9] pt-4">
            <div className="flex justify-between text-xs text-[#293330]">
              <span>{exportProgress.label}</span>
              <span className="font-medium tabular-nums">
                {exportProgress.percent}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[#ECE8DF]">
              <div
                className="h-full rounded-full bg-[#183B36] transition-all"
                style={{ width: `${exportProgress.percent}%` }}
              />
            </div>
          </div>
        )}

        {/* Export Result Feedback */}
        {lastExportResult && !isExporting && (
          <div
            role="status"
            className={`mt-5 flex items-start gap-2.5 rounded-lg border p-3.5 text-xs ${
              lastExportResult.ok
                ? 'border-[#183B36]/25 bg-[#F6F3ED] text-[#183B36]'
                : 'border-red-300 bg-red-50 text-red-700'
            }`}
          >
            {lastExportResult.ok ? (
              <>
                <CheckCircle2
                  className="mt-0.5 h-4 w-4 shrink-0"
                  aria-hidden="true"
                />
                <div>
                  <div className="font-semibold">
                    PDF exported successfully ({lastExportResult.pageCount}{' '}
                    {lastExportResult.pageCount === 1 ? 'page' : 'pages'})
                  </div>
                  <div className="mt-0.5 text-[#293330]">
                    Saved as{' '}
                    <span className="font-mono font-medium">
                      {lastExportResult.filename}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <AlertTriangle
                  className="mt-0.5 h-4 w-4 shrink-0"
                  aria-hidden="true"
                />
                <div>
                  <div className="font-semibold">PDF export failed</div>
                  <div className="mt-0.5">{lastExportResult.error}</div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
