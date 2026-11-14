export function buildResumePdfFilename(fullName?: string, documentName?: string): string {
  const base = (fullName || '').trim() || (documentName || '').trim() || 'Clover_Document';
  const sanitized = base
    .replace(/[^a-zA-Z0-9\s_-]/g, '')
    .trim()
    .replace(/\s+/g, '_');
  const safeBase = sanitized.length > 0 ? sanitized : 'Clover_Document';
  if (safeBase.toLowerCase().endsWith('_resume')) {
    return `${safeBase}.pdf`;
  }
  return `${safeBase}_Resume.pdf`;
}

export function buildBackupJsonFilename(documentName?: string): string {
  const base = (documentName || '').trim() || 'clover_resume';
  const sanitized = base
    .replace(/[^a-zA-Z0-9\s_-]/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .toLowerCase();
  return `${sanitized || 'clover_resume'}_backup.json`;
}
