import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { stationsApi } from '@/services/api/stationsApi';
import { useNetworkStore } from '@/stores/network';
import { makeReadings, makeStation } from '../../fixtures/stations';

vi.mock('@/services/api/stationsApi', () => ({
  stationsApi: {
    fetchStationsPage: vi.fn(),
    fetchStationsCount: vi.fn(),
    fetchStationReadings: vi.fn(),
  },
}));

const mockedApi = vi.mocked(stationsApi);

describe('useNetworkStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('starts idle with empty state', () => {
    const store = useNetworkStore();
    expect(store.status).toBe('idle');
    expect(store.stations).toEqual([]);
    expect(store.isReady).toBe(false);
  });

  it('walks every page of station identities until pageInfo.after is unset', async () => {
    mockedApi.fetchStationsCount.mockResolvedValue({ total: 2 });
    mockedApi.fetchStationsPage
      .mockResolvedValueOnce({
        items: [makeStation({ id: 'ST-001' })],
        pageInfo: { after: 'cursor-1' },
      })
      .mockResolvedValueOnce({
        items: [makeStation({ id: 'ST-002' })],
        pageInfo: { after: undefined },
      });
    mockedApi.fetchStationReadings.mockResolvedValue(makeReadings(1));

    const store = useNetworkStore();
    await store.loadNetworkOverview();

    expect(mockedApi.fetchStationsPage).toHaveBeenCalledTimes(2);
    expect(mockedApi.fetchStationsPage).toHaveBeenNthCalledWith(2, { limit: 100, after: 'cursor-1' });
    expect(store.stations.map((s) => s.id)).toEqual(['ST-001', 'ST-002']);
    expect(store.status).toBe('ready');
  });

  it('derives metrics for every station once readings have loaded', async () => {
    mockedApi.fetchStationsCount.mockResolvedValue({ total: 1 });
    mockedApi.fetchStationsPage.mockResolvedValueOnce({
      items: [makeStation({ id: 'ST-001' })],
      pageInfo: { after: undefined },
    });
    mockedApi.fetchStationReadings.mockResolvedValue(makeReadings(720));

    const store = useNetworkStore();
    await store.loadNetworkOverview();

    const [withMetrics] = store.stationsWithMetrics;
    expect(withMetrics!.metrics.connection).toBe('hq');
    expect(withMetrics!.metrics.stabilityPct).toBe(100);
  });

  it('derives snapshotNow as the latest reading timestamp across all stations', async () => {
    mockedApi.fetchStationsCount.mockResolvedValue({ total: 2 });
    mockedApi.fetchStationsPage.mockResolvedValueOnce({
      items: [makeStation({ id: 'ST-001' }), makeStation({ id: 'ST-002' })],
      pageInfo: { after: undefined },
    });
    mockedApi.fetchStationReadings
      .mockResolvedValueOnce(makeReadings(1, 0)) // t = 2026-01-01T00:00Z
      .mockResolvedValueOnce(makeReadings(1, 5)); // t = 2026-01-01T05:00Z, later

    const store = useNetworkStore();
    await store.loadNetworkOverview();

    expect(store.snapshotNow).toBe(new Date(Date.UTC(2026, 0, 1, 5)).toISOString());
  });

  it('exposes stations with a placeholder, offline metrics entry before their readings resolve', async () => {
    mockedApi.fetchStationsCount.mockResolvedValue({ total: 1 });
    mockedApi.fetchStationsPage.mockResolvedValueOnce({
      items: [makeStation({ id: 'ST-001' })],
      pageInfo: { after: undefined },
    });
    let resolveReadings!: (readings: ReturnType<typeof makeReadings>) => void;
    mockedApi.fetchStationReadings.mockReturnValue(
      new Promise((resolve) => {
        resolveReadings = resolve;
      }),
    );

    const store = useNetworkStore();
    const loadPromise = store.loadNetworkOverview();

    // Wait until station identities have loaded (readings intentionally stay pending).
    await vi.waitFor(() => {
      expect(store.stations).toHaveLength(1);
    });

    const [pending] = store.stationsWithMetrics;
    expect(pending?.metrics.connection).toBe('offline');

    resolveReadings(makeReadings(1));
    await loadPromise;
  });

  it('rolls network-wide KPI aggregates from every loaded station', async () => {
    mockedApi.fetchStationsCount.mockResolvedValue({ total: 2 });
    mockedApi.fetchStationsPage.mockResolvedValueOnce({
      items: [makeStation({ id: 'ST-001' }), makeStation({ id: 'ST-002' })],
      pageInfo: { after: undefined },
    });
    mockedApi.fetchStationReadings.mockResolvedValue(makeReadings(720));

    const store = useNetworkStore();
    await store.loadNetworkOverview();

    expect(store.aggregates.activeSensors).toBe(2);
  });

  it('is idempotent — calling it again while loading does not trigger a second fetch', async () => {
    mockedApi.fetchStationsCount.mockResolvedValue({ total: 1 });
    mockedApi.fetchStationsPage.mockResolvedValueOnce({
      items: [makeStation({ id: 'ST-001' })],
      pageInfo: { after: undefined },
    });
    mockedApi.fetchStationReadings.mockResolvedValue(makeReadings(1));

    const store = useNetworkStore();
    const first = store.loadNetworkOverview();
    const second = store.loadNetworkOverview();

    await Promise.all([first, second]);
    expect(mockedApi.fetchStationsCount).toHaveBeenCalledTimes(1);
  });

  it('does not re-fetch once already loaded', async () => {
    mockedApi.fetchStationsCount.mockResolvedValue({ total: 1 });
    mockedApi.fetchStationsPage.mockResolvedValueOnce({
      items: [makeStation({ id: 'ST-001' })],
      pageInfo: { after: undefined },
    });
    mockedApi.fetchStationReadings.mockResolvedValue(makeReadings(1));

    const store = useNetworkStore();
    await store.loadNetworkOverview();
    await store.loadNetworkOverview();

    expect(mockedApi.fetchStationsCount).toHaveBeenCalledTimes(1);
  });

  it('sets status to error and surfaces a message when a fetch fails', async () => {
    mockedApi.fetchStationsCount.mockRejectedValue(new Error('network down'));
    mockedApi.fetchStationsPage.mockResolvedValue({ items: [], pageInfo: { after: undefined } });

    const store = useNetworkStore();
    await expect(store.loadNetworkOverview()).rejects.toThrow('network down');

    expect(store.status).toBe('error');
    expect(store.error).toBe('network down');
  });

  it('allows retrying after a failed load', async () => {
    mockedApi.fetchStationsCount
      .mockRejectedValueOnce(new Error('network down'))
      .mockResolvedValueOnce({ total: 0 });
    mockedApi.fetchStationsPage.mockResolvedValue({ items: [], pageInfo: { after: undefined } });

    const store = useNetworkStore();
    await expect(store.loadNetworkOverview()).rejects.toThrow('network down');
    await store.loadNetworkOverview();

    expect(store.status).toBe('ready');
  });
});
