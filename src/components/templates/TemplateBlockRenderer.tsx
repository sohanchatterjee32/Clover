import React from 'react';
import { formatDateRange, formatMonthYear } from '../../lib/resume/date-formatting';
import { ACCENT_PALETTES } from '../../lib/resume/initial-data';
import type { ResumeDocument, TemplateId } from '../../lib/resume/types';
import { normalizeUrlForHref } from '../../lib/resume/validation';
import type { ResumeFlowBlock } from './resumeBlocks';

interface RendererProps {
  doc: ResumeDocument;
  block: ResumeFlowBlock;
  photoDataUrl?: string | null;
  templateOverride?: TemplateId;
}

export function getDesignMetrics(doc: ResumeDocument) {
  const { fontSizeScale, sectionSpacing, density, accentColor } =
    doc.designConfiguration;
  const accentHex = ACCENT_PALETTES[accentColor]?.hex || '#183B36';

  const baseFontPx =
    fontSizeScale === 'small' ? 10.2 : fontSizeScale === 'large' ? 11.8 : 11;

  const spacingMultiplier =
    sectionSpacing === 'tight' ? 0.8 : sectionSpacing === 'relaxed' ? 1.25 : 1;

  const lineHeight =
    density === 'compact' ? 1.38 : density === 'comfortable' ? 1.58 : 1.48;

  const pagePaddingPx =
    density === 'compact' ? 40 : density === 'comfortable' ? 54 : 46;

  return {
    accentHex,
    baseFontPx,
    spacingMultiplier,
    lineHeight,
    pagePaddingPx,
  };
}

function getPhotoRadius(shape: ResumeDocument['designConfiguration']['photoShape']): string {
  if (shape === 'circle') return '9999px';
  if (shape === 'square') return '2px';
  return '8px';
}

