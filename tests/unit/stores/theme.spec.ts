import { createPinia, setActivePinia } from 'pinia';
import { nextTick } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useThemeStore } from '@/stores/theme';

function mockPrefersDark(prefersDark: boolean): void {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: prefersDark,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
}

describe('useThemeStore', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    mockPrefersDark(false);
    setActivePinia(createPinia());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('boots with the OS preference when nothing is stored', () => {
    mockPrefersDark(true);
    const store = useThemeStore();

    expect(store.theme).toBe('dark');
    expect(store.isDark).toBe(true);
  });

  it('boots with a previously stored preference over the OS preference', () => {
    localStorage.setItem('wised:theme', 'light');
    mockPrefersDark(true);
    const store = useThemeStore();

    expect(store.theme).toBe('light');
  });

  it('toggle flips between light and dark', () => {
    const store = useThemeStore();
    const initial = store.theme;

    store.toggle();
    expect(store.theme).not.toBe(initial);

    store.toggle();
    expect(store.theme).toBe(initial);
  });

  it('apply sets an explicit theme', () => {
    const store = useThemeStore();

    store.apply('dark');
    expect(store.theme).toBe('dark');
    expect(store.isDark).toBe(true);
  });

  it('writes the current theme to the documentElement data-theme attribute', async () => {
    const store = useThemeStore();

    store.apply('dark');
    await nextTick();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

    store.apply('light');
    await nextTick();
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('persists the current theme to localStorage', async () => {
    const store = useThemeStore();

    store.apply('dark');
    await nextTick();
    expect(localStorage.getItem('wised:theme')).toBe('dark');
  });
});
