import { describe, expect, it } from 'vitest';

import {
  CONNECTION_LABELS,
  deriveConnectionState,
  deriveStabilityPct,
  EXPECTED_READINGS_30D,
} from '@/utils/connection';

describe('deriveStabilityPct', () => {
  it('is 100% at the full expected count', () => {
    expect(deriveStabilityPct(EXPECTED_READINGS_30D)).toBe(100);
  });

  it('is the share of expected readings present', () => {
    expect(deriveStabilityPct(360)).toBe(50);
  });

  it('rounds to one decimal place', () => {
    expect(deriveStabilityPct(1)).toBeCloseTo(0.1, 5);
    expect(deriveStabilityPct(500)).toBeCloseTo(69.4, 5);
  });

  it('is 0% with no readings', () => {
    expect(deriveStabilityPct(0)).toBe(0);
  });

  it('never exceeds 100% even with a longer-than-expected series', () => {
    expect(deriveStabilityPct(EXPECTED_READINGS_30D + 10)).toBe(100);
  });
});

describe('deriveConnectionState', () => {
  it('is offline whenever not reporting now, regardless of stability', () => {
    expect(deriveConnectionState(false, 99)).toBe('offline');
    expect(deriveConnectionState(false, 0)).toBe('offline');
  });

  it('is HQ link when reporting with stability >= 86%', () => {
    expect(deriveConnectionState(true, 86)).toBe('hq');
    expect(deriveConnectionState(true, 100)).toBe('hq');
  });

  it('is poor link when reporting with stability < 86%', () => {
    expect(deriveConnectionState(true, 85.9)).toBe('poor');
    expect(deriveConnectionState(true, 0)).toBe('poor');
  });

  it('treats the 86% boundary as inclusive on the HQ side', () => {
    expect(deriveConnectionState(true, 86)).toBe('hq');
    expect(deriveConnectionState(true, 85.99)).toBe('poor');
  });
});

describe('CONNECTION_LABELS', () => {
  it('provides a label for every ConnectionState', () => {
    expect(CONNECTION_LABELS.offline).toBe('Offline');
    expect(CONNECTION_LABELS.poor).toBe('Poor link');
    expect(CONNECTION_LABELS.hq).toBe('HQ link');
  });
});
