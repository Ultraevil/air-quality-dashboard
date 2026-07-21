import { createPinia, setActivePinia } from 'pinia';
import { nextTick } from 'vue';
import { beforeEach, describe, expect, it } from 'vitest';

import { useWatchlistStore } from '@/stores/watchlist';

describe('useWatchlistStore', () => {
  beforeEach(() => {
    localStorage.clear();
    setActivePinia(createPinia());
  });

  it('starts empty when nothing is persisted', () => {
    const store = useWatchlistStore();
    expect(store.trackedIds).toEqual([]);
  });

  it('isTracked is false for an id that has not been toggled on', () => {
    const store = useWatchlistStore();
    expect(store.isTracked('ST-001')).toBe(false);
  });

  it('toggle adds an untracked station id', () => {
    const store = useWatchlistStore();
    store.toggle('ST-001');

    expect(store.isTracked('ST-001')).toBe(true);
    expect(store.trackedIds).toEqual(['ST-001']);
  });

  it('toggle removes an already-tracked station id', () => {
    const store = useWatchlistStore();
    store.toggle('ST-001');
    store.toggle('ST-001');

    expect(store.isTracked('ST-001')).toBe(false);
    expect(store.trackedIds).toEqual([]);
  });

  it('toggle preserves other tracked ids', () => {
    const store = useWatchlistStore();
    store.toggle('ST-001');
    store.toggle('ST-002');
    store.toggle('ST-001');

    expect(store.trackedIds).toEqual(['ST-002']);
  });

  it('persists the tracked list to localStorage under the wised:watchlist key', async () => {
    const store = useWatchlistStore();
    store.toggle('ST-001');
    await nextTick();

    expect(JSON.parse(localStorage.getItem('wised:watchlist') ?? '[]')).toEqual(['ST-001']);
  });

  describe('seedIfEmpty', () => {
    it('seeds the watchlist with the given ids when nothing is tracked yet', () => {
      const store = useWatchlistStore();
      store.seedIfEmpty(['ST-001', 'ST-002']);

      expect(store.trackedIds).toEqual(['ST-001', 'ST-002']);
    });

    it('does nothing when the watchlist already has tracked ids', () => {
      const store = useWatchlistStore();
      store.toggle('ST-999');
      store.seedIfEmpty(['ST-001', 'ST-002']);

      expect(store.trackedIds).toEqual(['ST-999']);
    });

    it('does nothing when given an empty seed list', () => {
      const store = useWatchlistStore();
      store.seedIfEmpty([]);

      expect(store.trackedIds).toEqual([]);
    });
  });
});
