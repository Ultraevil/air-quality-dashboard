<script setup lang="ts">
import { computed } from 'vue';

import type { StationWithMetrics } from '@/types/station';

const props = defineProps<{
  query: string;
  stations: StationWithMetrics[];
}>();

const emit = defineEmits<{ select: [StationWithMetrics] }>();

const matches = computed(() => {
  const q = props.query.trim().toLowerCase();
  if (!q) return [];
  return props.stations
    .filter(
      (s) =>
        s.id.toLowerCase().includes(q) ||
        s.district.toLowerCase().includes(q) ||
        s.location.toLowerCase().includes(q),
    )
    .slice(0, 8);
});
</script>

<template>
  <ul v-if="matches.length > 0" class="search-dropdown">
    <li v-for="station in matches" :key="station.id">
      <button type="button" class="search-dropdown__item" @click="emit('select', station)">
        <span class="search-dropdown__id">{{ station.id }}</span>
        <span class="search-dropdown__place">{{ station.district }} · {{ station.location }}</span>
      </button>
    </li>
  </ul>
  <p v-else-if="query.trim()" class="search-dropdown__empty">No stations match “{{ query }}”.</p>
</template>

<style scoped>
.search-dropdown {
  position: absolute;
  top: calc(100% + var(--space-2));
  right: 0;
  z-index: 20;
  list-style: none;
  margin: 0;
  padding: var(--space-2);
  background: var(--color-surface-raised);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
  width: 320px;
  max-width: 320px;
}

.search-dropdown__item {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  background: none;
  border: none;
  border-radius: var(--radius-sm);
  padding: var(--space-2) var(--space-3);
  cursor: pointer;
  font: inherit;
  text-align: left;
}

.search-dropdown__item:hover {
  background: var(--color-surface-sunken);
}

.search-dropdown__id {
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 700;
}

.search-dropdown__place {
  font-size: 11px;
  color: var(--color-text-muted);
}

.search-dropdown__empty {
  position: absolute;
  top: calc(100% + var(--space-2));
  right: 0;
  z-index: 20;
  width: 320px;
  max-width: 320px;
  margin: 0;
  padding: var(--space-2) var(--space-3);
  background: var(--color-surface-raised);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
  font-size: 12px;
  color: var(--color-text-muted);
  text-align: right;
}
</style>
