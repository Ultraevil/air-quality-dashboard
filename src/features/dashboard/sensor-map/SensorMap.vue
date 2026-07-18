<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';

import BaseCard from '@/components/ui/BaseCard.vue';
import SegmentedControl, { type SegmentedControlOption } from '@/components/ui/SegmentedControl.vue';
import { useDashboardSelectionStore } from '@/stores/dashboardSelection';
import { useNetworkStore } from '@/stores/network';
import { useThemeStore } from '@/stores/theme';
import type { Pollutant, StationWithMetrics } from '@/types/station';
import AqiLegend from './AqiLegend.vue';
import { useLeafletStationMap } from './useLeafletStationMap';

const POLLUTANT_OPTIONS: SegmentedControlOption<Pollutant>[] = [
  { value: 'pm25', label: 'PM2.5' },
  { value: 'pm10', label: 'PM10' },
];

const networkStore = useNetworkStore();
const { stationsWithMetrics } = storeToRefs(networkStore);

const selectionStore = useDashboardSelectionStore();
const { selectedStation, mapPollutant } = storeToRefs(selectionStore);

const themeStore = useThemeStore();
const { isDark } = storeToRefs(themeStore);

const mapContainer = ref<HTMLElement | null>(null);
const selectedStationId = computed(() => selectedStation.value?.id ?? null);

function handleSelect(station: StationWithMetrics): void {
  selectionStore.selectStation(station);
}

useLeafletStationMap({
  container: mapContainer,
  stations: stationsWithMetrics,
  selectedStationId,
  pollutant: mapPollutant,
  isDark,
  onSelect: handleSelect,
});
</script>

<template>
  <BaseCard no-padding class="sensor-map-card">
    <div class="sensor-map-card__header">
      <div>
        <h2 class="sensor-map-card__title">Sensor Map</h2>
        <p class="sensor-map-card__subtitle">Particulate readings across Berlin</p>
      </div>
      <SegmentedControl v-model="mapPollutant" :options="POLLUTANT_OPTIONS" aria-label="Map pollutant" />
    </div>

    <div class="sensor-map-card__map-wrap">
      <div ref="mapContainer" class="sensor-map-card__map" />
      <AqiLegend class="sensor-map-card__legend" />
      <div v-if="!networkStore.isReady" class="sensor-map-card__loading">
        Loading network ({{ Math.round(networkStore.loadProgress * 100) }}%)…
      </div>
    </div>
  </BaseCard>
</template>

<style scoped>
.sensor-map-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sensor-map-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: var(--space-4) var(--space-5);
}

.sensor-map-card__title {
  font-size: 15px;
  font-weight: 700;
}

.sensor-map-card__subtitle {
  font-size: 12px;
  color: var(--color-text-muted);
  margin-top: 2px;
}

.sensor-map-card__map-wrap {
  position: relative;
  flex: 1;
  min-height: 420px;
}

.sensor-map-card__map {
  position: absolute;
  inset: 0;
}

.sensor-map-card__legend {
  position: absolute;
  left: var(--space-3);
  bottom: var(--space-3);
  z-index: 500;
}

.sensor-map-card__loading {
  position: absolute;
  inset: 0;
  z-index: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--color-surface) 80%, transparent);
  color: var(--color-text-muted);
  font-size: 13px;
  font-weight: 600;
}

:global(.station-marker) {
  cursor: pointer;
  transition: transform 0.1s ease;
}

:global(.leaflet-popup-content-wrapper),
:global(.leaflet-popup-tip) {
  background: var(--color-surface-raised);
  color: var(--color-text);
}

:global(.leaflet-popup-content) {
  font-size: 12px;
  line-height: 1.5;
}

:global(.leaflet-control-zoom a) {
  background: var(--color-surface-raised) !important;
  color: var(--color-text) !important;
  border-color: var(--color-border) !important;
}

:global(.leaflet-control-attribution) {
  background: color-mix(in srgb, var(--color-surface) 85%, transparent) !important;
  color: var(--color-text-faint) !important;
}
</style>
