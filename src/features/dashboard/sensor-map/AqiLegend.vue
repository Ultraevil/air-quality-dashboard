<script setup lang="ts">
import { AQI_LABELS } from '@/utils/aqi';
import type { AqiLevel } from '@/types/station';

const RANGES: Record<AqiLevel, string> = {
  good: '0–12',
  moderate: '12–35',
  elevated: '35–55',
  unhealthy: '55+',
};

const levels: AqiLevel[] = ['good', 'moderate', 'elevated', 'unhealthy'];
</script>

<template>
  <div class="aqi-legend">
    <p class="aqi-legend__title">Air Quality Index</p>
    <ul class="aqi-legend__list">
      <li v-for="level in levels" :key="level" class="aqi-legend__item">
        <span class="aqi-legend__dot" :class="`aqi-legend__dot--${level}`" aria-hidden="true" />
        {{ AQI_LABELS[level] }} · {{ RANGES[level] }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
.aqi-legend {
  background: var(--color-surface-raised);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: var(--space-2) var(--space-3);
  box-shadow: var(--shadow-card);
  font-size: 11px;
}

.aqi-legend__title {
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-text-faint);
  font-size: 10px;
  margin-bottom: var(--space-2);
}

.aqi-legend__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.aqi-legend__item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--color-text-muted);
}

.aqi-legend__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.aqi-legend__dot--good {
  background: var(--color-aqi-good);
}
.aqi-legend__dot--moderate {
  background: var(--color-aqi-moderate);
}
.aqi-legend__dot--elevated {
  background: var(--color-aqi-elevated);
}
.aqi-legend__dot--unhealthy {
  background: var(--color-aqi-unhealthy);
}
</style>
