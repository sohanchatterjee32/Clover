import { validateDateRange } from '../resume/date-formatting';
import type { ResumeDocument, WorkspaceSection } from '../resume/types';
import { isValidEmail } from '../resume/validation';

export interface ReadinessCheckItem {
  id: string;
  label: string;
  passed: boolean;
  pointsEarned: number;
  pointsMax: number;
  category: string;
  recommendation?: string;
  targetSection: WorkspaceSection;
}

export interface ReadinessCategoryScore {
  name: string;
  earned: number;
  max: number;
}

export interface ReadinessEvaluation {
  score: number;
  maxScore: number;
  categories: ReadinessCategoryScore[];
  completedChecks: ReadinessCheckItem[];
  incompleteChecks: ReadinessCheckItem[];
  recommendations: Array<{
    id: string;
    title: string;
    detail: string;
    targetSection: WorkspaceSection;
  }>;
}

const STRONG_ACTION_VERBS = new Set([
  'provision', 'provisioned', 'maintain', 'maintained', 'support', 'supported',
  'investigate', 'investigated', 'collaborate', 'collaborated', 'develop', 'developed',
  'participate', 'participated', 'architect', 'architected', 'build', 'built',
  'design', 'designed', 'lead', 'led', 'manage', 'managed', 'implement', 'implemented',
  'optimize', 'optimized', 'automate', 'automated', 'deliver', 'delivered',
  'coordinate', 'coordinated', 'resolve', 'resolved', 'configure', 'configured',
  'deploy', 'deployed', 'monitor', 'monitored', 'analyze', 'analyzed',
  'establish', 'established', 'streamline', 'streamlined', 'improve', 'improved',
  'execute', 'executed', 'reduce', 'reduced', 'increase', 'increased',
]);

