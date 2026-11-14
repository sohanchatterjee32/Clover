import React, { useMemo, useRef, useState } from 'react';
import { ImagePlus, Sparkles, Trash2, User } from 'lucide-react';
import { selectActiveDocument, useResumeStore } from '../../lib/resume/store';
import type { PhotoPosition, PhotoShape } from '../../lib/resume/types';
import { validatePersonalInfo } from '../../lib/resume/validation';
import { processProfileImage } from '../../lib/utils/image-processing';
import { generateProfessionalSummaryDraft } from '../../lib/writing/summary-generator';
import { FormField, inputBaseClass } from '../shared/FormField';

export const PersonalProfileEditor: React.FC = () => {
  const doc = useResumeStore(selectActiveDocument);
  const updateActiveDocument = useResumeStore((s) => s.updateActiveDocument);
  const updateDesign = useResumeStore((s) => s.updateDesign);
  const uploadProfilePhoto = useResumeStore((s) => s.uploadProfilePhoto);
  const removeProfilePhoto = useResumeStore((s) => s.removeProfilePhoto);
  const photoDataUrls = useResumeStore((s) => s.photoDataUrls);
  const addToast = useResumeStore((s) => s.addToast);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [summaryMissingInfo, setSummaryMissingInfo] = useState<string[] | null>(null);
  const [summaryDraftPreview, setSummaryDraftPreview] = useState<string | null>(null);

  const errors = useMemo(
    () => validatePersonalInfo(doc.personal),
    [doc.personal]
  );

  const photoDataUrl = doc.personal.profilePhotoRef
    ? photoDataUrls[doc.personal.profilePhotoRef] || null
    : null;

  const updatePersonalField = (
    field: keyof typeof doc.personal,
    value: string
  ) => {
    updateActiveDocument((current) => ({
      ...current,
      personal: {
        ...current.personal,
        [field]: value,
      },
    }));
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setPhotoError(null);
    setPhotoUploading(true);
    const processed = await processProfileImage(file);
    if (!processed.ok || !processed.blob || !processed.previewDataUrl) {
      setPhotoUploading(false);
      const errMsg =
        processed.error || 'Could not upload the selected profile photo.';
      setPhotoError(errMsg);
      addToast({
        type: 'error',
        title: 'Photo upload rejected',
        description: errMsg,
      });
      return;
    }

    await uploadProfilePhoto(processed.blob, processed.previewDataUrl);
    setPhotoUploading(false);
  };

  const handleCreateSummaryDraft = () => {
    const result = generateProfessionalSummaryDraft(doc);
    if (!result.canGenerate) {
      setSummaryDraftPreview(null);
      setSummaryMissingInfo(result.missingDetails);
      return;
    }
    setSummaryMissingInfo(
      result.missingDetails.length > 0 ? result.missingDetails : null
    );
    setSummaryDraftPreview(result.draft);
  };

  return (
    <div className="space-y-8">
      <div className="border-b border-[#E4E1D9] pb-5">
        <h2 className="font-editorial text-2xl font-semibold text-[#293330]">
          Personal Profile
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-[#738078]">
          Your header identity, contact channels, optional portrait photo, and introductory summary. Edits appear immediately on the document canvas.
        </p>
      </div>

      {/* Contact & Identity Fields */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          id="personal-fullName"
          label="Full Name"
          required
          error={errors.fullName}
          className="sm:col-span-2"
        >
          <input
            id="personal-fullName"
            type="text"
            value={doc.personal.fullName}
            onChange={(e) => updatePersonalField('fullName', e.target.value)}
            placeholder="e.g., Rohan Mehta"
            className={inputBaseClass}
          />
        </FormField>

        <FormField
          id="personal-headline"
          label="Professional Headline"
          hint="Target title or specialty"
          className="sm:col-span-2"
        >
          <input
            id="personal-headline"
            type="text"
            value={doc.personal.professionalHeadline}
            onChange={(e) =>
              updatePersonalField('professionalHeadline', e.target.value)
            }
            placeholder="e.g., Cloud Platform Engineer"
            className={inputBaseClass}
          />
        </FormField>

        <FormField
          id="personal-email"
          label="Email Address"
          error={errors.email}
        >
          <input
            id="personal-email"
            type="email"
            value={doc.personal.email}
            onChange={(e) => updatePersonalField('email', e.target.value)}
            placeholder="name@example.com"
            className={inputBaseClass}
          />
        </FormField>

        <FormField id="personal-phone" label="Phone Number">
          <input
            id="personal-phone"
            type="tel"
            value={doc.personal.phone}
            onChange={(e) => updatePersonalField('phone', e.target.value)}
            placeholder="+91 98765 43210"
            className={inputBaseClass}
          />
        </FormField>

        <FormField id="personal-location" label="Location">
          <input
            id="personal-location"
            type="text"
            value={doc.personal.location}
            onChange={(e) => updatePersonalField('location', e.target.value)}
            placeholder="City, Country"
            className={inputBaseClass}
          />
        </FormField>

        <FormField
          id="personal-linkedin"
          label="LinkedIn URL"
          error={errors.linkedinUrl}
        >
          <input
            id="personal-linkedin"
            type="url"
            value={doc.personal.linkedinUrl}
            onChange={(e) => updatePersonalField('linkedinUrl', e.target.value)}
            placeholder="linkedin.com/in/your-profile"
            className={inputBaseClass}
          />
        </FormField>

        <FormField
          id="personal-portfolio"
          label="Portfolio URL"
          error={errors.portfolioUrl}
        >
          <input
            id="personal-portfolio"
            type="url"
            value={doc.personal.portfolioUrl}
            onChange={(e) =>
              updatePersonalField('portfolioUrl', e.target.value)
            }
            placeholder="portfolio.example.com"
            className={inputBaseClass}
          />
        </FormField>

        <FormField
          id="personal-website"
          label="Professional Website"
          error={errors.websiteUrl}
        >
          <input
            id="personal-website"
            type="url"
            value={doc.personal.websiteUrl}
            onChange={(e) => updatePersonalField('websiteUrl', e.target.value)}
            placeholder="yourname.dev"
            className={inputBaseClass}
          />
        </FormField>
      </div>

      {/* Professional Summary + Writing Coach */}
      <div className="rounded-xl border border-[#E4E1D9] bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <label
              htmlFor="personal-summary"
              className="block text-sm font-semibold text-[#293330]"
            >
              Professional Summary
            </label>
            <p className="mt-0.5 text-xs text-[#738078]">
              2–4 concise sentences highlighting your role focus and core capabilities.{' '}
              <span className="tabular-nums">
                {doc.professionalSummary.length} characters
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={handleCreateSummaryDraft}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#183B36]/30 bg-[#F6F3ED] px-3 py-1.5 text-xs font-semibold text-[#183B36] transition-colors hover:bg-[#EAE5DA] focus-visible:outline-2 focus-visible:outline-[#183B36]"
          >
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Create Draft (Writing Coach)
          </button>
        </div>

        <textarea
          id="personal-summary"
          rows={4}
          value={doc.professionalSummary}
          onChange={(e) =>
            updateActiveDocument((current) => ({
              ...current,
              professionalSummary: e.target.value,
            }))
          }
          placeholder="Summarize your primary role, hands-on technical or operational skills, and collaborative strengths..."
          className={`${inputBaseClass} mt-3 resize-y leading-relaxed`}
        />

        {summaryMissingInfo && !summaryDraftPreview && (
          <div
            role="status"
            className="mt-3 rounded-lg border border-[#D69A43]/40 bg-[#FBF4E7] p-3 text-xs text-[#293330]"
          >
            <p className="font-semibold">
              Add a few details before generating a summary draft:
            </p>
            <ul className="mt-1 list-disc pl-4 text-[#5D5342]">
              {summaryMissingInfo.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {summaryDraftPreview && (
          <div className="mt-3 rounded-lg border border-[#183B36]/25 bg-[#F6F3ED] p-3.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-[#183B36]">
                Writing Coach Draft Suggestion (based strictly on your profile data)
              </span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-[#293330]">
              {summaryDraftPreview}
            </p>
            {summaryMissingInfo && summaryMissingInfo.length > 0 && (
              <p className="mt-1.5 text-[11px] text-[#738078]">
                Note: Adding {summaryMissingInfo.join(' and ')} can make this draft even more specific.
              </p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  updateActiveDocument((current) => ({
                    ...current,
                    professionalSummary: summaryDraftPreview,
                  }));
                  setSummaryDraftPreview(null);
                  setSummaryMissingInfo(null);
                }}
                className="rounded-md bg-[#183B36] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#122D29]"
              >
                Use This Draft
              </button>
              <button
                type="button"
                onClick={() => {
                  setSummaryDraftPreview(null);
                  setSummaryMissingInfo(null);
                }}
                className="rounded-md border border-[#E4E1D9] bg-white px-3 py-1.5 text-xs font-medium text-[#293330]"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Profile Photo Management */}
      <div className="rounded-xl border border-[#E4E1D9] bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#E4E1D9] bg-[#F6F3ED]">
              {photoDataUrl ? (
                <img
                  src={photoDataUrl}
                  alt="Uploaded profile preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-6 w-6 text-[#738078]" aria-hidden="true" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#293330]">
                Profile Portrait (Optional)
              </h3>
              <p className="mt-0.5 text-xs leading-relaxed text-[#738078]">
                Supports JPG, JPEG, PNG, or WebP (max 8 MB). Processed and stored locally in IndexedDB.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={photoUploading}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#E4E1D9] bg-white px-3.5 py-2 text-xs font-medium text-[#293330] transition-colors hover:bg-[#F6F3ED] disabled:opacity-50"
            >
              <ImagePlus className="h-3.5 w-3.5" aria-hidden="true" />
              {photoUploading
                ? 'Processing...'
                : photoDataUrl
                ? 'Replace Photo'
                : 'Upload Photo'}
            </button>
            {doc.personal.profilePhotoRef && (
              <button
                type="button"
                onClick={() => void removeProfilePhoto()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-700 transition-colors hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                Remove
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              onChange={handlePhotoSelect}
              className="hidden"
              aria-label="Upload profile portrait image"
            />
          </div>
        </div>

        {photoError && (
          <p className="mt-3 text-xs font-medium text-red-700" role="alert">
            {photoError}
          </p>
        )}

        {doc.personal.profilePhotoRef && (
          <div className="mt-4 grid grid-cols-1 gap-4 border-t border-[#E4E1D9] pt-4 sm:grid-cols-3">
            <div className="flex items-center gap-2.5">
              <input
                id="photo-visibility-toggle"
                type="checkbox"
                checked={doc.designConfiguration.showPhoto}
                onChange={(e) => updateDesign({ showPhoto: e.target.checked })}
                className="h-4 w-4 rounded border-[#E4E1D9] accent-[#183B36]"
              />
              <label
                htmlFor="photo-visibility-toggle"
                className="text-xs font-medium text-[#293330]"
              >
                Show photo on resume
              </label>
            </div>

            <div>
              <label
                htmlFor="photo-position-select"
                className="block text-xs font-medium text-[#738078]"
              >
                Position
              </label>
              <select
                id="photo-position-select"
                value={doc.designConfiguration.photoPosition}
                onChange={(e) =>
                  updateDesign({
                    photoPosition: e.target.value as PhotoPosition,
                  })
                }
                className={`${inputBaseClass} mt-1 py-1.5 text-xs`}
              >
                <option value="top-right">Top Right</option>
                <option value="top-left">Top Left</option>
                <option value="center">Centered</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="photo-shape-select"
                className="block text-xs font-medium text-[#738078]"
              >
                Frame Shape
              </label>
              <select
                id="photo-shape-select"
                value={doc.designConfiguration.photoShape}
                onChange={(e) =>
                  updateDesign({ photoShape: e.target.value as PhotoShape })
                }
                className={`${inputBaseClass} mt-1 py-1.5 text-xs`}
              >
                <option value="rounded">Rounded Square</option>
                <option value="circle">Circle</option>
                <option value="square">Crisp Square</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
