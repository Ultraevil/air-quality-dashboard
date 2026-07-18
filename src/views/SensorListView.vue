<script setup lang="ts">
import { refDebounced } from '@vueuse/core';
import { storeToRefs } from 'pinia';
import { onMounted, ref } from 'vue';

import AppHeader from '@/components/layout/AppHeader.vue';
import BaseCard from '@/components/ui/BaseCard.vue';
import { useStationsListPage } from '@/composables/useStationsListPage';
import PaginationControls from '@/features/sensor-list/table/PaginationControls.vue';
import SensorTable from '@/features/sensor-list/table/SensorTable.vue';
import { useNetworkStore } from '@/stores/network';

const networkStore = useNetworkStore();
const { snapshotNow } = storeToRefs(networkStore);

const searchQuery = ref('');
const debouncedSearchQuery = refDebounced(searchQuery, 150);

const { rows, isLoading, error, loadFirstPage, nextPage, previousPage, hasNext, hasPrevious } =
  useStationsListPage(() => snapshotNow.value);

onMounted(loadFirstPage);
</script>

<template>
  <div class="sensor-list-view">
    <AppHeader title="Sensor List" v-model:search-value="searchQuery" />

    <BaseCard no-padding>
      <SensorTable :rows="rows" :loading="isLoading" :search-query="debouncedSearchQuery" />
      <p v-if="error" class="sensor-list-view__error">{{ error }}</p>
      <PaginationControls
        :has-previous="hasPrevious()"
        :has-next="hasNext()"
        :loading="isLoading"
        @previous="previousPage"
        @next="nextPage"
      />
    </BaseCard>
  </div>
</template>

<style scoped>
.sensor-list-view {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.sensor-list-view__error {
  color: var(--color-negative);
  font-size: 13px;
  padding: 0 var(--space-5);
}
</style>
