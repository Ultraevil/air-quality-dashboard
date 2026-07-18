import type { EChartsOption } from 'echarts';

import type { Reading, ReadingsRange } from '@/types/station';
import { formatDateTime, formatTime } from '@/utils/format';

export interface ChartColorTokens {
  pm10: string;
  pm25: string;
  pm25Area: string;
  axisLine: string;
  axisLabel: string;
  splitLine: string;
  tooltipBg: string;
  tooltipText: string;
  tooltipBorder: string;
}

export interface SeriesVisibility {
  pm10: boolean;
  pm25: boolean;
}

/** Pure — takes readings + resolved theme colours in, returns an ECharts option. No DOM, no side effects: easy to unit test. */
export function buildParticulateChartOption(
  readings: Reading[],
  range: ReadingsRange,
  colors: ChartColorTokens,
  visibility: SeriesVisibility,
): EChartsOption {
  const labelFormatter = range === '24h' ? formatTime : formatDateTime;
  const categories = readings.map((r) => labelFormatter(r.t));

  return {
    animationDuration: 200,
    grid: { left: 48, right: 16, top: 16, bottom: 32 },
    legend: {
      show: false, // the visible toggle UI is ChartLegendToggle.vue; this just drives selection state
      selected: {
        PM10: visibility.pm10,
        'PM2.5': visibility.pm25,
      },
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: colors.tooltipBg,
      borderColor: colors.tooltipBorder,
      textStyle: { color: colors.tooltipText },
      valueFormatter: (value) => `${value} µg/m³`,
    },
    xAxis: {
      type: 'category',
      data: categories,
      boundaryGap: true,
      axisLine: { lineStyle: { color: colors.axisLine } },
      axisTick: { show: false },
      axisLabel: { color: colors.axisLabel, fontSize: 11 },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: colors.splitLine } },
      axisLabel: { color: colors.axisLabel, fontSize: 11 },
    },
    series: [
      {
        name: 'PM10',
        type: 'bar',
        data: readings.map((r) => r.pm10),
        itemStyle: { color: colors.pm10, borderRadius: [3, 3, 0, 0] },
        barMaxWidth: 18,
        z: 1,
      },
      {
        name: 'PM2.5',
        type: 'line',
        data: readings.map((r) => r.pm25),
        smooth: true,
        symbol: 'none',
        lineStyle: { color: colors.pm25, width: 2.5 },
        areaStyle: { color: colors.pm25Area },
        z: 2,
      },
    ],
  };
}
