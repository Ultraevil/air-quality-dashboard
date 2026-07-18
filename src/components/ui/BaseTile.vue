<script setup lang="ts">
import BaseCard from './BaseCard.vue';

withDefaults(
  defineProps<{
    icon: string;
    iconTone?: 'accent' | 'good' | 'elevated';
  }>(),
  { iconTone: 'accent' },
);
</script>

<template>
  <BaseCard class="kpi-tile">
    <span class="kpi-tile__icon" :class="`kpi-tile__icon--${iconTone}`">
      <i :class="icon" aria-hidden="true" />
    </span>
    <p class="kpi-tile__value numeric">
      <slot name="value" />
    </p>
    <p class="kpi-tile__label"><slot name="label" /></p>
  </BaseCard>
</template>

<style scoped>
.kpi-tile {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.kpi-tile :deep(.base-card__body) {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.kpi-tile__icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.kpi-tile__icon--accent {
  background: color-mix(in srgb, var(--color-accent) 16%, transparent);
  color: var(--color-accent);
}

.kpi-tile__icon--good {
  background: color-mix(in srgb, var(--color-aqi-good) 16%, transparent);
  color: var(--color-aqi-good);
}

.kpi-tile__icon--elevated {
  background: color-mix(in srgb, var(--color-aqi-unhealthy) 16%, transparent);
  color: var(--color-aqi-unhealthy);
}

.kpi-tile__value {
  font-size: 30px;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1;
}

.kpi-tile__label {
  font-size: 13px;
  color: var(--color-text-muted);
}
</style>
