import type { ResumeDocument } from '../resume/types';

export interface WordingSuggestion {
  improved: string;
  reason: string;
  changed: boolean;
}

export interface WritingQualityIssue {
  id: string;
  severity: 'info' | 'warning';
  location: string;
  message: string;
  targetSection: 'personal' | 'experience' | 'education' | 'skills';
}

const PHRASE_REWRITES: Array<{ pattern: RegExp; replacement: string; note: string }> = [
  {
    pattern: /^worked on\s+(.+?)\s+and\s+fixed\s+(.+?)\.?$/i,
    replacement:
      'Supported $1 operations and investigated $2 to maintain service reliability.',
    note: 'Replaced passive phrasing with clear operational ownership without adding unverified metrics.',
  },
  {
    pattern: /^helped with\s+/i,
    replacement: 'Contributed to ',
    note: 'Clarified active contribution.',
  },
  {
    pattern: /^worked on\s+/i,
    replacement: 'Supported and contributed to ',
    note: 'Replaced generic "worked on" opening with stronger professional framing.',
  },
  {
    pattern: /^did\s+/i,
    replacement: 'Executed ',
    note: 'Replaced informal verb with precise action verb.',
  },
  {
    pattern: /^made\s+/i,
    replacement: 'Built and delivered ',
    note: 'Strengthened delivery verb.',
  },
  {
    pattern: /^fixed\s+/i,
    replacement: 'Investigated and resolved ',
    note: 'Clarified diagnostic and resolution workflow.',
  },
  {
    pattern: /^responsible for\s+/i,
    replacement: 'Managed and maintained ',
    note: 'Replaced passive "responsible for" lead-in with direct action.',
  },
  {
    pattern: /^assisted in\s+/i,
    replacement: 'Collaborated on ',
    note: 'Clarified collaborative ownership.',
  },
  {
    pattern: /^used\s+/i,
    replacement: 'Applied ',
    note: 'Used more precise technical phrasing.',
  },
  {
    pattern: /^handled\s+/i,
    replacement: 'Coordinated and resolved ',
    note: 'Clarified execution scope.',
  },
];

const WEAK_START_VERBS = [
  'worked',
  'helped',
  'did',
  'made',
  'handled',
  'assisted',
  'responsible',
  'tried',
  'got',
];

export function improveAchievementWording(rawText: string): WordingSuggestion {
  const trimmed = rawText.trim();
  if (!trimmed) {
    return {
      improved: '',
      reason: 'Enter an achievement draft first so Writing Coach can refine its phrasing.',
      changed: false,
    };
  }

  let result = trimmed.replace(/\s+/g, ' ');
  const notes: string[] = [];

  // Specific multi-clause cleanups while preserving exact user facts
  const awsFixMatch = result.match(
    /^worked on\s+(.+?)\s+and\s+fixed\s+server\s+problems\.?$/i
  );
  if (awsFixMatch) {
    const subject = awsFixMatch[1].trim();
    return {
      improved: `Supported ${subject} infrastructure operations and investigated server-related incidents to maintain service reliability.`,
      reason:
        'Elevated informal phrasing into clear operational language while preserving your exact scope and adding no unverified metrics.',
      changed: true,
    };
  }

  for (const rule of PHRASE_REWRITES) {
    if (rule.pattern.test(result)) {
      result = result.replace(rule.pattern, rule.replacement);
      notes.push(rule.note);
      break;
    }
  }

  // Replace casual inner phrases conservatively
  if (/\bfixed\b/i.test(result) && !/\bresolved\b/i.test(result)) {
    result = result.replace(/\bfixed\b/gi, 'resolved');
    notes.push('Replaced "fixed" with "resolved".');
  }
  if (/\bproblems\b/i.test(result)) {
    result = result.replace(/\bproblems\b/gi, 'issues');
    notes.push('Refined "problems" to "issues".');
  }

  // Ensure capitalized start and trailing period
  result = result.charAt(0).toUpperCase() + result.slice(1);
  if (!/[.!?]$/.test(result)) {
    result = `${result}.`;
  }

  const changed = result !== trimmed;
  return {
    improved: result,
    reason: changed
      ? notes.join(' ') || 'Standardized capitalization, clarity, and punctuation.'
      : 'Your bullet already uses clear, direct professional phrasing.',
    changed,
  };
}

export function runWritingQualityChecks(doc: ResumeDocument): WritingQualityIssue[] {
  const issues: WritingQualityIssue[] = [];

  if (doc.professionalSummary.trim().length > 0 && doc.professionalSummary.trim().length < 60) {
    issues.push({
      id: 'short-summary',
      severity: 'info',
      location: 'Professional Summary',
      message: 'Summary is quite brief. Adding 1–2 sentences on core tools and strengths improves context.',
      targetSection: 'personal',
    });
  }

  const seenBullets = new Map<string, number>();

  doc.experiences.forEach((exp, expIdx) => {
    const roleLabel = exp.jobTitle.trim() || `Experience #${expIdx + 1}`;
    const verbCounts = new Map<string, number>();

    exp.achievements.forEach((ach, achIdx) => {
      const text = ach.text.trim();
      if (!text) {
        issues.push({
          id: `empty-ach-${ach.id}`,
          severity: 'warning',
          location: `${roleLabel} · Bullet ${achIdx + 1}`,
          message: 'Contains an empty achievement line. Complete or remove it.',
          targetSection: 'experience',
        });
        return;
      }

      if (text.length < 24) {
        issues.push({
          id: `short-ach-${ach.id}`,
          severity: 'info',
          location: `${roleLabel} · Bullet ${achIdx + 1}`,
          message: `"${text}" is very short. Consider adding context on what you built, maintained, or resolved.`,
          targetSection: 'experience',
        });
      }

      const firstWord = text.split(/\s+/)[0].toLowerCase().replace(/[^a-z]/g, '');
      if (WEAK_START_VERBS.includes(firstWord)) {
        issues.push({
          id: `weak-verb-${ach.id}`,
          severity: 'info',
          location: `${roleLabel} · Bullet ${achIdx + 1}`,
          message: `Starts with "${firstWord}". Use Improve Wording for stronger active phrasing.`,
          targetSection: 'experience',
        });
      }

      if (firstWord) {
        verbCounts.set(firstWord, (verbCounts.get(firstWord) || 0) + 1);
      }

      const normalized = text.toLowerCase();
      seenBullets.set(normalized, (seenBullets.get(normalized) || 0) + 1);
    });

    for (const [verb, count] of verbCounts.entries()) {
      if (count >= 3) {
        issues.push({
          id: `repeated-verb-${exp.id}-${verb}`,
          severity: 'info',
          location: roleLabel,
          message: `The opening verb "${verb}" is repeated ${count} times in this role. Varying verbs improves readability.`,
          targetSection: 'experience',
        });
      }
    }
  });

  for (const [bullet, count] of seenBullets.entries()) {
    if (count > 1) {
      issues.push({
        id: `duplicate-bullet-${bullet.slice(0, 16)}`,
        severity: 'warning',
        location: 'Experience',
        message: 'Identical achievement phrasing appears more than once across roles.',
        targetSection: 'experience',
      });
    }
  }

  return issues;
}
