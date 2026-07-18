export type ThemeName = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'wised:theme';

/**
 * Resolves the theme to boot with: an explicit stored preference wins,
 * otherwise the OS preference. Mirrors the inline snippet in `index.html`
 * that sets `data-theme` before Vue mounts (avoids a flash of the wrong theme).
 */
export function resolveInitialTheme(): ThemeName {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
