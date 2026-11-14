import type { ResumeDocument, WorkspaceSection } from '../resume/types';
import { extractJobKeywords, type ExtractedKeyword } from './keyword-extractor';

export interface JobFitSectionCheck {
  sectionName: string;
  targetSection: WorkspaceSection;
  status: 'aligned' | 'needs-attention';
  note: string;
}

export interface JobFitAnalysisResult {
  hasJobDescription: boolean;
  totalKeywords: number;
  matchingKeywords: ExtractedKeyword[];
  missingKeywords: ExtractedKeyword[];
  coveragePercent: number;
  sectionChecks: JobFitSectionCheck[];
  recommendations: string[];
}

export function analyzeJobFit(
  doc: ResumeDocument,
  jobDescription: string
): JobFitAnalysisResult {
  const trimmed = (jobDescription || '').trim();
  if (!trimmed) {
    return {
      hasJobDescription: false,
      totalKeywords: 0,
      matchingKeywords: [],
      missingKeywords: [],
      coveragePercent: 0,
      sectionChecks: [],
      recommendations: [],
    };
  }

  const extracted = extractJobKeywords(trimmed);
  const headlineText = doc.personal.professionalHeadline.toLowerCase();
  const summaryText = doc.professionalSummary.toLowerCase();
  const experienceText = doc.experiences
    .map(
      (e) =>
        `${e.jobTitle} ${e.company} ${e.achievements
          .map((a) => a.text)
          .join(' ')}`
    )
    .join(' ')
    .toLowerCase();
  const skillsText = doc.skills.map((s) => s.name).join(' ').toLowerCase();
  const projectsText = doc.projects
    .map((p) => `${p.title} ${p.description} ${p.technologies.join(' ')}`)
    .join(' ')
    .toLowerCase();
  const certificationsText = doc.certifications
    .map((c) => `${c.name} ${c.issuingOrganization}`)
    .join(' ')
    .toLowerCase();

  const fullCorpus = [
    headlineText,
    summaryText,
    experienceText,
    skillsText,
    projectsText,
    certificationsText,
  ].join(' ');

  const matchingKeywords: ExtractedKeyword[] = [];
  const missingKeywords: ExtractedKeyword[] = [];

  for (const kw of extracted) {
    const norm = kw.normalized;
    const escaped = norm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, 'i');
    if (regex.test(fullCorpus)) {
      matchingKeywords.push(kw);
    } else {
      missingKeywords.push(kw);
    }
  }

  const totalKeywords = extracted.length;
  const coveragePercent =
    totalKeywords > 0
      ? Math.round((matchingKeywords.length / totalKeywords) * 100)
      : 0;

  const sectionChecks: JobFitSectionCheck[] = [];

  const headlineOverlap = extracted.some((k) =>
    headlineText.includes(k.normalized)
  );
  sectionChecks.push({
    sectionName: 'Professional Headline & Summary',
    targetSection: 'personal',
    status:
      headlineOverlap ||
      extracted.some((k) => summaryText.includes(k.normalized))
        ? 'aligned'
        : 'needs-attention',
    note:
      headlineOverlap ||
      extracted.some((k) => summaryText.includes(k.normalized))
        ? 'Your headline or summary reflects terms from the target posting.'
        : 'Consider aligning your headline or summary wording with the core focus of the role if it matches your background.',
  });

  const skillMatches = extracted.filter((k) =>
    skillsText.includes(k.normalized)
  ).length;
  sectionChecks.push({
    sectionName: 'Skills',
    targetSection: 'skills',
    status: skillMatches >= Math.min(3, totalKeywords) ? 'aligned' : 'needs-attention',
    note:
      skillMatches > 0
        ? `${skillMatches} extracted term${skillMatches === 1 ? '' : 's'} appear in your Skills list.`
        : 'None of the extracted job keywords were found in your Skills list.',
  });

  const expMatches = extracted.filter((k) =>
    experienceText.includes(k.normalized)
  ).length;
  sectionChecks.push({
    sectionName: 'Work Experience',
    targetSection: 'experience',
    status: expMatches >= Math.min(3, totalKeywords) ? 'aligned' : 'needs-attention',
    note:
      expMatches > 0
        ? `${expMatches} extracted term${expMatches === 1 ? '' : 's'} are evidenced in your experience descriptions.`
        : 'Add concrete context in Experience bullets for relevant technologies you have actually used.',
  });

  const recommendations: string[] = [];
  if (missingKeywords.length > 0) {
    const sampleMissing = missingKeywords
      .slice(0, 5)
      .map((k) => k.term)
      .join(', ');
    recommendations.push(
      `Review potentially missing terms (${sampleMissing}) and add only those that genuinely reflect your hands-on experience.`
    );
  }
  if (skillMatches < 3 && totalKeywords >= 3) {
    recommendations.push(
      'Check the Skills workspace to ensure verified tools and platforms from your experience are explicitly listed.'
    );
  }
  if (!doc.professionalSummary.trim()) {
    recommendations.push(
      'Add a Professional Summary tailored to the role focus areas.'
    );
  }
  if (recommendations.length === 0) {
    recommendations.push(
      'Strong term alignment across your profile. Verify that your achievements clearly demonstrate how you applied these skills.'
    );
  }

  return {
    hasJobDescription: true,
    totalKeywords,
    matchingKeywords,
    missingKeywords,
    coveragePercent,
    sectionChecks,
    recommendations,
  };
}
