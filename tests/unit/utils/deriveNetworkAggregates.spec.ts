import { describe, expect, it } from 'vitest';

import { deriveNetworkAggregates } from '@/utils/deriveNetworkAggregates';
import { makeStationWithMetrics } from '../../fixtures/stations';

describe('deriveNetworkAggregates', () => {
  it('returns zeroed-out aggregates for an empty network', () => {
    const aggregates = deriveNetworkAggregates([]);
    expect(aggregates).toEqual({
      activeSensors: 0,
      avgPm25: null,
      avgPm25Aqi: null,
      poorConnectionCount: 0,
      avgStabilityPct: 0,
    });
  });

  it('counts every non-offline station as active', () => {
    const stations = [
      makeStationWithMetrics({ id: 'A' }, { connection: 'hq' }),
      makeStationWithMetrics({ id: 'B' }, { connection: 'poor' }),
      makeStationWithMetrics({ id: 'C' }, { connection: 'offline' }),
    ];
    expect(deriveNetworkAggregates(stations).activeSensors).toBe(2);
  });

  it('counts only poor-connection stations, not offline ones', () => {
    const stations = [
      makeStationWithMetrics({ id: 'A' }, { connection: 'poor' }),
      makeStationWithMetrics({ id: 'B' }, { connection: 'poor' }),
      makeStationWithMetrics({ id: 'C' }, { connection: 'offline' }),
      makeStationWithMetrics({ id: 'D' }, { connection: 'hq' }),
    ];
    expect(deriveNetworkAggregates(stations).poorConnectionCount).toBe(2);
  });

  it('averages PM2.5 only across stations that have a reading', () => {
    const stations = [
      makeStationWithMetrics({ id: 'A' }, { pm25: 10 }),
      makeStationWithMetrics({ id: 'B' }, { pm25: 20 }),
      makeStationWithMetrics({ id: 'C' }, { pm25: null }),
    ];
    const aggregates = deriveNetworkAggregates(stations);
    expect(aggregates.avgPm25).toBe(15);
  });

  it('derives the AQI band from the averaged PM2.5, not per-station AQIs', () => {
    const stations = [
      makeStationWithMetrics({ id: 'A' }, { pm25: 5, aqi: 'good' }),
      makeStationWithMetrics({ id: 'B' }, { pm25: 65, aqi: 'unhealthy' }),
    ];
    const aggregates = deriveNetworkAggregates(stations);
    expect(aggregates.avgPm25).toBe(35);
    expect(aggregates.avgPm25Aqi).toBe('elevated');
  });

  it('returns a null avgPm25 and avgPm25Aqi when no station has a reading', () => {
    const stations = [
      makeStationWithMetrics({ id: 'A' }, { pm25: null }),
      makeStationWithMetrics({ id: 'B' }, { pm25: null }),
    ];
    const aggregates = deriveNetworkAggregates(stations);
    expect(aggregates.avgPm25).toBeNull();
    expect(aggregates.avgPm25Aqi).toBeNull();
  });

  it('averages stability across all stations, including offline ones', () => {
    const stations = [
      makeStationWithMetrics({ id: 'A' }, { stabilityPct: 100 }),
      makeStationWithMetrics({ id: 'B' }, { stabilityPct: 0 }),
    ];
    expect(deriveNetworkAggregates(stations).avgStabilityPct).toBe(50);
  });
});
