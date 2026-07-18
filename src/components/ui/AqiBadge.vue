<script setup lang="ts">
import { computed } from 'vue';

import type { AqiLevel } from '@/types/station';
import { AQI_LABELS } from '@/utils/aqi';
import BaseBadge from './BaseBadge.vue';

const props = defineProps<{ level: AqiLevel | null }>();

const label = computed(() => (props.level ? AQI_LABELS[props.level] : '—'));
</script>

<template>
  <BaseBadge :tone="level ?? 'neutral'">{{ label }}</BaseBadge>
</template>
