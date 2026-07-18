<script setup lang="ts">
import BaseSearchInput from '@/components/ui/BaseSearchInput.vue';

defineProps<{ title: string; searchValue: string }>();
defineEmits<{ 'update:searchValue': [string] }>();
</script>

<template>
  <div class="page-header">
    <h1 class="page-header__title">{{ title }}</h1>
    <BaseSearchInput
      :model-value="searchValue"
      placeholder="Search districts or sensor IDs…"
      @update:model-value="(value) => $emit('update:searchValue', value)"
    />
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-5);
  flex-wrap: wrap;
}

.page-header__title {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.02em;
}
</style>
