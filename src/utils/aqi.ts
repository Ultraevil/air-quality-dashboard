import type { AqiLevel } from '@/types/station';

/**
 * Air Quality Index band, derived from PM2.5 (µg/m³) per the README legend:
 *   Good 0-12 · Moderate 12-35 · Elevated 35-55 · Unhealthy 55+
 *
 * Boundaries are treated as "band starts at this value" (i.e. the upper
 * bound of one band is exclusive, matching the legend's own overlap at 12/35/55).
 */
export function deriveAqi(pm25: number | null): AqiLevel | null {
  if (pm25 === null) return null;
  if (pm25 < 12) return 'good';
  if (pm25 < 35) return 'moderate';
  if (pm25 < 55) return 'elevated';
  return 'unhealthy';
}

export const AQI_LABELS: Record<AqiLevel, string> = {
  good: 'Good',
  moderate: 'Moderate',
  elevated: 'Elevated',
  unhealthy: 'Unhealthy',
};

/** Ordered worst→best for legend rendering / severity comparisons. */
export const AQI_LEVELS_BY_SEVERITY: AqiLevel[] = ['unhealthy', 'elevated', 'moderate', 'good'];
