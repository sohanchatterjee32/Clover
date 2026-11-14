import type {
  AccentColorId,
  DesignConfiguration,
  ResumeDocument,
  SectionConfigItem,
} from './types';

export const CURRENT_SCHEMA_VERSION = 1;

export const ACCENT_PALETTES: Record<
  AccentColorId,
  { id: AccentColorId; name: string; hex: string; softBg: string; description: string }
> = {
  forest: {
    id: 'forest',
    name: 'Forest',
    hex: '#183B36',
    softBg: '#EDF3F1',
    description: 'Deep editorial green with calm authority',
  },
  amber: {
    id: 'amber',
    name: 'Amber',
    hex: '#D69A43',
    softBg: '#FBF4E7',
    description: 'Burnished ochre for warm visual focus',
  },
  slate: {
    id: 'slate',
    name: 'Slate',
    hex: '#475569',
    softBg: '#F1F5F9',
    description: 'Neutral slate for understated clarity',
  },
  terracotta: {
    id: 'terracotta',
    name: 'Terracotta',
    hex: '#B65E45',
    softBg: '#FAF0EC',
    description: 'Warm clay accent for creative distinction',
  },
};

export function createId(prefix = 'id'): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function createDefaultSectionConfiguration(): SectionConfigItem[] {
  return [
    { id: 'summary', kind: 'standard', label: 'Professional Summary', visible: true, displayOrder: 0 },
    { id: 'experience', kind: 'standard', label: 'Experience', visible: true, displayOrder: 1 },
    { id: 'skills', kind: 'standard', label: 'Skills', visible: true, displayOrder: 2 },
    { id: 'education', kind: 'standard', label: 'Education', visible: true, displayOrder: 3 },
    { id: 'projects', kind: 'standard', label: 'Projects', visible: true, displayOrder: 4 },
    { id: 'certifications', kind: 'standard', label: 'Certifications', visible: true, displayOrder: 5 },
    { id: 'languages', kind: 'standard', label: 'Languages', visible: true, displayOrder: 6 },
    { id: 'awards', kind: 'standard', label: 'Awards', visible: true, displayOrder: 7 },
    { id: 'volunteer', kind: 'standard', label: 'Volunteer Experience', visible: true, displayOrder: 8 },
  ];
}

export function createDefaultDesignConfiguration(): DesignConfiguration {
  return {
    accentColor: 'forest',
    fontSizeScale: 'medium',
    sectionSpacing: 'normal',
    density: 'balanced',
    showPhoto: false,
    photoPosition: 'top-right',
    photoShape: 'rounded',
    showDividers: true,
  };
}

