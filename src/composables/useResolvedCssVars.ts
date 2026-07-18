import { nextTick, onMounted, ref, watch, type Ref } from 'vue';

/**
 * Reads the current values of the given CSS custom properties off
 * `documentElement` and keeps them in sync when `theme` changes. Canvas-based
 * libraries (ECharts) can't resolve `var(--x)` themselves, so this is how
 * they stay in step with the same design tokens everything else uses.
 */
export function useResolvedCssVars<K extends string>(names: Record<K, string>, theme: Ref<string>) {
  const values = ref(readAll()) as Ref<Record<K, string>>;

  function readAll(): Record<K, string> {
    const styles = getComputedStyle(document.documentElement);
    const result = {} as Record<K, string>;
    for (const key in names) {
      result[key] = styles.getPropertyValue(names[key]).trim();
    }
    return result;
  }

  async function refresh(): Promise<void> {
    await nextTick();
    values.value = readAll();
  }

  onMounted(refresh);
  watch(theme, refresh);

  return values;
}
