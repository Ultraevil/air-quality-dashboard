<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, watch } from 'vue';

import BaseCard from '@/components/ui/BaseCard.vue';
import { useDashboardSelectionStore } from '@/stores/dashboardSelection';
import { useNetworkStore } from '@/stores/network';
import { useWatchlistStore } from '@/stores/watchlist';
import DistrictRow from './DistrictRow.vue';

const networkStore = useNetworkStore();
const watchlistStore = useWatchlistStore();
const selectionStore = useDashboardSelectionStore();
const { trackedIds } = storeToRefs(watchlistStore);

// Seed a default watchlist the first time real data is available — one
// station per district, so the panel isn't empty on a first run.
watch(
  () => networkStore.isReady,
  (ready) => {
    if (!ready) return;
    const seenDistricts = new Set<string>();
    const defaults: string[] = [];
    for (const station of networkStore.stationsWithMetrics) {
      if (seenDistricts.has(station.district)) continue;
      seenDistricts.add(station.district);
      defaults.push(station.id);
      if (defaults.length >= 4) break;
    }
    watchlistStore.seedIfEmpty(defaults);
  },
  { immediate: true },
);

const trackedStations = computed(() => {
  const byId = new Map(networkStore.stationsWithMetrics.map((s) => [s.id, s]));
  return trackedIds.value.map((id) => byId.get(id)).filter((s) => s !== undefined);
});
</script>

<template>
  <BaseCard class="districts-panel">
    <div class="districts-panel__header">
      <div>
        <h2 class="districts-panel__title">Districts</h2>
        <p class="districts-panel__subtitle">Tracked monitoring stations</p>
      </div>
      <RouterLink to="/sensors" class="districts-panel__view-all">View all</RouterLink>
    </div>

    <div class="districts-panel__list">
      <DistrictRow
        v-for="station in trackedStations"
        :key="station.id"
        :station="station"
        :selected="selectionStore.selectedStation?.id === station.id"
        :tracked="true"
        @select="selectionStore.selectStation(station)"
        @toggle-tracked="watchlistStore.toggle(station.id)"
      />
      <p v-if="trackedStations.length === 0" class="districts-panel__empty">
        {{ networkStore.isReady ? 'No stations tracked yet.' : 'Loading…' }}
      </p>
    </div>
  </BaseCard>
</template>

<style scoped>
.districts-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.districts-panel :deep(.base-card__body) {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  height: 100%;
}

.districts-panel__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.districts-panel__title {
  font-size: 15px;
  font-weight: 700;
}

.districts-panel__subtitle {
  font-size: 12px;
  color: var(--color-text-faint);
  margin-top: 2px;
}

.districts-panel__view-all {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-accent);
  text-decoration: none;
}

.districts-panel__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  overflow-y: auto;
}

.districts-panel__empty {
  color: var(--color-text-muted);
  font-size: 13px;
  text-align: center;
  padding: var(--space-5) 0;
}
</style>
