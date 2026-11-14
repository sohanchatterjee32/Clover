import { z } from 'zod';
import { validateDateRange } from './date-formatting';
import type { PersonalInfo, ResumeDocument } from './types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_REGEX = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?$/i;

export function isValidEmail(email: string): boolean {
  const trimmed = (email || '').trim();
  if (!trimmed) return true; // optional until checked for completeness
  return EMAIL_REGEX.test(trimmed);
}

export function isValidUrl(url: string): boolean {
  const trimmed = (url || '').trim();
  if (!trimmed) return true;
  return URL_REGEX.test(trimmed);
}

export function normalizeUrlForHref(url: string): string {
  const trimmed = (url || '').trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function sanitizeText(value: string): string {
  return (value || '').replace(/\0/g, '');
}

export interface PersonalValidationErrors {
  fullName?: string;
  email?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  websiteUrl?: string;
}

export function validatePersonalInfo(personal: PersonalInfo): PersonalValidationErrors {
  const errors: PersonalValidationErrors = {};
  if (!personal.fullName.trim()) {
    errors.fullName = 'Full name is recommended for your document header.';
  }
  if (personal.email.trim() && !isValidEmail(personal.email)) {
    errors.email = 'Enter a valid email address (for example, name@domain.com).';
  }
  if (personal.linkedinUrl.trim() && !isValidUrl(personal.linkedinUrl)) {
    errors.linkedinUrl = 'Enter a valid LinkedIn profile URL.';
  }
  if (personal.portfolioUrl.trim() && !isValidUrl(personal.portfolioUrl)) {
    errors.portfolioUrl = 'Enter a valid portfolio URL.';
  }
  if (personal.websiteUrl.trim() && !isValidUrl(personal.websiteUrl)) {
    errors.websiteUrl = 'Enter a valid website URL.';
  }
  return errors;
}

export function hasInvalidExperienceDates(doc: ResumeDocument): boolean {
  for (const exp of doc.experiences) {
    if (!validateDateRange(exp.startDate, exp.endDate, exp.isCurrent).valid) {
      return true;
    }
  }
  for (const edu of doc.education) {
    if (!validateDateRange(edu.startDate, edu.endDate, false).valid) {
      return true;
    }
  }
  for (const vol of doc.volunteerExperience) {
    if (!validateDateRange(vol.startDate, vol.endDate, false).valid) {
      return true;
    }
  }
  return false;
}

const PersonalSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  professionalHeadline: z.string(),
  email: z.string(),
  phone: z.string(),
  location: z.string(),
  linkedinUrl: z.string(),
  portfolioUrl: z.string(),
  websiteUrl: z.string(),
  profilePhotoRef: z.string().nullable(),
});

const AchievementSchema = z.object({
  id: z.string(),
  text: z.string(),
});

const ExperienceSchema = z.object({
  id: z.string(),
  jobTitle: z.string(),
  company: z.string(),
  employmentType: z.string(),
  location: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  isCurrent: z.boolean(),
  achievements: z.array(AchievementSchema),
  displayOrder: z.number(),
});

const EducationSchema = z.object({
  id: z.string(),
  qualification: z.string(),
  institution: z.string(),
  location: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  description: z.string(),
  displayOrder: z.number(),
});

const SkillSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  displayOrder: z.number(),
});

const LanguageSchema = z.object({
  id: z.string(),
  name: z.string(),
  proficiency: z.enum(['Native', 'Fluent', 'Advanced', 'Intermediate', 'Basic']),
  displayOrder: z.number(),
});

const ProjectSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  technologies: z.array(z.string()),
  projectUrl: z.string(),
  displayOrder: z.number(),
});

const CertificationSchema = z.object({
  id: z.string(),
  name: z.string(),
  issuingOrganization: z.string(),
  issueDate: z.string(),
  credentialUrl: z.string(),
  displayOrder: z.number(),
});

const AwardSchema = z.object({
  id: z.string(),
  title: z.string(),
  issuingOrganization: z.string(),
  date: z.string(),
  description: z.string(),
  displayOrder: z.number(),
});

const VolunteerSchema = z.object({
  id: z.string(),
  role: z.string(),
  organization: z.string(),
  location: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  description: z.string(),
  displayOrder: z.number(),
});

const CustomSectionEntrySchema = z.object({
  id: z.string(),
  title: z.string(),
  subtitle: z.string(),
  date: z.string(),
  description: z.string(),
});

const CustomSectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  entries: z.array(CustomSectionEntrySchema),
  visible: z.boolean(),
  displayOrder: z.number(),
});

const SectionConfigSchema = z.object({
  id: z.string(),
  kind: z.enum(['standard', 'custom']),
  label: z.string(),
  visible: z.boolean(),
  displayOrder: z.number(),
});

const DesignConfigurationSchema = z.object({
  accentColor: z.enum(['forest', 'amber', 'slate', 'terracotta']),
  fontSizeScale: z.enum(['small', 'medium', 'large']),
  sectionSpacing: z.enum(['tight', 'normal', 'relaxed']),
  density: z.enum(['compact', 'balanced', 'comfortable']),
  showPhoto: z.boolean(),
  photoPosition: z.enum(['top-left', 'top-right', 'center']),
  photoShape: z.enum(['rounded', 'circle', 'square']),
  showDividers: z.boolean(),
});

export const ResumeDocumentSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  createdAt: z.string(),
  updatedAt: z.string(),
  schemaVersion: z.number(),
  personal: PersonalSchema,
  professionalSummary: z.string(),
  experiences: z.array(ExperienceSchema),
  education: z.array(EducationSchema),
  skills: z.array(SkillSchema),
  languages: z.array(LanguageSchema),
  projects: z.array(ProjectSchema),
  certifications: z.array(CertificationSchema),
  awards: z.array(AwardSchema),
  volunteerExperience: z.array(VolunteerSchema),
  customSections: z.array(CustomSectionSchema),
  sectionConfiguration: z.array(SectionConfigSchema),
  selectedTemplate: z.enum(['signal', 'contour', 'fieldnote', 'summit']),
  designConfiguration: DesignConfigurationSchema,
  targetRole: z.string(),
  targetJobDescription: z.string(),
});

export function validateImportedResumeJson(raw: unknown): {
  valid: boolean;
  document?: ResumeDocument;
  error?: string;
} {
  const parsed = ResumeDocumentSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      valid: false,
      error: 'The selected file does not match the CLOVER resume document format.',
    };
  }
  return {
    valid: true,
    document: parsed.data as ResumeDocument,
  };
}
