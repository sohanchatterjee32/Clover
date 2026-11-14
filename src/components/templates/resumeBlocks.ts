import { getOrderedVisibleSections } from '../../lib/resume/section-configuration';
import type {
  AwardItem,
  CertificationItem,
  CustomSectionEntry,
  EducationItem,
  ExperienceItem,
  LanguageItem,
  ProjectItem,
  ResumeDocument,
  SkillItem,
  VolunteerItem,
} from '../../lib/resume/types';

export type ResumeFlowBlock =
  | {
      id: string;
      kind: 'header';
      keepWithNext?: boolean;
    }
  | {
      id: string;
      kind: 'section-header';
      sectionId: string;
      title: string;
      keepWithNext: true;
    }
  | {
      id: string;
      kind: 'summary-text';
      text: string;
    }
  | {
      id: string;
      kind: 'experience-header';
      item: ExperienceItem;
      keepWithNext: boolean;
    }
  | {
      id: string;
      kind: 'experience-achievement';
      experienceId: string;
      achievementId: string;
      text: string;
    }
  | {
      id: string;
      kind: 'education-item';
      item: EducationItem;
    }
  | {
      id: string;
      kind: 'skills-group';
      category: string;
      skills: SkillItem[];
    }
  | {
      id: string;
      kind: 'skills-flat';
      skills: SkillItem[];
    }
  | {
      id: string;
      kind: 'languages-list';
      languages: LanguageItem[];
    }
  | {
      id: string;
      kind: 'project-item';
      item: ProjectItem;
    }
  | {
      id: string;
      kind: 'certification-item';
      item: CertificationItem;
    }
  | {
      id: string;
      kind: 'award-item';
      item: AwardItem;
    }
  | {
      id: string;
      kind: 'volunteer-item';
      item: VolunteerItem;
    }
  | {
      id: string;
      kind: 'custom-description';
      text: string;
      keepWithNext?: boolean;
    }
  | {
      id: string;
      kind: 'custom-entry';
      entry: CustomSectionEntry;
    };

const CONTOUR_SIDEBAR_SECTIONS = new Set([
  'skills',
  'languages',
  'certifications',
  'awards',
]);

