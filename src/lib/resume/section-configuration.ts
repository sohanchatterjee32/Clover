import type { ResumeDocument, SectionConfigItem } from './types';

export function hasSectionContent(doc: ResumeDocument, sectionId: string): boolean {
  if (sectionId.startsWith('custom:')) {
    const customId = sectionId.slice('custom:'.length);
    const custom = doc.customSections.find((s) => s.id === customId);
    if (!custom) return false;
    return (
      custom.title.trim().length > 0 &&
      (custom.description.trim().length > 0 ||
        custom.entries.some(
          (e) =>
            e.title.trim().length > 0 ||
            e.subtitle.trim().length > 0 ||
            e.description.trim().length > 0
        ))
    );
  }

  switch (sectionId) {
    case 'summary':
      return doc.professionalSummary.trim().length > 0;
    case 'experience':
      return doc.experiences.some(
        (exp) =>
          exp.jobTitle.trim().length > 0 ||
          exp.company.trim().length > 0 ||
          exp.achievements.some((a) => a.text.trim().length > 0)
      );
    case 'education':
      return doc.education.some(
        (edu) =>
          edu.qualification.trim().length > 0 ||
          edu.institution.trim().length > 0 ||
          edu.description.trim().length > 0
      );
    case 'skills':
      return doc.skills.some((sk) => sk.name.trim().length > 0);
    case 'languages':
      return doc.languages.some((lang) => lang.name.trim().length > 0);
    case 'projects':
      return doc.projects.some(
        (proj) =>
          proj.title.trim().length > 0 ||
          proj.description.trim().length > 0 ||
          proj.technologies.length > 0
      );
    case 'certifications':
      return doc.certifications.some(
        (cert) =>
          cert.name.trim().length > 0 || cert.issuingOrganization.trim().length > 0
      );
    case 'awards':
      return doc.awards.some(
        (aw) => aw.title.trim().length > 0 || aw.issuingOrganization.trim().length > 0
      );
    case 'volunteer':
      return doc.volunteerExperience.some(
        (vol) =>
          vol.role.trim().length > 0 ||
          vol.organization.trim().length > 0 ||
          vol.description.trim().length > 0
      );
    default:
      return false;
  }
}

export function getOrderedVisibleSections(doc: ResumeDocument): SectionConfigItem[] {
  return [...doc.sectionConfiguration]
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .filter((section) => section.visible && hasSectionContent(doc, section.id));
}

export function moveArrayItem<T>(items: T[], fromIndex: number, toIndex: number): T[] {
  if (
    fromIndex < 0 ||
    fromIndex >= items.length ||
    toIndex < 0 ||
    toIndex >= items.length ||
    fromIndex === toIndex
  ) {
    return items;
  }
  const copy = [...items];
  const [moved] = copy.splice(fromIndex, 1);
  copy.splice(toIndex, 0, moved);
  return copy;
}

export function reindexDisplayOrder<T extends { displayOrder: number }>(items: T[]): T[] {
  return items.map((item, idx) => ({ ...item, displayOrder: idx }));
}
