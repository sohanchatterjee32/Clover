import React from 'react';
import {
  Briefcase,
  ClipboardCheck,
  Download,
  GraduationCap,
  Layers,
  LayoutDashboard,
  ListPlus,
  Palette,
  User,
  X,
} from 'lucide-react';
import { useResumeStore } from '../../lib/resume/store';
import type { WorkspaceSection } from '../../lib/resume/types';
import { PWAInstallButton } from '../pwa/PWAInstallButton';

interface NavItem {
  id: WorkspaceSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'personal', label: 'Personal Profile', icon: User },
  { id: 'experience', label: 'Experience', icon: Briefcase },
  { id: 'education', label: 'Education', icon: GraduationCap },
  { id: 'skills', label: 'Skills', icon: Layers },
  { id: 'additional', label: 'Additional Sections', icon: ListPlus },
  { id: 'design', label: 'Design Studio', icon: Palette },
  { id: 'review', label: 'Career Review', icon: ClipboardCheck },
  { id: 'export', label: 'Export Center', icon: Download },
];

interface NavigationRailProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onAfterNavigate?: () => void;
}

export const NavigationRail: React.FC<NavigationRailProps> = ({
  mobileOpen,
  onCloseMobile,
  onAfterNavigate,
}) => {
  const activeSection = useResumeStore((s) => s.activeSection);
  const setActiveSection = useResumeStore((s) => s.setActiveSection);

  const handleSelect = (id: WorkspaceSection) => {
    setActiveSection(id);
    onAfterNavigate?.();
    onCloseMobile();
  };

  const navContent = (
    <nav
      aria-label="Workspace sections"
      className="flex h-full flex-col justify-between px-3 py-4"
    >
      <ul className="space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => handleSelect(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-xs font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-[#183B36] ${
                  isActive
                    ? 'bg-[#183B36] text-white'
                    : 'text-[#293330] hover:bg-[#EAE5DA]/70'
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 ${
                    isActive ? 'text-[#D69A43]' : 'text-[#738078]'
                  }`}
                  aria-hidden="true"
                />
                <span>{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="space-y-3 border-t border-[#E4E1D9] px-2 pt-3">
        <div className="lg:hidden">
          <PWAInstallButton variant="header" />
        </div>
        <p className="text-[11px] leading-relaxed text-[#738078]">
          Offline-ready local studio. Documents and images remain on your device.
        </p>
      </div>
    </nav>
  );

  return (
    <>
      {/* Persistent Desktop Rail */}
      <aside className="hidden w-52 shrink-0 border-r border-[#E4E1D9] bg-[#F6F3ED] lg:block">
        {navContent}
      </aside>

      {/* Mobile & Tablet Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-[#183B36]/30"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="relative z-10 flex w-64 max-w-[80vw] flex-col border-r border-[#E4E1D9] bg-[#F6F3ED] shadow-xl">
            <div className="flex h-14 items-center justify-between border-b border-[#E4E1D9] px-4">
              <span className="font-editorial text-base font-semibold text-[#183B36]">
                CLOVER
              </span>
              <button
                type="button"
                onClick={onCloseMobile}
                aria-label="Close navigation menu"
                className="rounded-md p-1.5 text-[#738078] hover:bg-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">{navContent}</div>
          </aside>
        </div>
      )}
    </>
  );
};
