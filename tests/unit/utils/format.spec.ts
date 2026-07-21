import { describe, expect, it } from 'vitest';

import {
  formatConcentration,
  formatConcentrationValue,
  formatDateTime,
  formatInteger,
  formatPercent,
  formatTime,
} from '@/utils/format';

describe('formatConcentration', () => {
  it('formats a value with one decimal and the µg/m³ unit', () => {
    expect(formatConcentration(23.44)).toBe('23.4 µg/m³');
  });

  it('pads whole numbers to one decimal', () => {
    expect(formatConcentration(10)).toBe('10.0 µg/m³');
  });

  it('renders an em dash for null', () => {
    expect(formatConcentration(null)).toBe('—');
  });
});

describe('formatConcentrationValue', () => {
  it('formats a value with one decimal and no unit', () => {
    expect(formatConcentrationValue(23.44)).toBe('23.4');
  });

  it('renders an em dash for null', () => {
    expect(formatConcentrationValue(null)).toBe('—');
  });
});

describe('formatInteger', () => {
  it('formats with thousands separators', () => {
    expect(formatInteger(1234)).toBe('1,234');
  });

  it('formats zero', () => {
    expect(formatInteger(0)).toBe('0');
  });
});

describe('formatPercent', () => {
  it('rounds to the nearest whole percent', () => {
    expect(formatPercent(86.4)).toBe('86%');
    expect(formatPercent(86.5)).toBe('87%');
  });

  it('appends a percent sign', () => {
    expect(formatPercent(100)).toBe('100%');
  });
});

describe('formatTime', () => {
  it('formats an ISO timestamp as hours:minutes', () => {
    expect(formatTime('2026-01-01T08:05:00.000Z')).toMatch(/^\d{2}:\d{2}$/);
  });
});

describe('formatDateTime', () => {
  it('formats an ISO timestamp with day, month, and time', () => {
    const result = formatDateTime('2026-03-15T08:05:00.000Z');
    expect(result).toMatch(/\d{2}:\d{2}/);
    expect(result).toContain('Mar');
  });
});
