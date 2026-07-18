import { describe, expect, it } from 'vitest';

import type { Reading } from '@/types/station';
import { buildParticulateChartOption, type ChartColorTokens } from '@/features/dashboard/chart/buildParticulateChartOption';

const COLORS: ChartColorTokens = {
  pm10: '#111111',
  pm25: '#222222',
  pm25Area: '#222222',
  axisLine: '#333333',
  axisLabel: '#444444',
  splitLine: '#555555',
  tooltipBg: '#666666',
  tooltipText: '#777777',
  tooltipBorder: '#888888',
};

const READINGS: Reading[] = [
  { t: '2026-01-01T00:00:00.000Z', pm25: 10, pm10: 20 },
  { t: '2026-01-01T01:00:00.000Z', pm25: 12, pm10: 24 },
];

describe('buildParticulateChartOption', () => {
  it('always renders both series, with data reflecting the readings', () => {
    const option = buildParticulateChartOption(READINGS, '24h', COLORS, { pm10: true, pm25: true });
    const series = option.series as { name: string; data: number[] }[];

    expect(series).toHaveLength(2);
    expect(series.find((s) => s.name === 'PM10')?.data).toEqual([20, 24]);
    expect(series.find((s) => s.name === 'PM2.5')?.data).toEqual([10, 12]);
  });

  // Regression test: series options have no `show` field in ECharts — visibility
  // has to be expressed via legend.selected, even though the legend itself is
  // hidden (the visible toggle is ChartLegendToggle.vue). An earlier version of
  // this code set a non-existent `series.show` flag, which ECharts silently
  // ignored — so the PM10/PM2.5 checkboxes never actually did anything.
  it('encodes hidden series via legend.selected, keyed by series name', () => {
    const option = buildParticulateChartOption(READINGS, '24h', COLORS, { pm10: false, pm25: true });

    expect(option.legend).toMatchObject({
      show: false,
      selected: { PM10: false, 'PM2.5': true },
    });
  });

  it('uses hourly time labels for the 24h range and date+time labels otherwise', () => {
    const hourly = buildParticulateChartOption(READINGS, '24h', COLORS, { pm10: true, pm25: true });
    const monthly = buildParticulateChartOption(READINGS, '30d', COLORS, { pm10: true, pm25: true });

    const hourlyAxis = hourly.xAxis as { data: string[] };
    const monthlyAxis = monthly.xAxis as { data: string[] };

    expect(hourlyAxis.data[0]).not.toEqual(monthlyAxis.data[0]);
  });
});
