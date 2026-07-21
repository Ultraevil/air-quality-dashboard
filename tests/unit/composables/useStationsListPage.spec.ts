import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useStationsListPage } from '@/composables/useStationsListPage';
import { stationsApi } from '@/services/api/stationsApi';
import { makeReadings, makeStation } from '../../fixtures/stations';

vi.mock('@/services/api/stationsApi', () => ({
  stationsApi: {
    fetchStationsPage: vi.fn(),
    fetchStationReadings: vi.fn(),
  },
}));

const mockedApi = vi.mocked(stationsApi);
const snapshotNow = () => '2026-01-01T23:00:00.000Z';

describe('useStationsListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('starts with no rows, no error, and not loading', () => {
    const { rows, isLoading, error, hasNext, hasPrevious } = useStationsListPage(snapshotNow);
    expect(rows.value).toEqual([]);
    expect(isLoading.value).toBe(false);
    expect(error.value).toBeNull();
    expect(hasNext()).toBe(false);
    expect(hasPrevious()).toBe(false);
  });

  it('loadFirstPage fetches with no cursor and attaches metrics to each row', async () => {
    mockedApi.fetchStationsPage.mockResolvedValue({
      items: [makeStation({ id: 'ST-001' })],
      pageInfo: { after: 'cursor-2' },
    });
    mockedApi.fetchStationReadings.mockResolvedValue(makeReadings(24));

    const { rows, pageInfo, loadFirstPage } = useStationsListPage(snapshotNow);
    await loadFirstPage();

    expect(mockedApi.fetchStationsPage).toHaveBeenCalledWith({ limit: 20 });
    expect(rows.value).toHaveLength(1);
    expect(rows.value[0]!.metrics).toBeDefined();
    expect(pageInfo.value).toEqual({ after: 'cursor-2' });
  });

  it('sets isLoading while a page is in flight', async () => {
    let resolvePage!: (value: Awaited<ReturnType<typeof stationsApi.fetchStationsPage>>) => void;
    mockedApi.fetchStationsPage.mockReturnValue(
      new Promise((resolve) => {
        resolvePage = resolve;
      }),
    );

    const { isLoading, loadFirstPage } = useStationsListPage(snapshotNow);
    const promise = loadFirstPage();

    expect(isLoading.value).toBe(true);

    resolvePage({ items: [], pageInfo: {} });
    await promise;

    expect(isLoading.value).toBe(false);
  });

  it('nextPage uses the after cursor from the last loaded page', async () => {
    mockedApi.fetchStationsPage
      .mockResolvedValueOnce({ items: [], pageInfo: { after: 'cursor-2' } })
      .mockResolvedValueOnce({ items: [], pageInfo: {} });
    mockedApi.fetchStationReadings.mockResolvedValue([]);

    const { loadFirstPage, nextPage } = useStationsListPage(snapshotNow);
    await loadFirstPage();
    await nextPage();

    expect(mockedApi.fetchStationsPage).toHaveBeenNthCalledWith(2, { limit: 20, after: 'cursor-2' });
  });

  it('nextPage is a no-op cursor (fetches page 1) when there is no after cursor', async () => {
    mockedApi.fetchStationsPage.mockResolvedValue({ items: [], pageInfo: {} });
    mockedApi.fetchStationReadings.mockResolvedValue([]);

    const { nextPage } = useStationsListPage(snapshotNow);
    await nextPage();

    expect(mockedApi.fetchStationsPage).toHaveBeenCalledWith({ limit: 20 });
  });

  it('previousPage uses the before cursor from the last loaded page', async () => {
    mockedApi.fetchStationsPage
      .mockResolvedValueOnce({ items: [], pageInfo: { before: 'cursor-0' } })
      .mockResolvedValueOnce({ items: [], pageInfo: {} });
    mockedApi.fetchStationReadings.mockResolvedValue([]);

    const { loadFirstPage, previousPage } = useStationsListPage(snapshotNow);
    await loadFirstPage();
    await previousPage();

    expect(mockedApi.fetchStationsPage).toHaveBeenNthCalledWith(2, { limit: 20, before: 'cursor-0' });
  });

  it('hasNext/hasPrevious reflect the current pageInfo cursors', async () => {
    mockedApi.fetchStationsPage.mockResolvedValue({
      items: [],
      pageInfo: { after: 'cursor-2', before: 'cursor-0' },
    });
    mockedApi.fetchStationReadings.mockResolvedValue([]);

    const { hasNext, hasPrevious, loadFirstPage } = useStationsListPage(snapshotNow);
    await loadFirstPage();

    expect(hasNext()).toBe(true);
    expect(hasPrevious()).toBe(true);
  });

  it('surfaces a fetch failure as an error message and clears loading, without crashing', async () => {
    mockedApi.fetchStationsPage.mockRejectedValue(new Error('502 Bad Gateway'));

    const { error, isLoading, loadFirstPage } = useStationsListPage(snapshotNow);
    await loadFirstPage();

    expect(error.value).toBe('502 Bad Gateway');
    expect(isLoading.value).toBe(false);
  });

  it('clears a previous error once a subsequent page loads successfully', async () => {
    mockedApi.fetchStationsPage
      .mockRejectedValueOnce(new Error('502 Bad Gateway'))
      .mockResolvedValueOnce({ items: [], pageInfo: {} });

    const { error, loadFirstPage } = useStationsListPage(snapshotNow);
    await loadFirstPage();
    expect(error.value).toBe('502 Bad Gateway');

    await loadFirstPage();
    expect(error.value).toBeNull();
  });

  it('passes the live snapshotNow value through to metric derivation for each row', async () => {
    mockedApi.fetchStationsPage.mockResolvedValue({
      items: [makeStation({ id: 'ST-001' })],
      pageInfo: {},
    });
    const readings = makeReadings(1);
    mockedApi.fetchStationReadings.mockResolvedValue(readings);

    // snapshotNow far in the future relative to the reading -> offline.
    const { rows, loadFirstPage } = useStationsListPage(() => '2030-01-01T00:00:00.000Z');
    await loadFirstPage();

    expect(rows.value[0]!.metrics.connection).toBe('offline');
  });
});
