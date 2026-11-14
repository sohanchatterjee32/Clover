import { buildResumePdfFilename } from '../utils/filename';
import { A4_HEIGHT_PX, A4_WIDTH_PX } from './pagination';

export interface PdfExportResult {
  ok: boolean;
  filename?: string;
  pageCount?: number;
  error?: string;
}

async function waitForImagesInContainer(container: HTMLElement): Promise<void> {
  const images = Array.from(container.querySelectorAll('img'));
  await Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve, reject) => {
          if (img.complete) {
            if (img.naturalWidth === 0 && img.src) {
              reject(new Error('Profile image failed to load before export.'));
            } else {
              resolve();
            }
            return;
          }
          const onLoad = () => {
            cleanup();
            resolve();
          };
          const onError = () => {
            cleanup();
            reject(new Error('Profile image failed to decode during PDF export.'));
          };
          const cleanup = () => {
            img.removeEventListener('load', onLoad);
            img.removeEventListener('error', onError);
          };
          img.addEventListener('load', onLoad);
          img.addEventListener('error', onError);
        })
    )
  );
}

function nextAnimationFrames(count = 2): Promise<void> {
  return new Promise((resolve) => {
    const step = (remaining: number) => {
      if (remaining <= 0) {
        resolve();
        return;
      }
      requestAnimationFrame(() => step(remaining - 1));
    };
    step(count);
  });
}

export async function exportResumeContainerToPdf(
  container: HTMLElement | null,
  fullName?: string,
  documentName?: string,
  onProgress?: (stepLabel: string, percent: number) => void
): Promise<PdfExportResult> {
  if (!container) {
    return {
      ok: false,
      error: 'Document export surface is not mounted. Please try again.',
    };
  }

  try {
    onProgress?.('Preparing typography and embedded assets...', 15);

    if (typeof document !== 'undefined' && document.fonts?.ready) {
      await document.fonts.ready;
    }
    await waitForImagesInContainer(container);
    await nextAnimationFrames(2);

    const pageElements = Array.from(
      container.querySelectorAll<HTMLElement>('[data-clover-a4-page="true"]')
    );

    if (pageElements.length === 0) {
      return {
        ok: false,
        error: 'No rendered A4 resume pages were found to export.',
      };
    }

    onProgress?.('Loading PDF rendering engine...', 30);
    const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
      import('html2canvas-pro'),
      import('jspdf'),
    ]);

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    for (let i = 0; i < pageElements.length; i += 1) {
      const pageEl = pageElements[i];
      const progressPct = 35 + Math.round(((i + 0.5) / pageElements.length) * 55);
      onProgress?.(
        `Rendering page ${i + 1} of ${pageElements.length}...`,
        progressPct
      );

      const canvas = await html2canvas(pageEl, {
        scale: 2,
        width: A4_WIDTH_PX,
        height: A4_HEIGHT_PX,
        windowWidth: A4_WIDTH_PX,
        windowHeight: A4_HEIGHT_PX,
        backgroundColor: '#FFFFFF',
        useCORS: true,
        allowTaint: false,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.96);
      if (i > 0) {
        pdf.addPage('a4', 'portrait');
      }
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
    }

    onProgress?.('Finalizing PDF download...', 96);
    const filename = buildResumePdfFilename(fullName, documentName);
    pdf.save(filename);

    onProgress?.('Export complete', 100);
    return {
      ok: true,
      filename,
      pageCount: pageElements.length,
    };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred while generating the PDF.',
    };
  }
}
