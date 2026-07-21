import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { defineComponent, h, ref, type Ref } from 'vue';

import { useResolvedCssVars } from '@/composables/useResolvedCssVars';

function setCssVar(name: string, value: string): void {
  document.documentElement.style.setProperty(name, value);
}

describe('useResolvedCssVars', () => {
  afterEach(() => {
    document.documentElement.removeAttribute('style');
  });

  it('resolves the current values of the requested CSS custom properties on mount', async () => {
    setCssVar('--chart-axis', '#333333');
    setCssVar('--chart-grid', '#eeeeee');

    let resolved: Record<string, string> | undefined;
    const TestComponent = defineComponent({
      setup() {
        const theme = ref('light');
        const values = useResolvedCssVars({ axis: '--chart-axis', grid: '--chart-grid' }, theme);
        return () => {
          resolved = values.value;
          return h('div');
        };
      },
    });

    const wrapper = mount(TestComponent);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(resolved).toEqual({ axis: '#333333', grid: '#eeeeee' });
  });

  it('re-reads the CSS custom properties when the theme ref changes', async () => {
    setCssVar('--chart-axis', '#333333');

    let theme!: Ref<string>;
    let values!: ReturnType<typeof useResolvedCssVars>;
    const TestComponent = defineComponent({
      setup() {
        theme = ref('light');
        values = useResolvedCssVars({ axis: '--chart-axis' }, theme);
        return () => h('div');
      },
    });

    const wrapper = mount(TestComponent);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    expect(values.value.axis).toBe('#333333');

    setCssVar('--chart-axis', '#ffffff');
    theme.value = 'dark';
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(values.value.axis).toBe('#ffffff');
  });

  it('trims whitespace around the resolved custom property value', async () => {
    setCssVar('--chart-axis', '  #123456  ');

    let values!: ReturnType<typeof useResolvedCssVars>;
    const TestComponent = defineComponent({
      setup() {
        const theme = ref('light');
        values = useResolvedCssVars({ axis: '--chart-axis' }, theme);
        return () => h('div');
      },
    });

    const wrapper = mount(TestComponent);
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(values.value.axis).toBe('#123456');
  });
});
