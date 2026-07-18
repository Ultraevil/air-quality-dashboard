import { definePreset } from '@primevue/themes';
import Aura from '@primevue/themes/aura';

/**
 * PrimeVue components are themed by pointing PrimeVue's own design tokens at
 * *our* CSS variables (defined once in `tokens.css`), rather than hand-tuning
 * colours per component. A light/dark change only ever happens in
 * `tokens.css` — this file never needs to change for that.
 *
 * There's only one `colorScheme` branch below (not light + dark). PrimeVue's
 * own dark-mode switching is disabled in `main.ts` (`darkModeSelector: false`)
 * because we already switch themes ourselves via `[data-theme]` — every value
 * here is a CSS variable that resolves differently under that attribute, so
 * a second, parallel light/dark branch in this file would just be dead,
 * unreachable configuration that has to be kept in sync by hand.
 */
export const wisedPreset = definePreset(Aura, {
  semantic: {
    // The 50-300 tints used to come from Aura's built-in `{orange.*}` scale,
    // which drifts out of sync the moment `--color-accent` changes. Deriving
    // every step from the same two tokens keeps the whole ramp consistent.
    primary: {
      50: 'color-mix(in srgb, var(--color-accent) 8%, transparent)',
      100: 'color-mix(in srgb, var(--color-accent) 16%, transparent)',
      200: 'color-mix(in srgb, var(--color-accent) 28%, transparent)',
      300: 'color-mix(in srgb, var(--color-accent) 42%, transparent)',
      400: 'var(--color-accent)',
      500: 'var(--color-accent)',
      600: 'var(--color-accent-strong)',
      700: 'var(--color-accent-strong)',
      800: 'var(--color-accent-strong)',
      900: 'var(--color-accent-strong)',
      950: 'var(--color-accent-strong)',
    },
    colorScheme: {
      light: {
        surface: {
          0: 'var(--color-surface-raised)',
          50: 'var(--color-surface)',
          100: 'var(--color-surface-sunken)',
          200: 'var(--color-border)',
          300: 'var(--color-border)',
          400: 'var(--color-border-strong)',
          500: 'var(--color-text-faint)',
          600: 'var(--color-text-muted)',
          700: 'var(--color-text-muted)',
          800: 'var(--color-text)',
          900: 'var(--color-text)',
          950: 'var(--color-text)',
        },
        text: {
          color: 'var(--color-text)',
          mutedColor: 'var(--color-text-muted)',
        },
        content: {
          background: 'var(--color-surface-raised)',
          borderColor: 'var(--color-border)',
        },
      },
    },
  },
});
