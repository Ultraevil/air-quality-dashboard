import { render, type RenderOptions, type RenderResult } from '@testing-library/vue';
import PrimeVue from 'primevue/config';
import type { Component } from 'vue';

/**
 * Renders a component with the same PrimeVue plugin configuration as the
 * real app (minus the design-token preset, which is irrelevant under jsdom
 * and would just add noise/slow tests down). Use this for any component
 * that wraps a PrimeVue primitive (BaseButton, BaseInput, BaseBadge, BaseTable…).
 */
export function renderWithPrimeVue<C extends Component>(
  component: C,
  options: RenderOptions<C> = {},
): RenderResult {
  return render(component, {
    ...options,
    global: {
      ...options.global,
      plugins: [[PrimeVue, { theme: 'none' }], ...(options.global?.plugins ?? [])],
    },
  });
}
