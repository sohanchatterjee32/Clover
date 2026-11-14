const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'if', 'then', 'else', 'when', 'where',
  'while', 'to', 'of', 'in', 'on', 'at', 'by', 'for', 'with', 'about', 'against',
  'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
  'from', 'up', 'down', 'out', 'off', 'over', 'under', 'again', 'further', 'once',
  'here', 'there', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other',
  'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too',
  'very', 'can', 'will', 'just', 'should', 'now', 'is', 'are', 'was', 'were',
  'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did',
  'doing', 'would', 'could', 'ought', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
  'our', 'your', 'their', 'this', 'that', 'these', 'those', 'as', 'must', 'may',
  'looking', 'seeking', 'join', 'team', 'role', 'position', 'company', 'work',
  'working', 'years', 'year', 'experience', 'ability', 'strong', 'excellent',
  'skills', 'skill', 'required', 'preferred', 'plus', 'including', 'well', 'using',
  'across', 'within', 'responsibilities', 'qualifications', 'requirements',
  'candidate', 'ideal', 'help', 'support', 'ensure', 'make', 'build', 'day',
]);

const KNOWN_MULTIWORD_TERMS = [
  'infrastructure as code',
  'rest apis',
  'rest api',
  'ci/cd',
  'incident management',
  'cloud infrastructure',
  'distributed systems',
  'design systems',
  'user research',
  'usability testing',
  'project management',
  'agile scrum',
  'data modeling',
  'data visualization',
  'machine learning',
  'unit testing',
  'automated testing',
  'system design',
  'micro services',
  'microservices',
  'version control',
  'load balancing',
  'high availability',
  'disaster recovery',
  'cost optimization',
  'stakeholder management',
  'product strategy',
  'cross-functional',
  'google analytics',
  'power bi',
  'aws cloud practitioner',
  'solutions architect',
  'active directory',
  'financial reporting',
  'account reconciliation',
];

const KNOWN_TECHNICAL_TOKENS = new Set([
  'aws', 'ec2', 'lambda', 'ecs', 'eks', 's3', 'rds', 'iam', 'vpc', 'cloudwatch',
  'cloudformation', 'terraform', 'ansible', 'docker', 'kubernetes', 'k8s', 'helm',
  'linux', 'bash', 'python', 'typescript', 'javascript', 'react', 'nextjs', 'next.js',
  'node.js', 'nodejs', 'java', 'go', 'golang', 'sql', 'postgresql', 'mysql',
  'mongodb', 'redis', 'graphql', 'rest', 'grpc', 'git', 'github', 'gitlab',
  'jenkins', 'grafana', 'prometheus', 'datadog', 'splunk', 'jira', 'confluence',
  'figma', 'sketch', 'tableau', 'excel', 'salesforce', 'hubspot', 'seo', 'sem',
  'scrum', 'kanban', 'agile', 'wcag', 'accessibility', 'azure', 'gcp', 'networking',
  'security', 'observability', 'monitoring', 'troubleshooting', 'automation',
  'backend', 'frontend', 'deployment', 'reliability', 'scalability', 'compliance',
  'bachelor', 'certification', 'certified', 'gaap', 'quickbooks', 'crm',
]);

export interface ExtractedKeyword {
  term: string;
  normalized: string;
  category: 'technical' | 'domain';
  frequency: number;
}

export function extractJobKeywords(jobDescription: string): ExtractedKeyword[] {
  const text = (jobDescription || '').trim();
  if (!text) return [];

  const lower = text.toLowerCase();
  const found = new Map<string, ExtractedKeyword>();

  // 1. Detect known multi-word phrases first
  for (const phrase of KNOWN_MULTIWORD_TERMS) {
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
    const matches = lower.match(regex);
    if (matches && matches.length > 0) {
      found.set(phrase, {
        term: formatDisplayTerm(phrase),
        normalized: phrase,
        category: 'technical',
        frequency: matches.length,
      });
    }
  }

  // 2. Tokenize words (preserve symbols like C++, C#, Node.js, CI/CD)
  const rawTokens = text.match(/[A-Za-z0-9][A-Za-z0-9.+#/-]{1,28}/g) || [];
  const tokenCounts = new Map<string, { raw: string; count: number }>();

  for (const tok of rawTokens) {
    const cleaned = tok.replace(/^[./-]+|[.,;:!?)]+$/g, '');
    if (cleaned.length < 2) continue;
    const norm = cleaned.toLowerCase();
    if (STOP_WORDS.has(norm)) continue;
    if (/^\d+$/.test(norm)) continue;

    const existing = tokenCounts.get(norm);
    if (existing) {
      existing.count += 1;
    } else {
      tokenCounts.set(norm, { raw: cleaned, count: 1 });
    }
  }

  for (const [norm, info] of tokenCounts.entries()) {
    const isKnownTech = KNOWN_TECHNICAL_TOKENS.has(norm);
    const isAcronym = /^[A-Z0-9]{2,8}$/.test(info.raw);
    const isRepeatedDomainWord = info.count >= 2 && norm.length >= 4;

    if (!isKnownTech && !isAcronym && !isRepeatedDomainWord) {
      continue;
    }

    // Avoid adding single tokens that are already covered by a multi-word phrase unless standalone known tech
    const coveredByPhrase = Array.from(found.keys()).some(
      (phrase) => phrase.includes(' ') && phrase.split(' ').includes(norm)
    );
    if (coveredByPhrase && !isKnownTech) continue;

    if (!found.has(norm)) {
      found.set(norm, {
        term: isKnownTech || isAcronym ? info.raw : formatDisplayTerm(norm),
        normalized: norm,
        category: isKnownTech || isAcronym ? 'technical' : 'domain',
        frequency: info.count,
      });
    }
  }

  return Array.from(found.values())
    .sort((a, b) => {
      if (a.category !== b.category) {
        return a.category === 'technical' ? -1 : 1;
      }
      if (b.frequency !== a.frequency) return b.frequency - a.frequency;
      return a.term.localeCompare(b.term);
    })
    .slice(0, 32);
}

function formatDisplayTerm(term: string): string {
  const upperMap: Record<string, string> = {
    'rest apis': 'REST APIs',
    'rest api': 'REST API',
    'ci/cd': 'CI/CD',
    'power bi': 'Power BI',
    'aws cloud practitioner': 'AWS Cloud Practitioner',
    'google analytics': 'Google Analytics',
    'infrastructure as code': 'Infrastructure as Code',
  };
  if (upperMap[term]) return upperMap[term];
  return term
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
