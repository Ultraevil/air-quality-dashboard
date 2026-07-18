<script setup lang="ts">
import { computed } from 'vue';

import AqiBadge from '@/components/ui/AqiBadge.vue';
import ConnectionBadge from '@/components/ui/ConnectionBadge.vue';
import Sparkline from '@/components/ui/Sparkline.vue';
import type { StationWithMetrics } from '@/types/station';
import { formatConcentrationValue } from '@/utils/format';

const props = defineProps<{
  station: StationWithMetrics;
  selected: boolean;
  tracked: boolean;
}>();

defineEmits<{ select: []; toggleTracked: [] }>();

const sparklineTone = computed(() => {
  const level = props.station.metrics.aqi;
  return level ? `var(--color-aqi-${level})` : 'var(--color-text-faint)';
});
</script>

<template>
  <div
    class="district-row"
    :class="{ 'district-row--selected': selected }"
    role="button"
    tabindex="0"
    :aria-pressed="selected"
    :aria-label="`Select ${station.district} station ${station.id} for the chart`"
    @click="$emit('select')"
    @keydown.enter.prevent="$emit('select')"
    @keydown.space.prevent="$emit('select')"
  >
    <div class="district-row__top">
      <div>
        <p class="district-row__district">{{ station.district }}</p>
        <p class="district-row__meta">{{ station.id }} · {{ station.location }}</p>
      </div>
      <button
        type="button"
        class="district-row__star"
        :class="{ 'district-row__star--active': tracked }"
        :aria-pressed="tracked"
        :aria-label="tracked ? `Remove ${station.district} from watchlist` : `Add ${station.district} to watchlist`"
        @click.stop="$emit('toggleTracked')"
      >
        <i :class="tracked ? 'pi pi-star-fill' : 'pi pi-star'" aria-hidden="true" />
      </button>
    </div>

    <div class="district-row__body">
      <div class="district-row__pm25">
        <span class="district-row__pm25-value numeric">{{ formatConcentrationValue(station.metrics.pm25) }}</span>
        <div class="district-row__pm25-meta">
          <span class="district-row__unit">µg/m³ PM2.5</span>
          <AqiBadge :level="station.metrics.aqi" />
        </div>
      </div>
      <Sparkline :values="station.metrics.sparkline" :tone="sparklineTone" />
    </div>

    <div class="district-row__footer">
      <span>PM10 {{ formatConcentrationValue(station.metrics.pm10) }}</span>
      <ConnectionBadge :state="station.metrics.connection" :stability-pct="station.metrics.stabilityPct" />
    </div>
  </div>
</template>

<style scoped>
.district-row {
  width: 100%;
  text-align: left;
  background: var(--color-surface-sunken);
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-4);
  cursor: pointer;
  font: inherit;
  color: inherit;
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease;
}

.district-row:hover {
  border-color: var(--color-border-strong);
}

.district-row:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.district-row--selected {
  background: var(--color-surface-raised);
  border-color: var(--color-accent);
}

.district-row__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.district-row__district {
  font-weight: 700;
  font-size: 13px;
}

.district-row__meta {
  font-size: 11px;
  color: var(--color-text-faint);
  font-family: var(--font-mono);
  margin-top: 2px;
}

.district-row__star {
  border: none;
  background: none;
  color: var(--color-text-faint);
  font-size: 14px;
  padding: 2px;
  cursor: pointer;
  border-radius: var(--radius-sm);
}

.district-row__star:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 1px;
}

.district-row__star--active {
  color: var(--color-accent);
}

.district-row__body {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-top: var(--space-2);
}

.district-row__pm25-value {
  font-size: 24px;
  font-weight: 700;
}

.district-row__pm25-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 2px;
}

.district-row__unit {
  font-size: 10px;
  color: var(--color-text-faint);
}

.district-row__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: var(--space-3);
  font-size: 12px;
  color: var(--color-text-muted);
}
</style>