function buildBlocksForSection(
  doc: ResumeDocument,
  sectionId: string,
  sectionLabel: string,
  groupSkillsByCategory: boolean
): ResumeFlowBlock[] {
  const blocks: ResumeFlowBlock[] = [];

  if (sectionId.startsWith('custom:')) {
    const customId = sectionId.slice('custom:'.length);
    const custom = doc.customSections.find((s) => s.id === customId);
    if (!custom) return [];
    const validEntries = custom.entries.filter(
      (e) => e.title.trim() || e.subtitle.trim() || e.description.trim()
    );
    if (!custom.description.trim() && validEntries.length === 0) return [];

    blocks.push({
      id: `sec-${sectionId}`,
      kind: 'section-header',
      sectionId,
      title: custom.title.trim() || sectionLabel,
      keepWithNext: true,
    });
    if (custom.description.trim()) {
      blocks.push({
        id: `custom-desc-${custom.id}`,
        kind: 'custom-description',
        text: custom.description.trim(),
        keepWithNext: validEntries.length > 0,
      });
    }
    for (const entry of validEntries) {
      blocks.push({
        id: `custom-entry-${entry.id}`,
        kind: 'custom-entry',
        entry,
      });
    }
    return blocks;
  }

  switch (sectionId) {
    case 'summary': {
      if (!doc.professionalSummary.trim()) return [];
      blocks.push({
        id: 'sec-summary',
        kind: 'section-header',
        sectionId: 'summary',
        title: sectionLabel,
        keepWithNext: true,
      });
      blocks.push({
        id: 'summary-body',
        kind: 'summary-text',
        text: doc.professionalSummary.trim(),
      });
      return blocks;
    }

    case 'experience': {
      const sorted = [...doc.experiences]
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .filter(
          (e) =>
            e.jobTitle.trim() ||
            e.company.trim() ||
            e.achievements.some((a) => a.text.trim())
        );
      if (sorted.length === 0) return [];

      blocks.push({
        id: 'sec-experience',
        kind: 'section-header',
        sectionId: 'experience',
        title: sectionLabel,
        keepWithNext: true,
      });

      for (const exp of sorted) {
        const bullets = exp.achievements.filter((a) => a.text.trim().length > 0);
        blocks.push({
          id: `exp-head-${exp.id}`,
          kind: 'experience-header',
          item: exp,
          keepWithNext: bullets.length > 0,
        });
        for (const ach of bullets) {
          blocks.push({
            id: `exp-ach-${ach.id}`,
            kind: 'experience-achievement',
            experienceId: exp.id,
            achievementId: ach.id,
            text: ach.text.trim(),
          });
        }
      }
      return blocks;
    }

    case 'education': {
      const sorted = [...doc.education]
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .filter(
          (e) => e.qualification.trim() || e.institution.trim() || e.description.trim()
        );
      if (sorted.length === 0) return [];
      blocks.push({
        id: 'sec-education',
        kind: 'section-header',
        sectionId: 'education',
        title: sectionLabel,
        keepWithNext: true,
      });
      for (const edu of sorted) {
        blocks.push({
          id: `edu-${edu.id}`,
          kind: 'education-item',
          item: edu,
        });
      }
      return blocks;
    }

    case 'skills': {
      const sorted = [...doc.skills]
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .filter((s) => s.name.trim().length > 0);
      if (sorted.length === 0) return [];
      blocks.push({
        id: 'sec-skills',
        kind: 'section-header',
        sectionId: 'skills',
        title: sectionLabel,
        keepWithNext: true,
      });

      if (groupSkillsByCategory) {
        const groups = new Map<string, SkillItem[]>();
        for (const sk of sorted) {
          const cat = sk.category.trim() || 'Core Skills';
          const list = groups.get(cat) || [];
          list.push(sk);
          groups.set(cat, list);
        }
        for (const [category, skills] of groups.entries()) {
          blocks.push({
            id: `skill-grp-${category}`,
            kind: 'skills-group',
            category,
            skills,
          });
        }
      } else {
        blocks.push({
          id: 'skills-flat',
          kind: 'skills-flat',
          skills: sorted,
        });
      }
      return blocks;
    }

    case 'languages': {
      const sorted = [...doc.languages]
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .filter((l) => l.name.trim().length > 0);
      if (sorted.length === 0) return [];
      blocks.push({
        id: 'sec-languages',
        kind: 'section-header',
        sectionId: 'languages',
        title: sectionLabel,
        keepWithNext: true,
      });
      blocks.push({
        id: 'languages-list',
        kind: 'languages-list',
        languages: sorted,
      });
      return blocks;
    }

    case 'projects': {
      const sorted = [...doc.projects]
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .filter((p) => p.title.trim() || p.description.trim());
      if (sorted.length === 0) return [];
      blocks.push({
        id: 'sec-projects',
        kind: 'section-header',
        sectionId: 'projects',
        title: sectionLabel,
        keepWithNext: true,
      });
      for (const proj of sorted) {
        blocks.push({
          id: `proj-${proj.id}`,
          kind: 'project-item',
          item: proj,
        });
      }
      return blocks;
    }

    case 'certifications': {
      const sorted = [...doc.certifications]
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .filter((c) => c.name.trim() || c.issuingOrganization.trim());
      if (sorted.length === 0) return [];
      blocks.push({
        id: 'sec-certifications',
        kind: 'section-header',
        sectionId: 'certifications',
        title: sectionLabel,
        keepWithNext: true,
      });
      for (const cert of sorted) {
        blocks.push({
          id: `cert-${cert.id}`,
          kind: 'certification-item',
          item: cert,
        });
      }
      return blocks;
    }

    case 'awards': {
      const sorted = [...doc.awards]
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .filter((a) => a.title.trim() || a.issuingOrganization.trim());
      if (sorted.length === 0) return [];
      blocks.push({
        id: 'sec-awards',
        kind: 'section-header',
        sectionId: 'awards',
        title: sectionLabel,
        keepWithNext: true,
      });
      for (const award of sorted) {
        blocks.push({
          id: `award-${award.id}`,
          kind: 'award-item',
          item: award,
        });
      }
      return blocks;
    }

    case 'volunteer': {
      const sorted = [...doc.volunteerExperience]
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .filter((v) => v.role.trim() || v.organization.trim());
      if (sorted.length === 0) return [];
      blocks.push({
        id: 'sec-volunteer',
        kind: 'section-header',
        sectionId: 'volunteer',
        title: sectionLabel,
        keepWithNext: true,
      });
      for (const vol of sorted) {
        blocks.push({
          id: `vol-${vol.id}`,
          kind: 'volunteer-item',
          item: vol,
        });
      }
      return blocks;
    }

    default:
      return [];
  }
}

export function buildSingleColumnFlowBlocks(
  doc: ResumeDocument
): ResumeFlowBlock[] {
  const ordered = getOrderedVisibleSections(doc);
  const blocks: ResumeFlowBlock[] = [{ id: 'doc-header', kind: 'header' }];
  const groupSkills =
    doc.selectedTemplate === 'contour' || doc.selectedTemplate === 'summit';

  for (const section of ordered) {
    blocks.push(
      ...buildBlocksForSection(doc, section.id, section.label, groupSkills)
    );
  }
  return blocks;
}

export function buildContourTrackBlocks(doc: ResumeDocument): {
  sidebarBlocks: ResumeFlowBlock[];
  mainBlocks: ResumeFlowBlock[];
} {
  const ordered = getOrderedVisibleSections(doc);
  const sidebarBlocks: ResumeFlowBlock[] = [];
  const mainBlocks: ResumeFlowBlock[] = [];

  for (const section of ordered) {
    if (CONTOUR_SIDEBAR_SECTIONS.has(section.id)) {
      sidebarBlocks.push(
        ...buildBlocksForSection(doc, section.id, section.label, true)
      );
    } else {
      mainBlocks.push(
        ...buildBlocksForSection(doc, section.id, section.label, false)
      );
    }
  }

  return { sidebarBlocks, mainBlocks };
}
