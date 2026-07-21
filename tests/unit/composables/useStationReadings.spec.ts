import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';

import { useStationReadings } from '@/composables/useStationReadings';
import { stationsApi } from '@/services/api/stationsApi';
import { makeReadings } from '../../fixtures/stations';

vi.mock('@/services/api/stationsApi', () => ({
  stationsApi: {
    fetchStationReadings: vi.fn(),
  },
}));

const mockedApi = vi.mocked(stationsApi);

describe('useStationReadings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does nothing when no station is selected', async () => {
    const stationId = ref<string | null>(null);
    const range = ref<'24h' | '7d' | '30d'>('24h');

    const { readings, isLoading } = useStationReadings(stationId, range);
    await vi.waitFor(() => expect(isLoading.value).toBe(false));

    expect(readings.value).toEqual([]);
    expect(mockedApi.fetchStationReadings).not.toHaveBeenCalled();
  });

  it('fetches readings immediately for the initial station and range', async () => {
    const data = makeReadings(24);
    mockedApi.fetchStationReadings.mockResolvedValue(data);

    const stationId = ref<string | null>('ST-001');
    const range = ref<'24h' | '7d' | '30d'>('24h');
    const { readings } = useStationReadings(stationId, range);

    await vi.waitFor(() => expect(readings.value).toEqual(data));
    expect(mockedApi.fetchStationReadings).toHaveBeenCalledWith('ST-001', '24h');
  });

  it('clears the readings when the station is deselected', async () => {
    mockedApi.fetchStationReadings.mockResolvedValue(makeReadings(5));

    const stationId = ref<string | null>('ST-001');
    const range = ref<'24h' | '7d' | '30d'>('24h');
    const { readings } = useStationReadings(stationId, range);
    await vi.waitFor(() => expect(readings.value).toHaveLength(5));

    stationId.value = null;
    await vi.waitFor(() => expect(readings.value).toEqual([]));
  });

  it('re-fetches when the range changes for the same station', async () => {
    mockedApi.fetchStationReadings.mockResolvedValue(makeReadings(5));

    const stationId = ref<string | null>('ST-001');
    const range = ref<'24h' | '7d' | '30d'>('24h');
    useStationReadings(stationId, range);
    await vi.waitFor(() => expect(mockedApi.fetchStationReadings).toHaveBeenCalledTimes(1));

    range.value = '7d';
    await vi.waitFor(() => expect(mockedApi.fetchStationReadings).toHaveBeenCalledTimes(2));
    expect(mockedApi.fetchStationReadings).toHaveBeenLastCalledWith('ST-001', '7d');
  });

  it('discards a stale response that resolves after the station has since changed', async () => {
    let resolveFirst!: (value: ReturnType<typeof makeReadings>) => void;
    mockedApi.fetchStationReadings.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveFirst = resolve;
        }),
    );

    const stationId = ref<string | null>('ST-001');
    const range = ref<'24h' | '7d' | '30d'>('24h');
    const { readings } = useStationReadings(stationId, range);

    // Switch stations before the first request resolves.
    const secondStationReadings = makeReadings(2, 100);
    mockedApi.fetchStationReadings.mockResolvedValueOnce(secondStationReadings);
    stationId.value = 'ST-002';

    await vi.waitFor(() => expect(readings.value).toEqual(secondStationReadings));

    // The stale ST-001 response now resolves — it must not overwrite ST-002's data.
    resolveFirst(makeReadings(9));
    await Promise.resolve();
    await Promise.resolve();

    expect(readings.value).toEqual(secondStationReadings);
  });

  it('surfaces a fetch error as an error message and clears loading', async () => {
    mockedApi.fetchStationReadings.mockRejectedValue(new Error('station not found'));

    const stationId = ref<string | null>('ST-001');
    const range = ref<'24h' | '7d' | '30d'>('24h');
    const { error, isLoading } = useStationReadings(stationId, range);

    await vi.waitFor(() => expect(error.value).toBe('station not found'));
    expect(isLoading.value).toBe(false);
  });
});
