import React, { useState } from 'react';
import { Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { resolveInstallActionMode } from '../../lib/pwa/pwa-utils';

interface PWAInstallButtonProps {
  variant?: 'header' | 'banner';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'header',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  const mode = resolveInstallActionMode({ isInstalled, isInstallable, isIOS });

  if (mode === 'hidden') {
    return null;
  }

  const iosDialog = showIOSGuide && (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ios-install-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#183B36]/40 p-4"
    >
      <div className="w-full max-w-sm rounded-xl border border-[#E4E1D9] bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <h3
            id="ios-install-title"
            className="font-editorial text-lg font-semibold text-[#183B36]"
          >
            Install CLOVER on iPhone / iPad
          </h3>
          <button
            type="button"
            onClick={() => setShowIOSGuide(false)}
            aria-label="Close installation instructions"
            className="rounded-md p-1 text-[#738078] hover:bg-[#F6F3ED] hover:text-[#293330]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <ol className="mt-3 space-y-2 text-sm leading-relaxed text-[#293330]">
          <li>
            1. Tap the <strong>Share</strong> button in the Safari toolbar.
          </li>
          <li>
            2. Scroll down and tap <strong>Add to Home Screen</strong>.
          </li>
          <li>
            3. Tap <strong>Add</strong> to launch CLOVER offline anytime.
          </li>
        </ol>
        <button
          type="button"
          onClick={() => setShowIOSGuide(false)}
          className="mt-5 w-full rounded-lg bg-[#183B36] py-2 text-sm font-medium text-white transition-colors hover:bg-[#122D29]"
        >
          Done
        </button>
      </div>
    </div>
  );

  if (variant === 'banner') {
    return (
      <>
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E4E1D9] bg-white p-4">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#183B36] text-[#D69A43]">
              <Smartphone className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <div className="text-sm font-semibold text-[#293330]">
                Install CLOVER for Offline Use
              </div>
              <p className="mt-0.5 text-xs leading-relaxed text-[#738078]">
                Add CLOVER to your Android or desktop home screen to edit and export resumes even without internet access.
              </p>
            </div>
          </div>
          {mode === 'prompt' ? (
            <button
              type="button"
              onClick={() => void install()}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#183B36] px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#122D29] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#183B36]"
            >
              <Smartphone className="h-3.5 w-3.5 text-[#D69A43]" aria-hidden="true" />
              Install App
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowIOSGuide(true)}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#183B36] bg-white px-3.5 py-2 text-xs font-semibold text-[#183B36] transition-colors hover:bg-[#F6F3ED]"
            >
              Install on iOS
            </button>
          )}
        </div>
        {iosDialog}
      </>
    );
  }

  if (mode === 'prompt') {
    return (
      <button
        type="button"
        onClick={() => void install()}
        aria-label="Install CLOVER app"
        className="inline-flex items-center gap-1.5 rounded-lg border border-[#183B36]/30 bg-[#F6F3ED] px-2.5 py-1.5 text-xs font-semibold text-[#183B36] whitespace-nowrap transition-colors hover:bg-[#EAE5DA] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#183B36]"
      >
        <Smartphone className="h-3.5 w-3.5 text-[#183B36]" aria-hidden="true" />
        <span className="hidden sm:inline">Install App</span>
        <span className="sm:hidden">Install</span>
      </button>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setShowIOSGuide(true)}
        aria-label="Install CLOVER on iOS"
        className="inline-flex items-center gap-1.5 rounded-lg border border-[#E4E1D9] bg-white px-2.5 py-1.5 text-xs font-medium text-[#293330] whitespace-nowrap transition-colors hover:bg-[#F6F3ED]"
      >
        <Smartphone className="h-3.5 w-3.5 text-[#183B36]" aria-hidden="true" />
        <span className="hidden sm:inline">Install iOS</span>
        <span className="sm:hidden">Install</span>
      </button>
      {iosDialog}
    </>
  );
};
