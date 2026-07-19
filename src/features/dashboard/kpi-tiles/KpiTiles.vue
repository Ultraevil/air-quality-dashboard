<script setup lang="ts">
import { storeToRefs } from 'pinia';

import BaseTile from '@/components/ui/BaseTile.vue';
import { useNetworkStore } from '@/stores/network';
import { AQI_LABELS } from '@/utils/aqi';
import { formatConcentrationValue, formatInteger, formatPercent } from '@/utils/format';

// Deltas in the reference mockup ("+6", "-2.4", ...) imply a prior period to
// compare against. The API is an explicit fixed snapshot with no history
// endpoint (README §Data), so there's nothing real to diff against — rather
// than fabricate a number, these tiles simply omit the delta pill.

const { aggregates } = storeToRefs(useNetworkStore());
</script>

<template>
  <div class="kpi-tiles">
    <BaseTile icon="pi pi-wifi" icon-tone="accent">
      <template #value>{{ formatInteger(aggregates.activeSensors) }}</template>
      <template #label>Active Sensors</template>
    </BaseTile>

    <BaseTile icon="pi pi-cloud" icon-tone="good">
      <template #value>
        {{ formatConcentrationValue(aggregates.avgPm25) }}<span class="kpi-tiles__unit">µg</span>
      </template>
      <template #label>
        Avg PM2.5 · {{ aggregates.avgPm25Aqi ? AQI_LABELS[aggregates.avgPm25Aqi] : '—' }}
      </template>
    </BaseTile>

    <BaseTile icon="pi pi-exclamation-triangle" icon-tone="elevated">
      <template #value>{{ formatInteger(aggregates.poorConnectionCount) }}</template>
      <template #label>Poor Connection</template>
    </BaseTile>

    <BaseTile icon="pi pi-chart-line" icon-tone="accent">
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

@media (max-width: 900px) {
  .kpi-tiles {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
