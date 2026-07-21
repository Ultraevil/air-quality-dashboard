import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';

import { useDashboardSelectionStore } from '@/stores/dashboardSelection';
import { makeStation } from '../../fixtures/stations';

describe('useDashboardSelectionStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('starts with no station selected and sane defaults', () => {
    const store = useDashboardSelectionStore();
    expect(store.selectedStation).toBeNull();
    expect(store.mapPollutant).toBe('pm25');
    expect(store.chartRange).toBe('24h');
  });

  it('selectStation sets the selected station', () => {
    const store = useDashboardSelectionStore();
    const station = makeStation({ id: 'ST-042' });

    store.selectStation(station);

    expect(store.selectedStation).toEqual(station);
  });

  it('selectStation replaces a previously selected station', () => {
    const store = useDashboardSelectionStore();
    store.selectStation(makeStation({ id: 'ST-001' }));
    store.selectStation(makeStation({ id: 'ST-002' }));

    expect(store.selectedStation?.id).toBe('ST-002');
  });

  it('mapPollutant and chartRange can be updated directly (used by v-model bindings)', () => {
    const store = useDashboardSelectionStore();
    store.mapPollutant = 'pm10';
    store.chartRange = '7d';

    expect(store.mapPollutant).toBe('pm10');
    expect(store.chartRange).toBe('7d');
  });
});
