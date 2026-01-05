import { z } from 'zod';
import { baseFieldSchema } from './base-field.schema';
import { DateFieldConfig } from '../field-config.types';

/**
 * Safely stringify any input into a string
 */
const safeToString = (input: unknown): string => {
  if (input === null || input === undefined) return '';

  if (typeof input === 'string') return input;

  if (typeof input === 'number' || typeof input === 'boolean') {
    return String(input);
  }

  if (input instanceof Date && !isNaN(input.getTime())) {
    return input.toISOString();
  }

  try {
    const json = JSON.stringify(input);
    return typeof json === 'string' ? json : '';
  } catch {
    return '';
  }
};

/**
 * Build a Date safely with bounds checking
 */
const buildDate = (
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
): Date | undefined => {
  if (
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31 ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return undefined;
  }

  const d = new Date(year, month - 1, day, hour, minute, 0, 0);
  return isNaN(d.getTime()) ? undefined : d;
};

/**
 * DATE ONLY
 * DD/MM/YYYY | DD-MM-YYYY | DD.MM.YYYY
 */
const parseDate = (raw: string): Date | undefined => {
  const m = raw.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
  if (!m) return undefined;

  const [, d, mth, y] = m.map(Number);
  return buildDate(y, mth, d, 0, 0);
};

/**
 * DATE + TIME (NO SECONDS)
 * DD/MM/YYYY HH:mm
 * HH:mm DD/MM/YYYY
 * Supports / - .
 */
const parseDateTime = (raw: string): Date | undefined => {
  // DD/MM/YYYY HH:mm
  let m = raw.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4}) (\d{1,2}):(\d{2})$/);
  if (m) {
    const [, d, mo, y, h, mi] = m.map(Number);
    return buildDate(y, mo, d, h, mi);
  }

  // HH:mm DD/MM/YYYY
  m = raw.match(/^(\d{1,2}):(\d{2}) (\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
  if (m) {
    const [, h, mi, d, mo, y] = m.map(Number);
    return buildDate(y, mo, d, h, mi);
  }

  // ISO without seconds
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(raw)) {
    const d = new Date(raw);
    return isNaN(d.getTime()) ? undefined : d;
  }

  return undefined;
};

export const dateFieldSchema = (config: DateFieldConfig = {}) => {
  const { dateAndTime = false } = config;

  const schema = z.preprocess((input, ctx) => {
    if (input == null || input === '') return undefined;

    // Already normalized by Excel
    if (input instanceof Date && !isNaN(input.getTime())) {
      return input;
    }

    const raw = safeToString(input).trim();
    if (!raw) return undefined;

    const parsed = dateAndTime ? parseDateTime(raw) : parseDate(raw);

    if (!parsed) {
      ctx.addIssue({
        code: 'custom',
        message: 'פורמט תאריך לא חוקי',
      });
      return z.NEVER;
    }

    return parsed;
  }, z.any());

  return baseFieldSchema(schema, config);
};
