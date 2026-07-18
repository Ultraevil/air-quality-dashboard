<script setup lang="ts">
defineProps<{
  label: string;
  color: string;
  modelValue: boolean;
  /** 'bar' renders a filled square swatch, 'line' a dot — matches each series' chart glyph. */
  shape: 'bar' | 'line';
}>();
defineEmits<{ 'update:modelValue': [boolean] }>();
</script>

<template>
  <button
    type="button"
    class="legend-toggle"
    :class="{ 'legend-toggle--off': !modelValue }"
    :aria-pressed="modelValue"
    @click="$emit('update:modelValue', !modelValue)"
  >
    <span
      class="legend-toggle__swatch"
      :class="`legend-toggle__swatch--${shape}`"
      :style="{ '--swatch-color': color }"
    />
    {{ label }}
  </button>
</template>

<style scoped>
.legend-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  padding: 4px 2px;
}

.legend-toggle--off {
  color: var(--color-text-faint);
  opacity: 0.6;
}

.legend-toggle__swatch {
  width: 10px;
  height: 10px;
  background: var(--swatch-color);
  flex-shrink: 0;
}

.legend-toggle__swatch--bar {
  border-radius: 2px;
}

.legend-toggle__swatch--line {
  border-radius: 50%;
}
</style>
