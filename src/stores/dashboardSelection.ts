import { defineStore } from 'pinia';
import { ref } from 'vue';

import type { Pollutant, ReadingsRange, Station } from '@/types/station';

/**
 * The map, the districts watchlist, and the chart all revolve around one
 * "currently selected station" (README §5 "selecting a marker updates the
 * chart below", §6 "clicking a row loads the station into the chart") — this
 * store is the single piece of shared state that ties them together, so none
 * of the three features needs to know about the others directly.
 */
export const useDashboardSelectionStore = defineStore('dashboardSelection', () => {
  const selectedStation = ref<Station | null>(null);
  const mapPollutant = ref<Pollutant>('pm25');
  const chartRange = ref<ReadingsRange>('24h');

  function selectStation(station: Station): void {
    selectedStation.value = station;
  }

  return { selectedStation, mapPollutant, chartRange, selectStation };
});
