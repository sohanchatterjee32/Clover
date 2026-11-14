import React from 'react';
import { Check, Palette, Sliders } from 'lucide-react';
import { ACCENT_PALETTES } from '../../lib/resume/initial-data';
import { selectActiveDocument, useResumeStore } from '../../lib/resume/store';
import type {
  AccentColorId,
  DocumentDensity,
  PhotoPosition,
  PhotoShape,
  TemplateId,
} from '../../lib/resume/types';
import { TEMPLATE_REGISTRY } from '../../lib/templates/template-registry';

const MiniTemplateSchematic: React.FC<{
  templateId: TemplateId;
  accentHex: string;
}> = ({ templateId, accentHex }) => {
  if (templateId === 'signal') {
    return (
      <div className="h-28 w-full rounded-lg border border-[#E4E1D9] bg-white p-3">
        <div className="h-2.5 w-24 rounded-sm bg-[#293330]" />
        <div
          className="mt-1 h-1.5 w-16 rounded-sm"
          style={{ backgroundColor: accentHex }}
        />
        <div
          className="mt-2 h-px w-full"
          style={{ backgroundColor: accentHex }}
        />
        <div className="mt-2.5 space-y-1.5">
          <div className="h-1.5 w-14 rounded-sm" style={{ backgroundColor: accentHex }} />
          <div className="h-1 w-full rounded-sm bg-[#E4E1D9]" />
          <div className="h-1 w-5/6 rounded-sm bg-[#E4E1D9]" />
        </div>
        <div className="mt-2.5 space-y-1">
          <div className="h-1.5 w-12 rounded-sm" style={{ backgroundColor: accentHex }} />
          <div className="h-1 w-4/5 rounded-sm bg-[#E4E1D9]" />
        </div>
      </div>
    );
  }

  if (templateId === 'contour') {
    return (
      <div className="h-28 w-full rounded-lg border border-[#E4E1D9] bg-white p-3">
        <div
          className="flex items-center justify-between border-b-2 pb-1.5"
          style={{ borderColor: accentHex }}
        >
          <div>
            <div className="h-2.5 w-20 rounded-sm bg-[#293330]" />
            <div
              className="mt-1 h-1 w-14 rounded-sm"
              style={{ backgroundColor: accentHex }}
            />
          </div>
          <div className="h-4 w-4 rounded bg-[#F6F3ED] border border-[#E4E1D9]" />
        </div>
        <div className="mt-2 grid grid-cols-[36%_1fr] gap-2">
          <div className="space-y-1.5 border-r border-[#E4E1D9] pr-2">
            <div className="h-1.5 w-10 rounded-sm" style={{ backgroundColor: accentHex }} />
            <div className="h-1 w-full rounded-sm bg-[#E4E1D9]" />
            <div className="h-1 w-4/5 rounded-sm bg-[#E4E1D9]" />
            <div className="h-1 w-3/4 rounded-sm bg-[#E4E1D9]" />
          </div>
          <div className="space-y-1.5">
            <div className="h-1.5 w-12 rounded-sm" style={{ backgroundColor: accentHex }} />
            <div className="h-1 w-full rounded-sm bg-[#E4E1D9]" />
            <div className="h-1 w-5/6 rounded-sm bg-[#E4E1D9]" />
            <div className="h-1 w-full rounded-sm bg-[#E4E1D9]" />
          </div>
        </div>
      </div>
    );
  }

  if (templateId === 'fieldnote') {
    return (
      <div className="h-28 w-full rounded-lg border border-[#E4E1D9] bg-white p-3">
        <div
          className="h-1 w-5"
          style={{ backgroundColor: accentHex }}
        />
        <div className="mt-1.5 h-3 w-24 rounded-sm bg-[#293330]" />
        <div className="mt-2 rounded bg-[#FAF8F4] p-1.5 border border-[#ECE8DF]">
          <div className="h-1 w-full rounded-sm bg-[#D9D4C8]" />
          <div className="mt-1 h-1 w-3/4 rounded-sm bg-[#D9D4C8]" />
        </div>
        <div className="mt-2 flex items-center gap-1.5">
          <div className="h-1.5 w-1.5" style={{ backgroundColor: accentHex }} />
          <div className="h-1.5 w-14 rounded-sm bg-[#293330]" />
        </div>
        <div className="mt-1 h-1 w-5/6 rounded-sm bg-[#E4E1D9]" />
      </div>
    );
  }

  // Summit
  return (
    <div className="h-28 w-full rounded-lg border border-[#E4E1D9] bg-white p-3">
      <div
        className="flex flex-col items-center border-b-2 pb-1.5"
        style={{ borderColor: accentHex }}
      >
        <div className="h-2.5 w-24 rounded-sm bg-[#293330]" />
        <div
          className="mt-1 h-1 w-16 rounded-sm"
          style={{ backgroundColor: accentHex }}
        />
      </div>
      <div className="mt-2.5 space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="h-1.5 w-16 rounded-sm bg-[#293330]" />
          <div className="h-1 w-10 rounded-sm bg-[#E4E1D9]" />
        </div>
        <div
          className="h-1 w-14 rounded-sm"
          style={{ backgroundColor: accentHex }}
        />
        <div className="h-1 w-full rounded-sm bg-[#E4E1D9]" />
        <div className="h-1 w-11/12 rounded-sm bg-[#E4E1D9]" />
      </div>
    </div>
  );
};

export const DesignStudioWorkspace: React.FC = () => {
  const doc = useResumeStore(selectActiveDocument);
  const setTemplate = useResumeStore((s) => s.setTemplate);
  const updateDesign = useResumeStore((s) => s.updateDesign);

  const activeAccentHex =
    ACCENT_PALETTES[doc.designConfiguration.accentColor]?.hex || '#183B36';

  return (
    <div className="space-y-8">
      <div className="border-b border-[#E4E1D9] pb-5">
        <h2 className="font-editorial text-2xl font-semibold text-[#293330]">
          Design Studio
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-[#738078]">
          Select an original resume architecture and tailor typography, spacing, and accent color. Switching designs never alters your resume content.
        </p>
      </div>

      {/* Template Gallery */}
      <div>
        <h3 className="text-sm font-semibold text-[#293330]">
          Resume Designs
        </h3>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {TEMPLATE_REGISTRY.map((tpl) => {
            const isSelected = doc.selectedTemplate === tpl.id;
            return (
              <div
                key={tpl.id}
                className={`flex flex-col justify-between rounded-xl border bg-white p-4 transition-colors ${
                  isSelected
                    ? 'border-[#183B36] ring-1 ring-[#183B36]'
                    : 'border-[#E4E1D9]'
                }`}
              >
                <div>
                  <MiniTemplateSchematic
                    templateId={tpl.id}
                    accentHex={activeAccentHex}
                  />
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <div>
                      <h4 className="font-editorial text-base font-semibold text-[#293330]">
                        {tpl.name}
                      </h4>
                      <p className="text-xs font-medium text-[#738078]">
                        {tpl.tagline}
                      </p>
                    </div>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-[#738078]">
                    {tpl.description}
                  </p>
                  <p className="mt-2 text-[11px] text-[#293330]">
                    <span className="font-semibold">Best for:</span>{' '}
                    {tpl.bestFor}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setTemplate(tpl.id)}
                  className={`mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-[#183B36] ${
                    isSelected
                      ? 'bg-[#183B36] text-white'
                      : 'border border-[#E4E1D9] bg-[#F6F3ED] text-[#293330] hover:bg-[#EAE5DA]'
                  }`}
                >
                  {isSelected && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
                  {isSelected ? 'Selected Design' : `Use ${tpl.name}`}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Accent Palette */}
      <div className="rounded-xl border border-[#E4E1D9] bg-white p-5">
        <div className="flex items-center gap-2">
          <Palette className="h-4 w-4 text-[#183B36]" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-[#293330]">
            Accent Palette
          </h3>
        </div>
        <p className="mt-1 text-xs text-[#738078]">
          Applied consistently to headings, dividers, and subtle markers in both live preview and PDF export.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(Object.keys(ACCENT_PALETTES) as AccentColorId[]).map((key) => {
            const palette = ACCENT_PALETTES[key];
            const selected = doc.designConfiguration.accentColor === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => updateDesign({ accentColor: key })}
                aria-pressed={selected}
                className={`flex items-center gap-2.5 rounded-lg border p-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-[#183B36] ${
                  selected
                    ? 'border-[#183B36] bg-[#F6F3ED]'
                    : 'border-[#E4E1D9] bg-white hover:bg-[#FAF8F4]'
                }`}
              >
                <span
                  aria-hidden="true"
                  className="h-5 w-5 shrink-0 rounded-md border border-black/10"
                  style={{ backgroundColor: palette.hex }}
                />
                <div>
                  <div className="text-xs font-semibold text-[#293330]">
                    {palette.name}
                  </div>
                  <div className="font-mono text-[10px] text-[#738078]">
                    {palette.hex}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Typography, Density & Layout Controls */}
      <div className="rounded-xl border border-[#E4E1D9] bg-white p-5">
        <div className="flex items-center gap-2">
          <Sliders className="h-4 w-4 text-[#183B36]" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-[#293330]">
            Typography & Document Rhythm
          </h3>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <span className="block text-xs font-medium text-[#293330]">
              Font Size Scale
            </span>
            <div className="mt-2 grid grid-cols-3 gap-1 rounded-lg border border-[#E4E1D9] bg-[#F6F3ED] p-1">
              {(['small', 'medium', 'large'] as const).map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => updateDesign({ fontSizeScale: sz })}
                  className={`rounded-md px-2 py-1.5 text-xs font-medium capitalize transition-colors ${
                    doc.designConfiguration.fontSizeScale === sz
                      ? 'bg-white text-[#183B36] shadow-xs'
                      : 'text-[#738078] hover:text-[#293330]'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="block text-xs font-medium text-[#293330]">
              Section Spacing
            </span>
            <div className="mt-2 grid grid-cols-3 gap-1 rounded-lg border border-[#E4E1D9] bg-[#F6F3ED] p-1">
              {(['tight', 'normal', 'relaxed'] as const).map((sp) => (
                <button
                  key={sp}
                  type="button"
                  onClick={() => updateDesign({ sectionSpacing: sp })}
                  className={`rounded-md px-2 py-1.5 text-xs font-medium capitalize transition-colors ${
                    doc.designConfiguration.sectionSpacing === sp
                      ? 'bg-white text-[#183B36] shadow-xs'
                      : 'text-[#738078] hover:text-[#293330]'
                  }`}
                >
                  {sp}
                </button>
              ))}
            </div>
          </div>

          <div className="sm:col-span-2">
            <span className="block text-xs font-medium text-[#293330]">
              Document Density
            </span>
            <div className="mt-2 grid grid-cols-3 gap-1 rounded-lg border border-[#E4E1D9] bg-[#F6F3ED] p-1">
              {(['compact', 'balanced', 'comfortable'] as DocumentDensity[]).map(
                (den) => (
                  <button
                    key={den}
                    type="button"
                    onClick={() => updateDesign({ density: den })}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                      doc.designConfiguration.density === den
                        ? 'bg-white text-[#183B36] shadow-xs'
                        : 'text-[#738078] hover:text-[#293330]'
                    }`}
                  >
                    {den === 'comfortable' ? 'Airy' : den}
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 border-t border-[#E4E1D9] pt-4 sm:grid-cols-2">
          <label
            htmlFor="design-dividers-toggle"
            className="flex cursor-pointer items-center gap-2.5 text-xs font-medium text-[#293330]"
          >
            <input
              id="design-dividers-toggle"
              type="checkbox"
              checked={doc.designConfiguration.showDividers}
              onChange={(e) => updateDesign({ showDividers: e.target.checked })}
              className="h-4 w-4 rounded border-[#E4E1D9] accent-[#183B36]"
            />
            Show section divider rules
          </label>

          <label
            htmlFor="design-photo-toggle"
            className="flex cursor-pointer items-center gap-2.5 text-xs font-medium text-[#293330]"
          >
            <input
              id="design-photo-toggle"
              type="checkbox"
              checked={doc.designConfiguration.showPhoto}
              disabled={!doc.personal.profilePhotoRef}
              onChange={(e) => updateDesign({ showPhoto: e.target.checked })}
              className="h-4 w-4 rounded border-[#E4E1D9] accent-[#183B36] disabled:opacity-40"
            />
            <span>
              Show profile photo
              {!doc.personal.profilePhotoRef
                ? ' (upload in Personal Profile)'
                : ''}
            </span>
          </label>
        </div>

        {doc.personal.profilePhotoRef && doc.designConfiguration.showPhoto && (
          <div className="mt-4 grid grid-cols-1 gap-4 border-t border-[#E4E1D9] pt-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="studio-photo-pos"
                className="block text-xs font-medium text-[#738078]"
              >
                Photo Position
              </label>
              <select
                id="studio-photo-pos"
                value={doc.designConfiguration.photoPosition}
                onChange={(e) =>
                  updateDesign({
                    photoPosition: e.target.value as PhotoPosition,
                  })
                }
                className="mt-1 w-full rounded-lg border border-[#E4E1D9] bg-white px-3 py-1.5 text-xs text-[#293330]"
              >
                <option value="top-right">Top Right</option>
                <option value="top-left">Top Left</option>
                <option value="center">Centered</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="studio-photo-shape"
                className="block text-xs font-medium text-[#738078]"
              >
                Photo Frame Shape
              </label>
              <select
                id="studio-photo-shape"
                value={doc.designConfiguration.photoShape}
                onChange={(e) =>
                  updateDesign({ photoShape: e.target.value as PhotoShape })
                }
                className="mt-1 w-full rounded-lg border border-[#E4E1D9] bg-white px-3 py-1.5 text-xs text-[#293330]"
              >
                <option value="rounded">Rounded Square</option>
                <option value="circle">Circle</option>
                <option value="square">Square</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
