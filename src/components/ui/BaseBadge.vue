<script setup lang="ts">
import PTag from 'primevue/tag';
import { computed } from 'vue';

/**
 * `tone` maps to a semantic colour token, so every badge in the app (AQI
 * bands, connection states, KPI deltas) draws from the same palette with no
 * per-usage colour picking.
 */
const props = withDefaults(
  defineProps<{
    tone?: 'good' | 'moderate' | 'elevated' | 'unhealthy' | 'positive' | 'negative' | 'neutral';
    /** Renders as a small coloured dot + label instead of a filled pill (used for connection states). */
    dot?: boolean;
  }>(),
  { tone: 'neutral', dot: false },
);

const toneColorVar = computed(
  () =>
    ({
      good: 'var(--color-aqi-good)',
      moderate: 'var(--color-aqi-moderate)',
      elevated: 'var(--color-aqi-elevated)',
      unhealthy: 'var(--color-aqi-unhealthy)',
      positive: 'var(--color-positive)',
      negative: 'var(--color-negative)',
      neutral: 'var(--color-text-muted)',
    })[props.tone],
);
</script>

<template>
  <span v-if="dot" class="base-badge base-badge--dot" :style="{ '--tone-color': toneColorVar }">
    <span class="base-badge__dot" aria-hidden="true" />
    <slot />
  </span>
  <PTag v-else class="base-badge" :style="{ '--tone-color': toneColorVar }">
    <slot />
  </PTag>
</template>

<style scoped>
.base-badge {
  --p-tag-background: color-mix(in srgb, var(--tone-color) 16%, transparent);
  --p-tag-color: var(--tone-color);
  font-weight: 600;
  font-size: 12px;
  border-radius: var(--radius-sm);
  border: none;
}

.base-badge--dot {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--tone-color);
  font-weight: 500;
  font-size: 12px;
}

.base-badge__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--tone-color);
  flex-shrink: 0;
}
</style>