export function createSampleDocument(existingId?: string): ResumeDocument {
  const now = new Date().toISOString();
  return {
    id: existingId || createId('doc'),
    name: 'Rohan Mehta — Cloud Platform Engineer',
    createdAt: now,
    updatedAt: now,
    schemaVersion: CURRENT_SCHEMA_VERSION,
    personal: {
      id: createId('per'),
      fullName: 'Rohan Mehta',
      professionalHeadline: 'Cloud Platform Engineer',
      email: 'rohan.mehta@example.com',
      phone: '+91 98765 43210',
      location: 'Bengaluru, India',
      linkedinUrl: 'linkedin.com/in/rohan-mehta-demo',
      portfolioUrl: '',
      websiteUrl: '',
      profilePhotoRef: null,
    },
    professionalSummary:
      'Cloud Platform Engineer with experience supporting cloud infrastructure, backend applications, deployment workflows, and operational reliability. Skilled in AWS services, infrastructure provisioning, monitoring, incident investigation, and backend development. Experienced in collaborating with engineering and operations teams to maintain stable environments and improve application performance.',
    experiences: [
      {
        id: createId('exp'),
        jobTitle: 'Cloud Platform Engineer',
        company: 'Nimbus Technologies',
        employmentType: 'Full-time',
        location: 'Bengaluru, India',
        startDate: '2023-01',
        endDate: '',
        isCurrent: true,
        achievements: [
          {
            id: createId('ach'),
            text: 'Provision and maintain cloud infrastructure using Infrastructure as Code practices.',
          },
          {
            id: createId('ach'),
            text: 'Support AWS services, including EC2, Lambda, ECS, S3, and networking components.',
          },
          {
            id: createId('ach'),
            text: 'Investigate application and infrastructure incidents using logs and monitoring dashboards.',
          },
          {
            id: createId('ach'),
            text: 'Collaborate with developers to troubleshoot backend application issues.',
          },
          {
            id: createId('ach'),
            text: 'Support deployment validation and environment configuration activities.',
          },
        ],
        displayOrder: 0,
      },
      {
        id: createId('exp'),
        jobTitle: 'Software Engineer',
        company: 'Vertex Systems',
        employmentType: 'Full-time',
        location: 'Pune, India',
        startDate: '2020-07',
        endDate: '2022-12',
        isCurrent: false,
        achievements: [
          {
            id: createId('ach'),
            text: 'Developed and maintained backend application functionality.',
          },
          {
            id: createId('ach'),
            text: 'Supported REST API integrations and database connectivity.',
          },
          {
            id: createId('ach'),
            text: 'Investigated application errors and production incidents.',
          },
          {
            id: createId('ach'),
            text: 'Collaborated with team members to improve service reliability.',
          },
          {
            id: createId('ach'),
            text: 'Participated in development, testing, and release activities.',
          },
        ],
        displayOrder: 1,
      },
    ],
    education: [
      {
        id: createId('edu'),
        qualification: 'Bachelor of Technology in Computer Science',
        institution: 'Western Institute of Technology',
        location: '',
        startDate: '2016-06',
        endDate: '2020-05',
        description: '',
        displayOrder: 0,
      },
    ],
    skills: [
      { id: createId('sk'), name: 'AWS', category: 'Cloud Platforms', displayOrder: 0 },
      { id: createId('sk'), name: 'EC2', category: 'Cloud Platforms', displayOrder: 1 },
      { id: createId('sk'), name: 'Lambda', category: 'Cloud Platforms', displayOrder: 2 },
      { id: createId('sk'), name: 'ECS', category: 'Cloud Platforms', displayOrder: 3 },
      { id: createId('sk'), name: 'S3', category: 'Cloud Platforms', displayOrder: 4 },
      { id: createId('sk'), name: 'Terraform', category: 'Infrastructure', displayOrder: 5 },
      { id: createId('sk'), name: 'Node.js', category: 'Programming Languages', displayOrder: 6 },
      { id: createId('sk'), name: 'REST APIs', category: 'Technical Skills', displayOrder: 7 },
      { id: createId('sk'), name: 'SQL', category: 'Technical Skills', displayOrder: 8 },
      { id: createId('sk'), name: 'Git', category: 'Software and Tools', displayOrder: 9 },
      { id: createId('sk'), name: 'Grafana', category: 'Software and Tools', displayOrder: 10 },
      { id: createId('sk'), name: 'Incident Management', category: 'Infrastructure', displayOrder: 11 },
    ],
    languages: [
      { id: createId('lang'), name: 'English', proficiency: 'Fluent', displayOrder: 0 },
      { id: createId('lang'), name: 'Hindi', proficiency: 'Native', displayOrder: 1 },
      { id: createId('lang'), name: 'Bengali', proficiency: 'Fluent', displayOrder: 2 },
    ],
    projects: [],
    certifications: [
      {
        id: createId('cert'),
        name: 'AWS Cloud Practitioner',
        issuingOrganization: 'Amazon Web Services',
        issueDate: '2025-03',
        credentialUrl: '',
        displayOrder: 0,
      },
    ],
    awards: [],
    volunteerExperience: [],
    customSections: [],
    sectionConfiguration: createDefaultSectionConfiguration(),
    selectedTemplate: 'signal',
    designConfiguration: createDefaultDesignConfiguration(),
    targetRole: 'Cloud Engineer',
    targetJobDescription: '',
  };
}

export function createBlankDocument(name = 'Untitled Resume'): ResumeDocument {
  const now = new Date().toISOString();
  return {
    id: createId('doc'),
    name,
    createdAt: now,
    updatedAt: now,
    schemaVersion: CURRENT_SCHEMA_VERSION,
    personal: {
      id: createId('per'),
      fullName: '',
      professionalHeadline: '',
      email: '',
      phone: '',
      location: '',
      linkedinUrl: '',
      portfolioUrl: '',
      websiteUrl: '',
      profilePhotoRef: null,
    },
    professionalSummary: '',
    experiences: [],
    education: [],
    skills: [],
    languages: [],
    projects: [],
    certifications: [],
    awards: [],
    volunteerExperience: [],
    customSections: [],
    sectionConfiguration: createDefaultSectionConfiguration(),
    selectedTemplate: 'signal',
    designConfiguration: createDefaultDesignConfiguration(),
    targetRole: '',
    targetJobDescription: '',
  };
}
