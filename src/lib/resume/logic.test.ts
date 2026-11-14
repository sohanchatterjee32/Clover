import test from 'node:test';
import assert from 'node:assert/strict';
import { formatDateRange, formatMonthYear, validateDateRange } from './date-formatting';
import { createBlankDocument, createSampleDocument } from './initial-data';
import { validateImportedResumeJson, validatePersonalInfo } from './validation';
import { evaluateResumeReadiness } from '../analysis/readiness-score';
import { analyzeJobFit } from '../analysis/job-fit-analysis';
import { improveAchievementWording } from '../writing/bullet-improvements';
import { generateProfessionalSummaryDraft } from '../writing/summary-generator';
import { paginateBlocks } from '../export/pagination';
import { buildResumePdfFilename } from '../utils/filename';
import { hasSectionContent, moveArrayItem } from './section-configuration';

test('date formatting renders YYYY-MM cleanly and rejects invalid end < start', () => {
  assert.equal(formatMonthYear('2023-01'), 'Jan 2023');
  assert.equal(formatDateRange('2023-01', '', true), 'Jan 2023 – Present');
  assert.equal(formatDateRange('2020-07', '2022-12', false), 'Jul 2020 – Dec 2022');
  assert.equal(formatDateRange('', '', false), '');

  const invalid = validateDateRange('2024-05', '2023-01', false);
  assert.equal(invalid.valid, false);

  const validCurrent = validateDateRange('2024-05', '2020-01', true);
  assert.equal(validCurrent.valid, true);
});

test('validation rejects malformed email and accepts valid backup JSON', () => {
  const sample = createSampleDocument('doc_test');
  const validErrors = validatePersonalInfo(sample.personal);
  assert.equal(Object.keys(validErrors).length, 0);

  const badErrors = validatePersonalInfo({
    ...sample.personal,
    email: 'not-an-email',
  });
  assert.ok(badErrors.email);

  const goodImport = validateImportedResumeJson(sample);
  assert.equal(goodImport.valid, true);

  const badImport = validateImportedResumeJson({ foo: 'bar' });
  assert.equal(badImport.valid, false);
});

test('readiness score evaluates actual data accurately', () => {
  const sample = createSampleDocument('doc_test');
  const sampleEval = evaluateResumeReadiness(sample);
  assert.ok(sampleEval.score >= 85, `Expected high score for sample, got ${sampleEval.score}`);

  const blank = createBlankDocument();
  const blankEval = evaluateResumeReadiness(blank);
  assert.equal(blankEval.score, 10); // only valid empty dates consistency check passes, no fake points for missing fields
  assert.ok(blankEval.recommendations.length >= 5);
});

test('Job Fit Lab extracts keywords and identifies matches vs missing terms locally', () => {
  const sample = createSampleDocument('doc_test');
  const jd = `
    Seeking a Cloud Platform Engineer with strong experience in AWS, Terraform, EC2,
    Kubernetes, Docker, and Incident Management to support CI/CD pipelines.
  `;
  const analysis = analyzeJobFit(sample, jd);
  assert.equal(analysis.hasJobDescription, true);

  const matchedNames = analysis.matchingKeywords.map((k) => k.normalized);
  const missingNames = analysis.missingKeywords.map((k) => k.normalized);

  assert.ok(matchedNames.includes('aws'));
  assert.ok(matchedNames.includes('terraform'));
  assert.ok(missingNames.includes('kubernetes'));
  assert.ok(missingNames.includes('docker'));
});

test('Writing Coach improves wording without inventing metrics', () => {
  const suggestion = improveAchievementWording('Worked on AWS and fixed server problems.');
  assert.equal(suggestion.changed, true);
  assert.ok(suggestion.improved.includes('AWS'));
  assert.ok(!/\d+%/.test(suggestion.improved), 'Must never invent percentage metrics');

  const blank = createBlankDocument();
  const emptyDraft = generateProfessionalSummaryDraft(blank);
  assert.equal(emptyDraft.canGenerate, false);
  assert.ok(emptyDraft.missingDetails.length >= 2);

  const sample = createSampleDocument();
  const sampleDraft = generateProfessionalSummaryDraft(sample);
  assert.equal(sampleDraft.canGenerate, true);
  assert.ok(sampleDraft.draft.includes('Cloud Platform Engineer'));
});

test('pagination preserves keepWithNext chains and splits overflow across pages', () => {
  const blocks = [
    { id: 'header' },
    { id: 'sec-exp', keepWithNext: true },
    { id: 'exp-1-head', keepWithNext: true },
    { id: 'exp-1-b1' },
    { id: 'exp-1-b2' },
    { id: 'exp-1-b3' },
  ];
  const heights: Record<string, number> = {
    header: 200,
    'sec-exp': 40,
    'exp-1-head': 50,
    'exp-1-b1': 120,
    'exp-1-b2': 300,
    'exp-1-b3': 350,
  };
  // Budget = 500px -> header(200) + sec-exp(40)+exp-1-head(50)+b1(120)=410 fits page 1; b2(300) overflows to page 2; b3(350) overflows to page 3
  const pages = paginateBlocks(blocks, heights, 500);
  assert.equal(pages.length, 3);
  assert.deepEqual(pages[0].map((b) => b.id), ['header', 'sec-exp', 'exp-1-head', 'exp-1-b1']);
  assert.deepEqual(pages[1].map((b) => b.id), ['exp-1-b2']);
  assert.deepEqual(pages[2].map((b) => b.id), ['exp-1-b3']);
});

test('filename sanitization and section helpers work deterministically', () => {
  assert.equal(buildResumePdfFilename('Rohan Mehta'), 'Rohan_Mehta_Resume.pdf');
  assert.equal(buildResumePdfFilename('Ada/Lovelace:*?'), 'AdaLovelace_Resume.pdf');

  const blank = createBlankDocument();
  assert.equal(hasSectionContent(blank, 'experience'), false);
  assert.equal(hasSectionContent(blank, 'projects'), false);

  const reordered = moveArrayItem(['a', 'b', 'c'], 0, 2);
  assert.deepEqual(reordered, ['b', 'c', 'a']);
});
