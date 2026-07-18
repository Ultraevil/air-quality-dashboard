<script setup lang="ts">
import PIconField from 'primevue/iconfield';
import PInputIcon from 'primevue/inputicon';

import BaseInput from './BaseInput.vue';

withDefaults(
  defineProps<{
    modelValue: string;
    placeholder?: string;
  }>(),
  { placeholder: 'Search…' },
);

defineEmits<{ 'update:modelValue': [string] }>();
</script>

<template>
  <PIconField class="base-search">
    <PInputIcon class="pi pi-search" aria-hidden="true" />
    <BaseInput
      :model-value="modelValue"
      :placeholder="placeholder"
      aria-label="Search districts or sensor IDs"
      class="base-search__input"
      @update:model-value="(value) => $emit('update:modelValue', value)"
    />
  </PIconField>
</template>

<style scoped>
.base-search {
  width: 100%;
  max-width: 320px;
}

.base-search__input {
  border-radius: 999px;
  padding-left: 2.25rem;
}
</style>