export const TemplateHeaderBlock: React.FC<{
  doc: ResumeDocument;
  photoDataUrl?: string | null;
  template: TemplateId;
}> = ({ doc, photoDataUrl, template }) => {
  const { personal, designConfiguration } = doc;
  const { accentHex, baseFontPx } = getDesignMetrics(doc);
  const showPhoto = Boolean(designConfiguration.showPhoto && photoDataUrl);
  const photoRadius = getPhotoRadius(designConfiguration.photoShape);

  const contactItems = [
    personal.email.trim(),
    personal.phone.trim(),
    personal.location.trim(),
    personal.linkedinUrl.trim(),
    personal.portfolioUrl.trim(),
    personal.websiteUrl.trim(),
  ].filter(Boolean);

  const candidateName = personal.fullName.trim() || 'Candidate Name';
  const headline = personal.professionalHeadline.trim();

  const photoNode = showPhoto && photoDataUrl ? (
    <img
      src={photoDataUrl}
      alt={personal.fullName ? `${personal.fullName} portrait` : 'Profile photo'}
      style={{
        width: template === 'contour' ? '68px' : '74px',
        height: template === 'contour' ? '68px' : '74px',
        objectFit: 'cover',
        borderRadius: photoRadius,
        border: '1px solid #E4E1D9',
        flexShrink: 0,
      }}
    />
  ) : null;

  if (template === 'signal') {
    return (
      <header
        style={{
          paddingBottom: '14px',
          marginBottom: '6px',
          borderBottom: designConfiguration.showDividers
            ? `1.5px solid ${accentHex}`
            : '1px solid transparent',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexDirection:
              designConfiguration.photoPosition === 'top-left'
                ? 'row-reverse'
                : 'row',
            gap: '16px',
            textAlign:
              designConfiguration.photoPosition === 'center' && !showPhoto
                ? 'center'
                : 'left',
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1
              style={{
                fontFamily: '"Plus Jakarta Sans", sans-serif',
                fontSize: `${Math.round(baseFontPx * 2.35)}px`,
                fontWeight: 700,
                color: '#1A211F',
                letterSpacing: '-0.02em',
                lineHeight: 1.15,
                margin: 0,
              }}
            >
              {candidateName}
            </h1>
            {headline && (
              <p
                style={{
                  fontFamily: '"Plus Jakarta Sans", sans-serif',
                  fontSize: `${Math.round(baseFontPx * 1.18)}px`,
                  fontWeight: 600,
                  color: accentHex,
                  marginTop: '4px',
                  marginBottom: 0,
                }}
              >
                {headline}
              </p>
            )}
            {contactItems.length > 0 && (
              <p
                style={{
                  fontFamily: '"Plus Jakarta Sans", sans-serif',
                  fontSize: `${baseFontPx - 1}px`,
                  color: '#4F5B55',
                  marginTop: '8px',
                  marginBottom: 0,
                  lineHeight: 1.45,
                }}
              >
                {contactItems.join('  ·  ')}
              </p>
            )}
          </div>
          {photoNode}
        </div>
      </header>
    );
  }

  if (template === 'contour') {
    return (
      <header
        style={{
          paddingBottom: '16px',
          marginBottom: '14px',
          borderBottom: `2px solid ${accentHex}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '20px',
          flexDirection:
            designConfiguration.photoPosition === 'top-left'
              ? 'row-reverse'
              : 'row',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: 0 }}>
          {designConfiguration.photoPosition === 'top-left' && photoNode}
          <div style={{ minWidth: 0 }}>
            <h1
              style={{
                fontFamily: '"Plus Jakarta Sans", sans-serif',
                fontSize: `${Math.round(baseFontPx * 2.25)}px`,
                fontWeight: 700,
                color: '#18221F',
                letterSpacing: '-0.025em',
                lineHeight: 1.12,
                margin: 0,
              }}
            >
              {candidateName}
            </h1>
            {headline && (
              <p
                style={{
                  fontFamily: '"Plus Jakarta Sans", sans-serif',
                  fontSize: `${Math.round(baseFontPx * 1.12)}px`,
                  fontWeight: 500,
                  color: accentHex,
                  marginTop: '5px',
                  marginBottom: 0,
                }}
              >
                {headline}
              </p>
            )}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '14px',
            flexShrink: 0,
          }}
        >
          {contactItems.length > 0 && (
            <div
              style={{
                textAlign: 'right',
                fontFamily: '"Plus Jakarta Sans", sans-serif',
                fontSize: `${baseFontPx - 1.3}px`,
                color: '#46524C',
                lineHeight: 1.5,
                maxWidth: '240px',
                wordBreak: 'break-word',
              }}
            >
              {contactItems.map((item, idx) => (
                <div key={`${item}-${idx}`}>{item}</div>
              ))}
            </div>
          )}
          {designConfiguration.photoPosition !== 'top-left' && photoNode}
        </div>
      </header>
    );
  }

  if (template === 'fieldnote') {
    const isCentered = designConfiguration.photoPosition === 'center';
    return (
      <header
        style={{
          paddingBottom: '16px',
          marginBottom: '8px',
          borderBottom: designConfiguration.showDividers
            ? '1px solid #DFDBD2'
            : 'none',
          textAlign: isCentered ? 'center' : 'left',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: isCentered
              ? 'column'
              : designConfiguration.photoPosition === 'top-left'
              ? 'row-reverse'
              : 'row',
            alignItems: isCentered ? 'center' : 'flex-start',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                width: '32px',
                height: '3px',
                backgroundColor: accentHex,
                marginBottom: '10px',
                marginLeft: isCentered ? 'auto' : 0,
                marginRight: isCentered ? 'auto' : 0,
              }}
            />
            <h1
              style={{
                fontFamily: '"Fraunces", Georgia, serif',
                fontSize: `${Math.round(baseFontPx * 2.55)}px`,
                fontWeight: 600,
                color: '#1E2724',
                letterSpacing: '-0.015em',
                lineHeight: 1.12,
                margin: 0,
              }}
            >
              {candidateName}
            </h1>
            {headline && (
              <p
                style={{
                  fontFamily: '"Plus Jakarta Sans", sans-serif',
                  fontSize: `${Math.round(baseFontPx * 1.1)}px`,
                  fontWeight: 500,
                  color: '#5A665F',
                  marginTop: '6px',
                  marginBottom: 0,
                }}
              >
                {headline}
              </p>
            )}
            {contactItems.length > 0 && (
              <p
                style={{
                  fontFamily: '"Plus Jakarta Sans", sans-serif',
                  fontSize: `${baseFontPx - 1}px`,
                  color: '#5A665F',
                  marginTop: '10px',
                  marginBottom: 0,
                  lineHeight: 1.5,
                }}
              >
                {contactItems.join('   /   ')}
              </p>
            )}
          </div>
          {photoNode}
        </div>
      </header>
    );
  }

  // Template 4: Summit (Executive masthead)
  const summitCentered = !showPhoto || designConfiguration.photoPosition === 'center';
  return (
    <header
      style={{
        paddingBottom: '14px',
        marginBottom: '8px',
        borderBottom: designConfiguration.showDividers
          ? `2px solid ${accentHex}`
          : '1px solid #E4E1D9',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: summitCentered
            ? 'column'
            : designConfiguration.photoPosition === 'top-left'
            ? 'row-reverse'
            : 'row',
          alignItems: summitCentered ? 'center' : 'center',
          justifyContent: 'space-between',
          textAlign: summitCentered ? 'center' : 'left',
          gap: '14px',
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1
            style={{
              fontFamily: '"Fraunces", Georgia, serif',
              fontSize: `${Math.round(baseFontPx * 2.4)}px`,
              fontWeight: 600,
              color: '#19211E',
              letterSpacing: '0.01em',
              lineHeight: 1.12,
              margin: 0,
            }}
          >
            {candidateName}
          </h1>
          {headline && (
            <p
              style={{
                fontFamily: '"Plus Jakarta Sans", sans-serif',
                fontSize: `${Math.round(baseFontPx * 1.08)}px`,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.09em',
                color: accentHex,
                marginTop: '5px',
                marginBottom: 0,
              }}
            >
              {headline}
            </p>
          )}
          {contactItems.length > 0 && (
            <p
              style={{
                fontFamily: '"Plus Jakarta Sans", sans-serif',
                fontSize: `${baseFontPx - 1.1}px`,
                color: '#46524C',
                marginTop: '8px',
                marginBottom: 0,
                lineHeight: 1.45,
              }}
            >
              {contactItems.join('  •  ')}
            </p>
          )}
        </div>
        {photoNode}
      </div>
    </header>
  );
};

export const TemplateBlockRenderer: React.FC<RendererProps> = ({
  doc,
  block,
  photoDataUrl,
  templateOverride,
}) => {
  const template = templateOverride || doc.selectedTemplate;
  const { accentHex, baseFontPx, spacingMultiplier, lineHeight } =
    getDesignMetrics(doc);
  const showDividers = doc.designConfiguration.showDividers;

  if (block.kind === 'header') {
    return (
      <TemplateHeaderBlock
        doc={doc}
        photoDataUrl={photoDataUrl}
        template={template}
      />
    );
  }

  if (block.kind === 'section-header') {
    const topSpace = Math.round(14 * spacingMultiplier);
    if (template === 'signal') {
      return (
        <div
          style={{
            paddingTop: `${topSpace}px`,
            paddingBottom: '6px',
          }}
        >
          <h2
            style={{
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              fontSize: `${baseFontPx + 0.5}px`,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: accentHex,
              margin: 0,
              paddingBottom: '4px',
              borderBottom: showDividers ? '1px solid #DAD6CC' : 'none',
            }}
          >
            {block.title}
          </h2>
        </div>
      );
    }

    if (template === 'contour') {
      return (
        <div
          style={{
            paddingTop: `${Math.round(12 * spacingMultiplier)}px`,
            paddingBottom: '5px',
          }}
        >
          <h2
            style={{
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              fontSize: `${baseFontPx}px`,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.09em',
              color: accentHex,
              margin: 0,
              paddingBottom: '3px',
              borderBottom: showDividers ? `1px solid ${accentHex}33` : 'none',
            }}
          >
            {block.title}
          </h2>
        </div>
      );
    }

    if (template === 'fieldnote') {
      return (
        <div
          style={{
            paddingTop: `${Math.round(16 * spacingMultiplier)}px`,
            paddingBottom: '7px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span
            aria-hidden="true"
            style={{
              display: 'inline-block',
              width: '6px',
              height: '6px',
              backgroundColor: accentHex,
              flexShrink: 0,
            }}
          />
          <h2
            style={{
              fontFamily: '"Fraunces", Georgia, serif',
              fontSize: `${baseFontPx + 2.5}px`,
              fontWeight: 600,
              color: '#1E2724',
              margin: 0,
            }}
          >
            {block.title}
          </h2>
          {showDividers && (
            <span
              aria-hidden="true"
              style={{
                flex: 1,
                height: '1px',
                backgroundColor: '#E4E1D9',
                marginLeft: '6px',
              }}
            />
          )}
        </div>
      );
    }

    // Summit
    return (
      <div
        style={{
          paddingTop: `${Math.round(13 * spacingMultiplier)}px`,
          paddingBottom: '6px',
        }}
      >
        <h2
          style={{
            fontFamily: '"Fraunces", Georgia, serif',
            fontSize: `${baseFontPx + 1.5}px`,
            fontWeight: 600,
            color: accentHex,
            margin: 0,
            paddingBottom: '3px',
            borderBottom: showDividers ? `1px solid ${accentHex}44` : 'none',
          }}
        >
          {block.title}
        </h2>
      </div>
    );
  }

  if (block.kind === 'summary-text') {
    if (template === 'fieldnote') {
      return (
        <div
          style={{
            backgroundColor: '#FAF8F4',
            border: '1px solid #EAE6DD',
            borderRadius: '6px',
            padding: '10px 14px',
            fontFamily: '"Plus Jakarta Sans", sans-serif',
            fontSize: `${baseFontPx}px`,
            lineHeight,
            color: '#2C3532',
          }}
        >
          {block.text}
        </div>
      );
    }
    return (
      <p
        style={{
          fontFamily: '"Plus Jakarta Sans", sans-serif',
          fontSize: `${baseFontPx}px`,
          lineHeight,
          color: '#2B3532',
          margin: 0,
          paddingBottom: '2px',
        }}
      >
        {block.text}
      </p>
    );
  }

  if (block.kind === 'experience-header') {
    const exp = block.item;
    const dateRange = formatDateRange(exp.startDate, exp.endDate, exp.isCurrent);
    const metaBits = [
      exp.company.trim(),
      exp.employmentType.trim(),
      exp.location.trim(),
    ].filter(Boolean);

    if (template === 'fieldnote') {
      return (
        <div
          style={{
            paddingTop: '8px',
            paddingBottom: '3px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            gap: '12px',
          }}
        >
          <div>
            <div
              style={{
                fontFamily: '"Plus Jakarta Sans", sans-serif',
                fontSize: `${baseFontPx + 1}px`,
                fontWeight: 700,
                color: '#1E2724',
              }}
            >
              {exp.jobTitle.trim()}
            </div>
            {metaBits.length > 0 && (
              <div
                style={{
                  fontFamily: '"Plus Jakarta Sans", sans-serif',
                  fontSize: `${baseFontPx - 0.5}px`,
                  fontWeight: 500,
                  color: accentHex,
                  marginTop: '1px',
                }}
              >
                {metaBits.join('  ·  ')}
              </div>
            )}
          </div>
          {dateRange && (
            <div
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: `${baseFontPx - 1.5}px`,
                color: '#647069',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {dateRange}
            </div>
          )}
        </div>
      );
    }

    if (template === 'summit') {
      return (
        <div style={{ paddingTop: '7px', paddingBottom: '3px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              gap: '12px',
            }}
          >
            <div
              style={{
                fontFamily: '"Plus Jakarta Sans", sans-serif',
                fontSize: `${baseFontPx + 0.8}px`,
                fontWeight: 700,
                color: '#1A2220',
              }}
            >
              {exp.company.trim()}
              {exp.location.trim()
                ? `${exp.company.trim() ? ' — ' : ''}${exp.location.trim()}`
                : ''}
            </div>
            {dateRange && (
              <div
                style={{
                  fontFamily: '"Plus Jakarta Sans", sans-serif',
                  fontSize: `${baseFontPx - 0.8}px`,
                  fontWeight: 600,
                  color: '#4E5A54',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                {dateRange}
              </div>
            )}
          </div>
          {(exp.jobTitle.trim() || exp.employmentType.trim()) && (
            <div
              style={{
                fontFamily: '"Plus Jakarta Sans", sans-serif',
                fontSize: `${baseFontPx}px`,
                fontWeight: 600,
                fontStyle: 'italic',
                color: accentHex,
                marginTop: '1px',
              }}
            >
              {exp.jobTitle.trim()}
              {exp.employmentType.trim()
                ? `${exp.jobTitle.trim() ? ' · ' : ''}${exp.employmentType.trim()}`
                : ''}
            </div>
          )}
        </div>
      );
    }

    // Signal & Contour
    return (
      <div style={{ paddingTop: '7px', paddingBottom: '3px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            gap: '12px',
          }}
        >
          <div
            style={{
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              fontSize: `${baseFontPx + 0.8}px`,
              fontWeight: 700,
              color: '#1E2623',
            }}
          >
            {exp.jobTitle.trim()}
          </div>
          {dateRange && (
            <div
              style={{
                fontFamily:
                  template === 'contour'
                    ? '"JetBrains Mono", monospace'
                    : '"Plus Jakarta Sans", sans-serif',
                fontSize: `${baseFontPx - 1}px`,
                fontWeight: 500,
                color: '#5A6660',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {dateRange}
            </div>
          )}
        </div>
        {metaBits.length > 0 && (
          <div
            style={{
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              fontSize: `${baseFontPx - 0.4}px`,
              fontWeight: 500,
              color: '#4F5C56',
              marginTop: '1px',
            }}
          >
            {metaBits.join('  ·  ')}
          </div>
        )}
      </div>
    );
  }

  if (block.kind === 'experience-achievement') {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '8px',
          paddingLeft: '4px',
          paddingTop: '1.5px',
          paddingBottom: '1.5px',
          fontFamily: '"Plus Jakarta Sans", sans-serif',
          fontSize: `${baseFontPx}px`,
          lineHeight,
          color: '#2B3532',
        }}
      >
        <span
          aria-hidden="true"
          style={{
            color: accentHex,
            fontWeight: 700,
            lineHeight,
            flexShrink: 0,
          }}
        >
          •
        </span>
        <span style={{ flex: 1, minWidth: 0 }}>{block.text}</span>
      </div>
    );
  }

  if (block.kind === 'education-item') {
    const edu = block.item;
    const dateRange = formatDateRange(edu.startDate, edu.endDate, false);
    const meta = [edu.institution.trim(), edu.location.trim()].filter(Boolean);

    return (
      <div style={{ paddingTop: '5px', paddingBottom: '4px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            gap: '12px',
          }}
        >
          <div
            style={{
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              fontSize: `${baseFontPx + 0.5}px`,
              fontWeight: 700,
              color: '#1E2623',
            }}
          >
            {edu.qualification.trim() || 'Qualification'}
          </div>
          {dateRange && (
            <div
              style={{
                fontFamily:
                  template === 'contour' || template === 'fieldnote'
                    ? '"JetBrains Mono", monospace'
                    : '"Plus Jakarta Sans", sans-serif',
                fontSize: `${baseFontPx - 1}px`,
                color: '#5A6660',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {dateRange}
            </div>
          )}
        </div>
        {meta.length > 0 && (
          <div
            style={{
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              fontSize: `${baseFontPx - 0.3}px`,
              color: '#4F5C56',
              marginTop: '1px',
            }}
          >
            {meta.join('  ·  ')}
          </div>
        )}
        {edu.description.trim() && (
          <p
            style={{
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              fontSize: `${baseFontPx - 0.3}px`,
              lineHeight,
              color: '#3B4540',
              marginTop: '3px',
              marginBottom: 0,
            }}
          >
            {edu.description.trim()}
          </p>
        )}
      </div>
    );
  }

  if (block.kind === 'skills-group') {
    return (
      <div style={{ paddingTop: '3px', paddingBottom: '4px' }}>
        <div
          style={{
            fontFamily: '"Plus Jakarta Sans", sans-serif',
            fontSize: `${baseFontPx - 0.8}px`,
            fontWeight: 700,
            color: '#2A3430',
            marginBottom: '2px',
          }}
        >
          {block.category}
        </div>
        <div
          style={{
            fontFamily: '"Plus Jakarta Sans", sans-serif',
            fontSize: `${baseFontPx - 0.5}px`,
            lineHeight: 1.45,
            color: '#434F49',
          }}
        >
          {block.skills.map((s) => s.name).join(' · ')}
        </div>
      </div>
    );
  }

  if (block.kind === 'skills-flat') {
    return (
      <div
        style={{
          fontFamily: '"Plus Jakarta Sans", sans-serif',
          fontSize: `${baseFontPx}px`,
          lineHeight: 1.55,
          color: '#2B3532',
          paddingTop: '2px',
          paddingBottom: '2px',
        }}
      >
        {block.skills.map((s) => s.name).join('  ·  ')}
      </div>
    );
  }

  if (block.kind === 'languages-list') {
    const isSidebar = template === 'contour';
    return (
      <div
        style={{
          display: isSidebar ? 'flex' : 'flex',
          flexDirection: isSidebar ? 'column' : 'row',
          flexWrap: 'wrap',
          gap: isSidebar ? '4px' : '8px 20px',
          paddingTop: '2px',
          paddingBottom: '2px',
          fontFamily: '"Plus Jakarta Sans", sans-serif',
          fontSize: `${baseFontPx - (isSidebar ? 0.5 : 0)}px`,
          color: '#2B3532',
        }}
      >
        {block.languages.map((lang) => (
          <div key={lang.id}>
            <span style={{ fontWeight: 600 }}>{lang.name}</span>
            <span style={{ color: '#5F6B65' }}> — {lang.proficiency}</span>
          </div>
        ))}
      </div>
    );
  }

  if (block.kind === 'project-item') {
    const proj = block.item;
    return (
      <div style={{ paddingTop: '5px', paddingBottom: '4px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            gap: '12px',
          }}
        >
          <div
            style={{
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              fontSize: `${baseFontPx + 0.5}px`,
              fontWeight: 700,
              color: '#1E2623',
            }}
          >
            {proj.title.trim() || 'Project'}
          </div>
          {proj.projectUrl.trim() && (
            <a
              href={normalizeUrlForHref(proj.projectUrl)}
              style={{
                fontFamily: '"Plus Jakarta Sans", sans-serif',
                fontSize: `${baseFontPx - 1}px`,
                color: accentHex,
                textDecoration: 'none',
              }}
            >
              {proj.projectUrl.trim()}
            </a>
          )}
        </div>
        {proj.description.trim() && (
          <p
            style={{
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              fontSize: `${baseFontPx}px`,
              lineHeight,
              color: '#2B3532',
              marginTop: '2px',
              marginBottom: 0,
            }}
          >
            {proj.description.trim()}
          </p>
        )}
        {proj.technologies.length > 0 && (
          <div
            style={{
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              fontSize: `${baseFontPx - 1}px`,
              color: '#5A6660',
              marginTop: '2px',
            }}
          >
            Technologies: {proj.technologies.join(', ')}
          </div>
        )}
      </div>
    );
  }

  if (block.kind === 'certification-item') {
    const cert = block.item;
    const dateLabel = formatMonthYear(cert.issueDate);
    const isSidebar = template === 'contour';
    return (
      <div style={{ paddingTop: '4px', paddingBottom: '3px' }}>
        <div
          style={{
            display: 'flex',
            flexDirection: isSidebar ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isSidebar ? 'flex-start' : 'baseline',
            gap: isSidebar ? '1px' : '12px',
          }}
        >
          <div
            style={{
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              fontSize: `${baseFontPx - (isSidebar ? 0.4 : 0)}px`,
              fontWeight: 600,
              color: '#1E2623',
            }}
          >
            {cert.name.trim() || 'Certification'}
          </div>
          {dateLabel && (
            <div
              style={{
                fontFamily: '"Plus Jakarta Sans", sans-serif',
                fontSize: `${baseFontPx - 1.2}px`,
                color: '#5A6660',
                whiteSpace: 'nowrap',
              }}
            >
              {dateLabel}
            </div>
          )}
        </div>
        {cert.issuingOrganization.trim() && (
          <div
            style={{
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              fontSize: `${baseFontPx - 0.8}px`,
              color: '#4F5C56',
            }}
          >
            {cert.issuingOrganization.trim()}
            {cert.credentialUrl.trim() ? ` · ${cert.credentialUrl.trim()}` : ''}
          </div>
        )}
      </div>
    );
  }

  if (block.kind === 'award-item') {
    const award = block.item;
    const dateLabel = formatMonthYear(award.date);
    return (
      <div style={{ paddingTop: '4px', paddingBottom: '3px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            gap: '10px',
          }}
        >
          <span
            style={{
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              fontSize: `${baseFontPx}px`,
              fontWeight: 600,
              color: '#1E2623',
            }}
          >
            {award.title.trim()}
          </span>
          {dateLabel && (
            <span
              style={{
                fontFamily: '"Plus Jakarta Sans", sans-serif',
                fontSize: `${baseFontPx - 1}px`,
                color: '#5A6660',
                whiteSpace: 'nowrap',
              }}
            >
              {dateLabel}
            </span>
          )}
        </div>
        {award.issuingOrganization.trim() && (
          <div
            style={{
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              fontSize: `${baseFontPx - 0.6}px`,
              color: '#4F5C56',
            }}
          >
            {award.issuingOrganization.trim()}
          </div>
        )}
        {award.description.trim() && (
          <p
            style={{
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              fontSize: `${baseFontPx - 0.4}px`,
              lineHeight,
              color: '#3B4540',
              margin: '2px 0 0 0',
            }}
          >
            {award.description.trim()}
          </p>
        )}
      </div>
    );
  }

  if (block.kind === 'volunteer-item') {
    const vol = block.item;
    const dateRange = formatDateRange(vol.startDate, vol.endDate, false);
    const meta = [vol.organization.trim(), vol.location.trim()].filter(Boolean);
    return (
      <div style={{ paddingTop: '5px', paddingBottom: '4px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            gap: '12px',
          }}
        >
          <span
            style={{
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              fontSize: `${baseFontPx + 0.3}px`,
              fontWeight: 700,
              color: '#1E2623',
            }}
          >
            {vol.role.trim() || 'Volunteer Role'}
          </span>
          {dateRange && (
            <span
              style={{
                fontFamily: '"Plus Jakarta Sans", sans-serif',
                fontSize: `${baseFontPx - 1}px`,
                color: '#5A6660',
                whiteSpace: 'nowrap',
              }}
            >
              {dateRange}
            </span>
          )}
        </div>
        {meta.length > 0 && (
          <div
            style={{
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              fontSize: `${baseFontPx - 0.4}px`,
              color: '#4F5C56',
            }}
          >
            {meta.join('  ·  ')}
          </div>
        )}
        {vol.description.trim() && (
          <p
            style={{
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              fontSize: `${baseFontPx}px`,
              lineHeight,
              color: '#2B3532',
              margin: '3px 0 0 0',
            }}
          >
            {vol.description.trim()}
          </p>
        )}
      </div>
    );
  }

  if (block.kind === 'custom-description') {
    return (
      <p
        style={{
          fontFamily: '"Plus Jakarta Sans", sans-serif',
          fontSize: `${baseFontPx}px`,
          lineHeight,
          color: '#3B4540',
          margin: '0 0 4px 0',
        }}
      >
        {block.text}
      </p>
    );
  }

  if (block.kind === 'custom-entry') {
    const entry = block.entry;
    return (
      <div style={{ paddingTop: '4px', paddingBottom: '4px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            gap: '12px',
          }}
        >
          <span
            style={{
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              fontSize: `${baseFontPx + 0.3}px`,
              fontWeight: 700,
              color: '#1E2623',
            }}
          >
            {entry.title.trim()}
          </span>
          {entry.date.trim() && (
            <span
              style={{
                fontFamily: '"Plus Jakarta Sans", sans-serif',
                fontSize: `${baseFontPx - 1}px`,
                color: '#5A6660',
                whiteSpace: 'nowrap',
              }}
            >
              {formatMonthYear(entry.date)}
            </span>
          )}
        </div>
        {entry.subtitle.trim() && (
          <div
            style={{
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              fontSize: `${baseFontPx - 0.4}px`,
              color: '#4F5C56',
            }}
          >
            {entry.subtitle.trim()}
          </div>
        )}
        {entry.description.trim() && (
          <p
            style={{
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              fontSize: `${baseFontPx}px`,
              lineHeight,
              color: '#2B3532',
              margin: '2px 0 0 0',
            }}
          >
            {entry.description.trim()}
          </p>
        )}
      </div>
    );
  }

  return null;
};
