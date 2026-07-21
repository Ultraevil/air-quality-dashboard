import { describe, expect, it } from 'vitest';

import type { Reading } from '@/types/station';
import {
  buildParticulateChartOption,
  type ChartColorTokens,
} from '@/features/dashboard/chart/buildParticulateChartOption';

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

  it('uses date+time labels for the 7d range too, not just 30d', () => {
    const hourly = buildParticulateChartOption(READINGS, '24h', COLORS, { pm10: true, pm25: true });
    const weekly = buildParticulateChartOption(READINGS, '7d', COLORS, { pm10: true, pm25: true });

    const hourlyAxis = hourly.xAxis as { data: string[] };
    const weeklyAxis = weekly.xAxis as { data: string[] };

    expect(hourlyAxis.data[0]).not.toEqual(weeklyAxis.data[0]);
  });

  it('builds one x-axis category per reading, in order', () => {
    const option = buildParticulateChartOption(READINGS, '24h', COLORS, { pm10: true, pm25: true });
    const axis = option.xAxis as { data: string[] };
    expect(axis.data).toHaveLength(READINGS.length);
  });
});

describe('buildParticulateChartOption — legend', () => {
  it('keeps the built-in ECharts legend hidden — visibility is driven by ChartLegendToggle instead', () => {
    const option = buildParticulateChartOption(READINGS, '24h', COLORS, { pm10: true, pm25: true });
    expect(option.legend).toMatchObject({ show: false });
  });

  it('shows both series when both are toggled on', () => {
    const option = buildParticulateChartOption(READINGS, '24h', COLORS, { pm10: true, pm25: true });
    expect(option.legend).toMatchObject({ selected: { PM10: true, 'PM2.5': true } });
  });

  it('hides both series when both are toggled off', () => {
    const option = buildParticulateChartOption(READINGS, '24h', COLORS, { pm10: false, pm25: false });
    expect(option.legend).toMatchObject({ selected: { PM10: false, 'PM2.5': false } });
  });
});

describe('buildParticulateChartOption — axis styling', () => {
  it('applies the resolved theme colours to the axis line, labels, and split lines', () => {
    const option = buildParticulateChartOption(READINGS, '24h', COLORS, { pm10: true, pm25: true });
    const xAxis = option.xAxis as {
      axisLine: { lineStyle: { color: string } };
      axisLabel: { color: string };
    };
    const yAxis = option.yAxis as {
      splitLine: { lineStyle: { color: string } };
      axisLabel: { color: string };
    };

    expect(xAxis.axisLine.lineStyle.color).toBe(COLORS.axisLine);
    expect(xAxis.axisLabel.color).toBe(COLORS.axisLabel);
    expect(yAxis.splitLine.lineStyle.color).toBe(COLORS.splitLine);
    expect(yAxis.axisLabel.color).toBe(COLORS.axisLabel);
  });
});

describe('buildParticulateChartOption — tooltip', () => {
  it('triggers on axis hover and applies the resolved theme colours', () => {
    const option = buildParticulateChartOption(READINGS, '24h', COLORS, { pm10: true, pm25: true });
    const tooltip = option.tooltip as {
      trigger: string;
      backgroundColor: string;
      borderColor: string;
      textStyle: { color: string };
      valueFormatter: (value: unknown) => string;
    };

    expect(tooltip.trigger).toBe('axis');
    expect(tooltip.backgroundColor).toBe(COLORS.tooltipBg);
    expect(tooltip.borderColor).toBe(COLORS.tooltipBorder);
    expect(tooltip.textStyle.color).toBe(COLORS.tooltipText);
  });

  it('formats tooltip values with the µg/m³ unit', () => {
    const option = buildParticulateChartOption(READINGS, '24h', COLORS, { pm10: true, pm25: true });
    const tooltip = option.tooltip as { valueFormatter: (value: unknown) => string };
    expect(tooltip.valueFormatter(23.4)).toBe('23.4 µg/m³');
  });
});

describe('buildParticulateChartOption — series shape', () => {
  it('renders PM10 as a bar series and PM2.5 as a line series', () => {
    const option = buildParticulateChartOption(READINGS, '24h', COLORS, { pm10: true, pm25: true });
    const series = option.series as { name: string; type: string }[];

    expect(series.find((s) => s.name === 'PM10')?.type).toBe('bar');
    expect(series.find((s) => s.name === 'PM2.5')?.type).toBe('line');
  });

  it('draws PM2.5 above PM10 (higher z-index)', () => {
    const option = buildParticulateChartOption(READINGS, '24h', COLORS, { pm10: true, pm25: true });
    const series = option.series as { name: string; z: number }[];

    const pm10Z = series.find((s) => s.name === 'PM10')!.z;
    const pm25Z = series.find((s) => s.name === 'PM2.5')!.z;
    expect(pm25Z).toBeGreaterThan(pm10Z);
  });
});

describe('buildParticulateChartOption — empty and malformed datasets', () => {
  it('handles an empty reading list without throwing, producing empty series and categories', () => {
    const option = buildParticulateChartOption([], '24h', COLORS, { pm10: true, pm25: true });
    const series = option.series as { data: unknown[] }[];
    const axis = option.xAxis as { data: string[] };

    expect(axis.data).toEqual([]);
    expect(series[0]!.data).toEqual([]);
    expect(series[1]!.data).toEqual([]);
  });

  it('passes through null pollutant values (e.g. a gap in the series) rather than dropping them', () => {
    const withGap: Reading[] = [
      { t: '2026-01-01T00:00:00.000Z', pm25: 10, pm10: 20 },
      { t: '2026-01-01T01:00:00.000Z', pm25: null as unknown as number, pm10: 24 },
    ];
    const option = buildParticulateChartOption(withGap, '24h', COLORS, { pm10: true, pm25: true });
    const series = option.series as { name: string; data: unknown[] }[];

    expect(series.find((s) => s.name === 'PM2.5')?.data).toEqual([10, null]);
  });

  // Documents current (arguably risky) behavior rather than desired behavior:
  // `formatTime`/`formatDateTime` call `Intl.DateTimeFormat.format(new Date(...))`,
  // which throws `RangeError: Invalid time value` for an unparseable timestamp.
  // Since `t` comes from the API and is never user-editable, this is a low-risk
  // gap — but it means one malformed reading can crash the whole chart. Flagging
  // here so a future API contract change doesn't reintroduce this silently.
  it('throws if a reading has an unparseable timestamp (known gap — see comment)', () => {
    const malformed: Reading[] = [{ t: 'not-a-real-timestamp', pm25: 5, pm10: 5 }];
    expect(() =>
      buildParticulateChartOption(malformed, '24h', COLORS, { pm10: true, pm25: true }),
    ).toThrow('Invalid time value');
  });
});
