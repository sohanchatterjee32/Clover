export type TemplateId = 'signal' | 'contour' | 'fieldnote' | 'summit';

export type AccentColorId = 'forest' | 'amber' | 'slate' | 'terracotta';

export type WorkspaceSection =
  | 'overview'
  | 'personal'
  | 'experience'
  | 'education'
  | 'skills'
  | 'additional'
  | 'design'
  | 'review'
  | 'export';

export type StandardSectionKey =
  | 'summary'
  | 'experience'
  | 'education'
  | 'skills'
  | 'languages'
  | 'projects'
  | 'certifications'
  | 'awards'
  | 'volunteer';

export type LanguageProficiency = 'Native' | 'Fluent' | 'Advanced' | 'Intermediate' | 'Basic';

export type PhotoPosition = 'top-left' | 'top-right' | 'center';

export type PhotoShape = 'rounded' | 'circle' | 'square';

export type DocumentDensity = 'compact' | 'balanced' | 'comfortable';

export interface PersonalInfo {
  id: string;
  fullName: string;
  professionalHeadline: string;
  email: string;
  phone: string;
  location: string;
  linkedinUrl: string;
  portfolioUrl: string;
  websiteUrl: string;
  profilePhotoRef: string | null;
}

export interface AchievementItem {
  id: string;
  text: string;
}

export interface ExperienceItem {
  id: string;
  jobTitle: string;
  company: string;
  employmentType: string;
  location: string;
  startDate: string; // YYYY-MM or empty
  endDate: string; // YYYY-MM or empty
  isCurrent: boolean;
  achievements: AchievementItem[];
  displayOrder: number;
}

export interface EducationItem {
  id: string;
  qualification: string;
  institution: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
  displayOrder: number;
}

export interface SkillItem {
  id: string;
  name: string;
  category: string;
  displayOrder: number;
}

export interface LanguageItem {
  id: string;
  name: string;
  proficiency: LanguageProficiency;
  displayOrder: number;
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  projectUrl: string;
  displayOrder: number;
}

export interface CertificationItem {
  id: string;
  name: string;
  issuingOrganization: string;
  issueDate: string;
  credentialUrl: string;
  displayOrder: number;
}

export interface AwardItem {
  id: string;
  title: string;
  issuingOrganization: string;
  date: string;
  description: string;
  displayOrder: number;
}

export interface VolunteerItem {
  id: string;
  role: string;
  organization: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
  displayOrder: number;
}

export interface CustomSectionEntry {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  description: string;
}

export interface CustomSection {
  id: string;
  title: string;
  description: string;
  entries: CustomSectionEntry[];
  visible: boolean;
  displayOrder: number;
}

export interface SectionConfigItem {
  id: string; // matches StandardSectionKey or `custom:${customSectionId}`
  kind: 'standard' | 'custom';
  label: string;
  visible: boolean;
  displayOrder: number;
}

export interface DesignConfiguration {
  accentColor: AccentColorId;
  fontSizeScale: 'small' | 'medium' | 'large';
  sectionSpacing: 'tight' | 'normal' | 'relaxed';
  density: DocumentDensity;
  showPhoto: boolean;
  photoPosition: PhotoPosition;
  photoShape: PhotoShape;
  showDividers: boolean;
}

export interface ResumeDocument {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  schemaVersion: number;
  personal: PersonalInfo;
  professionalSummary: string;
  experiences: ExperienceItem[];
  education: EducationItem[];
  skills: SkillItem[];
  languages: LanguageItem[];
  projects: ProjectItem[];
  certifications: CertificationItem[];
  awards: AwardItem[];
  volunteerExperience: VolunteerItem[];
  customSections: CustomSection[];
  sectionConfiguration: SectionConfigItem[];
  selectedTemplate: TemplateId;
  designConfiguration: DesignConfiguration;
  targetRole: string;
  targetJobDescription: string;
}

export type SaveStatus = 'saved' | 'saving' | 'error';
