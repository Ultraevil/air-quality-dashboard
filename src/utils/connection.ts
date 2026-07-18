import type { ConnectionState } from '@/types/station';

/**
 * A healthy station reports one reading per hour, on the hour, over the
 * 30-day snapshot window (README §Data): 24 * 30 = 720 expected readings.
 */
export const EXPECTED_READINGS_30D = 720;

/** Stability % — share of expected hourly readings present over 30 days. */
export function deriveStabilityPct(readingsCount: number): number {
  const pct = (readingsCount / EXPECTED_READINGS_30D) * 100;
  return Math.min(100, Math.round(pct * 10) / 10);
}

/**
 * Connection state (README §Connection):
 *   Offline    — no reading for the most recent expected hour, regardless of stability %.
 *   Poor link  — reporting, stability below 86%.
 *   HQ link    — reporting, stability 86% or better.
 *
 * `isReportingNow` tells us whether the station has a reading for the
 * snapshot's most recent expected hour ("now").
 */
export function deriveConnectionState(isReportingNow: boolean, stabilityPct: number): ConnectionState {
  if (!isReportingNow) return 'offline';
  return stabilityPct >= 86 ? 'hq' : 'poor';
}

export const CONNECTION_LABELS: Record<ConnectionState, string> = {
  offline: 'Offline',
  poor: 'Poor link',
  hq: 'HQ link',
};
