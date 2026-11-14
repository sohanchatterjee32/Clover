import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  A4_HEIGHT_PX,
  A4_WIDTH_PX,
  paginateBlocks,
} from '../../lib/export/pagination';
import type { ResumeDocument as ResumeDocumentModel } from '../../lib/resume/types';
import {
  buildContourTrackBlocks,
  buildSingleColumnFlowBlocks,
  type ResumeFlowBlock,
} from '../templates/resumeBlocks';
import {
  getDesignMetrics,
  TemplateBlockRenderer,
  TemplateHeaderBlock,
} from '../templates/TemplateBlockRenderer';

interface ResumeDocumentProps {
  doc: ResumeDocumentModel;
  photoDataUrl?: string | null;
  onPageCountChange?: (count: number) => void;
}

export const ResumeDocument: React.FC<ResumeDocumentProps> = ({
  doc,
  photoDataUrl,
  onPageCountChange,
}) => {
  const isContour = doc.selectedTemplate === 'contour';
  const { pagePaddingPx } = getDesignMetrics(doc);
  const contentWidth = A4_WIDTH_PX - pagePaddingPx * 2;
  const pageContentBudget = A4_HEIGHT_PX - pagePaddingPx * 2 - 28;

  const singleFlowBlocks = useMemo(
    () => (isContour ? [] : buildSingleColumnFlowBlocks(doc)),
    [doc, isContour]
  );

  const contourTracks = useMemo(
    () =>
      isContour
        ? buildContourTrackBlocks(doc)
        : { sidebarBlocks: [], mainBlocks: [] },
    [doc, isContour]
  );

  const measureRootRef = useRef<HTMLDivElement>(null);
  const [measuredHeights, setMeasuredHeights] = useState<{
    single: Record<string, number>;
    contourHeader: number;
    contourSidebar: Record<string, number>;
    contourMain: Record<string, number>;
  }>({
    single: {},
    contourHeader: 92,
    contourSidebar: {},
    contourMain: {},
  });

  useLayoutEffect(() => {
    const measure = () => {
      const root = measureRootRef.current;
      if (!root) return;

      if (!isContour) {
        const nextSingle: Record<string, number> = {};
        const els = root.querySelectorAll<HTMLElement>('[data-measure-block]');
        els.forEach((el) => {
          const id = el.getAttribute('data-measure-block');
          if (id) {
            nextSingle[id] = el.getBoundingClientRect().height;
          }
        });
        setMeasuredHeights((prev) => ({ ...prev, single: nextSingle }));
      } else {
        const headerEl = root.querySelector<HTMLElement>('[data-measure-contour-header]');
        const contourHeader = headerEl
          ? headerEl.getBoundingClientRect().height
          : 92;
        const nextSidebar: Record<string, number> = {};
        const nextMain: Record<string, number> = {};

        root
          .querySelectorAll<HTMLElement>('[data-measure-sidebar]')
          .forEach((el) => {
            const id = el.getAttribute('data-measure-sidebar');
            if (id) nextSidebar[id] = el.getBoundingClientRect().height;
          });

        root
          .querySelectorAll<HTMLElement>('[data-measure-main]')
          .forEach((el) => {
            const id = el.getAttribute('data-measure-main');
            if (id) nextMain[id] = el.getBoundingClientRect().height;
          });

        setMeasuredHeights((prev) => ({
          ...prev,
          contourHeader,
          contourSidebar: nextSidebar,
          contourMain: nextMain,
        }));
      }
    };

    measure();
    let cancelled = false;
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      void document.fonts.ready.then(() => {
        if (!cancelled) measure();
      });
    }
    return () => {
      cancelled = true;
    };
  }, [doc, isContour, photoDataUrl, pagePaddingPx]);

  const singlePages = useMemo(() => {
    if (isContour) return [];
    return paginateBlocks(
      singleFlowBlocks,
      measuredHeights.single,
      pageContentBudget,
      36
    );
  }, [isContour, singleFlowBlocks, measuredHeights.single, pageContentBudget]);

  const contourPages = useMemo(() => {
    if (!isContour) return [];
    const firstPageRemainingBudget = Math.max(
      240,
      pageContentBudget - measuredHeights.contourHeader
    );

    const paginateWithFirstBudget = (
      blocks: ResumeFlowBlock[],
      heights: Record<string, number>
    ) => {
      if (blocks.length === 0) return [[]];
      // Adjust first-page check cleanly by packing page 1 with firstPageRemainingBudget, then remaining blocks with pageContentBudget
      const pages: ResumeFlowBlock[][] = [];
      let currentPage: ResumeFlowBlock[] = [];
      let currentUsed = 0;
      let budget = firstPageRemainingBudget;
      let i = 0;

      while (i < blocks.length) {
        const group: ResumeFlowBlock[] = [blocks[i]];
        let j = i;
        while (j + 1 < blocks.length) {
          const candidate = blocks[j] as { keepWithNext?: boolean };
          if (!candidate.keepWithNext) break;
          j += 1;
          group.push(blocks[j]);
        }
        const groupHeight = group.reduce(
          (sum, item) => sum + (heights[item.id] ?? 36),
          0
        );

        if (currentPage.length > 0 && currentUsed + groupHeight > budget) {
          pages.push(currentPage);
          currentPage = [];
          currentUsed = 0;
          budget = pageContentBudget;
        }
        for (const item of group) {
          currentPage.push(item);
          currentUsed += heights[item.id] ?? 36;
        }
        i = j + 1;
      }
      if (currentPage.length > 0) pages.push(currentPage);
      return pages.length > 0 ? pages : [[]];
    };

    const sidebarPages = paginateWithFirstBudget(
      contourTracks.sidebarBlocks,
      measuredHeights.contourSidebar
    );
    const mainPages = paginateWithFirstBudget(
      contourTracks.mainBlocks,
      measuredHeights.contourMain
    );

    const total = Math.max(sidebarPages.length, mainPages.length, 1);
    return Array.from({ length: total }, (_, idx) => ({
      sidebar: sidebarPages[idx] || [],
      main: mainPages[idx] || [],
    }));
  }, [
    isContour,
    contourTracks,
    measuredHeights.contourHeader,
    measuredHeights.contourSidebar,
    measuredHeights.contourMain,
    pageContentBudget,
  ]);

  const totalPages = isContour ? contourPages.length : singlePages.length;

  useLayoutEffect(() => {
    onPageCountChange?.(totalPages);
  }, [totalPages, onPageCountChange]);

  const sidebarWidthPx = 212;
  const contourGapPx = 22;
  const contourMainWidthPx = contentWidth - sidebarWidthPx - contourGapPx;

  return (
    <div style={{ position: 'relative' }}>
      {/* Off-screen natural A4 measurement stage (never display: none) */}
      <div
        ref={measureRootRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          left: '-14000px',
          top: 0,
          width: `${A4_WIDTH_PX}px`,
          padding: `${pagePaddingPx}px`,
          backgroundColor: '#FFFFFF',
          pointerEvents: 'none',
          visibility: 'hidden',
          boxSizing: 'border-box',
        }}
      >
        {!isContour ? (
          <div>
            {singleFlowBlocks.map((block) => (
              <div key={`m-${block.id}`} data-measure-block={block.id}>
                <TemplateBlockRenderer
                  doc={doc}
                  block={block}
                  photoDataUrl={photoDataUrl}
                />
              </div>
            ))}
          </div>
        ) : (
          <div>
            <div data-measure-contour-header="true">
              <TemplateHeaderBlock
                doc={doc}
                photoDataUrl={photoDataUrl}
                template="contour"
              />
            </div>
            <div style={{ display: 'flex', gap: `${contourGapPx}px` }}>
              <div style={{ width: `${sidebarWidthPx}px` }}>
                {contourTracks.sidebarBlocks.map((block) => (
                  <div key={`ms-${block.id}`} data-measure-sidebar={block.id}>
                    <TemplateBlockRenderer
                      doc={doc}
                      block={block}
                      photoDataUrl={photoDataUrl}
                    />
                  </div>
                ))}
              </div>
              <div style={{ width: `${contourMainWidthPx}px` }}>
                {contourTracks.mainBlocks.map((block) => (
                  <div key={`mm-${block.id}`} data-measure-main={block.id}>
                    <TemplateBlockRenderer
                      doc={doc}
                      block={block}
                      photoDataUrl={photoDataUrl}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Rendered A4 Pages (Shared by Live Preview and PDF Export) */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        {!isContour
          ? singlePages.map((pageBlocks, pageIndex) => (
              <section
                key={`page-${pageIndex}`}
                data-clover-a4-page="true"
                data-page-number={pageIndex + 1}
                aria-label={`Resume page ${pageIndex + 1} of ${totalPages}`}
                style={{
                  width: `${A4_WIDTH_PX}px`,
                  height: `${A4_HEIGHT_PX}px`,
                  padding: `${pagePaddingPx}px`,
                  backgroundColor: '#FFFFFF',
                  color: '#293330',
                  boxSizing: 'border-box',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {pageBlocks.map((block) => (
                  <TemplateBlockRenderer
                    key={block.id}
                    doc={doc}
                    block={block}
                    photoDataUrl={photoDataUrl}
                  />
                ))}
                {totalPages > 1 && (
                  <div
                    style={{
                      position: 'absolute',
                      right: `${pagePaddingPx}px`,
                      bottom: '18px',
                      fontFamily: '"Plus Jakarta Sans", sans-serif',
                      fontSize: '9px',
                      color: '#88928B',
                    }}
                  >
                    Page {pageIndex + 1} of {totalPages}
                  </div>
                )}
              </section>
            ))
          : contourPages.map((page, pageIndex) => (
              <section
                key={`contour-page-${pageIndex}`}
                data-clover-a4-page="true"
                data-page-number={pageIndex + 1}
                aria-label={`Resume page ${pageIndex + 1} of ${totalPages}`}
                style={{
                  width: `${A4_WIDTH_PX}px`,
                  height: `${A4_HEIGHT_PX}px`,
                  padding: `${pagePaddingPx}px`,
                  backgroundColor: '#FFFFFF',
                  color: '#293330',
                  boxSizing: 'border-box',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {pageIndex === 0 && (
                  <TemplateHeaderBlock
                    doc={doc}
                    photoDataUrl={photoDataUrl}
                    template="contour"
                  />
                )}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      contourTracks.sidebarBlocks.length > 0
                        ? `${sidebarWidthPx}px 1fr`
                        : '1fr',
                    gap: `${contourGapPx}px`,
                    alignItems: 'start',
                  }}
                >
                  {contourTracks.sidebarBlocks.length > 0 && (
                    <div
                      style={{
                        borderRight: '1px solid #E4E1D9',
                        paddingRight: '16px',
                        minHeight: pageIndex === 0 ? '420px' : '180px',
                      }}
                    >
                      {page.sidebar.map((block) => (
                        <TemplateBlockRenderer
                          key={block.id}
                          doc={doc}
                          block={block}
                          photoDataUrl={photoDataUrl}
                        />
                      ))}
                    </div>
                  )}
                  <div style={{ minWidth: 0 }}>
                    {page.main.map((block) => (
                      <TemplateBlockRenderer
                        key={block.id}
                        doc={doc}
                        block={block}
                        photoDataUrl={photoDataUrl}
                      />
                    ))}
                  </div>
                </div>
                {totalPages > 1 && (
                  <div
                    style={{
                      position: 'absolute',
                      right: `${pagePaddingPx}px`,
                      bottom: '18px',
                      fontFamily: '"Plus Jakarta Sans", sans-serif',
                      fontSize: '9px',
                      color: '#88928B',
                    }}
                  >
                    Page {pageIndex + 1} of {totalPages}
                  </div>
                )}
              </section>
            ))}
      </div>
    </div>
  );
};
