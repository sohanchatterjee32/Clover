import type { TemplateId } from '../resume/types';

export interface TemplateMetadata {
  id: TemplateId;
  name: string;
  tagline: string;
  description: string;
  bestFor: string;
  defaultShowPhoto: boolean;
  supportsTwoColumnSidebar: boolean;
}

export const TEMPLATE_REGISTRY: TemplateMetadata[] = [
  {
    id: 'signal',
    name: 'Signal',
    tagline: 'Single-column ATS clarity',
    description:
      'Clean linear hierarchy with crisp typographic rules, balanced timelines, and zero decorative clutter for reliable document extraction.',
    bestFor: 'Engineering, technical roles, and automated application portals',
    defaultShowPhoto: false,
    supportsTwoColumnSidebar: false,
  },
  {
    id: 'contour',
    name: 'Contour',
    tagline: 'Structured dual-track editorial',
    description:
      'Anchored header paired with a disciplined metadata column for skills, credentials, and languages alongside a dedicated career narrative track.',
    bestFor: 'Cloud architects, operations leaders, and multi-disciplinary specialists',
    defaultShowPhoto: true,
    supportsTwoColumnSidebar: true,
  },
  {
    id: 'fieldnote',
    name: 'Fieldnote',
    tagline: 'Editorial whitespace & serif poise',
    description:
      'Generous breathing room, distinctive Fraunces serif title framing, subtle accent markers, and quiet section transitions.',
    bestFor: 'Product managers, designers, strategists, and creative directors',
    defaultShowPhoto: true,
    supportsTwoColumnSidebar: false,
  },
  {
    id: 'summit',
    name: 'Summit',
    tagline: 'Executive authority & precision',
    description:
      'Commanding centered or split executive masthead, compact yet scannable density, and restrained accent rules tailored for leadership reviews.',
    bestFor: 'Senior managers, directors, consultants, and executive candidates',
    defaultShowPhoto: true,
    supportsTwoColumnSidebar: false,
  },
];

export function getTemplateMetadata(id: TemplateId): TemplateMetadata {
  return TEMPLATE_REGISTRY.find((t) => t.id === id) || TEMPLATE_REGISTRY[0];
}
