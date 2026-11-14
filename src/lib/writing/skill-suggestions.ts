export interface ProfessionSkillGroup {
  profession: string;
  keywords: string[];
  suggestions: Array<{ name: string; category: string }>;
}

export const SKILL_CATEGORIES = [
  'Technical Skills',
  'Cloud Platforms',
  'Infrastructure',
  'Programming Languages',
  'Software and Tools',
  'Management',
  'Communication',
  'Business Skills',
] as const;

export const PROFESSION_SKILL_MAPPINGS: ProfessionSkillGroup[] = [
  {
    profession: 'Software Developer',
    keywords: ['software', 'developer', 'frontend', 'backend', 'full stack', 'engineer'],
    suggestions: [
      { name: 'TypeScript', category: 'Programming Languages' },
      { name: 'JavaScript', category: 'Programming Languages' },
      { name: 'React', category: 'Technical Skills' },
      { name: 'Node.js', category: 'Programming Languages' },
      { name: 'PostgreSQL', category: 'Technical Skills' },
      { name: 'REST APIs', category: 'Technical Skills' },
      { name: 'Automated Testing', category: 'Technical Skills' },
      { name: 'Git', category: 'Software and Tools' },
      { name: 'Docker', category: 'Infrastructure' },
      { name: 'Code Review', category: 'Communication' },
    ],
  },
  {
    profession: 'Cloud Engineer',
    keywords: ['cloud', 'aws', 'azure', 'gcp', 'platform'],
    suggestions: [
      { name: 'AWS', category: 'Cloud Platforms' },
      { name: 'Terraform', category: 'Infrastructure' },
      { name: 'IAM & Security', category: 'Cloud Platforms' },
      { name: 'VPC Networking', category: 'Infrastructure' },
      { name: 'Kubernetes', category: 'Infrastructure' },
      { name: 'CloudWatch', category: 'Software and Tools' },
      { name: 'Linux Administration', category: 'Infrastructure' },
      { name: 'CI/CD Pipelines', category: 'Infrastructure' },
      { name: 'Cost Optimization', category: 'Business Skills' },
      { name: 'Incident Management', category: 'Infrastructure' },
    ],
  },
  {
    profession: 'DevOps Engineer',
    keywords: ['devops', 'sre', 'site reliability', 'release', 'automation'],
    suggestions: [
      { name: 'CI/CD', category: 'Infrastructure' },
      { name: 'Docker', category: 'Infrastructure' },
      { name: 'Kubernetes', category: 'Infrastructure' },
      { name: 'Terraform', category: 'Infrastructure' },
      { name: 'GitHub Actions', category: 'Software and Tools' },
      { name: 'Prometheus', category: 'Software and Tools' },
      { name: 'Grafana', category: 'Software and Tools' },
      { name: 'Ansible', category: 'Infrastructure' },
      { name: 'Bash Scripting', category: 'Programming Languages' },
      { name: 'Observability', category: 'Technical Skills' },
    ],
  },
  {
    profession: 'Systems Administrator',
    keywords: ['systems', 'sysadmin', 'network', 'it support', 'administrator'],
    suggestions: [
      { name: 'Linux Administration', category: 'Infrastructure' },
      { name: 'Windows Server', category: 'Infrastructure' },
      { name: 'Active Directory', category: 'Infrastructure' },
      { name: 'TCP/IP Networking', category: 'Technical Skills' },
      { name: 'DNS & DHCP', category: 'Infrastructure' },
      { name: 'Backup & Recovery', category: 'Infrastructure' },
      { name: 'Virtualization', category: 'Infrastructure' },
      { name: 'Patch Management', category: 'Software and Tools' },
      { name: 'Hardware Troubleshooting', category: 'Technical Skills' },
    ],
  },
  {
    profession: 'Data Analyst',
    keywords: ['data', 'analytics', 'bi', 'reporting', 'sql'],
    suggestions: [
      { name: 'SQL', category: 'Technical Skills' },
      { name: 'Python', category: 'Programming Languages' },
      { name: 'Excel', category: 'Software and Tools' },
      { name: 'Tableau', category: 'Software and Tools' },
      { name: 'Power BI', category: 'Software and Tools' },
      { name: 'Data Modeling', category: 'Technical Skills' },
      { name: 'Statistical Analysis', category: 'Technical Skills' },
      { name: 'A/B Testing', category: 'Business Skills' },
      { name: 'Data Visualization', category: 'Communication' },
    ],
  },
  {
    profession: 'UI/UX Designer',
    keywords: ['ui', 'ux', 'designer', 'product design', 'interface'],
    suggestions: [
      { name: 'Figma', category: 'Software and Tools' },
      { name: 'Design Systems', category: 'Technical Skills' },
      { name: 'Wireframing', category: 'Technical Skills' },
      { name: 'Prototyping', category: 'Technical Skills' },
      { name: 'Usability Testing', category: 'Technical Skills' },
      { name: 'Information Architecture', category: 'Technical Skills' },
      { name: 'Accessibility (WCAG)', category: 'Technical Skills' },
      { name: 'User Research', category: 'Communication' },
    ],
  },
  {
    profession: 'Digital Marketer',
    keywords: ['marketing', 'growth', 'seo', 'content', 'campaign'],
    suggestions: [
      { name: 'SEO & SEM', category: 'Technical Skills' },
      { name: 'Google Analytics', category: 'Software and Tools' },
      { name: 'Content Strategy', category: 'Communication' },
      { name: 'Email Marketing', category: 'Business Skills' },
      { name: 'Paid Acquisition', category: 'Business Skills' },
      { name: 'Conversion Optimization', category: 'Business Skills' },
      { name: 'Copywriting', category: 'Communication' },
      { name: 'Campaign Reporting', category: 'Business Skills' },
    ],
  },
  {
    profession: 'Project Manager',
    keywords: ['project manager', 'program manager', 'scrum', 'delivery'],
    suggestions: [
      { name: 'Project Planning', category: 'Management' },
      { name: 'Agile & Scrum', category: 'Management' },
      { name: 'Risk Management', category: 'Management' },
      { name: 'Stakeholder Alignment', category: 'Communication' },
      { name: 'Budget Tracking', category: 'Business Skills' },
      { name: 'Jira', category: 'Software and Tools' },
      { name: 'Resource Allocation', category: 'Management' },
      { name: 'Roadmap Execution', category: 'Business Skills' },
    ],
  },
  {
    profession: 'Accountant',
    keywords: ['accountant', 'finance', 'audit', 'tax', 'bookkeeping'],
    suggestions: [
      { name: 'Financial Reporting', category: 'Business Skills' },
      { name: 'General Ledger', category: 'Business Skills' },
      { name: 'Account Reconciliation', category: 'Business Skills' },
      { name: 'GAAP Compliance', category: 'Business Skills' },
      { name: 'Tax Preparation', category: 'Business Skills' },
      { name: 'Accounts Payable / Receivable', category: 'Business Skills' },
      { name: 'Microsoft Excel', category: 'Software and Tools' },
      { name: 'QuickBooks', category: 'Software and Tools' },
    ],
  },
  {
    profession: 'Sales Professional',
    keywords: ['sales', 'account executive', 'business development', 'bdr'],
    suggestions: [
      { name: 'Pipeline Management', category: 'Business Skills' },
      { name: 'Consultative Selling', category: 'Communication' },
      { name: 'Contract Negotiation', category: 'Business Skills' },
      { name: 'CRM Administration', category: 'Software and Tools' },
      { name: 'Account Expansion', category: 'Business Skills' },
      { name: 'Lead Qualification', category: 'Business Skills' },
      { name: 'Executive Presentations', category: 'Communication' },
    ],
  },
  {
    profession: 'Teacher',
    keywords: ['teacher', 'educator', 'instructor', 'faculty', 'curriculum'],
    suggestions: [
      { name: 'Curriculum Design', category: 'Management' },
      { name: 'Classroom Management', category: 'Management' },
      { name: 'Student Assessment', category: 'Technical Skills' },
      { name: 'Differentiated Instruction', category: 'Communication' },
      { name: 'Lesson Planning', category: 'Management' },
      { name: 'Parent Communication', category: 'Communication' },
      { name: 'Educational Technology', category: 'Software and Tools' },
    ],
  },
  {
    profession: 'HR Professional',
    keywords: ['hr', 'human resources', 'recruiter', 'talent', 'people'],
    suggestions: [
      { name: 'Talent Acquisition', category: 'Business Skills' },
      { name: 'Employee Relations', category: 'Communication' },
      { name: 'Onboarding Programs', category: 'Management' },
      { name: 'Performance Management', category: 'Management' },
      { name: 'HRIS Administration', category: 'Software and Tools' },
      { name: 'Policy Compliance', category: 'Business Skills' },
      { name: 'Compensation Benchmarking', category: 'Business Skills' },
    ],
  },
  {
    profession: 'Business Analyst',
    keywords: ['business analyst', 'requirements', 'process', 'operations analyst'],
    suggestions: [
      { name: 'Requirements Gathering', category: 'Communication' },
      { name: 'Process Mapping', category: 'Business Skills' },
      { name: 'SQL', category: 'Technical Skills' },
      { name: 'User Stories', category: 'Communication' },
      { name: 'Stakeholder Interviews', category: 'Communication' },
      { name: 'Gap Analysis', category: 'Business Skills' },
      { name: 'UAT Coordination', category: 'Management' },
      { name: 'Jira & Confluence', category: 'Software and Tools' },
    ],
  },
];

export function detectBestProfessionCategory(headline: string, targetRole: string): string {
  const combined = `${headline} ${targetRole}`.toLowerCase();
  for (const group of PROFESSION_SKILL_MAPPINGS) {
    if (group.keywords.some((kw) => combined.includes(kw))) {
      return group.profession;
    }
  }
  return PROFESSION_SKILL_MAPPINGS[0].profession;
}
