import { describe, expect, it } from 'vitest';

import { deriveAqi } from '@/utils/aqi';
import { deriveConnectionState, deriveStabilityPct, EXPECTED_READINGS_30D } from '@/utils/connection';
import { deriveStationMetrics } from '@/utils/deriveStationMetrics';
import type { Reading } from '@/types/station';

function makeReadings(count: number, startHour = 0): Reading[] {
  return Array.from({ length: count }, (_, i) => ({
    t: new Date(Date.UTC(2026, 0, 1, startHour + i)).toISOString(),
    pm25: 10 + i,
    pm10: 20 + i,
  }));
}

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

  it('returns null when there is no reading', () => {
    expect(deriveAqi(null)).toBeNull();
  });
});

describe('deriveStabilityPct', () => {
  it('is 100% at the full expected count', () => {
    expect(deriveStabilityPct(EXPECTED_READINGS_30D)).toBe(100);
  });

  it('is the share of expected readings present', () => {
    expect(deriveStabilityPct(360)).toBe(50);
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
});

describe('deriveStationMetrics', () => {
  it('returns a fully-null, offline shape for a station with no readings', () => {
    const metrics = deriveStationMetrics([], null);
    expect(metrics).toEqual({
      pm25: null,
      pm10: null,
      aqi: null,
      connection: 'offline',
      stabilityPct: 0,
      sparkline: [],
    });
  });

  it('derives current values from the last reading', () => {
    const readings = makeReadings(720);
    const now = readings[readings.length - 1]!.t;
    const metrics = deriveStationMetrics(readings, now);

    expect(metrics.pm25).toBe(readings[719]!.pm25);
    expect(metrics.pm10).toBe(readings[719]!.pm10);
    expect(metrics.stabilityPct).toBe(100);
    expect(metrics.connection).toBe('hq');
    expect(metrics.sparkline).toHaveLength(24);
  });

  it('marks a station offline when its last reading predates the snapshot now', () => {
    const readings = makeReadings(720);
    const laterNow = new Date(
      new Date(readings[readings.length - 1]!.t).getTime() + 60 * 60 * 1000,
    ).toISOString();

    const metrics = deriveStationMetrics(readings, laterNow);
    expect(metrics.connection).toBe('offline');
  });

  it('optimistically treats a station as reporting when snapshotNow is not yet known', () => {
    const readings = makeReadings(100);
    const metrics = deriveStationMetrics(readings, null);
    expect(metrics.connection).not.toBe('offline');
  });
});
