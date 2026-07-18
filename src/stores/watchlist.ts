import { useStorage } from '@vueuse/core';
import { defineStore } from 'pinia';
import { computed } from 'vue';

const WATCHLIST_STORAGE_KEY = 'wised:watchlist';

/**
 * README §6: "Districts ... a short watchlist of tracked stations, not the
 * full network." There's no endpoint for this, so it's operator-local state:
 * a starred set of station IDs, persisted so it survives a reload like the
 * theme does.
 */
export const useWatchlistStore = defineStore('watchlist', () => {
  const trackedIds = useStorage<string[]>(WATCHLIST_STORAGE_KEY, []);

  const trackedSet = computed(() => new Set(trackedIds.value));

  function isTracked(stationId: string): boolean {
    return trackedSet.value.has(stationId);
  }

  function toggle(stationId: string): void {
    trackedIds.value = isTracked(stationId)
      ? trackedIds.value.filter((id) => id !== stationId)
      : [...trackedIds.value, stationId];
  }

  /** Seeds a default watchlist the first time the app runs (nothing stored yet). */
  function seedIfEmpty(stationIds: string[]): void {
    if (trackedIds.value.length === 0 && stationIds.length > 0) {
      trackedIds.value = stationIds;
    }
  }

  return { trackedIds, isTracked, toggle, seedIfEmpty };
});