export function evaluateResumeReadiness(doc: ResumeDocument): ReadinessEvaluation {
  const checks: ReadinessCheckItem[] = [];

  // 1. Contact information (15 pts)
  const hasName = doc.personal.fullName.trim().length >= 2;
  const hasValidEmail =
    doc.personal.email.trim().length > 0 && isValidEmail(doc.personal.email);
  const hasPhone = doc.personal.phone.trim().replace(/\D/g, '').length >= 7;

  checks.push({
    id: 'contact-name',
    label: 'Candidate full name provided',
    passed: hasName,
    pointsEarned: hasName ? 5 : 0,
    pointsMax: 5,
    category: 'Contact Information',
    recommendation: hasName ? undefined : 'Add your full name in Personal Profile.',
    targetSection: 'personal',
  });
  checks.push({
    id: 'contact-email',
    label: 'Valid email address included',
    passed: hasValidEmail,
    pointsEarned: hasValidEmail ? 5 : 0,
    pointsMax: 5,
    category: 'Contact Information',
    recommendation: hasValidEmail
      ? undefined
      : 'Add a valid contact email address so recruiters can reach you.',
    targetSection: 'personal',
  });
  checks.push({
    id: 'contact-phone',
    label: 'Phone number included',
    passed: hasPhone,
    pointsEarned: hasPhone ? 5 : 0,
    pointsMax: 5,
    category: 'Contact Information',
    recommendation: hasPhone
      ? undefined
      : 'Include a reachable phone number in Personal Profile.',
    targetSection: 'personal',
  });

  // 2. Professional introduction (15 pts)
  const hasHeadline = doc.personal.professionalHeadline.trim().length >= 3;
  const summaryWords = doc.professionalSummary
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  const hasMeaningfulSummary = summaryWords >= 18;

  checks.push({
    id: 'intro-headline',
    label: 'Professional headline defined',
    passed: hasHeadline,
    pointsEarned: hasHeadline ? 5 : 0,
    pointsMax: 5,
    category: 'Professional Introduction',
    recommendation: hasHeadline
      ? undefined
      : 'Add a clear target role or professional headline.',
    targetSection: 'personal',
  });
  checks.push({
    id: 'intro-summary',
    label: 'Meaningful professional summary (18+ words)',
    passed: hasMeaningfulSummary,
    pointsEarned: hasMeaningfulSummary ? 10 : summaryWords >= 6 ? 5 : 0,
    pointsMax: 10,
    category: 'Professional Introduction',
    recommendation: hasMeaningfulSummary
      ? undefined
      : 'Write a concise 2–4 sentence summary or generate a starting draft with Writing Coach.',
    targetSection: 'personal',
  });

  // 3. Experience quality (20 pts)
  const completeExps = doc.experiences.filter(
    (e) => e.jobTitle.trim().length > 0 && e.company.trim().length > 0
  );
  const meaningfulAchievements = doc.experiences.flatMap((e) =>
    e.achievements.filter((a) => a.text.trim().length >= 20)
  );
  const hasExperienceEntry = completeExps.length >= 1;
  const hasRichAchievements = meaningfulAchievements.length >= 3;

  checks.push({
    id: 'exp-entry',
    label: 'At least one experience entry with title and company',
    passed: hasExperienceEntry,
    pointsEarned: hasExperienceEntry ? 10 : 0,
    pointsMax: 10,
    category: 'Experience Quality',
    recommendation: hasExperienceEntry
      ? undefined
      : 'Add work experience with job title and organization name.',
    targetSection: 'experience',
  });
  checks.push({
    id: 'exp-bullets',
    label: 'Multiple descriptive achievement bullets (3+)',
    passed: hasRichAchievements,
    pointsEarned: hasRichAchievements
      ? 10
      : meaningfulAchievements.length >= 1
      ? 5
      : 0,
    pointsMax: 10,
    category: 'Experience Quality',
    recommendation: hasRichAchievements
      ? undefined
      : 'Include at least 3 concrete achievement bullets across your roles.',
    targetSection: 'experience',
  });

  // 4. Skills coverage (10 pts)
  const validSkills = doc.skills.filter((s) => s.name.trim().length > 0);
  const hasFiveSkills = validSkills.length >= 5;
  checks.push({
    id: 'skills-coverage',
    label: 'At least 5 relevant skills listed',
    passed: hasFiveSkills,
    pointsEarned: hasFiveSkills ? 10 : validSkills.length >= 2 ? 5 : 0,
    pointsMax: 10,
    category: 'Skills Coverage',
    recommendation: hasFiveSkills
      ? undefined
      : 'Add at least 5 core technical or domain skills in the Skills workspace.',
    targetSection: 'skills',
  });

  // 5. Education (10 pts)
  const completeEdu = doc.education.filter(
    (e) => e.qualification.trim().length > 0 && e.institution.trim().length > 0
  );
  const hasEdu = completeEdu.length >= 1;
  checks.push({
    id: 'education-complete',
    label: 'Education record with qualification and institution',
    passed: hasEdu,
    pointsEarned: hasEdu ? 10 : 0,
    pointsMax: 10,
    category: 'Education',
    recommendation: hasEdu
      ? undefined
      : 'Add your degree, diploma, or relevant educational background.',
    targetSection: 'education',
  });

  // 6. Achievement language (10 pts)
  const allBullets = doc.experiences.flatMap((e) =>
    e.achievements.map((a) => a.text.trim()).filter(Boolean)
  );
  const actionVerbBullets = allBullets.filter((b) => {
    const first = b.split(/\s+/)[0].toLowerCase().replace(/[^a-z]/g, '');
    return STRONG_ACTION_VERBS.has(first);
  });
  const strongLanguageRatio =
    allBullets.length > 0 ? actionVerbBullets.length / allBullets.length : 0;
  const passedLanguage = allBullets.length >= 2 && strongLanguageRatio >= 0.6;

  checks.push({
    id: 'achievement-language',
    label: 'Action-oriented achievement phrasing',
    passed: passedLanguage,
    pointsEarned: passedLanguage ? 10 : strongLanguageRatio > 0 ? 5 : 0,
    pointsMax: 10,
    category: 'Achievement Language',
    recommendation: passedLanguage
      ? undefined
      : 'Start achievement bullets with strong action verbs (such as Developed, Provisioned, Investigated).',
    targetSection: 'experience',
  });

  // 7. Document consistency (10 pts)
  const invalidExpDates = doc.experiences.some(
    (e) => !validateDateRange(e.startDate, e.endDate, e.isCurrent).valid
  );
  const invalidEduDates = doc.education.some(
    (e) => !validateDateRange(e.startDate, e.endDate, false).valid
  );
  const missingRoleDates = doc.experiences.some(
    (e) => (e.jobTitle.trim() || e.company.trim()) && !e.startDate.trim()
  );
  const datesConsistent =
    !invalidExpDates && !invalidEduDates && !missingRoleDates;

  checks.push({
    id: 'doc-consistency',
    label: 'Valid, consistent date ranges across entries',
    passed: datesConsistent,
    pointsEarned: datesConsistent
      ? 10
      : !invalidExpDates && !invalidEduDates
      ? 6
      : 0,
    pointsMax: 10,
    category: 'Document Consistency',
    recommendation: datesConsistent
      ? undefined
      : 'Verify that every experience entry has a valid start date and no end date precedes its start date.',
    targetSection: 'experience',
  });

  // 8. Completeness (10 pts)
  const hasAdditional =
    doc.languages.some((l) => l.name.trim()) ||
    doc.certifications.some((c) => c.name.trim()) ||
    doc.projects.some((p) => p.title.trim()) ||
    doc.awards.some((a) => a.title.trim()) ||
    doc.volunteerExperience.some((v) => v.role.trim());
  const hasLocationOrLinkedIn =
    doc.personal.location.trim().length > 0 ||
    doc.personal.linkedinUrl.trim().length > 0;
  const completenessPassed = hasAdditional && hasLocationOrLinkedIn;

  checks.push({
    id: 'doc-completeness',
    label: 'Supporting profile links and additional credentials',
    passed: completenessPassed,
    pointsEarned:
      (hasAdditional ? 5 : 0) + (hasLocationOrLinkedIn ? 5 : 0),
    pointsMax: 10,
    category: 'Completeness',
    recommendation: completenessPassed
      ? undefined
      : 'Add location or LinkedIn profile and relevant Languages, Certifications, or Projects.',
    targetSection: hasAdditional ? 'personal' : 'additional',
  });

  const categoryMap = new Map<string, { earned: number; max: number }>();
  for (const c of checks) {
    const prev = categoryMap.get(c.category) || { earned: 0, max: 0 };
    categoryMap.set(c.category, {
      earned: prev.earned + c.pointsEarned,
      max: prev.max + c.pointsMax,
    });
  }

  const categories: ReadinessCategoryScore[] = Array.from(
    categoryMap.entries()
  ).map(([name, vals]) => ({
    name,
    earned: vals.earned,
    max: vals.max,
  }));

  const score = checks.reduce((sum, c) => sum + c.pointsEarned, 0);
  const maxScore = checks.reduce((sum, c) => sum + c.pointsMax, 0);

  const completedChecks = checks.filter((c) => c.passed);
  const incompleteChecks = checks.filter((c) => !c.passed);

  const recommendations = incompleteChecks
    .filter((c) => c.recommendation)
    .map((c) => ({
      id: c.id,
      title: c.label,
      detail: c.recommendation as string,
      targetSection: c.targetSection,
    }));

  return {
    score,
    maxScore,
    categories,
    completedChecks,
    incompleteChecks,
    recommendations,
  };
}
