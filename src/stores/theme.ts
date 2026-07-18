import { defineStore } from 'pinia';
import { computed, ref, watch } from 'vue';

import { resolveInitialTheme, THEME_STORAGE_KEY, type ThemeName } from '@/app/theme/resolveInitialTheme';

export const useThemeStore = defineStore('theme', () => {
  const theme = ref<ThemeName>(resolveInitialTheme());
  const isDark = computed(() => theme.value === 'dark');

  function apply(next: ThemeName): void {
    theme.value = next;
  }

  function toggle(): void {
    apply(theme.value === 'dark' ? 'light' : 'dark');
  }

  // Single source of truth: writing `theme` is the only thing that needs to
  // touch the DOM attribute / persistence, so every consumer (PrimeVue
  // config, the map, the chart, custom components) just reads CSS variables.
  watch(
    theme,
    (value) => {
      document.documentElement.setAttribute('data-theme', value);
      localStorage.setItem(THEME_STORAGE_KEY, value);
    },
    { immediate: true },
  );

  return { theme, isDark, toggle, apply };
});
