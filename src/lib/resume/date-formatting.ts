import { format, isValid, parse } from 'date-fns';

const YEAR_MONTH_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;

export function isValidYearMonth(value: string): boolean {
  return YEAR_MONTH_REGEX.test(value.trim());
}

export function formatMonthYear(value: string): string {
  const trimmed = (value || '').trim();
  if (!trimmed) return '';
  if (!isValidYearMonth(trimmed)) {
    return trimmed;
  }
  const parsed = parse(trimmed, 'yyyy-MM', new Date(2000, 0, 1));
  if (!isValid(parsed)) {
    return trimmed;
  }
  return format(parsed, 'MMM yyyy');
}

export function formatDateRange(
  startDate: string,
  endDate: string,
  isCurrent = false
): string {
  const start = formatMonthYear(startDate);
  const end = isCurrent ? 'Present' : formatMonthYear(endDate);

  if (start && end) {
    return `${start} – ${end}`;
  }
  if (start) {
    return isCurrent ? `${start} – Present` : start;
  }
  if (end) {
    return end;
  }
  return '';
}

export function validateDateRange(
  startDate: string,
  endDate: string,
  isCurrent = false
): { valid: boolean; error?: string } {
  const start = (startDate || '').trim();
  const end = (endDate || '').trim();

  if (start && !isValidYearMonth(start)) {
    return { valid: false, error: 'Start month must use YYYY-MM format.' };
  }
  if (!isCurrent && end && !isValidYearMonth(end)) {
    return { valid: false, error: 'End month must use YYYY-MM format.' };
  }
  if (!isCurrent && start && end && end < start) {
    return {
      valid: false,
      error: 'End date cannot be earlier than the start date.',
    };
  }
  return { valid: true };
}
