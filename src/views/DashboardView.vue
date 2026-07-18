<script setup lang="ts">
import { refDebounced } from '@vueuse/core';
import { storeToRefs } from 'pinia';
import { ref, watch } from 'vue';

import AppHeader from '@/components/layout/AppHeader.vue';
import ParticulateChart from '@/features/dashboard/chart/ParticulateChart.vue';
import DistrictsPanel from '@/features/dashboard/districts/DistrictsPanel.vue';
import KpiTiles from '@/features/dashboard/kpi-tiles/KpiTiles.vue';
import SensorMap from '@/features/dashboard/sensor-map/SensorMap.vue';
import StationSearchDropdown from '@/features/dashboard/search/StationSearchDropdown.vue';
import { useDashboardSelectionStore } from '@/stores/dashboardSelection';
import { useNetworkStore } from '@/stores/network';
import type { StationWithMetrics } from '@/types/station';

const networkStore = useNetworkStore();
const { stationsWithMetrics } = storeToRefs(networkStore);
const selectionStore = useDashboardSelectionStore();

const searchQuery = ref('');
const debouncedSearchQuery = refDebounced(searchQuery, 150);

function handleSelect(station: StationWithMetrics): void {
  selectionStore.selectStation(station);
  searchQuery.value = '';
}

watch(
  () => networkStore.isReady,
  (ready) => {
    if (!ready || selectionStore.selectedStation) return;
    const firstStation = stationsWithMetrics.value[0];
    if (firstStation) selectionStore.selectStation(firstStation);
  },
  { immediate: true },
);
</script>

<template>
  <div class="dashboard-view">
    <div class="dashboard-view__header">
      <AppHeader title="Berlin · Particulate Monitoring" v-model:search-value="searchQuery" />
      <StationSearchDropdown :query="debouncedSearchQuery" :stations="stationsWithMetrics" @select="handleSelect" />
    </div>

    <KpiTiles />

    <div class="dashboard-view__main">
      <SensorMap />
      <DistrictsPanel />
    </div>

    <ParticulateChart />
  </div>
</template>

<style scoped>
.dashboard-view {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.dashboard-view__header {
  position: relative;
}

.dashboard-view__main {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: var(--space-5);
  align-items: stretch;
}

@media (max-width: 1024px) {
  .dashboard-view__main {
    grid-template-columns: 1fr;
  }
}
</style>
