<script setup lang="ts">
import BaseButton from '@/components/ui/BaseButton.vue';

defineProps<{
  hasPrevious: boolean;
  hasNext: boolean;
  loading: boolean;
}>();

defineEmits<{ previous: []; next: [] }>();
</script>

<template>
  <div class="pagination-controls">
    <BaseButton
      variant="secondary"
      icon="pi pi-chevron-left"
      label="Previous"
      :disabled="!hasPrevious || loading"
      @click="$emit('previous')"
    />
    <BaseButton
      variant="secondary"
      icon="pi pi-chevron-right"
      icon-pos="right"
      label="Next"
      :disabled="!hasNext || loading"
      @click="$emit('next')"
    />
  </div>
</template>

<style scoped>
.pagination-controls {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
  padding: var(--space-4) var(--space-5);
}
</style>
