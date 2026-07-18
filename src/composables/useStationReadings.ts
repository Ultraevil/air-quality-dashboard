import { ref, watch, type Ref } from 'vue';

import { stationsApi } from '@/services/api/stationsApi';
import type { Reading, ReadingsRange } from '@/types/station';

/**
 * Loads a station's reading series for the given range, re-fetching whenever
 * either the station or the range changes. Backs the Particulate
 * Concentration chart (README §7).
 */
export function useStationReadings(stationId: Ref<string | null>, range: Ref<ReadingsRange>) {
  const readings = ref<Reading[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  async function load(): Promise<void> {
    const id = stationId.value;
    if (!id) {
      readings.value = [];
      return;
    }
    isLoading.value = true;
    error.value = null;
    const requestedId = id;
    const requestedRange = range.value;
    try {
      const result = await stationsApi.fetchStationReadings(requestedId, requestedRange);
      // Guard against a slower, stale request resolving after a newer one.
      if (stationId.value === requestedId && range.value === requestedRange) {
        readings.value = result;
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load readings.';
    } finally {
      if (stationId.value === requestedId) isLoading.value = false;
    }
  }

  watch([stationId, range], load, { immediate: true });

  return { readings, isLoading, error };
}
