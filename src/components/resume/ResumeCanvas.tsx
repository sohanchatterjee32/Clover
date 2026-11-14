import React, { useEffect, useRef, useState } from 'react';
import { Maximize2, ZoomIn, ZoomOut } from 'lucide-react';
import { A4_HEIGHT_PX, A4_WIDTH_PX } from '../../lib/export/pagination';
import { ACCENT_PALETTES } from '../../lib/resume/initial-data';
import { selectActiveDocument, useResumeStore } from '../../lib/resume/store';
import { getTemplateMetadata } from '../../lib/templates/template-registry';
import { ResumeDocument } from './ResumeDocument';

interface ResumeCanvasProps {
  onPageCountChange?: (count: number) => void;
}

export const ResumeCanvas: React.FC<ResumeCanvasProps> = ({
  onPageCountChange,
}) => {
  const doc = useResumeStore(selectActiveDocument);
  const photoDataUrls = useResumeStore((s) => s.photoDataUrls);
  const photoDataUrl = doc.personal.profilePhotoRef
    ? photoDataUrls[doc.personal.profilePhotoRef] || null
    : null;

  const viewportRef = useRef<HTMLDivElement>(null);
  const [zoomMode, setZoomMode] = useState<'fit' | 'manual'>('fit');
  const [manualZoom, setManualZoom] = useState<number>(0.72);
  const [fitScale, setFitScale] = useState<number>(0.68);
  const [pageCount, setPageCount] = useState<number>(1);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const updateFit = () => {
      const available = Math.max(260, el.clientWidth - 40);
      const nextFit = Math.min(1, Math.max(0.32, available / A4_WIDTH_PX));
      setFitScale(Number(nextFit.toFixed(3)));
    };

    updateFit();
    const ro = new ResizeObserver(updateFit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const effectiveScale = zoomMode === 'fit' ? fitScale : manualZoom;
  const templateMeta = getTemplateMetadata(doc.selectedTemplate);
  const accentMeta = ACCENT_PALETTES[doc.designConfiguration.accentColor];

  const handlePageCount = (count: number) => {
    setPageCount(count);
    onPageCountChange?.(count);
  };

  const adjustZoom = (delta: number) => {
    setZoomMode('manual');
    setManualZoom((prev) => {
      const base = zoomMode === 'fit' ? fitScale : prev;
      return Math.min(1.25, Math.max(0.4, Number((base + delta).toFixed(2))));
    });
  };

  const scaledWidth = Math.round(A4_WIDTH_PX * effectiveScale);
  const totalUnscaledHeight =
    pageCount * A4_HEIGHT_PX + Math.max(0, pageCount - 1) * 24;
  const scaledHeight = Math.round(totalUnscaledHeight * effectiveScale);

  return (
    <section
      aria-label="Live resume document canvas"
      className="flex h-full flex-col bg-[#ECE8DF]"
    >
      {/* Canvas Desk Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E4E1D9] bg-[#F6F3ED] px-4 py-2.5">
        <div className="flex items-center gap-2 text-xs text-[#738078]">
          <span className="font-semibold text-[#293330]">
            {templateMeta.name}
          </span>
          <span aria-hidden="true">·</span>
          <span>{accentMeta.name}</span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">
            {pageCount} {pageCount === 1 ? 'page' : 'pages'} · A4
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => adjustZoom(-0.1)}
            aria-label="Zoom out preview"
            className="rounded-md border border-[#E4E1D9] bg-white p-1.5 text-[#293330] transition-colors hover:bg-[#F6F3ED] focus-visible:outline-2 focus-visible:outline-[#183B36]"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <span className="min-w-[46px] text-center text-xs font-medium text-[#293330] tabular-nums">
            {Math.round(effectiveScale * 100)}%
          </span>
          <button
            type="button"
            onClick={() => adjustZoom(0.1)}
            aria-label="Zoom in preview"
            className="rounded-md border border-[#E4E1D9] bg-white p-1.5 text-[#293330] transition-colors hover:bg-[#F6F3ED] focus-visible:outline-2 focus-visible:outline-[#183B36]"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setZoomMode('fit')}
            className={`ml-1 inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-[#183B36] ${
              zoomMode === 'fit'
                ? 'border-[#183B36] bg-[#183B36] text-white'
                : 'border-[#E4E1D9] bg-white text-[#293330] hover:bg-[#F6F3ED]'
            }`}
          >
            <Maximize2 className="h-3 w-3" aria-hidden="true" />
            Fit
          </button>
        </div>
      </div>

      {/* Desk Scrollable Canvas */}
      <div
        ref={viewportRef}
        data-testid="resume-canvas-viewport"
        className="flex-1 overflow-auto p-5"
      >
        <div
          style={{
            width: `${scaledWidth}px`,
            height: `${scaledHeight}px`,
            margin: '0 auto',
            position: 'relative',
          }}
        >
          <div
            style={{
              width: `${A4_WIDTH_PX}px`,
              transform: `scale(${effectiveScale})`,
              transformOrigin: 'top left',
              boxShadow: '0 8px 28px rgba(24, 59, 54, 0.08)',
            }}
          >
            <ResumeDocument
              doc={doc}
              photoDataUrl={photoDataUrl}
              onPageCountChange={handlePageCount}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
