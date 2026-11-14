import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-lg border border-[#D69A43]/40 bg-[#183B36] px-3 py-2 text-xs font-medium text-[#F6F3ED] shadow-lg"
    >
      <WifiOff className="h-3.5 w-3.5 shrink-0 text-[#D69A43]" aria-hidden="true" />
      <span>Offline mode — local storage active</span>
    </div>
  );
};
