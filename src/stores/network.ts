import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import { stationsApi } from '@/services/api/stationsApi';
import type { Reading, Station, StationMetrics } from '@/types/station';
import { mapWithConcurrency } from '@/utils/concurrency';
import { deriveNetworkAggregates } from '@/utils/deriveNetworkAggregates';
import { deriveStationMetrics } from '@/utils/deriveStationMetrics';

const READINGS_CONCURRENCY = 16;

/**
 * The Sensor Map and KPI tiles need a geographic/statistical view of the
 * *entire* network (README §5 "one marker per station", §4 KPIs are
 * network-wide), not just one paginated page — so this store loads every
 * station's identity plus its 30-day reading series once, with bounded
 * concurrency, and derives metrics for all of them.
 *
 * This is a deliberate exception to the "never fetch all pages up front"
 * rule in README §8 — that rule is scoped to the Sensor List *table*, which
 * pages independently via `useStationsListPage` and never touches this store.
 *
 * `loadNetworkOverview` is idempotent and is *not* triggered from here or
 * from the app shell — each view that needs it (`DashboardView` for the map
 * and KPIs, `SensorListView` for `snapshotNow`-driven connection badges)
 * triggers it on mount, so a route that doesn't need this data never pays
 * for it.
 */
export const useNetworkStore = defineStore('network', () => {
  const stations = ref<Station[]>([]);
  const metricsByStationId = ref<Map<string, StationMetrics>>(new Map());
  const totalCount = ref(0);
  const snapshotNow = ref<string | null>(null);

  const loadedCount = ref(0);
  const status = ref<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const error = ref<string | null>(null);

  let loadPromise: Promise<void> | null = null;

  const isReady = computed(() => status.value === 'ready');
  const loadProgress = computed(() => (totalCount.value === 0 ? 0 : loadedCount.value / totalCount.value));

  // A stable placeholder for stations whose metrics haven't loaded yet, so we
  // don't allocate a fresh "empty" object per row on every recompute.
  const pendingMetrics = computed(() => deriveStationMetrics([], snapshotNow.value));

  const stationsWithMetrics = computed(() =>
    stations.value.map((station) => ({
      ...station,
      metrics: metricsByStationId.value.get(station.id) ?? pendingMetrics.value,
    })),
  );

  /** Network-wide KPI aggregates (README §4) — see `deriveNetworkAggregates`. */
  const aggregates = computed(() => deriveNetworkAggregates(stationsWithMetrics.value));

  async function fetchAllStationIdentities(): Promise<Station[]> {
    const all: Station[] = [];
    let after: string | undefined;
    for (;;) {
      const page = await stationsApi.fetchStationsPage({ limit: 100, after });
      all.push(...page.items);
      if (!page.pageInfo.after) break;
      after = page.pageInfo.after;
    }
    return all;
  }

  /** Idempotent: safe to call from multiple views, only fetches once. */
  function loadNetworkOverview(): Promise<void> {
    if (loadPromise) return loadPromise;

    loadPromise = (async () => {
      status.value = 'loading';
      error.value = null;
      try {
        const [{ total }, allStations] = await Promise.all([
          stationsApi.fetchStationsCount(),
          fetchAllStationIdentities(),
        ]);
        totalCount.value = total;
        stations.value = allStations;

        const readingsByStation = await mapWithConcurrency(
          allStations,
          READINGS_CONCURRENCY,
          async (station): Promise<[string, Reading[]]> => {
            const readings = await stationsApi.fetchStationReadings(station.id);
            loadedCount.value += 1;
            return [station.id, readings];
          },
        );

        snapshotNow.value = readingsByStation.reduce<string | null>((latest, [, readings]) => {
          const last = readings[readings.length - 1];
          if (!last) return latest;
          return !latest || last.t > latest ? last.t : latest;
        }, null);

        const metrics = new Map<string, StationMetrics>();
        for (const [stationId, readings] of readingsByStation) {
          metrics.set(stationId, deriveStationMetrics(readings, snapshotNow.value));
        }
        metricsByStationId.value = metrics;
        status.value = 'ready';
      } catch (err) {
        status.value = 'error';
        error.value = err instanceof Error ? err.message : 'Failed to load the network overview.';
        loadPromise = null; // allow retry
        throw err;
      }
    })();

    return loadPromise;
  }

  return {
    stations,
    stationsWithMetrics,
    aggregates,
    totalCount,
    snapshotNow,
    status,
    isReady,
    loadProgress,
    error,
    loadNetworkOverview,
  };
});
