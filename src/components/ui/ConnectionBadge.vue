<script setup lang="ts">
import { computed } from 'vue';

import type { ConnectionState } from '@/types/station';
import { CONNECTION_LABELS } from '@/utils/connection';
import { formatPercent } from '@/utils/format';
import BaseBadge from './BaseBadge.vue';

const props = defineProps<{
  state: ConnectionState;
  /** Stability %, shown alongside the label for reporting stations. */
  stabilityPct?: number;
}>();

const tone = computed(
  () => ({ offline: 'neutral', poor: 'negative', hq: 'positive' })[props.state] as
    | 'neutral'
    | 'negative'
    | 'positive',
);

const label = computed(() => {
  const base = CONNECTION_LABELS[props.state];
  if (props.state === 'offline' || props.stabilityPct === undefined) return base;
  return `${base} ${formatPercent(props.stabilityPct)}`;
});
</script>

<template>
  <BaseBadge dot :tone="tone">{{ label }}</BaseBadge>
</template>
