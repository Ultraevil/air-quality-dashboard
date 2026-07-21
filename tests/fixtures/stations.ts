import type { Reading, Station, StationMetrics, StationWithMetrics } from '@/types/station';

/** Builds `count` consecutive hourly readings starting at 2026-01-01T00:00Z + startHour. */
export function makeReadings(count: number, startHour = 0): Reading[] {
  return Array.from({ length: count }, (_, i) => ({
    t: new Date(Date.UTC(2026, 0, 1, startHour + i)).toISOString(),
    pm25: 10 + i,
    pm10: 20 + i,
  }));
}

export function makeStation(overrides: Partial<Station> = {}): Station {
  return {
    id: 'ST-001',
    district: 'Mitte',
    location: 'Alexanderplatz',
    coordinates: { lat: 52.52, lng: 13.405 },
    ...overrides,
  };
}

export function makeMetrics(overrides: Partial<StationMetrics> = {}): StationMetrics {
  return {
    pm25: 10,
    pm10: 20,
    aqi: 'good',
    connection: 'hq',
    stabilityPct: 100,
    sparkline: [8, 9, 10],
    ...overrides,
  };
}

export function makeStationWithMetrics(
  stationOverrides: Partial<Station> = {},
  metricsOverrides: Partial<StationMetrics> = {},
): StationWithMetrics {
  return {
    ...makeStation(stationOverrides),
    metrics: makeMetrics(metricsOverrides),
  };
}
