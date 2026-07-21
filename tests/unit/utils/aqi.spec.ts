import { describe, expect, it } from 'vitest';

import { AQI_LABELS, AQI_LEVELS_BY_SEVERITY, deriveAqi } from '@/utils/aqi';

describe('deriveAqi', () => {
  it('classifies the four AQI bands per the README legend', () => {
    expect(deriveAqi(0)).toBe('good');
    expect(deriveAqi(11.9)).toBe('good');
    expect(deriveAqi(12)).toBe('moderate');
    expect(deriveAqi(34.9)).toBe('moderate');
    expect(deriveAqi(35)).toBe('elevated');
    expect(deriveAqi(54.9)).toBe('elevated');
    expect(deriveAqi(55)).toBe('unhealthy');
    expect(deriveAqi(200)).toBe('unhealthy');
  });

  it('treats each band boundary as the start of the next (upper-exclusive) band', () => {
    // Regression guard: the boundaries look ambiguous in the README's own
    // legend (bands appear to overlap at 12/35/55) — these are the exact
    // values a naive `<=` vs `<` swap would misclassify.
    expect(deriveAqi(12)).not.toBe('good');
    expect(deriveAqi(35)).not.toBe('moderate');
    expect(deriveAqi(55)).not.toBe('elevated');
  });

  it('returns null when there is no reading', () => {
    expect(deriveAqi(null)).toBeNull();
  });

  it('handles negative and zero values without throwing', () => {
    expect(deriveAqi(-5)).toBe('good');
    expect(deriveAqi(0)).toBe('good');
  });
});

describe('AQI_LABELS', () => {
  it('provides a human-readable label for every AqiLevel', () => {
    for (const level of AQI_LEVELS_BY_SEVERITY) {
      expect(AQI_LABELS[level]).toEqual(expect.any(String));
      expect(AQI_LABELS[level].length).toBeGreaterThan(0);
    }
  });
});

describe('AQI_LEVELS_BY_SEVERITY', () => {
  it('is ordered worst to best', () => {
    expect(AQI_LEVELS_BY_SEVERITY).toEqual(['unhealthy', 'elevated', 'moderate', 'good']);
  });

  it('has no duplicate or missing levels', () => {
    expect(new Set(AQI_LEVELS_BY_SEVERITY).size).toBe(AQI_LEVELS_BY_SEVERITY.length);
  });
});
