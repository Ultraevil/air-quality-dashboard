<script setup lang="ts">
import { storeToRefs } from 'pinia';

import BaseBadge from '@/components/ui/BaseBadge.vue';
import BaseTile from '@/components/ui/BaseTile.vue';
import { useNetworkStore } from '@/stores/network';
import { AQI_LABELS } from '@/utils/aqi';
import { formatConcentrationValue, formatInteger, formatPercent } from '@/utils/format';

// Deltas in the reference mockup ("+6", "-2.4", ...) imply a prior period to
// compare against. The API is an explicit fixed snapshot with no history
// endpoint (README §Data), so there's nothing real to diff these against —
// they're reproduced here as static values purely to match the mockup's
// visual design (README §1 Overview). Swap for real figures once a history
// endpoint exists.

const { aggregates } = storeToRefs(useNetworkStore());
</script>

<template>
  <div class="kpi-tiles">
    <BaseTile icon="pi pi-wifi" icon-tone="accent">
      <template #delta>
        <BaseBadge tone="positive"><i class="pi pi-arrow-up-right" aria-hidden="true" /> +6</BaseBadge>
      </template>
      <template #value>{{ formatInteger(aggregates.activeSensors) }}</template>
      <template #label>Active Sensors</template>
    </BaseTile>

    <BaseTile icon-tone="positive">
      <template #icon>
        <svg class="kpi-tiles__wind-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
              d="M3 8h11a3 3 0 1 0-3-3"
              stroke="currentColor"
              stroke-width="1.75"
              stroke-linecap="round"
              stroke-linejoin="round"
          />
          <path
              d="M3 12h14a3 3 0 1 1-3 3"
              stroke="currentColor"
              stroke-width="1.75"
              stroke-linecap="round"
              stroke-linejoin="round"
          />
          <path
              d="M3 16h8a2.5 2.5 0 1 1-2.5 2.5"
              stroke="currentColor"
              stroke-width="1.75"
              stroke-linecap="round"
              stroke-linejoin="round"
          />
        </svg>
      </template>
      <template #delta>
        <BaseBadge tone="positive"><i class="pi pi-arrow-up-right" aria-hidden="true" /> -2.4</BaseBadge>
      </template>
      <template #value>
        {{ formatConcentrationValue(aggregates.avgPm25) }}<span class="kpi-tiles__unit">µg</span>
      </template>
      <template #label>
        Avg PM2.5 · {{ aggregates.avgPm25Aqi ? AQI_LABELS[aggregates.avgPm25Aqi] : '—' }}
      </template>
    </BaseTile>

    <BaseTile icon="pi pi-exclamation-triangle" icon-tone="elevated">
      <template #delta>
        <BaseBadge tone="negative"><i class="pi pi-arrow-down-left" aria-hidden="true" /> +16</BaseBadge>
      </template>
      <template #value>{{ formatInteger(aggregates.poorConnectionCount) }}</template>
      <template #label>Poor Connection</template>
    </BaseTile>

    <BaseTile icon="pi pi-wave-pulse" icon-tone="positive">
      <template #delta>
        <BaseBadge tone="positive"><i class="pi pi-arrow-up-right" aria-hidden="true" /> +0.8</BaseBadge>
      </template>
      <template #value>{{ formatPercent(aggregates.avgStabilityPct) }}</template>
      <template #label>Network Stability</template>
    </BaseTile>
  </div>
</template>

<style scoped>
.kpi-tiles {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-4);
}

.kpi-tiles__unit {
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text-muted);
  margin-left: 2px;
}

.kpi-tiles__wind-icon {
  width: 18px;
  height: 18px;
}

.kpi-tiles :deep(.base-badge) {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}

@media (max-width: 900px) {
  .kpi-tiles {
    grid-template-columns: repeat(2, 1fr);
  }
}

.kpi-tile :deep(.pi-arrow-up-right),
.kpi-tile :deep(.pi-arrow-down-left) {
  font-size: 8px;
  font-weight: 600;
  padding-top: 2px;
}
</style>
