import { ref } from 'vue';

import { stationsApi } from '@/services/api/stationsApi';
import type { PageInfo } from '@/types/api';
import type { Station, StationWithMetrics } from '@/types/station';
import { deriveStationMetrics } from '@/utils/deriveStationMetrics';

const PAGE_SIZE = 20;

/**
 * Drives the Sensor List table: one page of stations at a time, following
 * the API's opaque cursors (README §8 — "Do not walk every page up front to
 * build one big client-side list"). Each page's readings are fetched only
 * for the rows actually shown.
 */
export function useStationsListPage(snapshotNow: () => string | null) {
  const rows = ref<StationWithMetrics[]>([]);
  const pageInfo = ref<PageInfo>({});
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  async function loadPage(cursor: { after?: string; before?: string } = {}): Promise<void> {
    isLoading.value = true;
    error.value = null;
    try {
      const page = await stationsApi.fetchStationsPage({ limit: PAGE_SIZE, ...cursor });
      const withMetrics = await attachMetrics(page.items);
      rows.value = withMetrics;
      pageInfo.value = page.pageInfo;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load stations.';
    } finally {
      isLoading.value = false;
    }
  }

  async function attachMetrics(stations: Station[]): Promise<StationWithMetrics[]> {
    return Promise.all(
      stations.map(async (station) => {
        const readings = await stationsApi.fetchStationReadings(station.id);
        return { ...station, metrics: deriveStationMetrics(readings, snapshotNow()) };
      }),
    );
  }

  function nextPage(): Promise<void> {
    return loadPage(pageInfo.value.after ? { after: pageInfo.value.after } : {});
  }

  function previousPage(): Promise<void> {
    return loadPage(pageInfo.value.before ? { before: pageInfo.value.before } : {});
  }

  return {
    rows,
    pageInfo,
    isLoading,
    error,
    loadFirstPage: () => loadPage(),
    nextPage,
    previousPage,
    hasNext: () => Boolean(pageInfo.value.after),
    hasPrevious: () => Boolean(pageInfo.value.before),
  };
}
