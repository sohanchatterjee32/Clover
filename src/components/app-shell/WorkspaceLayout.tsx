import React, { useEffect, useRef, useState } from 'react';
import { A4_WIDTH_PX } from '../../lib/export/pagination';
import { exportResumeContainerToPdf } from '../../lib/export/pdf-exporter';
import { selectActiveDocument, useResumeStore } from '../../lib/resume/store';
import { CareerReviewWorkspace } from '../career-review/CareerReviewWorkspace';
import { DesignStudioWorkspace } from '../design-studio/DesignStudioWorkspace';
import { AdditionalSectionsEditor } from '../editors/AdditionalSectionsEditor';
import { EducationEditor } from '../editors/EducationEditor';
import { ExperienceEditor } from '../editors/ExperienceEditor';
import { OverviewWorkspace } from '../editors/OverviewWorkspace';
import { PersonalProfileEditor } from '../editors/PersonalProfileEditor';
import { SkillsEditor } from '../editors/SkillsEditor';
import { ExportCenterWorkspace } from '../export/ExportCenterWorkspace';
import { ResumeCanvas } from '../resume/ResumeCanvas';
import { ResumeDocument } from '../resume/ResumeDocument';
import { ToastViewport } from '../shared/ToastViewport';
import { OfflineIndicator } from '../pwa/OfflineIndicator';
import { AppHeader } from './AppHeader';
import { NavigationRail } from './NavigationRail';

export const WorkspaceLayout: React.FC = () => {
  const hydrateWorkspace = useResumeStore((s) => s.hydrateWorkspace);
  const hydrated = useResumeStore((s) => s.hydrated);
  const activeSection = useResumeStore((s) => s.activeSection);
  const doc = useResumeStore(selectActiveDocument);
  const photoDataUrls = useResumeStore((s) => s.photoDataUrls);
  const addToast = useResumeStore((s) => s.addToast);

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [mobileView, setMobileView] = useState<'editor' | 'preview'>('editor');
  const [pageCount, setPageCount] = useState(1);

  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<{
    label: string;
    percent: number;
  } | null>(null);
  const [lastExportResult, setLastExportResult] = useState<{
    ok: boolean;
    filename?: string;
    pageCount?: number;
    error?: string;
  } | null>(null);

  const exportStageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void hydrateWorkspace();
  }, [hydrateWorkspace]);

  const photoDataUrl = doc.personal.profilePhotoRef
    ? photoDataUrls[doc.personal.profilePhotoRef] || null
    : null;

  const handleExportPdf = async () => {
    if (isExporting) return;
    setIsExporting(true);
    setLastExportResult(null);
    setExportProgress({ label: 'Initializing PDF export...', percent: 5 });

    const result = await exportResumeContainerToPdf(
      exportStageRef.current,
      doc.personal.fullName,
      doc.name,
      (label, percent) => setExportProgress({ label, percent })
    );

    setLastExportResult(result);
    setIsExporting(false);

    if (result.ok) {
      addToast({
        type: 'success',
        title: 'PDF downloaded',
        description: `${result.filename} (${result.pageCount} ${
          result.pageCount === 1 ? 'page' : 'pages'
        })`,
      });
    } else {
      addToast({
        type: 'error',
        title: 'PDF export failed',
        description: result.error || 'Could not generate PDF.',
      });
    }
  };

  const renderActiveWorkspace = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewWorkspace />;
      case 'personal':
        return <PersonalProfileEditor />;
      case 'experience':
        return <ExperienceEditor />;
      case 'education':
        return <EducationEditor />;
      case 'skills':
        return <SkillsEditor />;
      case 'additional':
        return <AdditionalSectionsEditor />;
      case 'design':
        return <DesignStudioWorkspace />;
      case 'review':
        return <CareerReviewWorkspace />;
      case 'export':
        return (
          <ExportCenterWorkspace
            pageCount={pageCount}
            isExporting={isExporting}
            exportProgress={exportProgress}
            lastExportResult={lastExportResult}
            onTriggerPdfExport={() => void handleExportPdf()}
          />
        );
      default:
        return <OverviewWorkspace />;
    }
  };

  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-[#F6F3ED] text-[#293330]">
      <AppHeader
        isExporting={isExporting}
        mobileView={mobileView}
        onMobileViewChange={setMobileView}
        onToggleMobileNav={() => setMobileNavOpen(true)}
        onQuickExportPdf={() => void handleExportPdf()}
      />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <NavigationRail
          mobileOpen={mobileNavOpen}
          onCloseMobile={() => setMobileNavOpen(false)}
          onAfterNavigate={() => setMobileView('editor')}
        />

        {/* Central Editing Workspace */}
        <main
          aria-label="Resume editing workspace"
          className={`min-w-0 flex-1 overflow-y-auto px-4 py-6 sm:px-8 ${
            mobileView === 'preview' ? 'hidden lg:block' : 'block'
          }`}
        >
          <div className="mx-auto max-w-2xl pb-16">
            {hydrated ? (
              renderActiveWorkspace()
            ) : (
              <div className="py-12 text-center text-sm text-[#738078]">
                Loading workspace...
              </div>
            )}
          </div>
        </main>

        {/* Right Live A4 Resume Canvas */}
        <div
          className={`min-w-0 border-l border-[#E4E1D9] lg:block lg:w-[44%] xl:w-[46%] ${
            mobileView === 'preview' ? 'block w-full flex-1' : 'hidden'
          }`}
        >
          <ResumeCanvas onPageCountChange={setPageCount} />
        </div>
      </div>

      {/* Dedicated Unscaled Natural A4 Off-Screen Export Stage (never display: none) */}
      <div
        ref={exportStageRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          left: '-18000px',
          top: 0,
          width: `${A4_WIDTH_PX}px`,
          pointerEvents: 'none',
          backgroundColor: '#FFFFFF',
        }}
      >
        <ResumeDocument doc={doc} photoDataUrl={photoDataUrl} />
      </div>

      <OfflineIndicator />
      <ToastViewport />
    </div>
  );
};
