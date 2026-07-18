import type { Reading, StationMetrics } from '@/types/station';
import { deriveAqi } from './aqi';
import { deriveConnectionState, deriveStabilityPct } from './connection';

/**
 * The single source of truth turning a station's raw reading series into
 * everything the UI renders (current PM2.5/PM10, AQI, connection state,
 * stability %, sparkline) — see README §Data.
 *
 * @param readings   A station's reading series, oldest first. Any range works
 *                    for pm25/pm10/aqi/sparkline, but stability % and
 *                    connection state need the full 30-day series to be
 *                    meaningful — callers computing those should pass the
 *                    unranged (30-day) series.
 * @param snapshotNow The snapshot's most recent expected hour (ISO string), or
 *                    null if not yet known. When null, the station is
 *                    optimistically treated as reporting — the badge
 *                    self-corrects once `snapshotNow` resolves (see
 *                    `useNetworkStore`).
 */
export function deriveStationMetrics(readings: Reading[], snapshotNow: string | null): StationMetrics {
  if (readings.length === 0) {
    return {
      pm25: null,
      pm10: null,
      aqi: null,
      connection: 'offline',
      stabilityPct: 0,
      sparkline: [],
    };
  }

  const last = readings[readings.length - 1]!;
  const stabilityPct = deriveStabilityPct(readings.length);
  const isReportingNow = snapshotNow === null || last.t === snapshotNow;

  return {
    pm25: last.pm25,
    pm10: last.pm10,
    aqi: deriveAqi(last.pm25),
    connection: deriveConnectionState(isReportingNow, stabilityPct),
    stabilityPct,
    sparkline: readings.slice(-24).map((r) => r.pm25),
  };
}
