import type { AqiLevel, StationWithMetrics } from '@/types/station';
import { deriveAqi } from './aqi';

/** Network-wide KPI aggregates (README §4), derived once from every station's metrics. */
export interface NetworkAggregates {
  /** Stations not currently `offline`. */
  activeSensors: number;
  /** Mean of the latest PM2.5 reading across stations that have one. */
  avgPm25: number | null;
  /** AQI band for `avgPm25`, or null if there's nothing to derive it from. */
  avgPm25Aqi: AqiLevel | null;
  /** Stations whose connection state is `poor`. */
  poorConnectionCount: number;
  /** Mean 30-day stability % across all stations. */
  avgStabilityPct: number;
}

/**
 * The single source of truth for the Dashboard's KPI tiles — mirrors
 * `deriveStationMetrics.ts`'s "derive once, consume everywhere" rule so a
 * KPI definition change (e.g. what counts as "active") only ever touches
 * this function, rather than being recomputed ad hoc in `KpiTiles.vue`.
 *
 * @param stations Every station in the network, each with its metrics
 *                  already derived via `deriveStationMetrics`.
 */
export function deriveNetworkAggregates(stations: StationWithMetrics[]): NetworkAggregates {
  const activeSensors = stations.filter((station) => station.metrics.connection !== 'offline').length;

  const pm25Values = stations
    .map((station) => station.metrics.pm25)
    .filter((value): value is number => value !== null);
  const avgPm25 =
    pm25Values.length === 0
      ? null
      : pm25Values.reduce((sum, value) => sum + value, 0) / pm25Values.length;

  const poorConnectionCount = stations.filter((station) => station.metrics.connection === 'poor').length;

  const avgStabilityPct =
    stations.length === 0
      ? 0
      : stations.reduce((sum, station) => sum + station.metrics.stabilityPct, 0) / stations.length;

  return {
    activeSensors,
    avgPm25,
    avgPm25Aqi: deriveAqi(avgPm25),
    poorConnectionCount,
    avgStabilityPct,
  };
}
