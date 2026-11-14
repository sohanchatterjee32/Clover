import type { ResumeDocument } from '../resume/types';

export interface SummaryDraftResult {
  canGenerate: boolean;
  draft: string;
  missingDetails: string[];
}

export function generateProfessionalSummaryDraft(
  doc: ResumeDocument
): SummaryDraftResult {
  const missingDetails: string[] = [];

  const headline = doc.personal.professionalHeadline.trim();
  const experiences = doc.experiences.filter(
    (e) => e.jobTitle.trim() || e.company.trim()
  );
  const skills = doc.skills.map((s) => s.name.trim()).filter(Boolean);
  const projects = doc.projects.filter((p) => p.title.trim());

  if (!headline) {
    missingDetails.push('Professional Headline in Personal Profile');
  }
  if (experiences.length === 0 && projects.length === 0) {
    missingDetails.push('At least one Experience or Project entry');
  }
  if (skills.length === 0) {
    missingDetails.push('Core Skills in the Skills workspace');
  }

  if (!headline && experiences.length === 0 && skills.length === 0) {
    return {
      canGenerate: false,
      draft: '',
      missingDetails,
    };
  }

  const rolePhrase = headline || experiences[0]?.jobTitle.trim() || 'Professional';
  const focusDomains: string[] = [];

  // Extract genuine focus themes from user's own achievement text without inventing anything
  const achievementBlob = experiences
    .flatMap((e) => e.achievements.map((a) => a.text))
    .join(' ')
    .toLowerCase();

  if (/\b(cloud|aws|azure|gcp|infrastructure|terraform)\b/.test(achievementBlob)) {
    focusDomains.push('cloud infrastructure and environment reliability');
  }
  if (/\b(api|backend|database|server|software|application|code)\b/.test(achievementBlob)) {
    focusDomains.push('application development and system integration');
  }
  if (/\b(incident|monitor|grafana|log|troubleshoot|debug|alert)\b/.test(achievementBlob)) {
    focusDomains.push('monitoring, incident investigation, and operational stability');
  }
  if (/\b(design|ui|ux|prototype|wireframe|research|accessibility)\b/.test(achievementBlob)) {
    focusDomains.push('user-centered design and interface clarity');
  }
  if (/\b(data|sql|analytics|dashboard|report|model)\b/.test(achievementBlob)) {
    focusDomains.push('data analysis and structured reporting');
  }
  if (/\b(project|stakeholder|roadmap|agile|team|collaborat|lead)\b/.test(achievementBlob)) {
    focusDomains.push('cross-functional collaboration and structured delivery');
  }

  const sentences: string[] = [];

  if (focusDomains.length > 0) {
    sentences.push(
      `${rolePhrase} with hands-on background in ${focusDomains.slice(0, 3).join(', ')}.`
    );
  } else if (experiences.length > 0) {
    const latest = experiences[0];
    const companyText = latest.company.trim() ? ` at ${latest.company.trim()}` : '';
    sentences.push(
      `${rolePhrase} with experience contributing to ${latest.jobTitle.trim() || 'team'} responsibilities${companyText}.`
    );
  } else {
    sentences.push(
      `${rolePhrase} focused on delivering dependable, well-structured work.`
    );
  }

  if (skills.length > 0) {
    const topSkills = skills.slice(0, 6);
    const formattedSkills =
      topSkills.length > 1
        ? `${topSkills.slice(0, -1).join(', ')}, and ${topSkills[topSkills.length - 1]}`
        : topSkills[0];
    sentences.push(`Experienced in working with ${formattedSkills}.`);
  }

  if (projects.length > 0) {
    sentences.push(
      `Demonstrated practical capability through initiatives including ${projects
        .slice(0, 2)
        .map((p) => p.title.trim())
        .join(' and ')}.`
    );
  } else if (experiences.length > 1) {
    sentences.push(
      'Committed to clear communication, dependable execution, and continuous improvement across engineering and team workflows.'
    );
  }

  return {
    canGenerate: true,
    draft: sentences.join(' '),
    missingDetails,
  };
}
