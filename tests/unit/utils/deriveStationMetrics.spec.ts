import { describe, expect, it } from 'vitest';

import { deriveStationMetrics } from '@/utils/deriveStationMetrics';
import { makeReadings } from '../../fixtures/stations';

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

  it('derives the AQI band from the last PM2.5 reading', () => {
    const readings = makeReadings(1); // pm25: 10 -> good
    const metrics = deriveStationMetrics(readings, readings[0]!.t);
    expect(metrics.aqi).toBe('good');
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

  it('marks a low-stability but currently-reporting station as poor link, not offline', () => {
    const readings = makeReadings(100); // 100/720 ≈ 13.9% stability
    const now = readings[readings.length - 1]!.t;
    const metrics = deriveStationMetrics(readings, now);
    expect(metrics.connection).toBe('poor');
    expect(metrics.stabilityPct).toBeLessThan(86);
  });

  it('caps the sparkline at the last 24 readings, oldest first, for long series', () => {
    const readings = makeReadings(720);
    const metrics = deriveStationMetrics(readings, null);
    expect(metrics.sparkline).toHaveLength(24);
    expect(metrics.sparkline[0]).toBe(readings[696]!.pm25);
    expect(metrics.sparkline[23]).toBe(readings[719]!.pm25);
  });

  it('uses every reading for the sparkline when there are fewer than 24', () => {
    const readings = makeReadings(5);
    const metrics = deriveStationMetrics(readings, null);
    expect(metrics.sparkline).toEqual(readings.map((r) => r.pm25));
  });

  it('derives stability from the full passed-in series length, independent of the range shown', () => {
    // Callers computing stability/connection must pass the unranged (30-day)
    // series — a single reading should not read as "100% stable".
    const readings = makeReadings(1);
    const metrics = deriveStationMetrics(readings, readings[0]!.t);
    expect(metrics.stabilityPct).toBeLessThan(1);
  });
});
