<script setup lang="ts">
import * as echarts from 'echarts';
import { storeToRefs } from 'pinia';
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';

import BaseCard from '@/components/ui/BaseCard.vue';
import SegmentedControl, { type SegmentedControlOption } from '@/components/ui/SegmentedControl.vue';
import { useResolvedCssVars } from '@/composables/useResolvedCssVars';
import { useStationReadings } from '@/composables/useStationReadings';
import { useDashboardSelectionStore } from '@/stores/dashboardSelection';
import { useThemeStore } from '@/stores/theme';
import type { ReadingsRange } from '@/types/station';
import { buildParticulateChartOption, type ChartColorTokens } from './buildParticulateChartOption';
import ChartLegendToggle from './ChartLegendToggle.vue';

const RANGE_OPTIONS: SegmentedControlOption<ReadingsRange>[] = [
  { value: '24h', label: '24H' },
  { value: '7d', label: '7D' },
  { value: '30d', label: '30D' },
];

const selectionStore = useDashboardSelectionStore();
const { selectedStation, chartRange } = storeToRefs(selectionStore);

const themeStore = useThemeStore();
const { theme } = storeToRefs(themeStore);

const stationId = computed(() => selectedStation.value?.id ?? null);
const { readings, isLoading } = useStationReadings(stationId, chartRange);

const showPm10 = ref(true);
const showPm25 = ref(true);

const CSS_VAR_NAMES = {
  pm10: '--color-border-strong',
  pm25: '--color-accent',
  axisLine: '--color-border',
  axisLabel: '--color-text-faint',
  splitLine: '--color-border',
  tooltipBg: '--color-surface-raised',
  tooltipText: '--color-text',
  tooltipBorder: '--color-border',
} as const;
const resolvedColors = useResolvedCssVars(CSS_VAR_NAMES, theme);

const colorTokens = computed<ChartColorTokens>(() => ({
  pm10: resolvedColors.value.pm10,
  pm25: resolvedColors.value.pm25,
  pm25Area: `color-mix(in srgb, ${resolvedColors.value.pm25} 18%, transparent)`,
  axisLine: resolvedColors.value.axisLine,
  axisLabel: resolvedColors.value.axisLabel,
  splitLine: resolvedColors.value.splitLine,
  tooltipBg: resolvedColors.value.tooltipBg,
  tooltipText: resolvedColors.value.tooltipText,
  tooltipBorder: resolvedColors.value.tooltipBorder,
}));

const chartContainer = ref<HTMLElement | null>(null);
let chart: echarts.ECharts | null = null;
let resizeObserver: ResizeObserver | null = null;

function render(): void {
  if (!chart) return;
  const option = buildParticulateChartOption(readings.value, chartRange.value, colorTokens.value, {
    pm10: showPm10.value,
    pm25: showPm25.value,
  });
  chart.setOption(option, true);
}

onMounted(() => {
  if (!chartContainer.value) return;
  chart = echarts.init(chartContainer.value);
  render();

  resizeObserver = new ResizeObserver(() => chart?.resize());
  resizeObserver.observe(chartContainer.value);
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  chart?.dispose();
});

watch([readings, colorTokens, showPm10, showPm25], render);

const subtitle = computed(() => {
  if (!selectedStation.value) return 'Select a station on the map or in Districts';
  const rangeLabel = { '24h': 'Live 24H', '7d': '7 days', '30d': '30 days' }[chartRange.value];
  return `${selectedStation.value.district} · ${selectedStation.value.location} · ${rangeLabel} · µg/m³`;
});
</script>

<template>
  <BaseCard class="particulate-chart">
    <div class="particulate-chart__header">
      <div>
        <h2 class="particulate-chart__title">Particulate Concentration over Time</h2>
        <p class="particulate-chart__subtitle">{{ subtitle }}</p>
      </div>
      <div class="particulate-chart__controls">
        <ChartLegendToggle v-model="showPm10" label="PM10" shape="bar" :color="colorTokens.pm10" />
        <ChartLegendToggle v-model="showPm25" label="PM2.5" shape="line" :color="colorTokens.pm25" />
        <SegmentedControl v-model="chartRange" :options="RANGE_OPTIONS" aria-label="Chart range" />
      </div>
    </div>

    <div class="particulate-chart__body">
      <div ref="chartContainer" class="particulate-chart__canvas" role="img" :aria-label="subtitle" />
      <p v-if="!selectedStation" class="particulate-chart__placeholder">
        Pick a station to see its readings.
      </p>
      <p v-else-if="isLoading" class="particulate-chart__placeholder">Loading readings…</p>
    </div>
  </BaseCard>
</template>

<style scoped>
.particulate-chart__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-3);
}

.particulate-chart__title {
  font-size: 15px;
  font-weight: 700;
}

.particulate-chart__subtitle {
  font-size: 11px;
  color: var(--color-text-faint);
  font-family: var(--font-mono);
  margin-top: 2px;
}

.particulate-chart__controls {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.particulate-chart__body {
  position: relative;
  margin-top: var(--space-4);
  height: 360px;
}

.particulate-chart__canvas {
  width: 100%;
  height: 100%;
}

.particulate-chart__placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  font-size: 13px;
  pointer-events: none;
}
</style>
